import { getCurrentCalculation, getSavedPlans, setSavedPlans, money, downloadCsv } from '../lib/calculator.js';
import { drawGrowthChart } from '../lib/charts.js';
import { toast } from '../components/shell.js';
let data=getCurrentCalculation();if(!data){location.href='calculator.html'}
const {inputs,results}=data;const final=results[results.length-1];
document.querySelector('#finalWith').textContent=money(final.withDeposits);document.querySelector('#totalPrincipal').textContent=money(final.totalDeposits);document.querySelector('#totalInterest').textContent=money(final.interestEarned);document.querySelector('#finalWithout').textContent=money(final.withoutDeposits);document.querySelector('#withoutText').textContent=`Just leaving the initial ${money(inputs.startingBalance)} to grow.`;
document.querySelector('#resultsTable').innerHTML=results.map(r=>`<tr><td>${r.year}</td><td><strong>${money(r.withDeposits)}</strong></td><td>${money(r.withoutDeposits)}</td><td>${money(r.totalDeposits)}</td><td class="positive">${money(r.interestEarned)}</td></tr>`).join('');
function redraw(){drawGrowthChart(document.querySelector('#growthChart'),results)}redraw();addEventListener('resize',redraw);
document.querySelector('#savePlan').addEventListener('click',()=>{const plans=getSavedPlans();plans.push({id:Date.now().toString(),date:new Date().toISOString(),name:`Plan: ${money(inputs.monthlyDeposit)}/mo for ${inputs.years} years`,data});setSavedPlans(plans);toast('Plan saved locally')});
document.querySelector('#exportCsv').addEventListener('click',()=>{downloadCsv(`airgead-${inputs.years}-year-plan.csv`,[['Year','With Deposits','Without Deposits','Total Principal','Interest Earned'],...results.map(r=>[r.year,r.withDeposits,r.withoutDeposits,r.totalDeposits,r.interestEarned])]);toast('CSV exported')});
