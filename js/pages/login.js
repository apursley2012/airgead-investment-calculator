import { toast } from '../components/shell.js';
document.querySelector('#loginForm').addEventListener('submit',e=>{e.preventDefault();const email=document.querySelector('#email').value;localStorage.setItem('airgead_user',email);toast('Signed in for demo mode');setTimeout(()=>location.href='saved-plans.html',350)});
