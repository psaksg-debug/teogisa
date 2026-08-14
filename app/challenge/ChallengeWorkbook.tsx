"use client";

import { useEffect, useMemo, useState } from "react";
import { workbookDays } from "../../lib/portal";

const storageKey = "retirement-lab-100-challenge";

export default function ChallengeWorkbook(){
  const [done,setDone]=useState<number[]>([]);
  useEffect(()=>{const frame=requestAnimationFrame(()=>{try{setDone(JSON.parse(localStorage.getItem(storageKey)??"[]"));}catch{setDone([]);}});return()=>cancelAnimationFrame(frame);},[]);
  const progress=Math.round((done.length/workbookDays.length)*100);
  const doneSet=useMemo(()=>new Set(done),[done]);
  function toggle(day:number){const next=doneSet.has(day)?done.filter(item=>item!==day):[...done,day].sort((a,b)=>a-b);setDone(next);localStorage.setItem(storageKey,JSON.stringify(next));}
  return <section className="workbook" aria-labelledby="workbook-title">
    <div className="workbook-progress"><div><p className="eyebrow">MY PROGRESS</p><h2 id="workbook-title">30일 실행 워크북</h2></div><strong>{progress}%</strong><div className="progress-track" aria-label={`워크북 ${progress}% 완료`}><span style={{width:`${progress}%`}}/></div><p>{done.length}일 완료 · 진행상황은 현재 기기에 저장됩니다.</p></div>
    <ol className="workbook-days">{workbookDays.map(([title,description],index)=>{const day=index+1;const checked=doneSet.has(day);return <li className={checked?"done":""} key={title}><button type="button" onClick={()=>toggle(day)} aria-pressed={checked}><span>{checked?"완료":`DAY ${String(day).padStart(2,"0")}`}</span><strong>{title}</strong><p>{description}</p></button></li>;})}</ol>
  </section>;
}
