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

export class ArticleMediaValidationError extends Error {
  constructor(message:string){super(message);this.name="ArticleMediaValidationError";}
}

export function validateArticleMedia(value:string){
  const images=Array.from(value.matchAll(/<img\b([^>]*)>/gi));
  if(images.length===0)throw new ArticleMediaValidationError("발행 글에는 본문 관련 이미지가 1개 이상 필요합니다. figure.article-image 안에 이미지를 넣고 구체적인 대체텍스트를 작성하세요.");
  for(const [,raw] of images){
    const alt=raw.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.slice(1).find(Boolean)?.trim()??"";
    if(alt.length<8||["이미지","본문 관련 이미지","사진"].includes(alt))throw new ArticleMediaValidationError("모든 본문 이미지에는 장식 여부가 아니라 이미지의 내용과 글의 맥락을 설명하는 alt 문구가 필요합니다.");
  }
  for(const [,raw] of value.matchAll(/<iframe\b([^>]*)>/gi)){
    const title=raw.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.slice(1).find(Boolean)?.trim()??"";
    if(title.length<4)throw new ArticleMediaValidationError("YouTube 임베드에는 영상 내용을 알 수 있는 title 속성이 필요합니다.");
  }
}

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

const officialOrganizationLinks=[
  {term:"국민건강보험공단",url:"https://www.nhis.or.kr/nhis/index.do"},
  {term:"국민건강공단",url:"https://www.nhis.or.kr/nhis/index.do"},
  {term:"국민연금공단",url:"https://www.nps.or.kr/"},
  {term:"고용복지센터",url:"https://www.work24.go.kr/"},
  {term:"고용센터",url:"https://www.work24.go.kr/"},
  {term:"고용24",url:"https://www.work24.go.kr/"},
  {term:"국세청",url:"https://www.nts.go.kr/"},
  {term:"홈택스",url:"https://hometax.go.kr/"},
] as const;

export function addOfficialOrganizationLinksToHtml(html:string){
  let anchorDepth=0;
  return html.split(/(<[^>]+>)/g).map((token)=>{
    if(token.startsWith("<")){
      if(/^<a\b/i.test(token))anchorDepth+=1;else if(/^<\/a\b/i.test(token))anchorDepth=Math.max(0,anchorDepth-1);
      return token;
    }
    if(anchorDepth>0)return token;
    let text=token;
    for(const item of officialOrganizationLinks){
      text=text.split(item.term).join(`<a class="official-organization-link" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(item.term)} 공식 홈페이지 열기">${item.term}</a>`);
    }
    return text;
  }).join("");
}
