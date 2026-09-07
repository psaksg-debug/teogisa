import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import { siteGroups, siteNodes, siteRoot } from "../../lib/site-map";

export const metadata: Metadata = {
  title: "사이트 모음",
  description: "애드블스가 운영하는 사이트를 도메인별로 한눈에 보여줍니다. 이사준비백서, ProShot, 영수증 정리도우미, VPN 비교와 공동 운영하는 수리위키를 연결합니다.",
  alternates: { canonical: "/site" },
};

// 지도는 하나의 SVG로 그린다. 노드마다 <a>를 두어 그림에서 바로 이동할 수 있고,
// 아래 목록이 같은 데이터를 글로 한 번 더 보여준다. 그림을 못 보는 환경과
// 좁은 화면에서는 목록이 본체 역할을 한다.
const CARD_X = 336;
const CARD_W = 544;
const CARD_H = 64;
const TRUNK_X = 296;
const ROW_Y = [60, 147, 234, 321, 408];

const groupFill = { content: "#eaf2ee", tool: "#ffffff", partner: "#f6f9f7" } as const;
const groupStroke = { content: "#2e6573", tool: "#cddbd6", partner: "#cddbd6" } as const;

export default function SiteMapPage() {
  const rows = siteNodes.map((node, index) => ({ node, cy: ROW_Y[index] ?? 60 + index * 87 }));
  const trunkTop = ROW_Y[0];
  const trunkBottom = ROW_Y[ROW_Y.length - 1];

  return <>
    <InnerHeader
      path="/site"
      eyebrow="SITE MAP"
      title="애드블스가 만드는 사이트"
      description="주제가 다르면 사이트를 나눠서 운영합니다. 어떤 주소가 무엇을 다루는지 한 장에 정리했습니다."
    />
    <main className="content-shell site-map-shell">
      <figure className="site-map-figure">
        <svg viewBox="0 0 900 470" role="img" aria-labelledby="site-map-title site-map-desc" className="site-map-svg">
          <title id="site-map-title">애드블스 사이트 연결 지도</title>
          <desc id="site-map-desc">adbles.com을 중심으로 이사준비백서, ProShot, 영수증 정리도우미, VPN 비교, 수리위키가 연결된 트리 구조입니다. 각 사이트를 누르면 해당 주소로 이동합니다.</desc>

          <a href={siteRoot.href} className="site-node">
            <rect x="20" y="196" width="210" height="78" rx="10" fill="#102d3c" />
            <text x="125" y="228" textAnchor="middle" fontSize="19" fontWeight="800" fill="#ffffff">{siteRoot.name}</text>
            <text x="125" y="252" textAnchor="middle" fontSize="12.5" fill="#a9d3cb" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">{siteRoot.domain}</text>
          </a>

          <path d={`M230 235 L${TRUNK_X} 235`} stroke="#2e6573" strokeWidth="2" fill="none" />
          <path d={`M${TRUNK_X} ${trunkTop} L${TRUNK_X} ${trunkBottom}`} stroke="#cddbd6" strokeWidth="2" fill="none" />

          {rows.map(({ node, cy }) => (
            <g key={node.id}>
              <path d={`M${TRUNK_X} ${cy} L${CARD_X} ${cy}`} stroke="#cddbd6" strokeWidth="2" fill="none" />
              <circle cx={TRUNK_X} cy={cy} r="4" fill="#2e6573" />
              <a href={node.href} target="_blank" rel="noreferrer" className="site-node">
                <rect
                  x={CARD_X} y={cy - CARD_H / 2} width={CARD_W} height={CARD_H} rx="8"
                  fill={groupFill[node.group]} stroke={groupStroke[node.group]} strokeWidth="2"
                  strokeDasharray={node.group === "partner" ? "6 4" : undefined}
                />
                <text x={CARD_X + 20} y={cy - 6} fontSize="16.5" fontWeight="700" fill="#102d3c">{node.name}</text>
                <text x={CARD_X + 20} y={cy + 17} fontSize="13" fill="#3d5560">{node.summary}</text>
                <text x={CARD_X + CARD_W - 20} y={cy - 6} textAnchor="end" fontSize="12.5" fill="#2e6573" fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace">{node.domain}</text>
                <text x={CARD_X + CARD_W - 20} y={cy + 17} textAnchor="end" fontSize="11.5" fontWeight="700" fill="#71868d">{siteGroups[node.group].label}</text>
              </a>
            </g>
          ))}
        </svg>
        <figcaption>사이트 이름을 누르면 해당 주소로 이동합니다. 점선은 다른 운영자와 함께 만드는 사이트입니다.</figcaption>
      </figure>

      <section className="site-map-list" aria-labelledby="site-list-title">
        <h2 id="site-list-title">사이트별로 하는 일</h2>
        {(Object.keys(siteGroups) as Array<keyof typeof siteGroups>).map((group) => {
          const nodes = siteNodes.filter((node) => node.group === group);
          if (nodes.length === 0) return null;
          return <div className="site-group" key={group}>
            <h3>{siteGroups[group].label}</h3>
            <p className="site-group-note">{siteGroups[group].note}</p>
            {nodes.map((node) => (
              <article key={node.id}>
                <a href={node.href} target="_blank" rel="noreferrer">
                  <strong>{node.name}</strong>
                  <span>{node.domain}</span>
                </a>
                <p>{node.detail}</p>
                <em className="site-ownership">{node.ownership}</em>
              </article>
            ))}
          </div>;
        })}
      </section>

      <aside className="safety-note">
        <strong>모두 애드블스가 만들고 운영하는 사이트입니다</strong>
        <p>여기 있는 주소는 제3자 서비스를 추천하는 것이 아니라 저희가 직접 만든 사이트입니다. 수리위키는 다른 운영자와 함께 만듭니다. 일부 사이트에는 제휴 링크가 있어 이용 시 수수료가 발생할 수 있으며, 자세한 내용은 <a href="/disclosure">제휴 고지</a>에 적어두었습니다.</p>
      </aside>
    </main>
    <SiteFooter />
  </>;
}
