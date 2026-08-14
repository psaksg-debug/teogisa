import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../../components/SiteChrome";
import SeveranceCalculator from "./SeveranceCalculator";
export const metadata:Metadata={title:"퇴직금 간편 계산기",description:"평균임금과 계속근로기간으로 예상 퇴직금을 간편하게 계산합니다.",alternates:{canonical:"/tools/severance-pay"}};
export default function Page(){return <><InnerHeader path="/tools/severance-pay" eyebrow="SEVERANCE ESTIMATOR" title="퇴직금 간편 계산기" description="평균임금 30일분 × 재직연수 방식으로 기준선을 계산합니다. 최종 금액은 회사 급여 담당자나 고용노동부 상담을 통해 확인하세요."/><main className="content-shell"><SeveranceCalculator/><p className="support-note">계산 결과는 기기에 저장하지 않으며 법률·세무 자문을 대신하지 않습니다. 공식 기준은 고용노동부와 국가법령정보센터에서 다시 확인하세요.</p></main><SiteFooter/></>}
