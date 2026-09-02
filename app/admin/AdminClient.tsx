"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { Post } from "../../lib/content";
import type { AgentRun, AuditFinding, AuditRun, ContentAgentState, ManagementIssue, ManagementRun, MemberActivityPlanState, MemberActivityRun, OriginalityCheck, PromotionCampaign, QueueItem, StorageDiagnostics } from "../../lib/repository";
import type { AuditDomain, AuditOfficer } from "../../lib/internal-audit";
import type { ManagementMember } from "../../lib/management-department";
import type { OrganizationPolicyRecipient } from "../../lib/organization-policy";
import { getPromotionMember, promotionTeam, searchPrograms } from "../../lib/promotion-team";
import { allEditorialAuthors, EDITOR_IN_CHIEF } from "../../lib/editorial-team";
import { qualityDesignGates, qualityDesignTeam } from "../../lib/quality-design-team";
import type { CompanyResource } from "../../lib/company-rules";
import { contentPlanningFirstMonth, contentPlanningTeam, contentPlanningWorkflow } from "../../lib/content-planning-team";
import { teamPermissions } from "../../lib/team-permissions";
import { safeReleasePolicy } from "../../lib/release-policy";
import RichTextEditor from "./RichTextEditor";

const categories = ["퇴직 준비", "정부지원·실업급여", "정부지원·세무", "재취업·N잡", "블로그·애드센스", "AI 활용", "온라인 부업", "투자·재테크", "실제 수익실험", "유용한 도구", "지역 생활정보", "건강·예방", "영상 큐레이션"];

function datetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

type ComboOption = { value: string; label: string; group?: string };

