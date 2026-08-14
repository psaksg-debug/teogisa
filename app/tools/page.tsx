import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import { toolCatalog } from "../../lib/portal";

export const metadata:Metadata={title:"퇴직생활 도구모음",description:"퇴직생활비와 퇴직금 계산부터 이미지 변환, 영수증 정리, 블로그 썸네일까지 한곳에서 이용합니다.",alternates:{canonical:"/tools"}};
export default function Tools(){return <><InnerHeader eyebrow="PRACTICAL TOOLBOX" title="유용한 도구모음" description="계산과 반복 작업은 도구에 맡기고, 중요한 판단에 시간을 씁니다. 입력 자료는 별도 안내가 없는 한 브라우저에서만 처리합니다."/><main className="content-shell portal-shell"><section className="tool-catalog">{toolCatalog.map(tool=><a className={tool.status==="사용 가능"?"available":"planned"} href={tool.status==="사용 가능"?tool.href:"#tool-roadmap"} key={tool.title}><span>{tool.status}</span><h2>{tool.title}</h2><p>{tool.description}</p><strong>{tool.status==="사용 가능"?"도구 열기 →":"개발 예정"}</strong></a>)}</section><section className="tool-roadmap" id="tool-roadmap"><p className="eyebrow">TOOL ROADMAP</p><h2>다음 도구 개발 순서</h2><p>이미지 변환기 → 영수증 정리기 → 블로그 썸네일 제작기 순으로 추가합니다. 관리자에서는 도구별 운영 상태와 연결 페이지를 확인할 수 있도록 확장합니다.</p></section></main><SiteFooter/></>}
