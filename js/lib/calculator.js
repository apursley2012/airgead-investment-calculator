export function calculateCompoundInterest(inputs){
  const startingBalance = Math.max(0, Number(inputs.startingBalance)||0);
  const monthlyDeposit = Math.max(0, Number(inputs.monthlyDeposit)||0);
  const annualRate = Math.max(0, Number(inputs.annualRate)||0);
  const years = Math.min(80, Math.max(0, Math.round(Number(inputs.years)||0)));
  const monthlyRate = annualRate / 100 / 12;
  let withDeposits = startingBalance;
  let withoutDeposits = startingBalance;
  let totalDeposits = startingBalance;
  const rows = [{year:0,withDeposits:Math.round(withDeposits),withoutDeposits:Math.round(withoutDeposits),totalDeposits:Math.round(totalDeposits),interestEarned:0}];
  for(let y=1;y<=years;y++){
    for(let m=0;m<12;m++){
      withDeposits = withDeposits * (1 + monthlyRate) + monthlyDeposit;
      withoutDeposits = withoutDeposits * (1 + monthlyRate);
      totalDeposits += monthlyDeposit;
    }
    rows.push({year:y,withDeposits:Math.round(withDeposits),withoutDeposits:Math.round(withoutDeposits),totalDeposits:Math.round(totalDeposits),interestEarned:Math.round(withDeposits-totalDeposits)});
  }
  return rows;
}
export const money = value => '$' + Math.round(Number(value)||0).toLocaleString();
export function saveCurrentCalculation(inputs, results){localStorage.setItem('airgead_current_calc', JSON.stringify({inputs,results,updatedAt:new Date().toISOString()}));}
export function getCurrentCalculation(){try{return JSON.parse(localStorage.getItem('airgead_current_calc')||'null')}catch{return null}}
export function getSavedPlans(){try{return JSON.parse(localStorage.getItem('airgead_saved_plans')||'[]')}catch{return []}}
export function setSavedPlans(plans){localStorage.setItem('airgead_saved_plans', JSON.stringify(plans));}
export function downloadCsv(filename, rows){const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
