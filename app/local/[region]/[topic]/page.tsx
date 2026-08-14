import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerHeader, SiteFooter } from "../../../components/SiteChrome";
import { liveKeywordPages } from "../../../../lib/portal";

type Props={params:Promise<{region:string;topic:string}>};
export async function generateStaticParams(){return liveKeywordPages.map(item=>({region:item.region,topic:item.topic}));}
function findPage(region:string,topic:string){return liveKeywordPages.find(item=>item.region===region&&item.topic===topic);}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {region,topic}=await params;const page=findPage(region,topic);return page?{title:page.label,description:`${page.label}를 위한 공식 창구와 확인 순서를 정리합니다.`,alternates:{canonical:`/local/${region}/${topic}`}}:{};}
export default async function LocalPage({params}:Props){const {region,topic}=await params;const page=findPage(region,topic);if(!page)notFound();return <><InnerHeader eyebrow="LOCAL PRACTICAL GUIDE" title={page.label} description={`${region}에서 실제로 확인할 공식 창구와 검색 순서를 한 장으로 정리했습니다. 지원 자격과 모집 일정은 신청 시점의 원문을 다시 확인하세요.`}/><main className="content-shell article-copy policy-copy"><h2>먼저 전국 공통 서비스를 확인하세요</h2><p>고용24에서 지역과 직종, 훈련 유형을 선택해 검색하고 정부24와 복지로에서 개인 조건에 맞는 지원을 확인합니다. 같은 이름의 사업도 모집 기간과 수행기관이 달라질 수 있습니다.</p><h2>{region} 지역 정보를 더하는 순서</h2><ol><li>시·구·군 공식 홈페이지에서 중장년, 일자리, 평생교육을 검색합니다.</li><li>관할 고용복지플러스센터와 중장년내일센터의 상담 가능 여부를 확인합니다.</li><li>접수일·거주지·소득·중복수급 조건을 원문에 표시합니다.</li></ol><div className="policy-links"><a href="https://www.work24.go.kr/" target="_blank" rel="noreferrer">고용24 검색 ↗</a><a href="https://www.gov.kr/" target="_blank" rel="noreferrer">정부24 확인 ↗</a></div><h2>이 페이지의 업데이트 원칙</h2><p>지역명만 바꾸지 않고, 실제 지역 사업과 창구가 확인될 때 내용을 추가합니다. 모집 종료 정보는 삭제하지 않고 종료 표시와 확인일을 남깁니다.</p></main><SiteFooter/></>}
