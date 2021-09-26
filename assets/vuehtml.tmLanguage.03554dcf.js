const e="Vue",t="source.vue",n={"L:meta.tag.metadata":{patterns:[{include:"#vue-directives"}]},"L:meta.tag.structure":{patterns:[{include:"#vue-directives"}]},"L:meta.tag.inline":{patterns:[{include:"#vue-directives"}]},"L:meta.tag.object":{patterns:[{include:"#vue-directives"}]},"L:meta.tag.other":{patterns:[{include:"#vue-directives"}]},"L:meta.tag.custom":{patterns:[{include:"#vue-directives"}]},"L:text.pug -comment -string.comment":{patterns:[{include:"#vue-interpolations"}]}},a=[{include:"#self-closing-tag"},{begin:"(<)",beginCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"}},end:"(>)",endCaptures:{1:{name:"punctuation.definition.tag.end.vuehtml"}},patterns:[{begin:"([a-zA-Z0-9:-]+)\\b(?=[^>]*\\blang\\s*=\\s*['\"]html['\"])",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"text.html.derivative",patterns:[{include:"#tag-stuff"},{include:"#html-stuff"}]},{begin:"([a-zA-Z0-9:-]+)\\b(?=[^>]*\\blang\\s*=\\s*['\"]css['\"])",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"source.css",patterns:[{include:"#tag-stuff"},{include:"source.css"}]},{begin:"([a-zA-Z0-9:-]+)\\b(?=[^>]*\\blang\\s*=\\s*['\"]js['\"])",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"source.js",patterns:[{include:"#tag-stuff"},{include:"source.js"}]},{begin:"([a-zA-Z0-9:-]+)\\b(?=[^>]*\\blang\\s*=\\s*['\"]ts['\"])",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"source.ts",patterns:[{include:"#tag-stuff"},{include:"source.ts"}]},{begin:"(template)\\b",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"text.html.derivative",patterns:[{include:"#tag-stuff"},{include:"#html-stuff"}]},{begin:"(script)\\b",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"source.js",patterns:[{include:"#tag-stuff"},{include:"source.js"}]},{begin:"(style)\\b",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"source.css",patterns:[{include:"#tag-stuff"},{include:"source.css"}]},{begin:"([a-zA-Z0-9:-]+)",beginCaptures:{1:{name:"entity.name.tag.$1.vuehtml"}},end:"(</)(\\1)\\s*(?=>)",endCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},name:"text",patterns:[{include:"#tag-stuff"}]}]}],i={"self-closing-tag":{begin:"(<)([a-zA-Z0-9:-]+)(?=([^>]+/>))",beginCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},end:"(?<=/>)",patterns:[{include:"#tag-stuff"}]},"template-tag":{patterns:[{include:"#template-tag-1"},{include:"#template-tag-2"}]},"template-tag-1":{begin:"(<)(template)\\b(>)",beginCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"},3:{name:"punctuation.definition.tag.end.vuehtml"}},end:"(/?>)",endCaptures:{1:{name:"punctuation.definition.tag.end.vuehtml"}},name:"meta.template-tag.start",patterns:[{begin:"\\G",end:"(?=/>)|((</)(template)\\b)",endCaptures:{2:{name:"punctuation.definition.tag.begin.vuehtml"},3:{name:"entity.name.tag.$3.vuehtml"}},name:"meta.template-tag.end",patterns:[{include:"#html-stuff"}]}]},"template-tag-2":{begin:"(<)(template)\\b",beginCaptures:{1:{name:"punctuation.definition.tag.begin.vuehtml"},2:{name:"entity.name.tag.$2.vuehtml"}},end:"(/?>)",endCaptures:{1:{name:"punctuation.definition.tag.end.vuehtml"}},name:"meta.template-tag.start",patterns:[{begin:"\\G",end:"(?=/>)|((</)(template)\\b)",endCaptures:{2:{name:"punctuation.definition.tag.begin.vuehtml"},3:{name:"entity.name.tag.$3.vuehtml"}},name:"meta.template-tag.end",patterns:[{include:"#tag-stuff"},{include:"#html-stuff"}]}]},"html-stuff":{patterns:[{include:"#vue-interpolations"},{include:"#template-tag"}]},"tag-stuff":{begin:"\\G",end:"(?=/>)|(>)",endCaptures:{1:{name:"punctuation.definition.tag.end.vuehtml"}},name:"meta.tag-stuff",patterns:[{include:"#vue-directives"}]},"vue-directives":{patterns:[{include:"#vue-directives-control"},{include:"#vue-directives-style-attr"},{include:"#vue-directives-original"}]},"vue-directives-original":{begin:"(?:\\b(v-)|(:|@|#))([a-zA-Z0-9\\-_]*)(?:\\:([a-zA-Z\\-_]+))?(?:\\.([a-zA-Z\\-_]+))*\\s*(=)",captures:{1:{name:"entity.other.attribute-name.vuehtml"},2:{name:"punctuation.separator.key-value.vuehtml"},3:{name:"entity.other.attribute-name.vuehtml"},4:{name:"entity.other.attribute-name.vuehtml"},5:{name:"entity.other.attribute-name.vuehtml"},6:{name:"entity.other.attribute-name.vuehtml"},7:{name:"punctuation.separator.key-value.vuehtml"}},end:"(?<='|\")",name:"meta.directive.vue",patterns:[{begin:"('|\")",beginCaptures:{1:{name:"punctuation.definition.string.begin.vuehtml"}},end:"(\\1)",endCaptures:{1:{name:"punctuation.definition.string.end.vuehtml"}},name:"source.js.embedded.vuehtml",patterns:[{include:"source.js"}]}]},"vue-directives-control":{begin:"(v-for)|(v-if|v-else-if|v-else)(?![\\w:-])",captures:{0:{name:"keyword.control.loop.vue"},1:{name:"keyword.control.conditional.vue"}},end:"(?=\\s*+[^=\\s])",name:"meta.directive.vue",patterns:[{begin:"=",beginCaptures:{0:{name:"punctuation.separator.key-value.vuehtml"}},end:"(?<=[^\\s=])(?!\\s*=)|(?=/?>)",patterns:[{begin:"('|\")",beginCaptures:{1:{name:"punctuation.definition.string.begin.vuehtml"}},end:"(\\1)",endCaptures:{1:{name:"punctuation.definition.string.end.vuehtml"}},name:"source.js.embedded.vuehtml",patterns:[{include:"source.js"}]}]}]},"vue-directives-style-attr":{begin:"\\b(style)\\s*(=)",captures:{1:{name:"entity.other.attribute-name.vuehtml"},2:{name:"punctuation.separator.key-value.vuehtml"}},end:"(?<='|\")",name:"meta.directive.vue",patterns:[{comment:"Copy from source.css#rule-list-innards",begin:"('|\")",beginCaptures:{1:{name:"punctuation.definition.string.begin.vuehtml"}},end:"(\\1)",endCaptures:{1:{name:"punctuation.definition.string.end.vuehtml"}},name:"source.css.embedded.vuehtml",patterns:[{include:"source.css#comment-block"},{include:"source.css#escapes"},{include:"source.css#font-features"},{match:"(?x) (?<![\\w-])\n--\n(?:[-a-zA-Z_]    | [^\\x00-\\x7F])     # First letter\n(?:[-a-zA-Z0-9_] | [^\\x00-\\x7F]      # Remainder of identifier\n  |\\\\(?:[0-9a-fA-F]{1,6}|.)\n)*",name:"variable.css"},{begin:"(?<![-a-zA-Z])(?=[-a-zA-Z])",end:"$|(?![-a-zA-Z])",name:"meta.property-name.css",patterns:[{include:"source.css#property-names"}]},{comment:"Modify end to fix #199. TODO: handle ' character.",begin:"(:)\\s*",beginCaptures:{1:{name:"punctuation.separator.key-value.css"}},end:'\\s*(;)|\\s*(?=")',endCaptures:{1:{name:"punctuation.terminator.rule.css"}},contentName:"meta.property-value.css",patterns:[{include:"source.css#comment-block"},{include:"source.css#property-values"}]},{match:";",name:"punctuation.terminator.rule.css"}]}]},"vue-interpolations":{patterns:[{begin:"\\{\\{",beginCaptures:[{name:"punctuation.definition.tag.begin.vuehtml"}],end:"\\}\\}",endCaptures:[{name:"punctuation.definition.tag.end.vuehtml"}],name:"expression.embbeded.vue",patterns:[{begin:"\\G",end:"(?=\\}\\})",name:"source.js.embedded.vuehtml",patterns:[{include:"source.js"}]}]}]}};var u={name:"Vue",scopeName:"source.vue",injections:n,patterns:a,repository:i};export{u as default,n as injections,e as name,a as patterns,i as repository,t as scopeName};
