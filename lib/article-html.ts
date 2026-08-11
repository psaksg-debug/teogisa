const blockedElements = /<\s*(script|style|object|embed|form|input|button|textarea|select|option|svg|math|meta|link|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const allowedTags = new Set(["p","br","h2","h3","h4","strong","b","em","i","u","s","ul","ol","li","blockquote","a","img","figure","figcaption","div","span","hr","pre","code","table","thead","tbody","tr","th","td","iframe"]);
const allowedClasses = new Set(["article-image","link-embed","embedded-video","font-size-small","font-size-normal","font-size-large","font-size-xlarge","font-family-sans","font-family-serif","font-family-mono"]);

function escapeAttribute(value:string){return value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function safeUrl(value:string, allowRelative=false){try{if(allowRelative&&value.startsWith("/"))return value;const url=new URL(value);return ["http:","https:"].includes(url.protocol)?url.toString():"";}catch{return "";}}
function safeYoutube(value:string){try{const url=new URL(value);return url.protocol==="https:"&&["www.youtube.com","youtube.com","www.youtube-nocookie.com"].includes(url.hostname)&&/^\/embed\/[a-zA-Z0-9_-]{6,20}$/.test(url.pathname)?url.toString():"";}catch{return "";}}
function attributes(raw:string){const result=new Map<string,string>();const pattern=/([a-zA-Z0-9:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;for(const match of raw.matchAll(pattern))result.set(match[1].toLowerCase(),match[2]??match[3]??match[4]??"");return result;}
function safeClasses(value:string){return value.split(/\s+/).filter((item)=>allowedClasses.has(item)).join(" ");}
function safeStyle(value:string){return value.split(";").map(item=>item.trim()).filter(item=>/^text-align\s*:\s*(left|center|right|justify)$/i.test(item)).join(";");}

export function sanitizeArticleHtml(value:string){
  let html=value.replace(/<!--[\s\S]*?-->/g,"").replace(blockedElements,"");
  html=html.replace(/<\s*(\/?)\s*([a-zA-Z0-9-]+)([^>]*)>/g,(full,closing:string,rawTag:string,rawAttributes:string)=>{
    const tag=rawTag.toLowerCase();
    if(!allowedTags.has(tag))return "";
    if(closing)return ["br","img","hr"].includes(tag)?"":`</${tag}>`;
    const attrs=attributes(rawAttributes);
    const className=safeClasses(attrs.get("class")??"");
    const style=safeStyle(attrs.get("style")??"");
    const common=`${className?` class="${escapeAttribute(className)}"`:""}${style?` style="${escapeAttribute(style)}"`:""}`;
    if(tag==="a"){
      const href=safeUrl(attrs.get("href")??"",true);
      return href?`<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer"${common}>`:"<span>";
    }
    if(tag==="img"){
      const src=safeUrl(attrs.get("src")??"",true);if(!src)return "";
      const alt=(attrs.get("alt")??"본문 관련 이미지").slice(0,180);
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async"${common}>`;
    }
    if(tag==="iframe"){
      const src=safeYoutube(attrs.get("src")??"");if(!src)return "";
      const title=(attrs.get("title")??"삽입된 YouTube 영상").slice(0,120);
      return `<iframe src="${escapeAttribute(src)}" title="${escapeAttribute(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen${common}>`;
    }
    return `<${tag}${common}>`;
  });
  return html.trim();
}

export function articlePlainText(value:string){return value.replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();}

export function addGlossaryLinksToHtml(html:string,glossary:Array<{term:string;url:string}>){
  const linked=new Set<string>();let anchorDepth=0;
  return html.split(/(<[^>]+>)/g).map((token)=>{
    if(token.startsWith("<")){
      if(/^<a\b/i.test(token))anchorDepth+=1;else if(/^<\/a\b/i.test(token))anchorDepth=Math.max(0,anchorDepth-1);
      return token;
    }
    if(anchorDepth>0)return token;
    let text=token;
    for(const item of glossary.toSorted((a,b)=>b.term.length-a.term.length)){
      if(linked.has(item.term))continue;
      const index=text.indexOf(item.term);if(index<0)continue;
      linked.add(item.term);
      const link=`<a class="glossary-link" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(item.term)} 뜻을 위키백과에서 확인">${item.term}</a>`;
      text=`${text.slice(0,index)}${link}${text.slice(index+item.term.length)}`;
    }
    return text;
  }).join("");
}
