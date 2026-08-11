"use client";
import { useMemo, useState } from "react";

function won(value:number){return new Intl.NumberFormat("ko-KR").format(value)+"원"}
export default function RunwayCalculator(){
  const [funds,setFunds]=useState(60000000);const [expense,setExpense]=useState(3000000);const [income,setIncome]=useState(500000);
  const result=useMemo(()=>{const gap=Math.max(0,expense-income);const months=gap===0?Infinity:Math.floor(funds/gap);return{gap,months,years:months===Infinity?Infinity:Math.floor(months/12),rest:months===Infinity?0:months%12}},[funds,expense,income]);
  return <section className="calculator" aria-labelledby="calculator-title">
    <div className="calculator-inputs"><p className="eyebrow">MY NUMBERS</p><h2 id="calculator-title">내 숫자 입력하기</h2>
      <label>사용 가능한 자금 <span>{won(funds)}</span><input aria-label="사용 가능한 자금" type="range" min="0" max="500000000" step="1000000" value={funds} onChange={e=>setFunds(Number(e.target.value))}/></label>
      <label>월 필수생활비 <span>{won(expense)}</span><input aria-label="월 필수생활비" type="range" min="500000" max="10000000" step="100000" value={expense} onChange={e=>setExpense(Number(e.target.value))}/></label>
      <label>월 고정 수입 <span>{won(income)}</span><input aria-label="월 고정 수입" type="range" min="0" max="10000000" step="100000" value={income} onChange={e=>setIncome(Number(e.target.value))}/></label>
      <p className="calculator-privacy">입력값은 브라우저에서만 계산하며 저장하거나 전송하지 않습니다.</p>
    </div>
    <div className="calculator-output" aria-live="polite"><span>예상 준비 기간</span>{result.months===Infinity?<><strong>계속 유지</strong><p>고정 수입이 필수생활비 이상입니다.</p></>:<><strong>{result.months}개월</strong><p>{result.years}년 {result.rest}개월 동안 월 부족액 {won(result.gap)}을 보완할 수 있습니다.</p></>}<div className="result-note"><b>다음 행동</b><p>{result.months<12?"1년 이내 현금흐름 확보가 우선입니다. 지출을 다시 나누고 받을 수 있는 지원부터 확인하세요.":result.months<36?"준비 기간을 월 단위로 배분하세요. 빠른 일 소득과 축적형 수입을 함께 시험할 수 있습니다.":"시간 여유가 있어도 생활비 계좌와 장기 자산을 분리하고 작은 수입 실험부터 검증하세요."}</p></div></div>
  </section>
}