function AdminCombo({ id, label, options, value, onChange, children }: { id: string; label: string; options: ComboOption[]; value: string; onChange: (value: string) => void; children?: ReactNode }) {
  const groups = Array.from(new Set(options.map((option) => option.group ?? "")));
  return (
    <div className="admin-combo-section">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="admin-combo-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.length === 0 && <option value="">등록된 항목이 없습니다</option>}
        {groups.length > 1
          ? groups.map((group) => <optgroup label={group} key={group}>{options.filter((option) => (option.group ?? "") === group).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</optgroup>)
          : options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
      {children && <div className="admin-combo-detail">{children}</div>}
    </div>
  );
}

export type SubagentLogItem = {
  id: string | number;
  source: "member" | "agent";
  memberName: string;
  teamName: string;
  action: string;
  status: string;
  summary: string;
  startedAt: string;
  postId?: number | null;
};

export default function AdminClient({ username }: { username: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [agents, setAgents] = useState<ContentAgentState[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [promotions, setPromotions] = useState<PromotionCampaign[]>([]);
  const [managementMembers, setManagementMembers] = useState<ManagementMember[]>([]);
  const [managementIssues, setManagementIssues] = useState<ManagementIssue[]>([]);
  const [managementRuns, setManagementRuns] = useState<ManagementRun[]>([]);
  const [organizationNotice, setOrganizationNotice] = useState<{ title: string; issuedBy: string; effectiveDate: string; message: string; rules: readonly string[] } | null>(null);
  const [policyCoverage, setPolicyCoverage] = useState<{ total: number; applied: number; departments: Array<{ department: string; count: number }> }>({ total: 0, applied: 0, departments: [] });
  const [policyRecipients, setPolicyRecipients] = useState<OrganizationPolicyRecipient[]>([]);
  const [originalityChecks, setOriginalityChecks] = useState<OriginalityCheck[]>([]);
  const [companyRules, setCompanyRules] = useState<{ title: string; version: string; effectiveAt: string; authority: string; vision: string; mission: string; purpose: string; strategicObjectives: readonly { id: string; title: string; description: string; kpis: readonly string[] }[]; coreRules: readonly string[]; chapters: readonly { number: number; title: string; articles: readonly string[] }[] } | null>(null);
  const [companyResources, setCompanyResources] = useState<CompanyResource[]>([]);
  const [auditScope, setAuditScope] = useState("");
  const [auditOfficers, setAuditOfficers] = useState<AuditOfficer[]>([]);
  const [auditDomains, setAuditDomains] = useState<AuditDomain[]>([]);
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [activityPlans, setActivityPlans] = useState<MemberActivityPlanState[]>([]);
  const [activityRuns, setActivityRuns] = useState<MemberActivityRun[]>([]);
  const [storage, setStorage] = useState<StorageDiagnostics | null>(null);
  const [selected, setSelected] = useState<Post | null>(null);
  const [message, setMessage] = useState("편집실을 준비하고 있습니다…");
  const [saving, setSaving] = useState(false);
  const [editorFeedback, setEditorFeedback] = useState<{ text: string; type: "success" | "error" | "loading" } | null>(null);
  const [comboPick, setComboPick] = useState<Record<string, string>>({});
  const editorPanelRef = useRef<HTMLElement>(null);

  // 서브에이전트 로그 필터 및 상세 보기 모달 상태
  const [subagentTeamFilter, setSubagentTeamFilter] = useState("all");
  const [subagentStatusFilter, setSubagentStatusFilter] = useState("all");
  const [subagentSearchQuery, setSubagentSearchQuery] = useState("");
  const [selectedSubagentLog, setSelectedSubagentLog] = useState<SubagentLogItem | null>(null);

  const pickId = (key: string, ids: readonly string[]) => {
    const current = comboPick[key];
    return current && ids.includes(current) ? current : ids[0] ?? "";
  };
  const setPick = (key: string) => (value: string) => setComboPick((previous) => ({ ...previous, [key]: value }));

  async function loadPrimaryData() {
    const postsResponse = await fetch("/api/posts");
    const postsData: any = await postsResponse.json();
    if (postsResponse.ok) {
      setPosts(postsData.posts);
      const requestedPostId = Number(new URLSearchParams(window.location.search).get("post"));
      const requestedPost = postsData.posts.find((post: Post) => post.id === requestedPostId);
      if (requestedPost) {
        setSelected(requestedPost);
        setMessage(`‘${requestedPost.title}’ 글을 편집기로 열었습니다.`);
      } else {
        setMessage("");
      }
    } else {
      setMessage(postsData.error || "콘텐츠 보관함을 불러오지 못했습니다.");
    }
  }

  async function loadStorageDiagnostics() {
    try {
      const response = await fetch("/api/diagnostics");
      const data: any = await response.json();
      if (response.ok) setStorage(data.storage || null);
    } catch (error) {
      console.error("저장소 진단을 불러오지 못했습니다:", error);
    }
  }

  async function loadSecondaryData() {
    try {
      const [queueResponse, agentsResponse, promotionsResponse, managementResponse, auditResponse, activityResponse] = await Promise.all([
        fetch("/api/automation"),
        fetch("/api/agents"),
        fetch("/api/promotions"),
        fetch("/api/management"),
        fetch("/api/audits"),
        fetch("/api/activity-plans"),
      ]);
      const [queueData, agentsData, promotionsData, managementData, auditData, activityData]: any[] = await Promise.all([
        queueResponse.json(),
        agentsResponse.json(),
        promotionsResponse.json(),
        managementResponse.json(),
        auditResponse.json(),
        activityResponse.json(),
      ]);
      if (queueResponse.ok) setQueue(queueData.queue || []);
      if (agentsResponse.ok) {
        setAgents(agentsData.agents || []);
        setAgentRuns(agentsData.runs || []);
      }
      if (promotionsResponse.ok) setPromotions(promotionsData.campaigns || []);
      if (managementResponse.ok) {
        setManagementMembers(managementData.members || []);
        setManagementIssues(managementData.issues || []);
        setManagementRuns(managementData.runs || []);
        setOrganizationNotice(managementData.notice || null);
        setPolicyCoverage(managementData.policyCoverage || { total: 0, applied: 0, departments: [] });
        setPolicyRecipients(managementData.policyRecipients || []);
        setOriginalityChecks(managementData.originalityChecks || []);
        setCompanyRules(managementData.companyRules || null);
        setCompanyResources(managementData.companyResources || []);
      }
      if (auditResponse.ok) {
        setAuditScope(auditData.scope || "");
        setAuditOfficers(auditData.officers || []);
        setAuditDomains(auditData.domains || []);
        setAuditRuns(auditData.runs || []);
        setAuditFindings(auditData.findings || []);
      }
      if (activityResponse.ok) {
        setActivityPlans(activityData.plans || []);
        setActivityRuns(activityData.runs || []);
      }
    } catch (error) {
      console.error("부가 정보를 불러오는 중 오류가 발생했습니다:", error);
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      loadStorageDiagnostics();
      loadPrimaryData().then(loadSecondaryData);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function openEditor(post: Post) {
    setSelected(post);
    setMessage(`‘${post.title}’ 글을 편집기로 열었습니다.`);
    window.history.replaceState(null, "", `/admin?post=${post.id}#article-editor`);
    requestAnimationFrame(() => {
      editorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startNewPost() {
    setSelected(null);
    window.history.replaceState(null, "", "/admin#article-editor");
    requestAnimationFrame(() => {
      editorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setEditorFeedback({ text: "저장 및 즉시 발행 처리 중…", type: "loading" });
    try {
      const visualEditor = form.querySelector<HTMLDivElement>(".visual-editor");
      const htmlEditor = form.querySelector<HTMLTextAreaElement>(".html-source-editor");
      const hiddenBody = form.querySelector<HTMLInputElement>("input[name='body']");
      if (hiddenBody) {
        if (htmlEditor && htmlEditor.value.trim()) hiddenBody.value = htmlEditor.value;
        else if (visualEditor && visualEditor.innerHTML.trim()) hiddenBody.value = visualEditor.innerHTML;
      }
      const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
      if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
      const response = await fetch(selected ? `/api/posts/${selected.id}` : "/api/posts", {
        method: selected ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const statusText = data.post?.status === "published" ? "실시간 즉시 발행" : data.post?.status === "scheduled" ? "예약" : "저장";
        const msg = `‘${data.post.title}’ 글을 성공적으로 ${statusText}했습니다.`;
        setMessage(msg);
        setEditorFeedback({ text: `✅ ${msg}`, type: "success" });
        if (data.post) setSelected(data.post);
        await loadPrimaryData();
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "글을 저장하지 못했습니다.";
        setMessage(errorMsg);
        setEditorFeedback({ text: `❌ ${errorMsg}`, type: "error" });
        alert(`저장 실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      setEditorFeedback({ text: `❌ ${errorMsg}`, type: "error" });
      alert(`저장 오류: ${errorMsg}`);
    }
  }

  async function removePost(id: number, title: string) {
    if (!window.confirm(`‘${title}’ 글을 정말 삭제하시겠습니까?`)) return;
    setSaving(true);
    const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    const data: any = await response.json();
    setSaving(false);
    if (response.ok) {
      setMessage(`‘${title}’ 글을 삭제했습니다.`);
      if (selected?.id === id) setSelected(null);
      await loadPrimaryData();
      await loadSecondaryData();
    } else {
      setMessage(data.error || "글을 삭제하지 못했습니다.");
    }
  }

  async function createQueueDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
    setSaving(true);
    try {
      const response = await fetch("/api/automation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = `‘${data.post?.title ?? payload.topic}’ 포스트를 생성하여 즉시 자동 발행했습니다.`;
        setMessage(msg);
        alert(`✅ ${msg}`);
        form.reset();
        await loadPrimaryData();
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "자동 포스팅을 처리하지 못했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function controlAgent(id: string, action: "run" | "status", status?: "active" | "paused") {
    setSaving(true);
    try {
      const response = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action, status }) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = action === "run" ? `‘${data.post?.title ?? id}’ 포스트를 자동 생성하고 즉시 발행했습니다.` : `에이전트를 ${status === "active" ? "가동" : "일시정지"}했습니다.`;
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadPrimaryData();
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "에이전트 실행에 실패했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function controlActivity(id: string, action: "run" | "status", status?: "active" | "paused") {
    setSaving(true);
    try {
      const response = await fetch("/api/activity-plans", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action, status }) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = action === "run" ? "구성원 업무를 실행하고 결과를 기록했습니다." : `구성원 계획을 ${status === "active" ? "가동" : "일시정지"}했습니다.`;
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadPrimaryData();
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "구성원 실행에 실패했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function runAllSubagentsNow() {
    setSaving(true);
    setMessage("전 서브에이전트 작업을 24시간 자동화 스케줄에 맞춰 일괄 가동하고 있습니다…");
    try {
      const response = await fetch("/api/cron", { method: "POST" });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = "전 서브에이전트 일괄 가동을 완료하고 최신 작업 이력을 갱신했습니다!";
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadPrimaryData();
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "서브에이전트 일괄 가동 중 오류가 발생했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "서브에이전트 가동 요청 처리 중 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function manageSite(action: "audit" | "resolve", id?: number) {
    setSaving(true);
    try {
      const response = await fetch("/api/management", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id }) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = action === "audit" ? `전사 점검을 마쳤습니다. 문제 ${data.run?.issueCount ?? 0}건, 즉시 조치 ${data.run?.actionCount ?? 0}건입니다.` : "문제를 조치 완료로 표시했습니다.";
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "사이트 관리를 처리하지 못했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function auditOrganization(action: "run" | "resolve", id?: number) {
    const resolution = action === "resolve" ? window.prompt("완료한 시정조치와 확인 증거를 입력하세요.", "") ?? "" : "";
    if (action === "resolve" && !resolution.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/audits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id, resolution }) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = action === "run" ? `전 프로젝트 감사를 마쳤습니다. 감사의견 ‘${data.run?.overallOpinion ?? "적정"}’, 지적 ${data.run?.findingCount ?? 0}건입니다.` : "시정조치와 완료 증거를 감사 이력에 기록했습니다.";
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "감사 작업을 처리하지 못했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function preparePromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const postId = Number(new FormData(event.currentTarget).get("promotionPostId"));
    if (!postId) {
      alert("홍보할 글을 선택하세요.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/promotions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "prepare", postId }) });
      if (response.status === 401) {
        setSaving(false);
        alert("관리자 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/admin/login";
        return;
      }
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const msg = `‘${data.campaign?.title ?? "선택한 글"}’ 홍보안을 준비했습니다.`;
        setMessage(msg);
        alert(`✅ ${msg}`);
        await loadSecondaryData();
      } else {
        const errorMsg = data.error || "홍보안을 준비하지 못했습니다.";
        setMessage(errorMsg);
        alert(`실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
      setMessage(errorMsg);
      alert(`오류: ${errorMsg}`);
    }
  }

  async function finishPromotion(id: number) {
    setSaving(true);
    const response = await fetch("/api/promotions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "execute", id }) });
    const data: any = await response.json();
    setSaving(false);
    if (response.ok) {
      setMessage(`‘${data.campaign?.title ?? id}’ 홍보 실행을 기록했습니다.`);
      await loadSecondaryData();
    } else {
      setMessage(data.error || "홍보 실행을 기록하지 못했습니다.");
    }
  }

  async function copyPromotion(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label}을 복사했습니다. 원하는 채널에 붙여넣어 확인한 뒤 게시하세요.`);
    } catch {
      setMessage("복사하지 못했습니다. 문구를 직접 선택해 복사하세요.");
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  const count = (status: string) => posts.filter((post) => post.status === status).length;

  // 통합 서브에이전트 로그 리스트 합성 (memberActivityRuns + agentRuns)
  const combinedSubagentLogs: SubagentLogItem[] = [
    ...activityRuns.map((run) => ({
      id: `member-${run.id}`,
      source: "member" as const,
      memberName: run.memberName,
      teamName: run.teamName,
      action: run.action,
      status: run.status,
      summary: run.summary,
      startedAt: run.startedAt,
    })),
    ...agentRuns.map((run) => ({
      id: `agent-${run.id}`,
      source: "agent" as const,
      memberName: run.agentName,
      teamName: "콘텐츠편집팀",
      action: "content-generation",
      status: run.status,
      summary: `${run.topic} — ${run.message || "작업 완료"}`,
      startedAt: run.createdAt,
      postId: run.postId,
    })),
  ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // 필터링된 서브에이전트 로그
  const filteredSubagentLogs = combinedSubagentLogs.filter((log) => {
    if (subagentTeamFilter !== "all" && log.teamName !== subagentTeamFilter) return false;
    if (subagentStatusFilter !== "all" && log.status !== subagentStatusFilter) return false;
    if (subagentSearchQuery.trim()) {
      const q = subagentSearchQuery.toLowerCase();
      const matchName = log.memberName.toLowerCase().includes(q);
      const matchTeam = log.teamName.toLowerCase().includes(q);
      const matchSummary = log.summary.toLowerCase().includes(q);
      if (!matchName && !matchTeam && !matchSummary) return false;
    }
    return true;
  });

  const activePlanId = pickId("activity", activityPlans.map((plan) => plan.id));
  const activePlan = activityPlans.find((plan) => plan.id === activePlanId);
  const activeAgentId = pickId("agent", agents.map((agent) => agent.id));
  const activeAgent = agents.find((agent) => agent.id === activeAgentId);
  const activeTeam = teamPermissions.find((team) => team.id === pickId("permission", teamPermissions.map((team) => team.id)));
  const activeManager = managementMembers.find((member) => member.id === pickId("manager", managementMembers.map((member) => member.id)));
  const activeOfficer = auditOfficers.find((officer) => officer.id === pickId("officer", auditOfficers.map((officer) => officer.id)));
  async function triggerSeoIndexing(slug?: string) {
    setSaving(true);
    setEditorFeedback({ text: "네이버·구글 색인 요청 전송 중…", type: "loading" });
    try {
      const response = await fetch("/api/seo/indexing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data: any = await response.json();
      setSaving(false);
      if (response.ok) {
        const engineSummary = (data.engines || [])
          .map((e: any) => `• ${e.engine}: ${e.status === "success" ? "성공" : e.status} (${e.detail})`)
          .join("\n");
        const msg = `네이버 서치어드바이저(IndexNow) 및 구글에 ‘${data.targetUrl}’ 색인 요청 완료!`;
        setMessage(msg);
        setEditorFeedback({ text: `✅ ${msg}`, type: "success" });
        alert(`[실시간 검색엔진 색인 전송 완료]\n\n대상 URL: ${data.targetUrl}\n\n${engineSummary}`);
      } else {
        const errorMsg = data.error || "색인 요청 중 오류가 발생했습니다.";
        setMessage(errorMsg);
        setEditorFeedback({ text: `❌ ${errorMsg}`, type: "error" });
        alert(`색인 요청 실패: ${errorMsg}`);
      }
    } catch (error) {
      setSaving(false);
      const errorMsg = error instanceof Error ? error.message : "네트워크 오류";
      setEditorFeedback({ text: `❌ ${errorMsg}`, type: "error" });
      alert(`색인 요청 오류: ${errorMsg}`);
    }
  }

  const planningMember = contentPlanningTeam.find((member) => member.id === pickId("planning", contentPlanningTeam.map((member) => member.id)));
  const qualityMember = qualityDesignTeam.find((member) => member.id === pickId("quality", qualityDesignTeam.map((member) => member.id)));
  const growthMember = promotionTeam.find((member) => member.id === pickId("growth", promotionTeam.map((member) => member.id)));

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div>
          <strong>애드블스 · 독립 편집실</strong>
          <span>{username} · 실시간 24시간 자동화 운영 중</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button" type="button" disabled={saving} onClick={runAllSubagentsNow}>
            ⚡ 전 서브에이전트 일괄 가동
          </button>
          <button className="admin-button secondary" type="button" disabled={saving} onClick={() => triggerSeoIndexing()}>
            🌐 네이버·구글 색인 전송
          </button>
          <a className="admin-button secondary" href="/api/export">
            전체 백업
          </a>
          <Link className="admin-button secondary" href="/">
            사이트 보기
          </Link>
          <button className="admin-button secondary" type="button" onClick={logout}>
            로그아웃
          </button>
        </div>
      </header>

      {storage && (
        <div className={storage.persistent ? "storage-banner ok" : "storage-banner warn"} role={storage.persistent ? undefined : "alert"}>
          <strong>
            {storage.persistent ? "✅ 영속 저장소 연결됨" : "⚠️ 저장한 글이 보존되지 않습니다"}
            {" · "}
            {storage.backend === "postgres" ? "Supabase PostgreSQL" : storage.backend === "d1" ? "Cloudflare D1" : "임시 메모리"}
          </strong>
          <span>{storage.message}</span>
          {storage.probeError && <span className="storage-banner-detail">오류: {storage.probeError}</span>}
          <button className="admin-button secondary" type="button" onClick={loadStorageDiagnostics}>
            다시 확인
          </button>
        </div>
      )}

      <div className="admin-dashboard">
        {/* === [NEW] 1. 서브에이전트 실시간 활동 및 작업 이력 상황실 === */}
        <section className="panel subagent-log-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">SUBAGENT OPERATIONS</p>
              <h2>서브에이전트 활동 및 작업 이력 상황실</h2>
            </div>
            <div className="admin-actions">
              <button className="admin-button" type="button" disabled={saving} onClick={runAllSubagentsNow}>
                지금 즉시 실행
              </button>
            </div>
          </div>
          <p className="panel-help">
            애드블스 AI 구성원 33명과 분야별 에이전트 6개의 실시간 작업 보고서, 실행 상태, 입출력 및 로그 내역을 통합 조회합니다. 각 항목을 클릭하면 전체 작업 내역과 상세 보고서를 확인할 수 있습니다.
          </p>

          <div className="activity-summary">
            <article>
              <span>총 기록</span>
              <strong>{combinedSubagentLogs.length}건</strong>
            </article>
            <article>
              <span>완료/발행</span>
              <strong>{combinedSubagentLogs.filter((l) => l.status === "completed" || l.status === "published").length}건</strong>
            </article>
            <article>
              <span>검토 필요</span>
              <strong>{combinedSubagentLogs.filter((l) => l.status === "review").length}건</strong>
            </article>
            <article>
              <span>실패/주의</span>
              <strong>{combinedSubagentLogs.filter((l) => l.status === "failed").length}건</strong>
            </article>
          </div>

          <div className="subagent-filter-bar">
            <div className="subagent-filter-group">
              <label htmlFor="subagent-team-filter">팀별 필터</label>
              <select id="subagent-team-filter" value={subagentTeamFilter} onChange={(e) => setSubagentTeamFilter(e.target.value)}>
                <option value="all">전체 팀 (33명)</option>
                <option value="콘텐츠기획팀">콘텐츠기획팀</option>
                <option value="콘텐츠편집팀">콘텐츠편집팀</option>
                <option value="품질디자인팀">품질디자인팀</option>
                <option value="홍보마케팅팀">홍보마케팅팀</option>
                <option value="경영관리팀">경영관리팀</option>
              </select>
            </div>
            <div className="subagent-filter-group">
              <label htmlFor="subagent-status-filter">상태 필터</label>
              <select id="subagent-status-filter" value={subagentStatusFilter} onChange={(e) => setSubagentStatusFilter(e.target.value)}>
                <option value="all">전체 상태</option>
                <option value="completed">완료 (completed)</option>
                <option value="published">자동 발행 (published)</option>
                <option value="review">검토 대기 (review)</option>
                <option value="noop">중복 생략 (noop)</option>
                <option value="failed">실패 (failed)</option>
              </select>
            </div>
            <div className="subagent-filter-group" style={{ flexGrow: 1 }}>
              <label htmlFor="subagent-search-input">검색</label>
              <input
                id="subagent-search-input"
                type="search"
                placeholder="에이전트 이름, 업무 내용, 키워드로 검색…"
                value={subagentSearchQuery}
                onChange={(e) => setSubagentSearchQuery(e.target.value)}
                style={{ width: "100%", maxWidth: "320px" }}
              />
            </div>
          </div>

          <div className="subagent-log-grid">
            {filteredSubagentLogs.length === 0 ? (
              <p className="management-empty">조건에 맞는 서브에이전트 작업 기록이 없습니다.</p>
            ) : (
              filteredSubagentLogs.slice(0, 30).map((log) => (
                <div key={log.id} className="subagent-log-card" onClick={() => setSelectedSubagentLog(log)} role="button" tabIndex={0}>
                  <span className={`badge badge-${log.status}`}>
                    {log.status === "completed" ? "완료" : log.status === "published" ? "자동 발행" : log.status === "review" ? "검토 필요" : log.status === "noop" ? "중복" : "실패"}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--navy)" }}>{log.memberName}</span>
                  <span className="log-team" style={{ color: "var(--muted-ink)" }}>
                    {log.teamName}
                  </span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{log.summary}</p>
                  <span className="log-time" style={{ color: "var(--muted)", fontSize: "11px", textAlign: "right" }}>
                    {new Date(log.startedAt).toLocaleString("ko-KR")}
                  </span>
                  <span style={{ color: "var(--teal)", fontSize: "12px", fontWeight: 700 }}>상세 보기 →</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 서브에이전트 상세 보고서 모달 */}
        {selectedSubagentLog && (
          <div className="subagent-log-modal-overlay" onClick={() => setSelectedSubagentLog(null)}>
            <div className="subagent-log-modal" onClick={(e) => e.stopPropagation()}>
              <header>
                <div>
                  <span className={`badge badge-${selectedSubagentLog.status}`} style={{ marginBottom: "6px" }}>
                    {selectedSubagentLog.status.toUpperCase()}
                  </span>
                  <h3>
                    {selectedSubagentLog.memberName} · {selectedSubagentLog.teamName}
                  </h3>
                </div>
                <button type="button" className="admin-button secondary" onClick={() => setSelectedSubagentLog(null)}>
                  닫기
                </button>
              </header>
              <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
                <div>
                  <strong>실행 시각:</strong> {new Date(selectedSubagentLog.startedAt).toLocaleString("ko-KR")}
                </div>
                <div>
                  <strong>수행 액션:</strong> <code>{selectedSubagentLog.action}</code>
                </div>
                <div>
                  <strong>작업 요약:</strong>
                  <pre>{selectedSubagentLog.summary}</pre>
                </div>
                {selectedSubagentLog.postId && (
                  <div>
                    <strong>연관 포스트:</strong>{" "}
                    <button
                      type="button"
                      className="admin-button secondary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => {
                        const target = posts.find((p) => p.id === selectedSubagentLog.postId);
                        if (target) {
                          setSelectedSubagentLog(null);
                          openEditor(target);
                        }
                      }}
                    >
                      편집기로 글 열기 (#{selectedSubagentLog.postId})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. 콘텐츠 보관함 */}
        <section>
          <div className="admin-stats">
            <div className="stat">
              <span>발행 글</span>
              <strong>{count("published")}</strong>
            </div>
            <div className="stat">
              <span>초안</span>
              <strong>{count("draft")}</strong>
            </div>
            <div className="stat">
              <span>예약</span>
              <strong>{count("scheduled")}</strong>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow">CONTENT LIBRARY</p>
                <h2>콘텐츠 보관함</h2>
              </div>
              <button className="admin-button secondary" type="button" onClick={startNewPost}>
                새 글
              </button>
            </div>
            {message && <p className="admin-message" role="status">{message}</p>}
            <div className="admin-list">
              {posts.map((post) => (
                <div className={`admin-item-wrapper ${selected?.id === post.id ? "selected" : ""}`} key={post.id}>
                  <button type="button" className="admin-item" onClick={() => openEditor(post)} aria-label={`${post.title} 글 편집하기`} aria-pressed={selected?.id === post.id}>
                    <span className={`status status-${post.status}`}>{post.status === "published" ? "발행" : post.status === "scheduled" ? "예약" : "초안"}</span>
                    <p>{post.title}</p>
                    <span>{post.category} · {post.publishedAt || (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("ko-KR") : "날짜 미정")}</span>
                  </button>
                  {post.status === "published" && (
                    <Link href={`/posts/${post.slug}`} target="_blank" className="admin-item-link" title="새 탭에서 발행된 글 보기">
                      🔗
                    </Link>
                  )}
                  <button type="button" className="admin-item-delete" title="글 삭제" onClick={() => removePost(post.id, post.title)}>
                    🗑️ 삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. 글 편집기 */}
        <section className="panel editor-panel" id="article-editor" ref={editorPanelRef}>
          <div className="panel-title">
            <div>
              <p className="eyebrow">{selected ? "EDIT ARTICLE" : "NEW ARTICLE"}</p>
              <h2>{selected ? `글 수정 · ${selected.title}` : "새 글 작성"}</h2>
            </div>
            <div className="admin-actions">
              {selected && (
                <button className="admin-button danger" type="button" onClick={() => removePost(selected.id, selected.title)}>
                  삭제
                </button>
              )}
              {selected && (
                <button className="admin-button secondary" type="button" onClick={() => setSelected(null)}>
                  취소
                </button>
              )}
            </div>
          </div>
          <form key={selected?.id ?? "new"} onSubmit={savePost} noValidate>
            <div className="field">
              <label htmlFor="title">제목</label>
              <input id="title" name="title" required defaultValue={selected?.title} placeholder="독자가 찾을 구체적인 제목" />
            </div>
            <div className="field">
              <label htmlFor="excerpt">한 줄 요약</label>
              <input id="excerpt" name="excerpt" defaultValue={selected?.excerpt} placeholder="검색 결과에 보일 120자 안팎의 설명" />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="category">카테고리</label>
                <select id="category" name="category" defaultValue={selected?.category}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="visual">표지 표시</label>
                <input id="visual" name="visual" maxLength={6} defaultValue={selected?.visual} placeholder="예: 30D" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="authorName">글 작성자</label>
              <select id="authorName" name="authorName" defaultValue={selected?.authorName || EDITOR_IN_CHIEF.name}>
                {allEditorialAuthors.map((author) => (
                  <option value={author.name} key={author.id}>
                    {author.name} · {author.role}
                  </option>
                ))}
              </select>
              <small>선택한 이름이 글 상단과 검색엔진용 작성자 정보에 함께 표시됩니다.</small>
            </div>
            <div className="field">
              <label htmlFor="tags">태그</label>
              <input id="tags" name="tags" defaultValue={selected?.tags.join(", ")} placeholder="쉼표로 구분: 퇴직, 생활비" />
            </div>
            <div className="field">
              <label htmlFor="sourceUrl">
                공식자료 주소 <span>(선택)</span>
              </label>
              <input id="sourceUrl" name="sourceUrl" type="text" placeholder="https://www.work24.go.kr/..." />
              <small>입력하면 본문 끝에 출처 링크가 추가되고 전용 썸네일과 공개 글의 공식자료 영역에 자동 표시됩니다.</small>
            </div>
            <div className="field">
              <div className="field-label" id="body-editor-label">
                본문 편집기
              </div>
              <RichTextEditor initialValue={selected?.body} />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="status">저장 상태</label>
                <select id="status" name="status" defaultValue={selected?.status || "published"}>
                  <option value="published">바로 발행 (추천)</option>
                  <option value="draft">초안</option>
                  <option value="scheduled">예약</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="scheduledAt">예약 일시</label>
                <input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={datetimeLocal(selected?.scheduledAt ?? null)} />
              </div>
            </div>
            <input type="hidden" name="publishedAt" value={selected?.publishedAt || ""} />
            <div className="form-actions-bar" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "저장 중…" : selected ? "변경사항 저장" : "글 저장"}
              </button>
              {selected && (
                <button
                  type="button"
                  className="admin-button secondary"
                  disabled={saving}
                  onClick={() => triggerSeoIndexing(selected.slug)}
                >
                  🔍 네이버·구글 색인 요청
                </button>
              )}
              {editorFeedback && (
                <div
                  className={`editor-feedback-badge ${editorFeedback.type}`}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    background: editorFeedback.type === "success" ? "#ecfdf5" : editorFeedback.type === "error" ? "#fef2f2" : "#f0f9ff",
                    color: editorFeedback.type === "success" ? "#065f46" : editorFeedback.type === "error" ? "#991b1b" : "#075985",
                    border: `1px solid ${editorFeedback.type === "success" ? "#a7f3d0" : editorFeedback.type === "error" ? "#fecaca" : "#bae6fd"}`,
                  }}
                >
                  {editorFeedback.text}
                </div>
              )}
            </div>
          </form>
        </section>

        {/* 4. 자동 포스팅 준비 */}
        <section className="panel automation-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">REVIEW QUEUE</p>
              <h2>자동 포스팅 준비</h2>
            </div>
            <span className="queue-count">대기 {queue.length}</span>
          </div>
          <p className="panel-help">공식 자료 주소와 주제를 입력하면 24시간 자동화 시스템이 포스팅을 자동 생성하여 사이트에 즉시 발행합니다.</p>
          <form className="queue-form" onSubmit={createQueueDraft} noValidate>
            <div className="field">
              <label htmlFor="topic">글 주제</label>
              <input id="topic" name="topic" required placeholder="예: 2026년 실업크레딧 신청 방법" />
            </div>
            <div className="field">
              <label htmlFor="sourceUrl">공식 자료 주소</label>
              <input id="sourceUrl" name="sourceUrl" type="text" placeholder="https://www.work24.go.kr/..." />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="queueCategory">카테고리</label>
                <select id="queueCategory" name="category">
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="queueTime">발행 시각</label>
                <input id="queueTime" name="scheduledAt" type="datetime-local" />
              </div>
            </div>
            <button className="admin-button" disabled={saving}>
              포스팅 생성 및 자동 발행
            </button>
          </form>
          <div className="queue-list">
            {queue.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  const post = posts.find((candidate) => candidate.id === item.postId);
                  if (post) openEditor(post);
                }}
              >
                <span>{item.status === "published" ? "발행 완료" : item.status}</span>
                <strong>{item.title}</strong>
                <small>{item.sourceUrl}</small>
              </button>
            ))}
          </div>
        </section>

        {/* 5. 전 구성원 자동 실행계획 */}
        <section className="panel member-activity-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">ORGANIZATION SCHEDULER</p>
              <h2>전 구성원 자동 실행계획</h2>
            </div>
            <span className="queue-count">
              가동 {activityPlans.filter((plan) => plan.status === "active").length}/{activityPlans.length}
            </span>
          </div>
          <p className="panel-help">24시간 스케줄러가 각 구성원의 시간 단위·일 단위 자동화 계획을 처리합니다. '지금 실행'을 눌러 즉시 업무를 실행할 수 있습니다.</p>
          <div className="activity-summary">
            <article>
              <span>시간 단위</span>
              <strong>{activityPlans.filter((plan) => plan.frequency === "hourly").length}명</strong>
            </article>
            <article>
              <span>일 단위</span>
              <strong>{activityPlans.filter((plan) => plan.frequency === "daily").length}명</strong>
            </article>
            <article>
              <span>최근 수행</span>
              <strong>{activityRuns.filter((run) => run.status === "completed" || (run.status as string) === "published").length}건</strong>
            </article>
            <article>
              <span>최근 실패</span>
              <strong>{activityRuns.filter((run) => run.status === "failed").length}건</strong>
            </article>
          </div>
          <AdminCombo id="activity-plan-select" label="구성원 선택" options={activityPlans.map((plan) => ({ value: plan.id, label: `${plan.memberName} · ${plan.role}`, group: plan.teamName }))} value={activePlanId} onChange={setPick("activity")}>
            {activePlan && (
              <>
                <strong>
                  {activePlan.memberName} · {activePlan.role}
                </strong>
                <p>{activePlan.taskTitle}</p>
                <p>{activePlan.instruction}</p>
                <dl>
                  <div>
                    <dt>소속</dt>
                    <dd>{activePlan.teamName}</dd>
                  </div>
                  <div>
                    <dt>실행 주기</dt>
                    <dd>{activePlan.frequency === "hourly" ? `${activePlan.intervalHours}시간마다` : `매일 ${String(activePlan.dailyHourKst).padStart(2, "0")}:${String(activePlan.minuteOffset).padStart(2, "0")} KST`}</dd>
                  </div>
                  <div>
                    <dt>다음 실행</dt>
                    <dd>{activePlan.nextRunAt ? new Date(activePlan.nextRunAt).toLocaleString("ko-KR") : "즉시 실행 가능"}</dd>
                  </div>
                  <div>
                    <dt>자동 산출물</dt>
                    <dd>{activePlan.safeOutput}</dd>
                  </div>
                  <div>
                    <dt>상태</dt>
                    <dd>{activePlan.status === "active" ? "가동 중" : "일시정지"}</dd>
                  </div>
                </dl>
                <div className="combo-actions">
                  <button type="button" disabled={saving || activePlan.status !== "active"} onClick={() => controlActivity(activePlan.id, "run")}>
                    지금 즉시 실행
                  </button>
                  <button type="button" disabled={saving} onClick={() => controlActivity(activePlan.id, "status", activePlan.status === "active" ? "paused" : "active")}>
                    {activePlan.status === "active" ? "일시정지" : "다시 가동"}
                  </button>
                </div>
              </>
            )}
          </AdminCombo>
        </section>

        {/* 6. 팀별 권한 및 정책 */}
        <section className="panel release-governance-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">SAFE RELEASE & ACCESS</p>
              <h2>팀별 권한·무중단 배포</h2>
            </div>
            <span className="queue-count">운영 배포 {safeReleasePolicy.productionAuthority} 전용</span>
          </div>
          <p className="panel-help">콘텐츠 업데이트는 운영 중인 사이트를 멈추지 않고 데이터에 즉시 반영됩니다.</p>
          <div className="release-safety-summary">
            <article>
              <span>배포 방식</span>
              <strong>버전 분리·일괄 교체</strong>
              <p>검증 중에는 현재 정상 사이트를 그대로 제공합니다.</p>
            </article>
            <article>
              <span>승인</span>
              <strong>{safeReleasePolicy.approvalAuthority}</strong>
              <p>정책·품질·보안 게이트를 확인합니다.</p>
            </article>
            <article>
              <span>복구</span>
              <strong>직전 정상 버전 유지</strong>
              <p>{safeReleasePolicy.rollback}</p>
            </article>
          </div>
          <AdminCombo id="team-permission-select" label="팀별 권한 보기" options={teamPermissions.map((team) => ({ value: team.id, label: team.name }))} value={activeTeam?.id ?? ""} onChange={setPick("permission")}>
            {activeTeam && (
              <>
                <strong>
                  {activeTeam.name} · 권한 {activeTeam.capabilities.length}개
                </strong>
                <p>{activeTeam.responsibility}</p>
                <dl>
                  <div>
                    <dt>보유 권한</dt>
                    <dd>{activeTeam.capabilities.join(" · ")}</dd>
                  </div>
                  {activeTeam.restrictions.map((rule, index) => (
                    <div key={rule}>
                      <dt>제약 {index + 1}</dt>
                      <dd>{rule}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </AdminCombo>
        </section>

        {/* 7. 경영관리팀 상황실 */}
        <section className="panel management-department-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">SITE MANAGEMENT</p>
              <h2>사이트 경영관리팀 상황실</h2>
            </div>
            <button className="admin-button" type="button" disabled={saving} onClick={() => manageSite("audit")}>
              지금 전체 점검
            </button>
          </div>
          <p className="panel-help">3명의 관리 담당자가 발행정책, 자동화 흐름, 사이트 품질을 점검합니다.</p>
          {companyRules && (
            <section className="company-rules-card">
              <header>
                <div>
                  <span>전사 사규 · 시행 중</span>
                  <h3>
                    {companyRules.title} v{companyRules.version}
                  </h3>
                  <p>{companyRules.purpose}</p>
                </div>
                <strong>
                  {companyRules.effectiveAt}
                  <small>시행</small>
                </strong>
              </header>
              <section className="company-direction">
                <span>VISION</span>
                <h4>{companyRules.vision}</h4>
                <p>{companyRules.mission}</p>
              </section>
              <div className="company-rules-metrics">
                <span>
                  적용 직원 <b>{policyCoverage.applied}명</b>
                </span>
                <span>
                  관리 리소스 <b>{companyResources.length}종</b>
                </span>
                <span>
                  경영목표 <b>{companyRules.strategicObjectives.length}개</b>
                </span>
              </div>
              <details>
                <summary>MVP 6대 경영목표 보기</summary>
                <div className="company-objectives">
                  {companyRules.strategicObjectives.map((objective) => (
                    <article key={objective.id}>
                      <h4>{objective.title}</h4>
                      <p>{objective.description}</p>
                      <ul>
                        {objective.kpis.map((kpi) => (
                          <li key={kpi}>{kpi}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </details>
              <details>
                <summary>사규 전체 조항 보기</summary>
                <div className="company-rule-chapters">
                  {companyRules.chapters.map((chapter) => (
                    <article key={chapter.number}>
                      <h4>
                        제{chapter.number}장 {chapter.title}
                      </h4>
                      <ol>
                        {chapter.articles.map((article) => (
                          <li key={article}>{article}</li>
                        ))}
                      </ol>
                    </article>
                  ))}
                </div>
              </details>
              <details>
                <summary>리소스 책임자 보기</summary>
                <div className="company-resource-list">
                  {companyResources.map((resource) => (
                    <article key={resource.id}>
                      <div>
                        <span>{resource.category}</span>
                        <strong>{resource.name}</strong>
                      </div>
                      <dl>
                        <div>
                          <dt>소유팀</dt>
                          <dd>{resource.owner}</dd>
                        </div>
                        <div>
                          <dt>실무관리</dt>
                          <dd>{resource.custodian}</dd>
                        </div>
                      </dl>
                      <p>{resource.control}</p>
                    </article>
                  ))}
                </div>
              </details>
            </section>
          )}
          {organizationNotice && (
            <section className="organization-notice" aria-labelledby="organization-notice-title">
              <header>
                <div>
                  <span>전사 공지 · {organizationNotice.effectiveDate}</span>
                  <h3 id="organization-notice-title">{organizationNotice.title}</h3>
                  <p>{organizationNotice.message}</p>
                </div>
                <strong>
                  전사 적용 {policyCoverage.applied}/{policyCoverage.total}명
                </strong>
              </header>
              <ol>
                {organizationNotice.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
              <details>
                <summary>적용 구성원 전체 보기</summary>
                <div className="policy-recipient-list">
                  {policyRecipients.map((member) => (
                    <span key={member.id}>
                      <b>{member.name}</b>
                      {member.title}
                    </span>
                  ))}
                </div>
              </details>
            </section>
          )}
          <section className="originality-monitor">
            <header>
              <div>
                <p className="eyebrow">ORIGINALITY MONITOR</p>
                <h3>원문 복사 자동감시</h3>
              </div>
              <strong>최근 차단 {originalityChecks.filter((check) => check.status === "blocked").length}건</strong>
            </header>
            <p>편집자가 글을 발행하거나 예약할 때 연결된 원문과 기존 게시물을 자동 대조합니다. 동일 문장이 과도하면 발행을 중지하고 자신의 설명·사례·표로 재작성하도록 즉시 요청합니다.</p>
            <div>
              {originalityChecks.length === 0 ? (
                <span className="originality-empty">아직 검사 기록이 없습니다.</span>
              ) : (
                originalityChecks.slice(0, 8).map((check) => (
                  <article className={check.status} key={check.id}>
                    <span>{check.status === "passed" ? "통과" : check.status === "blocked" ? "발행 차단" : "직접 확인 필요"}</span>
                    <strong>
                      {check.editorName} · {check.title}
                    </strong>
                    <small>
                      문장 중복 {Math.round(check.overlapRatio * 100)}% · 최장 일치 {check.longestMatchChars}자
                    </small>
                    <p>{check.message}</p>
                  </article>
                ))
              )}
            </div>
          </section>
          <div className="management-summary">
            <div>
              <span>열린 문제</span>
              <strong>{managementIssues.filter((issue) => issue.status === "open").length}</strong>
            </div>
            <div>
              <span>긴급</span>
              <strong>{managementIssues.filter((issue) => issue.status === "open" && issue.severity === "critical").length}</strong>
            </div>
            <div>
              <span>최근 점검</span>
              <strong>{managementRuns[0] ? new Date(managementRuns[0].createdAt).toLocaleString("ko-KR") : "대기 중"}</strong>
            </div>
          </div>
          <AdminCombo id="management-member-select" label="관리 담당자 보기" options={managementMembers.map((member) => ({ value: member.id, label: `${member.name} · ${member.role}` }))} value={activeManager?.id ?? ""} onChange={setPick("manager")}>
            {activeManager && (
              <>
                <strong>
                  {activeManager.name} · {activeManager.role}
                </strong>
                <p>{activeManager.mission}</p>
              </>
            )}
          </AdminCombo>
          <div className="management-issue-list">
            <h3>문제 보고 및 조치 내역</h3>
            {managementIssues.length === 0 ? (
              <p className="management-empty">아직 발견된 문제가 없습니다. ‘지금 전체 점검’을 실행하세요.</p>
            ) : (
              managementIssues.map((issue) => (
                <article className={`${issue.status} ${issue.severity}`} key={issue.id}>
                  <header>
                    <div>
                      <span>{issue.status === "resolved" ? "조치 완료" : issue.severity === "critical" ? "긴급 보고" : "확인 필요"}</span>
                      <strong>{issue.title}</strong>
                    </div>
                    <small>
                      {issue.auditorName} · {issue.scope}
                    </small>
                  </header>
                  <p>{issue.details}</p>
                  {issue.actionTaken && <p className="management-action">즉시 조치: {issue.actionTaken}</p>}
                  <footer>
                    {issue.postId ? (
                      <button
                        type="button"
                        onClick={() => {
                          const post = posts.find((item) => item.id === issue.postId);
                          if (post) openEditor(post);
                        }}
                      >
                        해당 글 열기
                      </button>
                    ) : (
                      <span />
                    )}
                    {issue.status === "open" && (
                      <button type="button" disabled={saving} onClick={() => manageSite("resolve", issue.id)}>
                        조치 완료 표시
                      </button>
                    )}
                  </footer>
                </article>
              ))
            )}
          </div>
        </section>

        {/* 8. 전사 감사실 */}
        <section className="panel internal-audit-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">INTERNAL AUDIT</p>
              <h2>전사 감사실</h2>
            </div>
            <button className="admin-button" type="button" disabled={saving} onClick={() => auditOrganization("run")}>
              전 프로젝트 감사 실행
            </button>
          </div>
          <p className="panel-help">{auditScope || "애드블스 전 프로젝트 업무"}를 대상으로 사규·인사·콘텐츠·품질·보안 증거를 점검합니다.</p>
          <div className="audit-summary">
            <div>
              <span>최근 감사의견</span>
              <strong>{auditRuns[0]?.overallOpinion ?? "감사 대기"}</strong>
            </div>
            <div>
              <span>통과 항목</span>
              <strong>{auditRuns[0] ? `${auditRuns[0].passedItems}/${auditRuns[0].totalItems}` : "-"}</strong>
            </div>
            <div>
              <span>열린 지적사항</span>
              <strong>{auditFindings.filter((item) => item.status === "open").length}</strong>
            </div>
          </div>
          <AdminCombo id="audit-officer-select" label="감사 담당관 보기" options={auditOfficers.map((officer) => ({ value: officer.id, label: `${officer.name} · ${officer.title}` }))} value={activeOfficer?.id ?? ""} onChange={setPick("officer")}>
            {activeOfficer && (
              <>
                <strong>
                  {activeOfficer.name} · {activeOfficer.title}
                </strong>
                <p>{activeOfficer.responsibility}</p>
              </>
            )}
          </AdminCombo>
          <details className="audit-domains">
            <summary>감사영역 {auditDomains.length}개와 증거기준 보기</summary>
            <div>
              {auditDomains.map((domain) => (
                <article key={domain.id}>
                  <span>{domain.owner} 담당</span>
                  <h4>{domain.name}</h4>
                  <p>{domain.standard}</p>
                  <small>{domain.evidence.join(" · ")}</small>
                </article>
              ))}
            </div>
          </details>
          <div className="audit-findings">
            <h3>감사조서 · 시정조치</h3>
            {auditFindings.length === 0 ? (
              <p className="management-empty">아직 감사 이력이 없습니다. ‘전 프로젝트 감사 실행’을 눌러 시작하세요.</p>
            ) : (
              auditFindings.slice(0, 24).map((finding) => (
                <article className={`${finding.status} ${finding.severity}`} key={finding.id}>
                  <header>
                    <div>
                      <span>{finding.status === "compliant" ? "적정" : finding.status === "resolved" ? "조치 완료" : finding.severity === "critical" ? "긴급" : "시정 필요"}</span>
                      <strong>{finding.title}</strong>
                    </div>
                    <small>{auditDomains.find((domain) => domain.id === finding.domain)?.name ?? finding.domain}</small>
                  </header>
                  <p>{finding.details}</p>
                  <footer>
                    <span>
                      담당 {finding.actionOwner}
                      {finding.dueAt ? ` · ${new Date(finding.dueAt).toLocaleDateString("ko-KR")}까지` : ""}
                    </span>
                    {finding.status === "open" && (
                      <button type="button" disabled={saving} onClick={() => auditOrganization("resolve", finding.id)}>
                        시정조치 기록
                      </button>
                    )}
                  </footer>
                  {finding.resolution && <p className="management-action">완료 증거: {finding.resolution}</p>}
                </article>
              ))
            )}
          </div>
        </section>

        {/* 9. 분야별 에이전트 운영실 */}
        <section className="panel automation-panel agent-control-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">CONTENT AGENTS</p>
              <h2>분야별 에이전트 운영실</h2>
            </div>
            <span className="queue-count">
              가동 {agents.filter((agent) => agent.status === "active").length}/{agents.length}
            </span>
          </div>
          <p className="panel-help">각 에이전트는 정해진 공식 출처와 주제를 사용해 16시간마다 초안을 준비합니다. 사람이 확인해 예약 또는 발행 상태로 바꾼 글만 공개됩니다. 품질 기준에 미달하면 실패 기록으로 남깁니다.</p>
          <AdminCombo id="content-agent-select" label="에이전트 선택" options={agents.map((agent) => ({ value: agent.id, label: `${agent.name} · ${agent.category}` }))} value={activeAgentId} onChange={setPick("agent")}>
            {activeAgent && (
              <>
                <strong>
                  {activeAgent.name} · {activeAgent.category}
                </strong>
                <p>{activeAgent.mission}</p>
                <dl>
                  <div>
                    <dt>상태</dt>
                    <dd>{activeAgent.status === "active" ? "가동 중" : "일시정지"}</dd>
                  </div>
                  <div>
                    <dt>초안 생성 주기</dt>
                    <dd>{activeAgent.cadenceHours < 24 ? `${activeAgent.cadenceHours}시간` : `${Math.round(activeAgent.cadenceHours / 24)}일`}</dd>
                  </div>
                  <div>
                    <dt>다음 실행</dt>
                    <dd>{activeAgent.nextRunAt ? new Date(activeAgent.nextRunAt).toLocaleString("ko-KR") : "즉시 실행 가능"}</dd>
                  </div>
                  <div>
                    <dt>공식 출처</dt>
                    <dd>{activeAgent.sources.length}곳</dd>
                  </div>
                </dl>
                <div className="combo-actions">
                  <button type="button" disabled={saving || activeAgent.status !== "active"} onClick={() => controlAgent(activeAgent.id, "run")}>
                    지금 초안 만들기 (자동 발행)
                  </button>
                  <button type="button" disabled={saving} onClick={() => controlAgent(activeAgent.id, "status", activeAgent.status === "active" ? "paused" : "active")}>
                    {activeAgent.status === "active" ? "일시정지" : "다시 가동"}
                  </button>
                </div>
              </>
            )}
          </AdminCombo>
          <div className="agent-run-log">
            <h3>최근 작업 기록</h3>
            {agentRuns.length === 0 ? (
              <p>아직 실행 기록이 없습니다.</p>
            ) : (
              agentRuns.map((run) => (
                <div key={run.id}>
                  <span>{run.status === "published" ? "자동 발행" : run.status === "review" ? "검토 대기" : "실패"}</span>
                  <strong>{run.agentName}</strong>
                  <p>{run.topic}</p>
                  <time>{new Date(run.createdAt).toLocaleString("ko-KR")}</time>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 10. 홍보 에이전트 작업실 */}
        <section className="panel promotion-agent-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">PROMOTION AGENT</p>
              <h2>홍보 에이전트 작업실</h2>
            </div>
            <span className="queue-count">준비 {promotions.filter((item) => item.status === "prepared").length}</span>
          </div>
          <p className="panel-help">발행된 글을 선택하면 SNS용 문구, 커뮤니티 소개문, 해시태그와 원문 링크를 즉시 준비합니다.</p>
          <form className="promotion-agent-form" onSubmit={preparePromotion}>
            <div className="field">
              <label htmlFor="promotionPostId">홍보할 발행 글</label>
              <select id="promotionPostId" name="promotionPostId" required defaultValue="">
                <option value="" disabled>
                  글을 선택하세요
                </option>
                {posts
                  .filter((post) => post.status === "published")
                  .map((post) => (
                    <option value={post.id} key={post.id}>
                      {post.title}
                    </option>
                  ))}
              </select>
            </div>
            <button className="admin-button" disabled={saving}>
              홍보안 준비하기
            </button>
          </form>
          <div className="promotion-campaigns">
            {promotions.length === 0 ? (
              <p className="promotion-empty">아직 준비된 홍보안이 없습니다. 발행 글을 선택해 첫 홍보안을 만드세요.</p>
            ) : (
              promotions.map((campaign) => (
                <article className={`promotion-card ${campaign.status}`} key={campaign.id}>
                  <header>
                    <div>
                      <span>{campaign.status === "prepared" ? "확인·실행 대기" : "실행 기록 완료"}</span>
                      <h3>{campaign.title}</h3>
                    </div>
                    <time>{new Date(campaign.executedAt || campaign.createdAt).toLocaleString("ko-KR")}</time>
                  </header>
                  <div className="promotion-channel-list" aria-label="추천 홍보 채널">
                    {campaign.channels.map((channel) => (
                      <span key={channel}>{channel}</span>
                    ))}
                  </div>
                  <div className="marketing-channel-plans">
                    {campaign.channelPlans.map((plan) => (
                      <section key={plan.id} className="marketing-channel-plan">
                        <header>
                          <div>
                            <strong>{plan.name}</strong>
                            <span>담당 {plan.owner}</span>
                          </div>
                          <small>UTM 추적 적용</small>
                        </header>
                        <p>{plan.copy}</p>
                        <code>{plan.trackedUrl}</code>
                        <div>
                          <button type="button" disabled={saving} onClick={() => copyPromotion(plan.copy, `${plan.name} 문구`)}>
                            문구 복사
                          </button>
                          {plan.actionUrl && (
                            <a href={plan.actionUrl} target="_blank" rel="noreferrer">
                              공유 화면 열기
                            </a>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                  <div className="promotion-actions">{campaign.status === "prepared" && <button type="button" disabled={saving} onClick={() => finishPromotion(campaign.id)}>외부 게시 완료로 표시</button>}</div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* 11. 품질디자인팀 운영실 */}
        <section className="panel promotion-department-panel">
          <div className="panel-title"><div><p className="eyebrow">QUALITY DESIGN TEAM</p><h2>품질디자인팀 운영실</h2></div><span className="queue-count">AI 실무자 {qualityDesignTeam.length}명</span></div>
          <p className="panel-help">콘텐츠편집팀이 만든 글을 디자인, 가독성, 시각자료, 모바일·접근성, 발행 정보까지 하나의 완성품으로 검수합니다. 기준 미달 작업은 보완 대기로 돌리고, 최종 공개는 경영관리팀 승인 뒤에만 진행합니다.</p>
          <AdminCombo id="quality-member-select" label="품질디자인팀 실무자" options={qualityDesignTeam.map(member => ({ value: member.id, label: `${member.name} · ${member.title}` }))} value={qualityMember?.id ?? ""} onChange={setPick("quality")}>{qualityMember && <><strong>{qualityMember.name} · {qualityMember.title}</strong><p>{qualityMember.mission}</p><dl><div><dt>전담</dt><dd>{qualityMember.owns.join(" · ")}</dd></div>{qualityMember.kpis.map((kpi, index) => <div key={kpi}><dt>KPI {index + 1}</dt><dd>{kpi}</dd></div>)}</dl></>}</AdminCombo>
          <div className="search-programs"><h3>발행 전 필수 품질 게이트</h3><article><ol>{qualityDesignGates.map(gate => <li key={gate}>{gate}</li>)}</ol></article></div>
        </section>

        {/* 11. 콘텐츠기획팀 운영실 */}
        <section className="panel promotion-department-panel">
          <div className="panel-title"><div><p className="eyebrow">CONTENT PLANNING TEAM</p><h2>콘텐츠기획팀 운영실</h2></div><span className="queue-count">AI 실무자 {contentPlanningTeam.length}명</span></div>
          <p className="panel-help">독자 질문을 주제 포트폴리오와 제작 브리프로 바꿔 콘텐츠편집팀에 인계합니다. 기획팀은 무엇을 왜 만들지 책임지고, 집필·사실검증·발행 권한은 각각 콘텐츠편집팀과 경영관리팀에 둡니다.</p>
          <AdminCombo id="planning-member-select" label="콘텐츠기획팀 실무자" options={contentPlanningTeam.map(member => ({ value: member.id, label: `${member.name} · ${member.title}` }))} value={planningMember?.id ?? ""} onChange={setPick("planning")}>{planningMember && <><strong>{planningMember.name} · {planningMember.title}</strong><p>{planningMember.mission}</p><dl><div><dt>전담</dt><dd>{planningMember.owns.join(" · ")}</dd></div>{planningMember.kpis.map((kpi, index) => <div key={kpi}><dt>KPI {index + 1}</dt><dd>{kpi}</dd></div>)}</dl></>}</AdminCombo>
          <div className="search-programs"><h3>기획 → 학습 운영 흐름</h3><article><ol>{contentPlanningWorkflow.map(item => <li key={item}>{item}</li>)}</ol></article><h3>출범 후 첫 30일</h3><article><ol>{contentPlanningFirstMonth.map(item => <li key={item}>{item}</li>)}</ol></article></div>
        </section>

        {/* 12. 홍보마케팅팀 조직·SEO 운영실 */}
        <section className="panel promotion-department-panel">
          <div className="panel-title"><div><p className="eyebrow">SEARCH GROWTH TEAM</p><h2>홍보마케팅팀 조직·SEO 운영실</h2></div><span className="queue-count">AI 실무자 {promotionTeam.length}명</span></div>
          <p className="panel-help">역할이 바로 연상되는 짧은 닉네임을 사용하는 AI 조직입니다. 검색 결과 점검과 개선안 작성은 반복 수행하되, 외부 게시·검색도구 설정 변경·배포는 사람의 확인과 승인 뒤에만 실행합니다.</p>
          <AdminCombo id="growth-member-select" label="홍보마케팅팀 실무자" options={promotionTeam.map(member => ({ value: member.id, label: `${member.name} · ${member.title}` }))} value={growthMember?.id ?? ""} onChange={setPick("growth")}>{growthMember && <><strong>{growthMember.name} · {growthMember.title}</strong><p>{growthMember.scope}</p><dl><div><dt>수행 주기</dt><dd>{growthMember.cadence}</dd></div>{growthMember.kpis.map((kpi, index) => <div key={kpi}><dt>KPI {index + 1}</dt><dd>{kpi}</dd></div>)}</dl></>}</AdminCombo>
          <div className="search-programs"><h3>검색엔진별 상시 관리</h3>{searchPrograms.map(program => { const owner = getPromotionMember(program.ownerId); return <article key={program.id}><header><div><span>{program.engine}</span><strong>{owner?.name} · {owner?.title}</strong></div><small>{program.successMetric}</small></header><ol>{program.routine.map(item => <li key={item}>{item}</li>)}</ol></article>; })}</div>
        </section>
      </div>
    </main>
  );
}
