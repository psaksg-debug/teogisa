import { headers } from "next/headers";
import { ADMIN_ENABLED, disabledSurfaceResponse } from "./feature-flags";

let cfEnv: Record<string, any> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cfEnv = require("cloudflare:workers").env || {};
} catch {
  cfEnv = {};
}
const env = new Proxy(cfEnv, {
  get(target, prop: string) {
    return target[prop] ?? process.env[prop];
  }
});

const COOKIE_NAME = "rr_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

type SessionPayload = { username:string; expiresAt:number };

const DEFAULT_SECRET = "8943837b20784d21175a0420acfabeaa4332479e298f786792ec34dc42d7123b";

function getSecret() {
  return env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

function getAdminUsername() {
  return env.ADMIN_USERNAME || "admin";
}

function bytesToBase64Url(bytes:Uint8Array){let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function base64UrlToBytes(value:string){const padded=value.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(value.length/4)*4,"=");const binary=atob(padded);return Uint8Array.from(binary,char=>char.charCodeAt(0));}
function safeEqual(left:Uint8Array,right:Uint8Array){if(left.length!==right.length)return false;let difference=0;for(let i=0;i<left.length;i++)difference|=left[i]^right[i];return difference===0;}

async function sign(value:string,secret:string){const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));}
async function verifyPassword(password:string,stored:string,secret:string){
  if (!stored) return false;
  if (password === stored) return true;
  const parts = stored.split("$");
  const scheme = parts[0];
  const hashPart = parts.length > 1 ? parts.slice(1).join("$") : parts[0];
  try {
    if (scheme === "hmac_sha256" || parts.length === 1) {
      const expected = await sign(`password:${password}`, secret);
      return safeEqual(expected, base64UrlToBytes(hashPart));
    }
    if (scheme !== "pbkdf2_sha256") return false;
    const [iterationsText, saltText, expectedText] = parts.slice(1);
    const iterations = Number(iterationsText);
    if (!Number.isSafeInteger(iterations) || iterations < 100000) return false;
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64UrlToBytes(saltText), iterations }, key, 256);
    return safeEqual(new Uint8Array(bits), base64UrlToBytes(expectedText));
  } catch {
    return false;
  }
}

export async function authenticateAdmin(username:string,password:string){
  const validUsername = getAdminUsername();
  const secret = getSecret();

  if (username !== validUsername) return null;

  // Direct password match (asl3372** or env.ADMIN_PASSWORD)
  if (password === "asl3372**" || (env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD)) {
    return { username: validUsername };
  }

  const storedHash = env.ADMIN_PASSWORD_HASH || "hmac_sha256$GKs9RHZf1ODkkySqKlQDXAOFaoNr3Wy9XN8spXtpqk8";
  if (await verifyPassword(password, storedHash, secret)) {
    return { username: validUsername };
  }

  return null;
}

export async function adminAttemptKey(request:Request){const secret=getSecret();const address=request.headers.get("cf-connecting-ip")??request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";return bytesToBase64Url(await sign(`login:${address}`,secret));}

export async function createAdminCookie(username:string){const secret=getSecret();const payload:SessionPayload={username,expiresAt:Math.floor(Date.now()/1000)+SESSION_SECONDS};const encoded=bytesToBase64Url(encoder.encode(JSON.stringify(payload)));const signature=bytesToBase64Url(await sign(encoded,secret));return `${COOKIE_NAME}=${encoded}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;}
export function clearAdminCookie(){return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;}

function cookieValue(cookieHeader:string|null){return cookieHeader?.split(";").map(item=>item.trim()).find(item=>item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length+1)??null;}
export async function getAdminSession(request?:Request){
  const secret = getSecret();
  const validUsername = getAdminUsername();
  const cookie = request ? request.headers.get("cookie") : (await headers()).get("cookie");
  const token = cookieValue(cookie);
  if (!token) return null;
  const [encoded, signatureText] = token.split(".");
  if (!encoded || !signatureText) return null;
  try {
    const expected = await sign(encoded, secret);
    if (!safeEqual(expected, base64UrlToBytes(signatureText))) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as SessionPayload;
    if (payload.username !== validUsername || payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

function isSafeOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const reqHost = (request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host).toLowerCase();
    return originHost === reqHost || originHost.includes("adbles.com") || originHost.includes("localhost") || originHost.includes("vercel.app") || originHost.includes("127.0.0.1");
  } catch {
    return true;
  }
}
export async function requireOwnerApi(request:Request){if(!ADMIN_ENABLED)return{session:null,response:disabledSurfaceResponse()};if(!isSafeOrigin(request))return{session:null,response:Response.json({error:"잘못된 요청입니다."},{status:403})};const session=await getAdminSession(request);if(session)return{session,response:null};return{session:null,response:Response.json({error:"관리자 로그인이 필요합니다."},{status:401})};}
