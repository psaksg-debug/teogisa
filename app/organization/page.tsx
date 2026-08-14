import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import { ORGANIZATION_CHART_AS_OF, ORGANIZATION_CHART_VERSION, organizationChartDepartments, organizationChartSummary, organizationExecutive } from "../../lib/organization-chart";

export const metadata:Metadata={title:"현재 조직도",description:`${ORGANIZATION_CHART_AS_OF} 기준 퇴.기.사 대표와 5개 부서, 직원 ${organizationChartSummary.employees}명의 역할과 보고체계입니다.`,alternates:{canonical:"/organization"}};

export default function OrganizationPage(){return <>
  <InnerHeader path="/organization" eyebrow="CURRENT ORGANIZATION" title="퇴.기.사 전체 조직도" description={`${ORGANIZATION_CHART_AS_OF} 기준 대표 아래 5개 부서, 직원 ${organizationChartSummary.employees}명이 하나의 발행·운영 원칙으로 일합니다.`}/>
  <main className="content-shell organization-page">
    <section className="organization-facts" aria-label="조직 현황"><div><span>기준일</span><strong>{ORGANIZATION_CHART_AS_OF}</strong></div><div><span>부서</span><strong>{organizationChartSummary.departments}개</strong></div><div><span>직원</span><strong>{organizationChartSummary.employees}명</strong></div><div><span>대표 포함 직책</span><strong>{organizationChartSummary.positions}석</strong></div></section>
    <section className="organization-chart" aria-labelledby="organization-chart-title">
      <header className="organization-executive"><span>최종 의사결정</span><h2 id="organization-chart-title">{organizationExecutive.name}</h2><strong>{organizationExecutive.title}</strong><p>{organizationExecutive.responsibility}</p></header>
      <div className="organization-connector" aria-hidden="true"/>
      <div className="organization-departments">{organizationChartDepartments.map((department,index)=><article className={`organization-department department-${index+1}`} id={department.id} key={department.id}>
        <header><div><span>{String(index+1).padStart(2,"0")} · {department.shortName}</span><h2>{department.name}</h2></div><strong>{department.members.length}명</strong></header>
        <p>{department.responsibility}</p>
        <div className="department-lead"><span>부서 책임자</span><strong>{department.lead}</strong><small>{department.members.find(member=>member.name===department.lead)?.title}</small></div>
        <ol aria-label={`${department.name} 구성원`}>{department.members.map(member=><li className={member.name===department.lead?"lead":""} key={member.id}><div><strong>{member.name}</strong><span>{member.title}</span></div><p>{member.responsibility}</p></li>)}</ol>
        <footer><span>업무 흐름</span><p>{department.workflow}</p></footer>
      </article>)}</div>
    </section>
    <section className="organization-governance" aria-labelledby="organization-governance-title"><div><p className="eyebrow">REPORTING & CONTROL</p><h2 id="organization-governance-title">제작과 검수, 감사 권한을 분리합니다.</h2></div><ol><li><strong>기획</strong><span>무엇을 왜 만들지 정하고 편집부에 브리프를 인계합니다.</span></li><li><strong>제작</strong><span>편집부가 사실과 출처를 확인해 고유한 콘텐츠를 작성합니다.</span></li><li><strong>품질</strong><span>품질디자인팀이 독립적으로 완성도와 접근성을 검수합니다.</span></li><li><strong>통제</strong><span>관리부가 정책·리소스·감사를 맡고 대표가 최종 변경을 승인합니다.</span></li></ol></section>
    <p className="organization-version">조직도 버전 {ORGANIZATION_CHART_VERSION} · 직원 수는 현재 각 부서 명부에서 자동 집계됩니다.</p>
  </main>
  <SiteFooter/>
</>}
