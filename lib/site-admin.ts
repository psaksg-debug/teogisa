import { getChatGPTUser, requireChatGPTUser } from "../app/chatgpt-auth";

const OWNER_EMAIL = "playskang@gmail.com";

export async function requireSiteOwner(returnTo = "/admin") {
  const user = await requireChatGPTUser(returnTo);
  if (user.email.toLowerCase() !== OWNER_EMAIL) return null;
  return user;
}

export async function getSiteOwner() {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== OWNER_EMAIL) return null;
  return user;
}

export async function requireOwnerApi() {
  const user = await getSiteOwner();
  if (user) return { user, response: null };
  return {
    user: null,
    response: Response.json(
      { error: "사이트 소유자만 사용할 수 있습니다." },
      { status: 403 },
    ),
  };
}
