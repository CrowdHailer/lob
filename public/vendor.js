// Ion.Sound | version 3.0.7 | https://github.com/IonDen/ion.sound
(function(l,e,n,r){l.ion=l.ion||{};if(!ion.sound){var m=function(a){a||(a="undefined");if(l.console){console.warn&&"function"===typeof console.warn?console.warn(a):console.log&&"function"===typeof console.log&&console.log(a);var g=n&&n("#debug");if(g&&g.length){var b=g.html();g.html(b+a+"<br/>")}}},f=function(a,b){var c;b=b||{};for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b};if("function"!==typeof Audio&&"object"!==typeof Audio)e=function(){m("HTML5 Audio is not supported in this browser")},
ion.sound=e,ion.sound.play=e,ion.sound.stop=e,ion.sound.pause=e,ion.sound.preload=e,ion.sound.destroy=e,e();else{e=/iPad|iPhone|iPod/.test(e.appVersion);var q=0,c={},d={},b;!c.supported&&e?c.supported=["mp3","mp4","aac"]:c.supported||(c.supported=["mp3","ogg","mp4","aac","wav"]);ion.sound=function(a){f(a,c);c.path=c.path||"";c.volume=c.volume||1;c.preload=c.preload||!1;c.multiplay=c.multiplay||!1;c.loop=c.loop||!1;c.sprite=c.sprite||null;c.scope=c.scope||null;c.ready_callback=c.ready_callback||null;
c.ended_callback=c.ended_callback||null;if(q=c.sounds.length)for(b=0;b<q;b++){a=c.sounds[b];var g=a.alias||a.name;d[g]||(d[g]=new p(a),d[g].init())}else m("No sound-files provided!")};ion.sound.VERSION="3.0.7";ion.sound._method=function(a,c,e){if(c)d[c]&&d[c][a](e);else for(b in d)if(d.hasOwnProperty(b)&&d[b])d[b][a](e)};ion.sound.preload=function(a,b){b=b||{};f({preload:!0},b);ion.sound._method("init",a,b)};ion.sound.destroy=function(a){ion.sound._method("destroy",a);if(a)d[a]=null;else for(b in d)d.hasOwnProperty(b)&&
d[b]&&(d[b]=null)};ion.sound.play=function(a,b){ion.sound._method("play",a,b)};ion.sound.stop=function(a,b){ion.sound._method("stop",a,b)};ion.sound.pause=function(a,b){ion.sound._method("pause",a,b)};ion.sound.volume=function(a,b){ion.sound._method("volume",a,b)};n&&(n.ionSound=ion.sound);e=l.AudioContext||l.webkitAudioContext;var h;e&&(h=new e);var p=function(a){this.options=f(c);delete this.options.sounds;f(a,this.options);this.request=null;this.streams={};this.result={};this.ext=0;this.url="";
this.autoplay=this.no_file=this.decoded=this.loaded=!1};p.prototype={init:function(a){a&&f(a,this.options);this.options.preload&&this.load()},destroy:function(){var a;for(b in this.streams)(a=this.streams[b])&&a.destroy();this.streams={};this.result=null;this.options=this.options.buffer=null;this.request&&(this.request.removeEventListener("load",this.ready.bind(this),!1),this.request.removeEventListener("error",this.error.bind(this),!1),this.request.abort(),this.request=null)},createUrl:function(){var a=
(new Date).valueOf();this.url=this.options.path+encodeURIComponent(this.options.name)+"."+this.options.supported[this.ext]+"?"+a},load:function(){this.no_file?m('No sources for "'+this.options.name+'" sound :('):this.request||(this.createUrl(),this.request=new XMLHttpRequest,this.request.open("GET",this.url,!0),this.request.responseType="arraybuffer",this.request.addEventListener("load",this.ready.bind(this),!1),this.request.addEventListener("error",this.error.bind(this),!1),this.request.send())},
reload:function(){this.ext++;this.options.supported[this.ext]?this.load():(this.no_file=!0,m('No sources for "'+this.options.name+'" sound :('))},ready:function(a){this.result=a.target;4!==this.result.readyState?this.reload():200!==this.result.status&&0!==this.result.status?(m(this.url+" was not found on server!"),this.reload()):(this.request.removeEventListener("load",this.ready.bind(this),!1),this.request.removeEventListener("error",this.error.bind(this),!1),this.request=null,this.loaded=!0,this.decode())},
decode:function(){h&&h.decodeAudioData(this.result.response,this.setBuffer.bind(this),this.error.bind(this))},setBuffer:function(a){this.options.buffer=a;this.decoded=!0;a={name:this.options.name,alias:this.options.alias,ext:this.options.supported[this.ext],duration:this.options.buffer.duration};this.options.ready_callback&&"function"===typeof this.options.ready_callback&&this.options.ready_callback.call(this.options.scope,a);if(this.options.sprite)for(b in this.options.sprite)this.options.start=
this.options.sprite[b][0],this.options.end=this.options.sprite[b][1],this.streams[b]=new k(this.options,b);else this.streams[0]=new k(this.options);this.autoplay&&(this.autoplay=!1,this.play())},error:function(){this.reload()},play:function(a){delete this.options.part;a&&f(a,this.options);if(!this.loaded)this.autoplay=!0,this.load();else if(!this.no_file&&this.decoded)if(this.options.sprite)if(this.options.part)this.streams[this.options.part].play(this.options);else for(b in this.options.sprite)this.streams[b].play(this.options);
else this.streams[0].play(this.options)},stop:function(a){if(this.options.sprite)if(a)this.streams[a.part].stop();else for(b in this.options.sprite)this.streams[b].stop();else this.streams[0].stop()},pause:function(a){if(this.options.sprite)if(a)this.streams[a.part].pause();else for(b in this.options.sprite)this.streams[b].pause();else this.streams[0].pause()},volume:function(a){if(a)if(f(a,this.options),this.options.sprite)if(this.options.part)(a=this.streams[this.options.part])&&a.setVolume(this.options);
else for(b in this.options.sprite)(a=this.streams[b])&&a.setVolume(this.options);else(a=this.streams[0])&&a.setVolume(this.options)}};var k=function(a,b){this.alias=a.alias;this.name=a.name;this.sprite_part=b;this.buffer=a.buffer;this.start=a.start||0;this.end=a.end||this.buffer.duration;this.multiplay=a.multiplay||!1;this.volume=a.volume||1;this.scope=a.scope;this.ended_callback=a.ended_callback;this.setLoop(a);this.gain=this.source=null;this.paused=this.playing=!1;this.time_offset=this.time_played=
this.time_ended=this.time_started=0};k.prototype={destroy:function(){this.stop();this.source=this.buffer=null;this.gain&&this.gain.disconnect();this.source&&this.source.disconnect();this.source=this.gain=null},setLoop:function(a){this.loop=!0===a.loop?9999999:"number"===typeof a.loop?+a.loop-1:!1},update:function(a){this.setLoop(a);"volume"in a&&(this.volume=a.volume)},play:function(a){a&&this.update(a);if(this.multiplay||!this.playing)this.gain=h.createGain(),this.source=h.createBufferSource(),this.source.buffer=
this.buffer,this.source.connect(this.gain),this.gain.connect(h.destination),this.gain.gain.value=this.volume,this.source.onended=this.ended.bind(this),this._play()},_play:function(){var a,b;this.paused?(a=this.start+this.time_offset,b=this.end-this.time_offset):(a=this.start,b=this.end);0>=b?this.clear():("function"===typeof this.source.start?this.source.start(0,a,b):this.source.noteOn(0,a,b),this.playing=!0,this.paused=!1,this.time_started=(new Date).valueOf())},stop:function(){this.playing&&this.source&&
("function"===typeof this.source.stop?this.source.stop(0):this.source.noteOff(0));this.clear()},pause:function(){this.paused?this.play():this.playing&&(this.source&&this.source.stop(0),this.paused=!0)},ended:function(){this.playing=!1;this.time_ended=(new Date).valueOf();this.time_played=(this.time_ended-this.time_started)/1E3;this.time_offset+=this.time_played;if(this.time_offset>=this.end||.015>this.end-this.time_offset)this._ended(),this.clear(),this.loop&&(this.loop--,this.play())},_ended:function(){var a=
{name:this.name,alias:this.alias,part:this.sprite_part,start:this.start,duration:this.end};this.ended_callback&&"function"===typeof this.ended_callback&&this.ended_callback.call(this.scope,a)},clear:function(){this.time_offset=this.time_played=0;this.playing=this.paused=!1},setVolume:function(a){this.volume=a.volume;this.gain&&(this.gain.gain.value=this.volume)}};h||(function(){var a=new Audio,b=a.canPlayType("audio/mpeg"),e=a.canPlayType("audio/ogg"),a=a.canPlayType('audio/mp4; codecs="mp4a.40.2"'),
d,f;for(f=0;f<c.supported.length;f++)d=c.supported[f],b||"mp3"!==d||c.supported.splice(f,1),e||"ogg"!==d||c.supported.splice(f,1),a||"aac"!==d||c.supported.splice(f,1),a||"mp4"!==d||c.supported.splice(f,1)}(),p.prototype={init:function(a){a&&f(a,this.options);this.inited=!0;this.options.preload&&this.load()},destroy:function(){var a;for(b in this.streams)(a=this.streams[b])&&a.destroy();this.streams={};this.inited=this.loaded=!1},load:function(){var a;this.options.preload=!0;this.options._ready=this.ready;
this.options._scope=this;if(this.options.sprite)for(b in this.options.sprite)a=this.options.sprite[b],this.options.start=a[0],this.options.end=a[1],this.streams[b]=new k(this.options,b);else this.streams[0]=new k(this.options)},ready:function(a){this.loaded||(this.loaded=!0,a={name:this.options.name,alias:this.options.alias,ext:this.options.supported[this.ext],duration:a},this.options.ready_callback&&"function"===typeof this.options.ready_callback&&this.options.ready_callback.call(this.options.scope,
a),this.autoplay&&(this.autoplay=!1,this.play()))},play:function(a){if(this.inited)if(delete this.options.part,a&&f(a,this.options),console.log(1),this.loaded)if(this.options.sprite)if(this.options.part)this.streams[this.options.part].play(this.options);else for(b in this.options.sprite)this.streams[b].play(this.options);else this.streams[0].play(this.options);else this.options.preload?this.autoplay=!0:(this.autoplay=!0,this.load())},stop:function(a){if(this.inited)if(this.options.sprite)if(a)this.streams[a.part].stop();
else for(b in this.options.sprite)this.streams[b].stop();else this.streams[0].stop()},pause:function(a){if(this.inited)if(this.options.sprite)if(a)this.streams[a.part].pause();else for(b in this.options.sprite)this.streams[b].pause();else this.streams[0].pause()},volume:function(a){if(a)if(f(a,this.options),this.options.sprite)if(this.options.part)(a=this.streams[this.options.part])&&a.setVolume(this.options);else for(b in this.options.sprite)(a=this.streams[b])&&a.setVolume(this.options);else(a=
this.streams[0])&&a.setVolume(this.options)}},k=function(a,b){this.name=a.name;this.alias=a.alias;this.sprite_part=b;this.multiplay=a.multiplay;this.volume=a.volume;this.preload=a.preload;this.path=c.path;this.start=a.start||0;this.end=a.end||0;this.scope=a.scope;this.ended_callback=a.ended_callback;this._scope=a._scope;this._ready=a._ready;this.setLoop(a);this.url=this.sound=null;this.loaded=!1;this.played_time=this.paused_time=this.start_time=0;this.init()},k.prototype={init:function(){this.sound=
new Audio;this.sound.volume=this.volume;this.createUrl();this.sound.addEventListener("ended",this.ended.bind(this),!1);this.sound.addEventListener("canplaythrough",this.can_play_through.bind(this),!1);this.sound.addEventListener("timeupdate",this._update.bind(this),!1);this.load()},destroy:function(){this.stop();this.sound.removeEventListener("ended",this.ended.bind(this),!1);this.sound.removeEventListener("canplaythrough",this.can_play_through.bind(this),!1);this.sound.removeEventListener("timeupdate",
this._update.bind(this),!1);this.sound=null;this.loaded=!1},createUrl:function(){var a=(new Date).valueOf();this.url=this.path+encodeURIComponent(this.name)+"."+c.supported[0]+"?"+a},can_play_through:function(){this.preload&&this.ready()},load:function(){this.sound.src=this.url;this.sound.preload=this.preload?"auto":"none";this.preload&&this.sound.load()},setLoop:function(a){this.loop=!0===a.loop?9999999:"number"===typeof a.loop?+a.loop-1:!1},update:function(a){this.setLoop(a);"volume"in a&&(this.volume=
a.volume)},ready:function(){!this.loaded&&this.sound&&(this.loaded=!0,this._ready.call(this._scope,this.sound.duration),this.end||(this.end=this.sound.duration))},play:function(a){a&&this.update(a);!this.multiplay&&this.playing||this._play()},_play:function(){if(this.paused)this.paused=!1;else try{this.sound.currentTime=this.start}catch(a){}this.playing=!0;this.start_time=(new Date).valueOf();this.sound.volume=this.volume;this.sound.play()},stop:function(){if(this.playing){this.paused=this.playing=
!1;this.sound.pause();this.clear();try{this.sound.currentTime=this.start}catch(a){}}},pause:function(){this.paused?this._play():(this.playing=!1,this.paused=!0,this.sound.pause(),this.paused_time=(new Date).valueOf(),this.played_time+=this.paused_time-this.start_time)},_update:function(){this.start_time&&(this.played_time+((new Date).valueOf()-this.start_time))/1E3>=this.end&&this.playing&&(this.stop(),this._ended())},ended:function(){this.playing&&(this.stop(),this._ended())},_ended:function(){this.playing=
!1;var a={name:this.name,alias:this.alias,part:this.sprite_part,start:this.start,duration:this.end};this.ended_callback&&"function"===typeof this.ended_callback&&this.ended_callback.call(this.scope,a);this.loop&&setTimeout(this.looper.bind(this),15)},looper:function(){this.loop--;this.play()},clear:function(){this.paused_time=this.played_time=this.start_time=0},setVolume:function(a){this.volume=a.volume;this.sound&&(this.sound.volume=this.volume)}})}}})(window,navigator,window.jQuery||window.$);
/**
 * StyleFix 1.0.3 & PrefixFree 1.0.7
 * @author Lea Verou
 * MIT license
 */
