import { requireOwnerApi } from "../../../../lib/site-admin";
import { requestSearchEngineIndexing } from "../../../../lib/seo-indexing";
import { getPost, getPublishedPosts } from "../../../../lib/repository";

export async function POST(request: Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as { slug?: string; url?: string };
    let targetUrl = body.url || "";
    let targetTitle = "퇴.기.사 업데이트";
    let targetSlug = body.slug || "";

    if (body.slug) {
      const post = await getPost(body.slug);
      if (post) {
        targetUrl = `/posts/${post.slug}`;
        targetTitle = post.title;
        targetSlug = post.slug;
      }
    }

    if (!targetUrl) {
      const publishedPosts = await getPublishedPosts();
      const latestPublished = publishedPosts[0];
      if (latestPublished) {
        targetUrl = `/posts/${latestPublished.slug}`;
        targetTitle = latestPublished.title;
        targetSlug = latestPublished.slug;
      } else {
        targetUrl = "/";
      }
    }

    const result = await requestSearchEngineIndexing({
      url: targetUrl,
      title: targetTitle,
      slug: targetSlug,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "네이버 IndexNow 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
