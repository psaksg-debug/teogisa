import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";

export const metadata:Metadata={title:"문의·오류 제보",description:"퇴.기.사의 콘텐츠 오류, 출처, 개인정보와 사이트 이용 문의 안내입니다.",alternates:{canonical:"/contact"}};

export default function Contact(){return <><InnerHeader path="/contact" eyebrow="CONTACT & CORRECTIONS" title="틀린 내용은 고치고, 궁금한 점은 답하겠습니다." description="콘텐츠 오류와 끊어진 링크, 개인정보와 광고 표시 문제를 알려주세요."/><main className="content-shell article-copy policy-copy"><h2>문의할 수 있는 내용</h2><ul><li>금액·기한·대상 조건 등 사실 오류</li><li>열리지 않는 공식자료 또는 관련 글 링크</li><li>이미지·인용·저작권 관련 요청</li><li>개인정보, 쿠키와 광고 표시에 관한 문의</li><li>사이트 기능 이용 중 발견한 오류</li></ul><h2>연락처</h2><p>운영사 애드블스, 책임 편집자 어썸라이프<br/>이메일: <a href="mailto:master@adbles.com">master@adbles.com</a></p><h2>정확한 확인을 위해 적어주세요</h2><p>문제가 있는 페이지 주소, 확인한 문장, 참고할 공식 원문과 확인 날짜를 함께 보내면 더 빠르게 검토할 수 있습니다. 주민등록번호, 계좌번호, 건강기록 등 불필요한 개인정보는 보내지 마세요.</p><h2>답변과 수정 원칙</h2><p>제보 내용은 원문과 기준일을 대조해 확인합니다. 중요한 사실 오류는 페이지 내용을 고치고, 제도 변경처럼 시점이 중요한 경우 최신 공식 안내를 우선 표시합니다. 개별 투자·세무·노무·법률·의료 상담은 제공하지 않습니다.</p></main><SiteFooter/></>}