(function(){function k(a,b){return[].slice.call((b||document).querySelectorAll(a))}if(window.addEventListener){var e=window.StyleFix={link:function(a){var c=a.href||a.getAttribute("data-href");try{if(!c||"stylesheet"!==a.rel||a.hasAttribute("data-noprefix"))return}catch(b){return}var d=c.replace(/[^\/]+$/,""),h=(/^[a-z]{3,10}:/.exec(d)||[""])[0],l=(/^[a-z]{3,10}:\/\/[^\/]+/.exec(d)||[""])[0],g=/^([^?]*)\??/.exec(c)[1],m=a.parentNode,f=new XMLHttpRequest,n;f.onreadystatechange=function(){4===f.readyState&&
n()};n=function(){var b=f.responseText;if(b&&a.parentNode&&(!f.status||400>f.status||600<f.status)){b=e.fix(b,!0,a);if(d)var b=b.replace(/url\(\s*?((?:"|')?)(.+?)\1\s*?\)/gi,function(b,a,c){return/^([a-z]{3,10}:|#)/i.test(c)?b:/^\/\//.test(c)?'url("'+h+c+'")':/^\//.test(c)?'url("'+l+c+'")':/^\?/.test(c)?'url("'+g+c+'")':'url("'+d+c+'")'}),c=d.replace(/([\\\^\$*+[\]?{}.=!:(|)])/g,"\\$1"),b=b.replace(RegExp("\\b(behavior:\\s*?url\\('?\"?)"+c,"gi"),"$1");c=document.createElement("style");c.textContent='/*# sourceURL='+a.getAttribute('href')+' */\n/*@ sourceURL='+a.getAttribute('href')+' */\n' +
b;c.media=a.media;c.disabled=a.disabled;c.setAttribute("data-href",a.getAttribute("href"));m.insertBefore(c,a);m.removeChild(a);c.media=a.media}};try{f.open("GET",c),f.send(null)}catch(p){"undefined"!=typeof XDomainRequest&&(f=new XDomainRequest,f.onerror=f.onprogress=function(){},f.onload=n,f.open("GET",c),f.send(null))}a.setAttribute("data-inprogress","")},styleElement:function(a){if(!a.hasAttribute("data-noprefix")){var b=a.disabled;a.textContent=e.fix(a.textContent,!0,a);a.disabled=b}},styleAttribute:function(a){var b=
a.getAttribute("style"),b=e.fix(b,!1,a);a.setAttribute("style",b)},process:function(){k('link[rel="stylesheet"]:not([data-inprogress])').forEach(StyleFix.link);k("style").forEach(StyleFix.styleElement);k("[style]").forEach(StyleFix.styleAttribute)},register:function(a,b){(e.fixers=e.fixers||[]).splice(void 0===b?e.fixers.length:b,0,a)},fix:function(a,b,c){for(var d=0;d<e.fixers.length;d++)a=e.fixers[d](a,b,c)||a;return a},camelCase:function(a){return a.replace(/-([a-z])/g,function(b,a){return a.toUpperCase()}).replace("-",
"")},deCamelCase:function(a){return a.replace(/[A-Z]/g,function(b){return"-"+b.toLowerCase()})}};(function(){setTimeout(function(){k('link[rel="stylesheet"]').forEach(StyleFix.link)},10);document.addEventListener("DOMContentLoaded",StyleFix.process,!1)})()}})();
(function(k){function e(b,c,d,h,l){b=a[b];b.length&&(b=RegExp(c+"("+b.join("|")+")"+d,"gi"),l=l.replace(b,h));return l}if(window.StyleFix&&window.getComputedStyle){var a=window.PrefixFree={prefixCSS:function(b,c,d){var h=a.prefix;-1<a.functions.indexOf("linear-gradient")&&(b=b.replace(/(\s|:|,)(repeating-)?linear-gradient\(\s*(-?\d*\.?\d*)deg/ig,function(b,a,c,d){return a+(c||"")+"linear-gradient("+(90-d)+"deg"}));b=e("functions","(\\s|:|,)","\\s*\\(","$1"+h+"$2(",b);b=e("keywords","(\\s|:)","(\\s|;|\\}|$)",
"$1"+h+"$2$3",b);b=e("properties","(^|\\{|\\s|;)","\\s*:","$1"+h+"$2:",b);if(a.properties.length){var l=RegExp("\\b("+a.properties.join("|")+")(?!:)","gi");b=e("valueProperties","\\b",":(.+?);",function(a){return a.replace(l,h+"$1")},b)}c&&(b=e("selectors","","\\b",a.prefixSelector,b),b=e("atrules","@","\\b","@"+h+"$1",b));b=b.replace(RegExp("-"+h,"g"),"-");return b=b.replace(/-\*-(?=[a-z]+)/gi,a.prefix)},property:function(b){return(0<=a.properties.indexOf(b)?a.prefix:"")+b},value:function(b,c){b=
e("functions","(^|\\s|,)","\\s*\\(","$1"+a.prefix+"$2(",b);b=e("keywords","(^|\\s)","(\\s|$)","$1"+a.prefix+"$2$3",b);0<=a.valueProperties.indexOf(c)&&(b=e("properties","(^|\\s|,)","($|\\s|,)","$1"+a.prefix+"$2$3",b));return b},prefixSelector:function(b){return b.replace(/^:{1,2}/,function(b){return b+a.prefix})},prefixProperty:function(b,c){var d=a.prefix+b;return c?StyleFix.camelCase(d):d}};(function(){var b={},c=[],d=getComputedStyle(document.documentElement,null),h=document.createElement("div").style,
l=function(a){if("-"===a.charAt(0)){c.push(a);a=a.split("-");var d=a[1];for(b[d]=++b[d]||1;3<a.length;)a.pop(),d=a.join("-"),StyleFix.camelCase(d)in h&&-1===c.indexOf(d)&&c.push(d)}};if(0<d.length)for(var g=0;g<d.length;g++)l(d[g]);else for(var e in d)l(StyleFix.deCamelCase(e));var g=0,f,k;for(k in b)d=b[k],g<d&&(f=k,g=d);a.prefix="-"+f+"-";a.Prefix=StyleFix.camelCase(a.prefix);a.properties=[];for(g=0;g<c.length;g++)e=c[g],0===e.indexOf(a.prefix)&&(f=e.slice(a.prefix.length),StyleFix.camelCase(f)in
h||a.properties.push(f));!("Ms"!=a.Prefix||"transform"in h||"MsTransform"in h)&&"msTransform"in h&&a.properties.push("transform","transform-origin");a.properties.sort()})();(function(){function b(a,b){h[b]="";h[b]=a;return!!h[b]}var c={"linear-gradient":{property:"backgroundImage",params:"red, teal"},calc:{property:"width",params:"1px + 5%"},element:{property:"backgroundImage",params:"#foo"},"cross-fade":{property:"backgroundImage",params:"url(a.png), url(b.png), 50%"}};c["repeating-linear-gradient"]=
c["repeating-radial-gradient"]=c["radial-gradient"]=c["linear-gradient"];var d={initial:"color","zoom-in":"cursor","zoom-out":"cursor",box:"display",flexbox:"display","inline-flexbox":"display",flex:"display","inline-flex":"display",grid:"display","inline-grid":"display","max-content":"width","min-content":"width","fit-content":"width","fill-available":"width"};a.functions=[];a.keywords=[];var h=document.createElement("div").style,e;for(e in c){var g=c[e],k=g.property,g=e+"("+g.params+")";!b(g,k)&&
b(a.prefix+g,k)&&a.functions.push(e)}for(var f in d)k=d[f],!b(f,k)&&b(a.prefix+f,k)&&a.keywords.push(f)})();(function(){function b(a){e.textContent=a+"{}";return!!e.sheet.cssRules.length}var c={":read-only":null,":read-write":null,":any-link":null,"::selection":null},d={keyframes:"name",viewport:null,document:'regexp(".")'};a.selectors=[];a.atrules=[];var e=k.appendChild(document.createElement("style")),l;for(l in c){var g=l+(c[l]?"("+c[l]+")":"");!b(g)&&b(a.prefixSelector(g))&&a.selectors.push(l)}for(var m in d)g=
m+" "+(d[m]||""),!b("@"+g)&&b("@"+a.prefix+g)&&a.atrules.push(m);k.removeChild(e)})();a.valueProperties=["transition","transition-property"];k.className+=" "+a.prefix;StyleFix.register(a.prefixCSS)}})(document.documentElement);
/**
* UAParser.js v0.7.10
* Lightweight JavaScript-based User-Agent string parser
* https://github.com/faisalman/ua-parser-js
*
* Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
* Dual licensed under GPLv2 & MIT
*/(function(e,t){"use strict";var n="0.7.10",r="",i="?",s="function",o="undefined",u="object",a="string",f="major",l="model",c="name",h="type",p="vendor",d="version",v="architecture",m="console",g="mobile",y="tablet",b="smarttv",w="wearable",E="embedded",S={extend:function(e,t){for(var n in t)"browser cpu device engine os".indexOf(n)!==-1&&t[n].length%2===0&&(e[n]=t[n].concat(e[n]));return e},has:function(e,t){return typeof e=="string"?t.toLowerCase().indexOf(e.toLowerCase())!==-1:!1},lowerize:function(e){return e.toLowerCase()},major:function(e){return typeof e===a?e.split(".")[0]:t}},x={rgx:function(){var e,n=0,r,i,a,f,l,c,h=arguments;while(n<h.length&&!l){var p=h[n],d=h[n+1];if(typeof e===o){e={};for(a in d)d.hasOwnProperty(a)&&(f=d[a],typeof f===u?e[f[0]]=t:e[f]=t)}r=i=0;while(r<p.length&&!l){l=p[r++].exec(this.getUA());if(!!l)for(a=0;a<d.length;a++)c=l[++i],f=d[a],typeof f===u&&f.length>0?f.length==2?typeof f[1]==s?e[f[0]]=f[1].call(this,c):e[f[0]]=f[1]:f.length==3?typeof f[1]===s&&(!f[1].exec||!f[1].test)?e[f[0]]=c?f[1].call(this,c,f[2]):t:e[f[0]]=c?c.replace(f[1],f[2]):t:f.length==4&&(e[f[0]]=c?f[3].call(this,c.replace(f[1],f[2])):t):e[f]=c?c:t}n+=2}return e},str:function(e,n){for(var r in n)if(typeof n[r]===u&&n[r].length>0){for(var s=0;s<n[r].length;s++)if(S.has(n[r][s],e))return r===i?t:r}else if(S.has(n[r],e))return r===i?t:r;return e}},T={browser:{oldsafari:{version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{amazon:{model:{"Fire Phone":["SD","KF"]}},sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"}}}},N={browser:[[/(opera\smini)\/([\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,/(opera).+version\/([\w\.]+)/i,/(opera)[\/\s]+([\w\.]+)/i],[c,d],[/\s(opr)\/([\w\.]+)/i],[[c,"Opera"],d],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,/(?:ms|\()(ie)\s([\w\.]+)/i,/(rekonq)\/([\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i],[c,d],[/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],[[c,"IE"],d],[/(edge)\/((\d+)?[\w\.]+)/i],[c,d],[/(yabrowser)\/([\w\.]+)/i],[[c,"Yandex"],d],[/(comodo_dragon)\/([\w\.]+)/i],[[c,/_/g," "],d],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,/(qqbrowser)[\/\s]?([\w\.]+)/i],[c,d],[/(uc\s?browser)[\/\s]?([\w\.]+)/i,/ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,/JUC.+(ucweb)[\/\s]?([\w\.]+)/i],[[c,"UCBrowser"],d],[/(dolfin)\/([\w\.]+)/i],[[c,"Dolphin"],d],[/((?:android.+)crmo|crios)\/([\w\.]+)/i],[[c,"Chrome"],d],[/XiaoMi\/MiuiBrowser\/([\w\.]+)/i],[d,[c,"MIUI Browser"]],[/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i],[d,[c,"Android Browser"]],[/FBAV\/([\w\.]+);/i],[d,[c,"Facebook"]],[/fxios\/([\w\.-]+)/i],[d,[c,"Firefox"]],[/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],[d,[c,"Mobile Safari"]],[/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],[d,c],[/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[c,[d,x.str,T.browser.oldsafari.version]],[/(konqueror)\/([\w\.]+)/i,/(webkit|khtml)\/([\w\.]+)/i],[c,d],[/(navigator|netscape)\/([\w\.-]+)/i],[[c,"Netscape"],d],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,/(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,/(links)\s\(([\w\.]+)/i,/(gobrowser)\/?([\w\.]+)*/i,/(ice\s?browser)\/v?([\w\._]+)/i,/(mosaic)[\/\s]([\w\.]+)/i],[c,d]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[v,"amd64"]],[/(ia32(?=;))/i],[[v,S.lowerize]],[/((?:i[346]|x)86)[;\)]/i],[[v,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[v,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[v,/ower/,"",S.lowerize]],[/(sun4\w)[;\)]/i],[[v,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[[v,S.lowerize]]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[l,p,[h,y]],[/applecoremedia\/[\w\.]+ \((ipad)/],[l,[p,"Apple"],[h,y]],[/(apple\s{0,1}tv)/i],[[l,"Apple TV"],[p,"Apple"]],[/(archos)\s(gamepad2?)/i,/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[p,l,[h,y]],[/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i],[l,[p,"Amazon"],[h,y]],[/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i],[[l,x.str,T.device.amazon.model],[p,"Amazon"],[h,g]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[l,p,[h,g]],[/\((ip[honed|\s\w*]+);/i],[l,[p,"Apple"],[h,g]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[p,l,[h,g]],[/\(bb10;\s(\w+)/i],[l,[p,"BlackBerry"],[h,g]],[/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],[l,[p,"Asus"],[h,y]],[/(sony)\s(tablet\s[ps])\sbuild\//i,/(sony)?(?:sgp.+)\sbuild\//i],[[p,"Sony"],[l,"Xperia Tablet"],[h,y]],[/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],[[p,"Sony"],[l,"Xperia Phone"],[h,g]],[/\s(ouya)\s/i,/(nintendo)\s([wids3u]+)/i],[p,l,[h,m]],[/android.+;\s(shield)\sbuild/i],[l,[p,"Nvidia"],[h,m]],[/(playstation\s[34portablevi]+)/i],[l,[p,"Sony"],[h,m]],[/(sprint\s(\w+))/i],[[p,x.str,T.device.sprint.vendor],[l,x.str,T.device.sprint.model],[h,g]],[/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],[p,l,[h,y]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[p,[l,/_/g," "],[h,g]],[/(nexus\s9)/i],[l,[p,"HTC"],[h,y]],[/[\s\(;](xbox(?:\sone)?)[\s\);]/i],[l,[p,"Microsoft"],[h,m]],[/(kin\.[onetw]{3})/i],[[l,/\./g," "],[p,"Microsoft"],[h,g]],[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,/mot[\s-]?(\w+)*/i,/(XT\d{3,4}) build\//i,/(nexus\s[6])/i],[l,[p,"Motorola"],[h,g]],[/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],[l,[p,"Motorola"],[h,y]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,/((SM-T\w+))/i],[[p,"Samsung"],l,[h,y]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[p,"Samsung"],l,[h,g]],[/(samsung);smarttv/i],[p,l,[h,b]],[/\(dtv[\);].+(aquos)/i],[l,[p,"Sharp"],[h,b]],[/sie-(\w+)*/i],[l,[p,"Siemens"],[h,g]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[p,"Nokia"],l,[h,g]],[/android\s3\.[\s\w;-]{10}(a\d{3})/i],[l,[p,"Acer"],[h,y]],[/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],[[p,"LG"],l,[h,y]],[/(lg) netcast\.tv/i],[p,l,[h,b]],[/(nexus\s[45])/i,/lg[e;\s\/-]+(\w+)*/i],[l,[p,"LG"],[h,g]],[/android.+(ideatab[a-z0-9\-\s]+)/i],[l,[p,"Lenovo"],[h,y]],[/linux;.+((jolla));/i],[p,l,[h,g]],[/((pebble))app\/[\d\.]+\s/i],[p,l,[h,w]],[/android.+;\s(glass)\s\d/i],[l,[p,"Google"],[h,w]],[/android.+(\w+)\s+build\/hm\1/i,/android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,/android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],[[l,/_/g," "],[p,"Xiaomi"],[h,g]],[/\s(tablet)[;\/\s]/i,/\s(mobile)[;\/\s]/i],[[h,S.lowerize],p,l]],engine:[[/windows.+\sedge\/([\w\.]+)/i],[d,[c,"EdgeHTML"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[c,d],[/rv\:([\w\.]+).*(gecko)/i],[d,c]],os:[[/microsoft\s(windows)\s(vista|xp)/i],[c,d],[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[c,[d,x.str,T.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[c,"Windows"],[d,x.str,T.os.windows.version]],[/\((bb)(10);/i],[[c,"BlackBerry"],d],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)[\/\s]([\w\.]+)/i,/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,/linux;.+(sailfish);/i],[c,d],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[c,"Symbian"],d],[/\((series40);/i],[c],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[c,"Firefox OS"],d],[/(nintendo|playstation)\s([wids34portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(mageia|vectorlinux)[;\s]/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[c,d],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[c,"Chromium OS"],d],[/(sunos)\s?([\w\.]+\d)*/i],[[c,"Solaris"],d],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[c,d],[/(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i],[[c,"iOS"],[d,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i,/(macintosh|mac(?=_powerpc)\s)/i],[[c,"Mac OS"],[d,/_/g,"."]],[/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,/(unix)\s?([\w\.]+)*/i],[c,d]]},C=function(t,n){if(this instanceof C){var i=t||(e&&e.navigator&&e.navigator.userAgent?e.navigator.userAgent:r),s=n?S.extend(N,n):N;return this.getBrowser=function(){var e=x.rgx.apply(this,s.browser);return e.major=S.major(e.version),e},this.getCPU=function(){return x.rgx.apply(this,s.cpu)},this.getDevice=function(){return x.rgx.apply(this,s.device)},this.getEngine=function(){return x.rgx.apply(this,s.engine)},this.getOS=function(){return x.rgx.apply(this,s.os)},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return i},this.setUA=function(e){return i=e,this},this.setUA(i),this}return(new C(t,n)).getResult()};C.VERSION=n,C.BROWSER={NAME:c,MAJOR:f,VERSION:d},C.CPU={ARCHITECTURE:v},C.DEVICE={MODEL:l,VENDOR:p,TYPE:h,CONSOLE:m,MOBILE:g,SMARTTV:b,TABLET:y,WEARABLE:w,EMBEDDED:E},C.ENGINE={NAME:c,VERSION:d},C.OS={NAME:c,VERSION:d},typeof exports!==o?(typeof module!==o&&module.exports&&(exports=module.exports=C),exports.UAParser=C):typeof define===s&&define.amd?define(function(){return C}):e.UAParser=C;var k=e.jQuery||e.Zepto;if(typeof k!==o){var L=new C;k.ua=L.getResult(),k.ua.get=function(){return L.getUA()},k.ua.set=function(e){L.setUA(e);var t=L.getResult();for(var n in t)k.ua[n]=t[n]}}})(typeof window=="object"?window:this);
