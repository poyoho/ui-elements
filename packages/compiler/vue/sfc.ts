import type { SFCDescriptor, BindingMetadata } from '@vue/compiler-sfc'
import { importVuePackage, COMP_IDENTIFIER, SFCFile } from "./env"

export async function compileVueSFCFile(
  file: SFCFile
): Promise<Error[]> {
  const { compiler } = await importVuePackage()

  if (!file.content.trim() || !file.change) {
    return []
  }

  if (!file.filename.endsWith('.vue')) {
    file.compiled.js = file.compiled.ssr = file.content
    file.change = false
    return []
  }

  const id = await hashId(file.filename)
  const { errors, descriptor } = compiler.parse(file.content, {
    filename: file.filename,
    sourceMap: true,
  })
  if (errors.length) {
    file.change = false
    return errors
  }

  if (
    (descriptor.script && descriptor.script.lang)
    || (descriptor.scriptSetup && descriptor.scriptSetup.lang)
    || descriptor.styles.some(s => s.lang)
    || (descriptor.template && descriptor.template.lang)
  ) {
    file.change = false
    return [
      Error('lang="x" pre-processors are not supported in the in-browser playground.'),
    ]
  }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  const clientScriptResult = await doCompileScript(descriptor, id, false)
  if (!clientScriptResult) {
    file.change = false
    return []
  }

  const [clientScript, bindings] = clientScriptResult
  clientCode += clientScript

  // script ssr only needs to be performed if using <script setup> where
  // the render fn is inlined.
  if (descriptor.scriptSetup) {
    const ssrScriptResult = doCompileScript(descriptor, id, true)
    if (!ssrScriptResult) {
      file.change = false
      return []
    }

    ssrCode += ssrScriptResult[0]
  }
  else {
    // when no <script setup> is used, the script result will be identical.
    ssrCode += clientScript
  }
  // template
  // only need dedicated compilation if not using <script setup>
  if (descriptor.template && !descriptor.scriptSetup) {
    const clientTemplateResult = await doCompileTemplate(
      descriptor,
      id,
      bindings,
      false,
    )
    if (!clientTemplateResult) {
      file.change = false
      return []
    }

    clientCode += clientTemplateResult

    const ssrTemplateResult = await doCompileTemplate(descriptor, id, bindings, true)
    if (!ssrTemplateResult) {
      file.change = false
      return []
    }

    ssrCode += ssrTemplateResult
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`,
    )
  }

  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(file.filename)}`
        + `\nexport default ${COMP_IDENTIFIER}`,
    )
    file.compiled.js = clientCode.trimStart()
    file.compiled.ssr = ssrCode.trimStart()
  }

  file.compiled.css = await doCompileStyle(descriptor, id)
  file.change = false
  return []
}

async function doCompileScript(
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
): Promise<[string, BindingMetadata | undefined] | undefined> {

  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const { compiler } = await importVuePackage()
      const compiledScript = compiler.compileScript(descriptor, {
        id,
        refSugar: true,
        inlineTemplate: true,
        templateOptions: {
          ssr,
          ssrCssVars: descriptor.cssVars,
        },
      })
      let code = ''
      if (compiledScript.bindings) {
        code += `\n/* Analyzed bindings: ${JSON.stringify(
          compiledScript.bindings,
          null,
          2,
        )} */`
      }
      code
        += `\n${
          compiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER)}`
      return [code, compiledScript.bindings]
    }
    catch (e) {
      // store.errors = [e]
    }
  } else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

async function doCompileTemplate(
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
) {
  const { compiler } = await importVuePackage()
  const templateResult = compiler.compileTemplate({
    source: descriptor.template!.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some(s => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    isProd: false,
    compilerOptions: {
      bindingMetadata,
    },
  })
  if (templateResult.errors.length) {
    return
  }

  const fnName = ssr ? 'ssrRender' : 'render'

  return (
    `\n${templateResult.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`,
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`
  )
}

async function doCompileStyle(descriptor: SFCDescriptor, id: string) {
  const { compiler } = await importVuePackage()
  return descriptor.styles.map(style => {
    const styleResult = compiler.compileStyle({
      id: id,
      filename: descriptor.filename,
      source: style.content,
      scoped: style.scoped,
    })
    if (styleResult.errors.length) {
      return ""
    }
    return styleResult.code
  }).join("\n")
}

async function hashId(filename: string) {
  const msgUint8 = new TextEncoder().encode(filename) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex.slice(0, 8)
}
