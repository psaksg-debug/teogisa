export type OriginalityResult = {
  status:"passed"|"blocked"|"unavailable";
  sourceUrl:string|null;
  overlapRatio:number;
  longestMatchChars:number;
  message:string;
};

const COPY_RATIO_LIMIT = 0.25;
const LONG_COPY_LIMIT = 120;

function decodeEntities(value:string){return value.replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&apos;/gi,"'");}
export function plainText(value:string){return decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
function normalized(value:string){return plainText(value).normalize("NFKC").toLowerCase().replace(/[^0-9a-z가-힣\s]/g," ").replace(/\s+/g," ").trim();}
function meaningfulSentences(value:string){return plainText(value).split(/(?:[.!?。！？]\s+|다\.\s+|[\r\n]+)/).map(sentence=>normalized(sentence)).filter(sentence=>sentence.length>=45);}

export function compareOriginality(draft:string,source:string):OriginalityResult{
  const draftText=normalized(draft);const sourceText=normalized(source);
  if(draftText.length<120||sourceText.length<120)return{status:"unavailable",sourceUrl:null,overlapRatio:0,longestMatchChars:0,message:"비교할 수 있는 본문 분량이 부족합니다."};
  const sentences=meaningfulSentences(draft);const matches=sentences.filter(sentence=>sourceText.includes(sentence));
  const copiedChars=matches.reduce((sum,sentence)=>sum+sentence.length,0);const ratio=Math.min(1,copiedChars/Math.max(1,draftText.length));const longest=matches.reduce((max,sentence)=>Math.max(max,sentence.length),0);
  const blocked=ratio>=COPY_RATIO_LIMIT||longest>=LONG_COPY_LIMIT;
  return{status:blocked?"blocked":"passed",sourceUrl:null,overlapRatio:ratio,longestMatchChars:longest,message:blocked?`원문과 동일한 문장이 과도합니다(중복 ${Math.round(ratio*100)}%, 최장 ${longest}자). 원문을 그대로 옮기지 말고 사실을 확인한 뒤 자신의 설명·사례·표로 다시 작성하세요.`:`원문 문장 중복이 허용 범위입니다(중복 ${Math.round(ratio*100)}%).`};
}

function safeSourceUrl(value:string){try{const url=new URL(value);const host=url.hostname.toLowerCase();if(url.protocol!=="https:"||host==="localhost"||host.endsWith(".local")||/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))return null;return url;}catch{return null;}}
async function fetchSource(url:URL){const response=await fetch(url,{headers:{accept:"text/html,application/xhtml+xml","user-agent":"RetireRich-OriginalityMonitor/1.0"},redirect:"follow",signal:AbortSignal.timeout(7000)});if(!response.ok)throw new Error(`원문 응답 ${response.status}`);const length=Number(response.headers.get("content-length")??0);if(length>1_500_000)throw new Error("원문 용량이 너무 큽니다");return(await response.text()).slice(0,600_000);}

export function extractSourceUrls(body:string,preferred?:string|null){const found=[...(preferred?[preferred]:[]),...Array.from(body.matchAll(/(?:href=["']|출처:\s*)(https:\/\/[^"'\s<]+)/gi),match=>match[1])];return Array.from(new Set(found)).filter(url=>safeSourceUrl(url)).slice(0,2);}

export async function checkAgainstSources(body:string,sourceUrls:string[]):Promise<OriginalityResult>{
  if(sourceUrls.length===0)return{status:"passed",sourceUrl:null,overlapRatio:0,longestMatchChars:0,message:"비교할 외부 원문이 없어 내부 발행정책만 적용했습니다."};
  let best:OriginalityResult|null=null;let lastError="원문을 불러오지 못했습니다.";
  for(const value of sourceUrls){const url=safeSourceUrl(value);if(!url)continue;try{const result=compareOriginality(body,await fetchSource(url));const withSource={...result,sourceUrl:url.toString()};if(result.status==="blocked")return withSource;if(result.status==="passed"&&(!best||result.overlapRatio>best.overlapRatio))best=withSource;else if(!best)best=withSource;}catch(error){lastError=error instanceof Error?error.message:lastError;}}
  return best?.status==="passed"?best:{status:"unavailable",sourceUrl:sourceUrls[0]??null,overlapRatio:best?.overlapRatio??0,longestMatchChars:best?.longestMatchChars??0,message:`원문 대조를 완료하지 못했습니다: ${lastError}. 초안으로 저장하고 원문을 직접 확인하세요.`};
}

export class OriginalityCheckError extends Error{result:OriginalityResult;constructor(result:OriginalityResult){super(result.message);this.name="OriginalityCheckError";this.result=result;}}
