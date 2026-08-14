import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import { toolCatalog } from "../../lib/portal";

export const metadata:Metadata={title:"퇴직생활 도구모음",description:"퇴직생활비와 퇴직금 계산부터 이미지 변환, 영수증 정리, 블로그 썸네일까지 한곳에서 이용합니다.",alternates:{canonical:"/tools"}};
export default function Tools(){return <><InnerHeader path="/tools" eyebrow="FREE PRACTICAL TOOLS" title="복잡한 계산, 직접 해보면 답이 보입니다." description="퇴직 후 버틸 수 있는 기간과 예상 퇴직금을 내 숫자로 계산해 보세요. 입력한 금액은 서버에 저장하지 않습니다."/><main className="content-shell portal-shell"><section className="tool-catalog">{toolCatalog.map(tool=><a className={tool.status==="사용 가능"?"available":"planned"} href={tool.status==="사용 가능"?tool.href:"#tool-roadmap"} key={tool.title}><span>{tool.status}</span><h2>{tool.title}</h2><p>{tool.description}</p><strong>{tool.status==="사용 가능"?"지금 계산하기 →":"준비 중인 도구"}</strong></a>)}</section><section className="tool-roadmap" id="tool-roadmap"><p className="eyebrow">다음에 추가할 도구</p><h2>생활 속 반복 작업도 더 가볍게.</h2><p>이미지 용량 줄이기, 부업 영수증 분류, 블로그 썸네일 제작처럼 자주 반복하지만 시간이 걸리는 일을 브라우저에서 간단히 처리할 수 있도록 준비하고 있습니다. 실제 사용할 수 있게 완성된 도구부터 차례로 공개합니다.</p></section></main><SiteFooter/></>}
