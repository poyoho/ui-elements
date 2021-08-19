/* 这里引用只用dts 后面打包去除 */
import { SFCDescriptor, BindingMetadata } from '@vue/compiler-sfc'
import * as defaultCompiler from '@vue/compiler-sfc'

// import { fs, SFCFile } from '../fs'

export const COMP_IDENTIFIER = '__sfc__'

type SFCCompiler = typeof defaultCompiler

// import in sandbox
export async function importCompile(version: string) {
  const compilerUrl = `https://unpkg.com/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`
  const runtimeUrl = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`
  const [compiler] = await Promise.all([
    import(compilerUrl),
    import(runtimeUrl),
  ])
  console.info(`Now using Vue version: ${version}`)
  return compiler
}

export async function compileFile(
  SFCCompiler: SFCCompiler,
  { filename, compiled, content }: SFCFile
) {
  if (!content.trim()) {
    fs.errors = []
    return
  }

  if (!filename.endsWith('.vue')) {
    compiled.js = compiled.ssr = content
    fs.errors = []
    return
  }

  const id = await hashId(filename)
  const { errors, descriptor } = SFCCompiler.parse(content, {
    filename,
    sourceMap: true,
  })
  if (errors.length) {
    fs.errors = errors
    return
  }

  if (
    (descriptor.script && descriptor.script.lang)
    || (descriptor.scriptSetup && descriptor.scriptSetup.lang)
    || descriptor.styles.some(s => s.lang)
    || (descriptor.template && descriptor.template.lang)
  ) {
    fs.errors = [
      'lang="x" pre-processors are not supported in the in-browser playground.',
    ]
    return
  }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  const clientScriptResult = doCompileScript(SFCCompiler, descriptor, id, false)
  if (!clientScriptResult)
    return

  const [clientScript, bindings] = clientScriptResult
  clientCode += clientScript

  // script ssr only needs to be performed if using <script setup> where
  // the render fn is inlined.
  if (descriptor.scriptSetup) {
    const ssrScriptResult = doCompileScript(SFCCompiler, descriptor, id, true)
    if (!ssrScriptResult)
      return

    ssrCode += ssrScriptResult[0]
  }
  else {
    // when no <script setup> is used, the script result will be identical.
    ssrCode += clientScript
  }

  // template
  // only need dedicated compilation if not using <script setup>
  if (descriptor.template && !descriptor.scriptSetup) {
    const clientTemplateResult = doCompileTemplate(
      SFCCompiler,
      descriptor,
      id,
      bindings,
      false,
    )
    if (!clientTemplateResult)
      return

    clientCode += clientTemplateResult

    const ssrTemplateResult = doCompileTemplate(SFCCompiler, descriptor, id, bindings, true)
    if (!ssrTemplateResult)
      return

    ssrCode += ssrTemplateResult
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`,
    )
  }

  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}`
        + `\nexport default ${COMP_IDENTIFIER}`,
    )
    compiled.js = clientCode.trimStart()
    compiled.ssr = ssrCode.trimStart()
  }

  // clear errors
  fs.errors = []
}

function doCompileScript(
  SFCCompiler: SFCCompiler,
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
): [string, BindingMetadata | undefined] | undefined {
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const compiledScript = SFCCompiler.compileScript(descriptor, {
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
          SFCCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER)}`
      return [code, compiledScript.bindings]
    }
    catch (e) {
      // store.errors = [e]
    }
  }
  else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

function doCompileTemplate(
  SFCCompiler: SFCCompiler,
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
) {
  const templateResult = SFCCompiler.compileTemplate({
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
    // store.errors = templateResult.errors
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

async function hashId(filename: string) {
  const msgUint8 = new TextEncoder().encode(filename) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex.slice(0, 8)
}
