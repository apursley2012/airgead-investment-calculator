import { calculateCompoundInterest, money } from '../lib/calculator.js';
import { drawComparisonChart } from '../lib/charts.js';
function read(form){return Object.fromEntries([...form.elements].filter(e=>e.name).map(e=>[e.name,e.value]));}
const a=document.querySelector('[data-scenario="a"]');const b=document.querySelector('[data-scenario="b"]');
function update(){const ra=calculateCompoundInterest(read(a));const rb=calculateCompoundInterest(read(b));const fa=ra[ra.length-1];const fb=rb[rb.length-1];document.querySelector('#finalA').textContent=money(fa.withDeposits);document.querySelector('#finalB').textContent=money(fb.withDeposits);drawComparisonChart(document.querySelector('#comparisonChart'),[{name:'Scenario A',balance:fa.withDeposits,interest:fa.interestEarned,principal:fa.totalDeposits},{name:'Scenario B',balance:fb.withDeposits,interest:fb.interestEarned,principal:fb.totalDeposits}]);}
[a,b].forEach(form=>form.addEventListener('input',update));addEventListener('resize',update);update();
