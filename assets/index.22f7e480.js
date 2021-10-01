import{d as W,g as w}from"./index.5a742324.js";import{a as T,p as V,b as Y}from"./vendor.91e6cab1.js";import{i as G}from"./index.c880ee52.js";function Q(n,t,e=!1,r=[],i=Object.create(null)){const s=n.type==="Program"&&n.body[0].type==="ExpressionStatement"&&n.body[0].expression;T(n,{enter(o,u){if(u&&r.push(u),u&&u.type.startsWith("TS")&&u.type!=="TSAsExpression"&&u.type!=="TSNonNullExpression"&&u.type!=="TSTypeAssertion")return this.skip();if(o.type==="Identifier"){const l=!!i[o.name],a=X(o,u,r);(e||a&&!l)&&t(o,u,r,a,l)}else o.type==="ObjectProperty"&&u.type==="ObjectPattern"?o.inPattern=!0:rt(o)?tt(o,l=>N(o,l,i)):o.type==="BlockStatement"&&et(o,l=>N(o,l,i))},leave(o,u){if(u&&r.pop(),o!==s&&o.scopeIds)for(const l of o.scopeIds)i[l]--,i[l]===0&&delete i[l]}})}function X(n,t,e){if(!t)return!0;if(n.name==="arguments")return!1;if(pt(n,t))return!0;switch(t.type){case"AssignmentExpression":case"AssignmentPattern":return!0;case"ObjectPattern":case"ArrayPattern":return Z(t,e)}return!1}function Z(n,t){if(n&&(n.type==="ObjectProperty"||n.type==="ArrayPattern")){let e=t.length;for(;e--;){const r=t[e];if(r.type==="AssignmentExpression")return!0;if(r.type!=="ObjectProperty"&&!r.type.endsWith("Pattern"))break}}return!1}function tt(n,t){for(const e of n.params)for(const r of y(e))t(r)}function et(n,t){for(const e of n.body)if(e.type==="VariableDeclaration"){if(e.declare)continue;for(const r of e.declarations)for(const i of y(r.id))t(i)}else if(e.type==="FunctionDeclaration"||e.type==="ClassDeclaration"){if(e.declare||!e.id)continue;t(e.id)}}function y(n,t=[]){switch(n.type){case"Identifier":t.push(n);break;case"MemberExpression":let e=n;for(;e.type==="MemberExpression";)e=e.object;t.push(e);break;case"ObjectPattern":for(const r of n.properties)r.type==="RestElement"?y(r.argument,t):y(r.value,t);break;case"ArrayPattern":n.elements.forEach(r=>{r&&y(r,t)});break;case"RestElement":y(n.argument,t);break;case"AssignmentPattern":y(n.left,t);break}return t}function N(n,t,e){const{name:r}=t;n.scopeIds&&n.scopeIds.has(r)||(r in e?e[r]++:e[r]=1,(n.scopeIds||(n.scopeIds=new Set)).add(r))}const rt=n=>/Function(?:Expression|Declaration)$|Method$/.test(n.type),j=["bigInt","optionalChaining","nullishCoalescingOperator"];var nt={},P="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";for(var L=0;L<P.length;L++)nt[P.charCodeAt(L)]=L;function it(n){for(var t=0,e=0,r=0,i=0,s="",o=0;o<n.length;o++){var u=n[o];if(o>0&&(s+=";"),u.length!==0){for(var l=0,a=[],f=0,g=u;f<g.length;f++){var c=g[f],p=x(c[0]-l);l=c[0],c.length>1&&(p+=x(c[1]-t)+x(c[2]-e)+x(c[3]-r),t=c[1],e=c[2],r=c[3]),c.length===5&&(p+=x(c[4]-i),i=c[4]),a.push(p)}s+=a.join(",")}}return s}function x(n){var t="";n=n<0?-n<<1|1:n<<1;do{var e=n&31;n>>>=5,n>0&&(e|=32),t+=P[e]}while(n>0);return t}var $=function n(t){this.bits=t instanceof n?t.bits.slice():[]};$.prototype.add=function(t){this.bits[t>>5]|=1<<(t&31)};$.prototype.has=function(t){return!!(this.bits[t>>5]&1<<(t&31))};var m=function(t,e,r){this.start=t,this.end=e,this.original=r,this.intro="",this.outro="",this.content=r,this.storeName=!1,this.edited=!1,Object.defineProperties(this,{previous:{writable:!0,value:null},next:{writable:!0,value:null}})};m.prototype.appendLeft=function(t){this.outro+=t};m.prototype.appendRight=function(t){this.intro=this.intro+t};m.prototype.clone=function(){var t=new m(this.start,this.end,this.original);return t.intro=this.intro,t.outro=this.outro,t.content=this.content,t.storeName=this.storeName,t.edited=this.edited,t};m.prototype.contains=function(t){return this.start<t&&t<this.end};m.prototype.eachNext=function(t){for(var e=this;e;)t(e),e=e.next};m.prototype.eachPrevious=function(t){for(var e=this;e;)t(e),e=e.previous};m.prototype.edit=function(t,e,r){return this.content=t,r||(this.intro="",this.outro=""),this.storeName=e,this.edited=!0,this};m.prototype.prependLeft=function(t){this.outro=t+this.outro};m.prototype.prependRight=function(t){this.intro=t+this.intro};m.prototype.split=function(t){var e=t-this.start,r=this.original.slice(0,e),i=this.original.slice(e);this.original=r;var s=new m(t,this.end,i);return s.outro=this.outro,this.outro="",this.end=t,this.edited?(s.edit("",!1),this.content=""):this.content=r,s.next=this.next,s.next&&(s.next.previous=s),s.previous=this,this.next=s,s};m.prototype.toString=function(){return this.intro+this.content+this.outro};m.prototype.trimEnd=function(t){if(this.outro=this.outro.replace(t,""),this.outro.length)return!0;var e=this.content.replace(t,"");if(e.length)return e!==this.content&&this.split(this.start+e.length).edit("",void 0,!0),!0;if(this.edit("",void 0,!0),this.intro=this.intro.replace(t,""),this.intro.length)return!0};m.prototype.trimStart=function(t){if(this.intro=this.intro.replace(t,""),this.intro.length)return!0;var e=this.content.replace(t,"");if(e.length)return e!==this.content&&(this.split(this.end-e.length),this.edit("",void 0,!0)),!0;if(this.edit("",void 0,!0),this.outro=this.outro.replace(t,""),this.outro.length)return!0};var R=function(){throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.")};typeof window!="undefined"&&typeof window.btoa=="function"?R=function(n){return window.btoa(unescape(encodeURIComponent(n)))}:typeof Buffer=="function"&&(R=function(n){return Buffer.from(n,"utf-8").toString("base64")});var _=function(t){this.version=3,this.file=t.file,this.sources=t.sources,this.sourcesContent=t.sourcesContent,this.names=t.names,this.mappings=it(t.mappings)};_.prototype.toString=function(){return JSON.stringify(this)};_.prototype.toUrl=function(){return"data:application/json;charset=utf-8;base64,"+R(this.toString())};function st(n){var t=n.split(`
`),e=t.filter(function(s){return/^\t+/.test(s)}),r=t.filter(function(s){return/^ {2,}/.test(s)});if(e.length===0&&r.length===0)return null;if(e.length>=r.length)return"	";var i=r.reduce(function(s,o){var u=/^ +/.exec(o)[0].length;return Math.min(u,s)},1/0);return new Array(i+1).join(" ")}function ot(n,t){var e=n.split(/[/\\]/),r=t.split(/[/\\]/);for(e.pop();e[0]===r[0];)e.shift(),r.shift();if(e.length)for(var i=e.length;i--;)e[i]="..";return e.concat(r).join("/")}var at=Object.prototype.toString;function lt(n){return at.call(n)==="[object Object]"}function D(n){for(var t=n.split(`
`),e=[],r=0,i=0;r<t.length;r++)e.push(i),i+=t[r].length+1;return function(o){for(var u=0,l=e.length;u<l;){var a=u+l>>1;o<e[a]?l=a:u=a+1}var f=u-1,g=o-e[f];return{line:f,column:g}}}var I=function(t){this.hires=t,this.generatedCodeLine=0,this.generatedCodeColumn=0,this.raw=[],this.rawSegments=this.raw[this.generatedCodeLine]=[],this.pending=null};I.prototype.addEdit=function(t,e,r,i){if(e.length){var s=[this.generatedCodeColumn,t,r.line,r.column];i>=0&&s.push(i),this.rawSegments.push(s)}else this.pending&&this.rawSegments.push(this.pending);this.advance(e),this.pending=null};I.prototype.addUneditedChunk=function(t,e,r,i,s){for(var o=e.start,u=!0;o<e.end;)(this.hires||u||s.has(o))&&this.rawSegments.push([this.generatedCodeColumn,t,i.line,i.column]),r[o]===`
`?(i.line+=1,i.column=0,this.generatedCodeLine+=1,this.raw[this.generatedCodeLine]=this.rawSegments=[],this.generatedCodeColumn=0,u=!0):(i.column+=1,this.generatedCodeColumn+=1,u=!1),o+=1;this.pending=null};I.prototype.advance=function(t){if(!!t){var e=t.split(`
`);if(e.length>1){for(var r=0;r<e.length-1;r++)this.generatedCodeLine++,this.raw[this.generatedCodeLine]=this.rawSegments=[];this.generatedCodeColumn=0}this.generatedCodeColumn+=e[e.length-1].length}};var E=`
`,b={insertLeft:!1,insertRight:!1,storeName:!1},h=function(t,e){e===void 0&&(e={});var r=new m(0,t.length,t);Object.defineProperties(this,{original:{writable:!0,value:t},outro:{writable:!0,value:""},intro:{writable:!0,value:""},firstChunk:{writable:!0,value:r},lastChunk:{writable:!0,value:r},lastSearchedChunk:{writable:!0,value:r},byStart:{writable:!0,value:{}},byEnd:{writable:!0,value:{}},filename:{writable:!0,value:e.filename},indentExclusionRanges:{writable:!0,value:e.indentExclusionRanges},sourcemapLocations:{writable:!0,value:new $},storedNames:{writable:!0,value:{}},indentStr:{writable:!0,value:st(t)}}),this.byStart[0]=r,this.byEnd[t.length]=r};h.prototype.addSourcemapLocation=function(t){this.sourcemapLocations.add(t)};h.prototype.append=function(t){if(typeof t!="string")throw new TypeError("outro content must be a string");return this.outro+=t,this};h.prototype.appendLeft=function(t,e){if(typeof e!="string")throw new TypeError("inserted content must be a string");this._split(t);var r=this.byEnd[t];return r?r.appendLeft(e):this.intro+=e,this};h.prototype.appendRight=function(t,e){if(typeof e!="string")throw new TypeError("inserted content must be a string");this._split(t);var r=this.byStart[t];return r?r.appendRight(e):this.outro+=e,this};h.prototype.clone=function(){for(var t=new h(this.original,{filename:this.filename}),e=this.firstChunk,r=t.firstChunk=t.lastSearchedChunk=e.clone();e;){t.byStart[r.start]=r,t.byEnd[r.end]=r;var i=e.next,s=i&&i.clone();s&&(r.next=s,s.previous=r,r=s),e=i}return t.lastChunk=r,this.indentExclusionRanges&&(t.indentExclusionRanges=this.indentExclusionRanges.slice()),t.sourcemapLocations=new $(this.sourcemapLocations),t.intro=this.intro,t.outro=this.outro,t};h.prototype.generateDecodedMap=function(t){var e=this;t=t||{};var r=0,i=Object.keys(this.storedNames),s=new I(t.hires),o=D(this.original);return this.intro&&s.advance(this.intro),this.firstChunk.eachNext(function(u){var l=o(u.start);u.intro.length&&s.advance(u.intro),u.edited?s.addEdit(r,u.content,l,u.storeName?i.indexOf(u.original):-1):s.addUneditedChunk(r,u,e.original,l,e.sourcemapLocations),u.outro.length&&s.advance(u.outro)}),{file:t.file?t.file.split(/[/\\]/).pop():null,sources:[t.source?ot(t.file||"",t.source):null],sourcesContent:t.includeContent?[this.original]:[null],names:i,mappings:s.raw}};h.prototype.generateMap=function(t){return new _(this.generateDecodedMap(t))};h.prototype.getIndentString=function(){return this.indentStr===null?"	":this.indentStr};h.prototype.indent=function(t,e){var r=/^[^\r\n]/gm;if(lt(t)&&(e=t,t=void 0),t=t!==void 0?t:this.indentStr||"	",t==="")return this;e=e||{};var i={};if(e.exclude){var s=typeof e.exclude[0]=="number"?[e.exclude]:e.exclude;s.forEach(function(c){for(var p=c[0];p<c[1];p+=1)i[p]=!0})}var o=e.indentStart!==!1,u=function(c){return o?""+t+c:(o=!0,c)};this.intro=this.intro.replace(r,u);for(var l=0,a=this.firstChunk;a;){var f=a.end;if(a.edited)i[l]||(a.content=a.content.replace(r,u),a.content.length&&(o=a.content[a.content.length-1]===`
`));else for(l=a.start;l<f;){if(!i[l]){var g=this.original[l];g===`
`?o=!0:g!=="\r"&&o&&(o=!1,l===a.start||(this._splitChunk(a,l),a=a.next),a.prependRight(t))}l+=1}l=a.end,a=a.next}return this.outro=this.outro.replace(r,u),this};h.prototype.insert=function(){throw new Error("magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)")};h.prototype.insertLeft=function(t,e){return b.insertLeft||(console.warn("magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"),b.insertLeft=!0),this.appendLeft(t,e)};h.prototype.insertRight=function(t,e){return b.insertRight||(console.warn("magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"),b.insertRight=!0),this.prependRight(t,e)};h.prototype.move=function(t,e,r){if(r>=t&&r<=e)throw new Error("Cannot move a selection inside itself");this._split(t),this._split(e),this._split(r);var i=this.byStart[t],s=this.byEnd[e],o=i.previous,u=s.next,l=this.byStart[r];if(!l&&s===this.lastChunk)return this;var a=l?l.previous:this.lastChunk;return o&&(o.next=u),u&&(u.previous=o),a&&(a.next=i),l&&(l.previous=s),i.previous||(this.firstChunk=s.next),s.next||(this.lastChunk=i.previous,this.lastChunk.next=null),i.previous=a,s.next=l||null,a||(this.firstChunk=i),l||(this.lastChunk=s),this};h.prototype.overwrite=function(t,e,r,i){if(typeof r!="string")throw new TypeError("replacement content must be a string");for(;t<0;)t+=this.original.length;for(;e<0;)e+=this.original.length;if(e>this.original.length)throw new Error("end is out of bounds");if(t===e)throw new Error("Cannot overwrite a zero-length range \u2013 use appendLeft or prependRight instead");this._split(t),this._split(e),i===!0&&(b.storeName||(console.warn("The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"),b.storeName=!0),i={storeName:!0});var s=i!==void 0?i.storeName:!1,o=i!==void 0?i.contentOnly:!1;if(s){var u=this.original.slice(t,e);this.storedNames[u]=!0}var l=this.byStart[t],a=this.byEnd[e];if(l){if(e>l.end&&l.next!==this.byStart[l.end])throw new Error("Cannot overwrite across a split point");if(l.edit(r,s,o),l!==a){for(var f=l.next;f!==a;)f.edit("",!1),f=f.next;f.edit("",!1)}}else{var g=new m(t,e,"").edit(r,s);a.next=g,g.previous=a}return this};h.prototype.prepend=function(t){if(typeof t!="string")throw new TypeError("outro content must be a string");return this.intro=t+this.intro,this};h.prototype.prependLeft=function(t,e){if(typeof e!="string")throw new TypeError("inserted content must be a string");this._split(t);var r=this.byEnd[t];return r?r.prependLeft(e):this.intro=e+this.intro,this};h.prototype.prependRight=function(t,e){if(typeof e!="string")throw new TypeError("inserted content must be a string");this._split(t);var r=this.byStart[t];return r?r.prependRight(e):this.outro=e+this.outro,this};h.prototype.remove=function(t,e){for(;t<0;)t+=this.original.length;for(;e<0;)e+=this.original.length;if(t===e)return this;if(t<0||e>this.original.length)throw new Error("Character is out of bounds");if(t>e)throw new Error("end must be greater than start");this._split(t),this._split(e);for(var r=this.byStart[t];r;)r.intro="",r.outro="",r.edit(""),r=e>r.end?this.byStart[r.end]:null;return this};h.prototype.lastChar=function(){if(this.outro.length)return this.outro[this.outro.length-1];var t=this.lastChunk;do{if(t.outro.length)return t.outro[t.outro.length-1];if(t.content.length)return t.content[t.content.length-1];if(t.intro.length)return t.intro[t.intro.length-1]}while(t=t.previous);return this.intro.length?this.intro[this.intro.length-1]:""};h.prototype.lastLine=function(){var t=this.outro.lastIndexOf(E);if(t!==-1)return this.outro.substr(t+1);var e=this.outro,r=this.lastChunk;do{if(r.outro.length>0){if(t=r.outro.lastIndexOf(E),t!==-1)return r.outro.substr(t+1)+e;e=r.outro+e}if(r.content.length>0){if(t=r.content.lastIndexOf(E),t!==-1)return r.content.substr(t+1)+e;e=r.content+e}if(r.intro.length>0){if(t=r.intro.lastIndexOf(E),t!==-1)return r.intro.substr(t+1)+e;e=r.intro+e}}while(r=r.previous);return t=this.intro.lastIndexOf(E),t!==-1?this.intro.substr(t+1)+e:this.intro+e};h.prototype.slice=function(t,e){for(t===void 0&&(t=0),e===void 0&&(e=this.original.length);t<0;)t+=this.original.length;for(;e<0;)e+=this.original.length;for(var r="",i=this.firstChunk;i&&(i.start>t||i.end<=t);){if(i.start<e&&i.end>=e)return r;i=i.next}if(i&&i.edited&&i.start!==t)throw new Error("Cannot use replaced character "+t+" as slice start anchor.");for(var s=i;i;){i.intro&&(s!==i||i.start===t)&&(r+=i.intro);var o=i.start<e&&i.end>=e;if(o&&i.edited&&i.end!==e)throw new Error("Cannot use replaced character "+e+" as slice end anchor.");var u=s===i?t-i.start:0,l=o?i.content.length+e-i.end:i.content.length;if(r+=i.content.slice(u,l),i.outro&&(!o||i.end===e)&&(r+=i.outro),o)break;i=i.next}return r};h.prototype.snip=function(t,e){var r=this.clone();return r.remove(0,t),r.remove(e,r.original.length),r};h.prototype._split=function(t){if(!(this.byStart[t]||this.byEnd[t]))for(var e=this.lastSearchedChunk,r=t>e.end;e;){if(e.contains(t))return this._splitChunk(e,t);e=r?this.byStart[e.end]:this.byEnd[e.start]}};h.prototype._splitChunk=function(t,e){if(t.edited&&t.content.length){var r=D(this.original)(e);throw new Error("Cannot split a chunk that has already been edited ("+r.line+":"+r.column+' \u2013 "'+t.original+'")')}var i=t.split(e);return this.byEnd[e]=t,this.byStart[e]=i,this.byEnd[i.end]=i,t===this.lastChunk&&(this.lastChunk=i),this.lastSearchedChunk=t,!0};h.prototype.toString=function(){for(var t=this.intro,e=this.firstChunk;e;)t+=e.toString(),e=e.next;return t+this.outro};h.prototype.isEmpty=function(){var t=this.firstChunk;do if(t.intro.length&&t.intro.trim()||t.content.length&&t.content.trim()||t.outro.length&&t.outro.trim())return!1;while(t=t.next);return!0};h.prototype.length=function(){var t=this.firstChunk,e=0;do e+=t.intro.length+t.content.length+t.outro.length;while(t=t.next);return e};h.prototype.trimLines=function(){return this.trim("[\\r\\n]")};h.prototype.trim=function(t){return this.trimStart(t).trimEnd(t)};h.prototype.trimEndAborted=function(t){var e=new RegExp((t||"\\s")+"+$");if(this.outro=this.outro.replace(e,""),this.outro.length)return!0;var r=this.lastChunk;do{var i=r.end,s=r.trimEnd(e);if(r.end!==i&&(this.lastChunk===r&&(this.lastChunk=r.next),this.byEnd[r.end]=r,this.byStart[r.next.start]=r.next,this.byEnd[r.next.end]=r.next),s)return!0;r=r.previous}while(r);return!1};h.prototype.trimEnd=function(t){return this.trimEndAborted(t),this};h.prototype.trimStartAborted=function(t){var e=new RegExp("^"+(t||"\\s")+"+");if(this.intro=this.intro.replace(e,""),this.intro.length)return!0;var r=this.firstChunk;do{var i=r.end,s=r.trimStart(e);if(r.end!==i&&(r===this.lastChunk&&(this.lastChunk=r.next),this.byEnd[r.end]=r,this.byStart[r.next.start]=r.next,this.byEnd[r.next.end]=r.next),s)return!0;r=r.next}while(r);return!1};h.prototype.trimStart=function(t){return this.trimStartAborted(t),this};const ct="__modules__",O="__export__",ut="__dynamic_import__",M="__module__",ht="window.__css__",F=V,pt=Y.isReferenced,dt=n=>n.type==="ObjectProperty"&&!n.computed;function ft(n,t,e){return{code:t?`
${ht} += ${JSON.stringify(t)}`:""}}function gt(n,t,e,r=j){const i=new h(t),s=F(t,{sourceFilename:n,sourceType:"module",plugins:r}).program.body,o=new Map,u=new Set,l=new Set,a=new Map;function f(c,p){const d=p.replace(/^\.\/+/,"");if(!e.isExist(d))throw new Error(`File "${d}" does not exist.`);if(l.has(d))return a.get(d);l.add(d);const v=`__import_${l.size}__`;return a.set(d,v),i.appendLeft(c.start,`const ${v} = ${ct}[${JSON.stringify(d)}]
`),v}function g(c,p=c){i.append(`
${O}(${M}, "${c}", () => ${p})`)}i.prepend(`const ${M} = __modules__[${JSON.stringify(n)}] = { [Symbol.toStringTag]: "Module" }

`);for(const c of s)if(c.type==="ImportDeclaration"&&c.source.value.startsWith("./")){const d=f(c,c.source.value);for(const v of c.specifiers)v.type==="ImportSpecifier"?o.set(v.local.name,`${d}.${v.imported.name}`):v.type==="ImportDefaultSpecifier"?o.set(v.local.name,`${d}.default`):o.set(v.local.name,d);i.remove(c.start,c.end)}for(const c of s){if(c.type==="ExportNamedDeclaration")if(c.declaration){if(c.declaration.type==="FunctionDeclaration"||c.declaration.type==="ClassDeclaration")g(c.declaration.id.name);else if(c.declaration.type==="VariableDeclaration")for(const p of c.declaration.declarations){const d=vt(p.id);for(const v of d)g(v)}i.remove(c.start,c.declaration.start)}else if(c.source){const p=f(c,c.source.value);for(const d of c.specifiers)g(d.exported.name,`${p}.${d.local.name}`);i.remove(c.start,c.end)}else{for(const p of c.specifiers){const d=p.local.name,v=o.get(d);g(p.exported.name,v||d)}i.remove(c.start,c.end)}if(c.type==="ExportDefaultDeclaration"&&i.overwrite(c.start,c.start+14,`${M}.default =`),c.type==="ExportAllDeclaration"){const p=f(c,c.source.value);i.remove(c.start,c.end),i.append(`
for (const key in ${p}) {
        if (key !== 'default') {
          ${O}(${M}, key, () => ${p}[key])
        }
      }`)}}for(const c of s)c.type!=="ImportDeclaration"&&Q(c,(p,d,v)=>{const C=o.get(p.name);if(!!C)if(dt(d)&&d.shorthand)(!d.inPattern||mt(d,v))&&i.appendLeft(p.end,`: ${C}`);else if(d.type==="ClassDeclaration"&&p===d.superClass){if(!u.has(p.name)){u.add(p.name);const J=v[1];i.prependRight(J.start,`const ${p.name} = ${C};
`)}}else i.overwrite(p.start,p.end,C)});return T(s,{enter(c,p){if(c.type==="Import"&&p.type==="CallExpression"){const d=p.arguments[0];d.type==="StringLiteral"&&d.value.startsWith("./")&&(i.overwrite(c.start,c.start+6,ut),i.overwrite(d.start,d.end,JSON.stringify(d.value.replace(/^\.\/+/,""))))}}}),{code:i.toString(),importedFiles:l}}function z(n,t,e=new Map){if(e.has(n))return;const{js:r,css:i}=n.compiled,{code:s,importedFiles:o}=gt(n.filename,r,t),{code:u}=ft(n.filename,i),l=s+u;for(const a of o)z(t.readFile(a),t,e);e.set(n,l)}function vt(n){return k(n).map(t=>t.name)}function k(n,t=[]){switch(n.type){case"Identifier":t.push(n);break;case"MemberExpression":let e=n;for(;e.type==="MemberExpression";)e=e.object;t.push(e);break;case"ObjectPattern":n.properties.forEach(r=>{r.type==="RestElement"?k(r.argument,t):k(r.value,t)});break;case"ArrayPattern":n.elements.forEach(r=>{r&&k(r,t)});break;case"RestElement":k(n.argument,t);break;case"AssignmentPattern":k(n.left,t);break}return t}function mt(n,t){if(n&&(n.type==="ObjectProperty"||n.type==="ArrayPattern")){let e=t.length;for(;e--;){const r=t[e];if(r.type==="AssignmentExpression")return!0;if(r.type!=="ObjectProperty"&&!r.type.endsWith("Pattern"))break}}return!1}async function B(n,t,e,r=new Set){const i=new h(t),s=new Set,o=F(t,{sourceFilename:n,sourceType:"module",plugins:[...j,"typescript"]}).program.body;function u(a){const f=a.match(/\/-\/(.*)@/)[1];return r.has(a)||s.add(a),f}for(const a of o)if(a.type==="ImportDeclaration"){const f=u(a.source.value);i.remove(a.source.start,a.source.end),i.appendLeft(a.source.start,`'${f}'`)}for(const a of o)if((a.type==="ExportNamedDeclaration"||a.type==="ExportAllDeclaration")&&a.source){const f=u(a.source.value);i.remove(a.source.start,a.source.end),i.appendRight(a.source.start,`'${f}'`)}let l=[{filePath:n,content:`declare module '${n}' { ${i.toString()} }`}];return s.forEach(a=>r.add(a)),await Promise.all(Array.from(s.values()).map(async a=>{const f=await e(a),g=a.match(/\/-\/(.*)@/)[1],c=await B(g,f,e,r);l=l.concat(c)})),l}function Nt(n,t,e){return z(n,t,e)}var yt=`<svg t="1631631233593" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2480" width="24" height="24"><path d="M846.416977 421.154969c-7.857968-29.366841-19.485797-57.192583-34.354436-82.913385l65.271586-98.513688-0.107447-0.107447-92.849688-92.848665-0.107447-0.107447-98.513688 65.271586c-25.718755-14.869662-53.544497-26.495444-82.912361-34.355459L579.340199 61.780065l-0.152473 0L447.877075 61.780065l-0.151449 0-23.502273 115.801423c-29.366841 7.858992-57.192583 19.485797-82.914408 34.355459l-98.513688-65.271586-0.107447 0.107447-92.849688 92.849688-0.107447 0.107447 65.272609 98.513688c-14.869662 25.720801-26.495444 53.546543-34.355459 82.913385L64.848449 444.657242l0 0.152473 0 131.309628 0 0.151449 115.801423 23.50125c7.860015 29.365818 19.485797 57.192583 34.355459 82.913385l-65.271586 98.514711 0.107447 0.106424 92.849688 92.848665 0.107447 0.107447 98.513688-65.271586c25.720801 14.869662 53.546543 26.495444 82.914408 34.355459l23.502273 115.801423 0.152473 0 131.309628 0 0.151449 0 23.502273-115.801423c29.366841-7.860015 57.192583-19.485797 82.912361-34.355459l98.513688 65.271586 0.107447-0.107447 92.850711-92.848665 0.107447-0.106424-65.272609-98.514711c14.870686-25.720801 26.497491-53.546543 34.354436-82.913385l115.802446-23.50125 0-0.152473L962.220447 444.808692l0-0.151449L846.416977 421.154969zM669.350213 510.465041c0 86.054935-69.761853 155.815765-155.817812 155.815765-86.054935 0-155.818835-69.76083-155.818835-155.815765 0-86.055958 69.762877-155.816788 155.818835-155.816788C599.589382 354.648252 669.350213 424.409083 669.350213 510.465041z" p-id="2481"></path></svg>
`,wt=`<svg svg t="1631378872341" class="icon-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1198" width="20" height="20"><path d="M466.773333 512l-254.72 254.72 45.226667 45.226667L512 557.226667l254.72 254.72 45.226667-45.226667L557.226667 512l254.72-254.72-45.226667-45.226667L512 466.773333 257.28 212.053333 212.053333 257.28 466.773333 512z" fill="#e1e1e1" p-id="1199"></path></svg>
`,bt=`<svg t="1631930302196" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1341" width="18" height="18"><path d="M51.327944 344.293596l437.36626 244.999363a53.635945 53.635945 0 0 0 25.889754 6.823656h0.602087a53.987163 53.987163 0 0 0 26.240972-6.823656l429.689647-244.246754a48.86942 48.86942 0 0 0-0.351217-85.998138L533.399187 14.048704a53.987163 53.987163 0 0 0-52.732814 0L50.976726 258.295458a48.819246 48.819246 0 0 0 0.351218 85.998138z m455.780097-252.425107l375.752658 210.73056-367.925523 209.124994L139.182518 301.043657z" fill="#e1e1e1" p-id="1342"></path><path d="M26.742712 550.357979l452.719486 254.331717a62.617081 62.617081 0 0 0 60.810819 0l454.977314-254.381891a40.139154 40.139154 0 0 0 15.453574-54.890293 40.691068 40.691068 0 0 0-55.191337-15.353227l-445.544613 249.063453-443.286785-248.912931a40.741242 40.741242 0 0 0-55.191337 15.052183 40.139154 40.139154 0 0 0 15.252879 55.090989z" fill="#e1e1e1" p-id="1343"></path><path d="M955.462394 684.523103l-445.544613 249.063452-443.236611-249.013279a40.691068 40.691068 0 0 0-55.191337 15.052183 40.139154 40.139154 0 0 0 15.353226 54.940468l452.719487 254.331716a62.466559 62.466559 0 0 0 60.810819 0l454.977314-254.331716a40.139154 40.139154 0 0 0 15.453574-54.890294 40.640894 40.640894 0 0 0-55.341859-15.15253z" fill="#e1e1e1" p-id="1344"></path></svg>
`,kt=`<svg t="1631930256862" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1021" width="18" height="18"><path d="M976.635798 644.584644a40.139154 40.139154 0 0 0-40.139154 40.139154v198.989858a52.732814 52.732814 0 0 1-52.732814 52.582292H140.48704a52.68264 52.68264 0 0 1-52.732814-52.582292v-198.88951a40.139154 40.139154 0 0 0-80.729874 0v198.989858A133.462688 133.462688 0 0 0 140.48704 1016.975648h743.076094a133.462688 133.462688 0 0 0 133.462688-133.161644v-198.989858a40.139154 40.139154 0 0 0-40.390024-40.239502z" fill="#e1e1e1" p-id="1022"></path><path d="M483.877505 786.526728a40.390024 40.390024 0 0 0 57.047773 0l267.276594-266.674506a40.139154 40.139154 0 1 0-57.047773-56.947425l-198.688814 198.187074V47.46455a40.139154 40.139154 0 0 0-80.830222 0v613.075408l-198.538292-198.187074a40.139154 40.139154 0 1 0-57.097947 56.947425z" fill="#e1e1e1" p-id="1023"></path></svg>
`,xt=`
<button id="entry">
  ${yt}
</button>
<div id="panel" style="display: none;">
  <ul class="menu">
    <li class="title">
      Setting
      ${wt}
    </li>
    <li key="Installed" class="active">
      ${bt}
      Installed
    </li>
    <li key="Packages">
      ${kt}
      Packages
    </li>
  </ul>
  <div class="result">
    <input type="text" class="filter item" placeholder="pick package">
    <div class="content"></div>
  </div>
<style>
@keyframes input-error {
  to {
    transform: scale(.92);
  }
}
.input-error {
  animation: input-error .1s linear 4 alternate;
}
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(0, 0, 0, 0.5);
}
button {
  background: transparent;
  outline: 0;
  border: 0;
  cursor: pointer;
}
button svg path {
  fill: #e1e1e1;
}
button:hover svg path {
  fill: #1e1e1e;
}
#panel {
  width: 1000px;
  background: #fff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1e1e1e;
  color: #e1e1e1;
  border-radius: 10px;
  height: 700px;
  overflow: hidden;
  z-index: 2147483647;
}
@media screen and (max-width: 1000px) {
  #panel {
    width: 100%;
  }
}
.show {
  display: flex !important;
}
.menu {
  margin: 0;
  padding: 0;
  list-style: none;
  border-right: 3px solid #111111;
  width: 25%;
  user-select: none;
}
.menu li {
  color: #e1e1e1;
  padding: 20px;
  cursor: default;
}
.icon-close {
  float: right;
  cursor: pointer;
}
.menu li[key] {
  cursor: pointer;
}
.menu li.active {
  background: #555;
}
.result {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  overflow-y: scroll;
}
.filter {
  height: 40px;
  color: #e1e1e1;
  padding: 0 20px;
  font-size: 18px;
  outline: 0;
  display: block;
}
.item {
  position: relative;
  box-sizing: border-box;
  width: 95%;
  margin: 12px auto;
  border: 1px solid #111;
  background: #1e1e1e;
  padding: 15px;
  border-radius: 5px;
}
.pkg-title {
  font-size: 24px;
  margin: 0;
  color: #e1e1e1;
}
.pkg-desc {
  font-size: 16px;
  color: #bbb;
  padding: 10px 0;
  word-break: break-all;
}
.pkg-ctrl {
  position: absolute;
  font-size: 16px;
  text-align: right;
  padding: 10px 16px;
  border-radius: 5px;
  background: #000;
  top: 12px;
  right: 15px;
}
.pkg-ctrl button {
  color: #e1e1e1;
}
.installed {
  background: #3f3f3f;
}
select-box {
  width: 90px;
  display: none;
}
</style>
`;const Et=n=>n[0]==="/"?n:`/${n}`,St=n=>n?"@"+n:"",Ct=n=>`https://api.skypack.dev/v1/search?q=${n}&count=12`,Lt=n=>`https://api.skypack.dev/v1/package/${n}`,A=(n,t,e)=>`https://cdn.skypack.dev${Et(n)}${St(t)}`+(e||"");async function jt(n,t){const e=await fetch(A(n,t,"?dts"));if(!e.ok)return[];const r=await fetch(A(e.headers.get("x-typescript-types")));if(!e.ok)return[];const i=await r.text();return(await B("vue",i,async o=>{const l=await(await fetch(A(o))).text();return Promise.resolve(l)})).reverse()}async function $t(n){if(!n)return[];const t=await fetch(Ct(n));return t.ok?(await t.json()).results:[]}async function U(n){const t=await fetch(Lt(n));if(!t.ok)throw"load package data error";return await t.json()}function H(n){return new CustomEvent("unpkg-change",{detail:n})}function K(n){const t=n.target,e=w(t),{panel:r}=e;r.classList.toggle("show"),S(e.installed,e.resultContent,!0)}function It(n){const t=n.target;if(t.tagName!=="LI"||!t.hasAttribute("key"))return;const e=w(t);n.currentTarget.querySelector(".active").classList.toggle("active",!1),t.classList.toggle("active",!0),e.activeMenu=t.getAttribute("key"),Mt(e)}function Mt(n){const{keywordInput:t,resultContent:e,activeMenu:r}=n;switch(Array.from(e.children).forEach(i=>i.remove()),t.value="",r){case"Installed":{S(n.installed,e,n.activeMenu==="Installed");break}}}function S(n,t,e){const r=w(t),i=new Set(r.installed.map(s=>s.name));t.innerHTML=n.reduce((s,o)=>{const u=o.version,l=e?"uninstall":i.has(o.name)?"\u2714 installed":"install";return s.concat(['<div class="item">',`<a class="pkg-title" target="_blank" href="https://www.npmjs.com/package/${o.name}${u?"/v/"+u:""}">${o.name}${u?"@"+u:""}</a>`,`<div class="pkg-desc">${o.description}</div>`,`<div class="pkg-ctrl ${l}">`,'<select-box placeholder="pick package"></select-box>',`<button key="${l}" name="${o.name}">${l}</button>`,"</div></div>"])},[]).join(`
`)}async function Pt(){const n=w(this),t=n.keywordInput.value;switch(n.activeMenu){case"Packages":{const e=await $t(t);S(e,n.resultContent,!1);break}case"Installed":{const e=new RegExp(`[${t}]{${t.length}}`),r=n.installed.filter(i=>e.test(i.name));S(r,n.resultContent,!0);break}}}async function Rt(n){const t=n.target;if(t.tagName==="BUTTON")switch(t.innerHTML){case"install":{const e=t.getAttribute("name"),r=await U(e),i=Object.keys(r.versions),s=t.previousElementSibling;s.innerHTML=i.splice(i.length-13).sort().reverse().map(o=>`<option-box value="${o}">${o}</option-box>`).join(""),s.style.display="inline-block",t.innerHTML='<button key="confirm">confirm</button>  <button key="cancel">cancel</button>';break}case"uninstall":{const e=w(t),r=t.getAttribute("name"),i=e.installed.findIndex(s=>s.name===r);if(i!==-1){const s=e.installed[i];e.installed.splice(i,1),S(e.installed,e.resultContent,!0),e.dispatchEvent(H({item:s,list:e.installed,action:"delete"}))}break}case"confirm":{const e=t.parentElement,r=e.previousElementSibling,i=r.value;if(!i){r.classList.toggle("input-error",!0),setTimeout(()=>{r.classList.toggle("input-error",!1)},400);break}const s=w(t);r.style.display="none",e.innerHTML="\u2714 installed",e.parentElement.classList.toggle("installed",!0);const o=e.parentElement.parentElement,u=o.querySelector(".pkg-title").innerHTML,l=o.querySelector(".pkg-desc").innerHTML,a={name:u,version:i,description:l};s.installed.push(a),s.dispatchEvent(H({list:s.installed,item:a,action:"add"}));break}case"cancel":{const e=t.parentElement.previousElementSibling;t.parentElement.innerHTML="install",e.style.display="none";break}}}class q extends HTMLElement{constructor(){super();this.activeMenu="Installed",this.installed=[],this.keywordFileter=W(Pt);const t=this.attachShadow({mode:"open"}),e=this.ownerDocument.createElement("div");e.style.width="inherit",e.style.height="inherit",e.innerHTML=xt,t.appendChild(e)}async installPackage(t){for(const e in t){const r=t[e],i=await U(e);this.installed.push({version:r,name:e,description:i.description})}}connectedCallback(){const{entry:t,menu:e,keywordInput:r,resultContent:i,iconClose:s}=this;t.addEventListener("click",K),e.addEventListener("click",It),r.addEventListener("input",this.keywordFileter),i.addEventListener("click",Rt),s.addEventListener("click",K)}disconnectedCallback(){}get entry(){return this.shadowRoot.querySelector("#entry")}get panel(){return this.shadowRoot.querySelector("#panel")}get menu(){return this.shadowRoot.querySelector("ul.menu")}get resultContent(){return this.shadowRoot.querySelector(".result .content")}get keywordInput(){return this.shadowRoot.querySelector(".result .filter")}get iconClose(){return this.shadowRoot.querySelector(".icon-close")}}function Dt(){window.customElements.get("unpkg-manage")||(G(),window.UnpkgManage=q,window.customElements.define("unpkg-manage",q))}export{A as S,Dt as i,Nt as p,jt as r};
