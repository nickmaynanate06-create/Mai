const $ = id => document.getElementById(id);
const DB_KEY = "mai.memory.v1", SETTINGS_KEY = "mai.settings.v1", LOG_KEY = "mai.log.v1";
let memories = load(DB_KEY, []), logs = load(LOG_KEY, []), paused = false, currentPlan = [];
const defaults = {allowPlanning:true,allowTools:true,confirmSteps:true,rememberNotes:false};
let settings = {...defaults,...load(SETTINGS_KEY,{})};
function load(k,fallback){try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function stamp(){return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
function log(message){logs.unshift({time:stamp(),message});logs=logs.slice(0,30);save(LOG_KEY,logs);renderLogs()}
function renderLogs(){$("activityLog").innerHTML=logs.length?logs.map(x=>`<div class="logitem"><span class="logtime">${esc(x.time)}</span>${esc(x.message)}</div>`).join(""):'<p class="muted">No activity yet.</p>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderMemory(){$("memoryCount").textContent=`${memories.length} memor${memories.length===1?"y":"ies"}`;$("memoryList").innerHTML=memories.length?memories.map((m,i)=>`<li><span>${esc(m.text)}<br><small class="muted">${esc(m.date)}</small></span><button class="secondary" data-del="${i}" aria-label="Delete memory">×</button></li>`).join(""):'<li class="muted">No saved memories yet.</li>'}
function addMemory(text){text=text.trim();if(!text)return;if(text.length>1000){alert("Keep each memory under 1,000 characters.");return}memories.unshift({text,date:new Date().toLocaleDateString()});memories=memories.slice(0,200);save(DB_KEY,memories);renderMemory();log("Saved a memory on this device.")}
function syncSettings(){for(const k of Object.keys(defaults))$(k).checked=!!settings[k];save(SETTINGS_KEY,settings)}
function makePlan(goal){const clean=goal.trim();if(!clean)return[];return [
{title:`Clarify the desired outcome for: ${clean}`,kind:"review"},
{title:"Break the work into small, reversible steps",kind:"plan"},
{title:"Gather only the information needed for the next step",kind:"research"},
{title:"Prepare a draft or proposed action for your review",kind:"draft"},
{title:"Check the result against your original goal",kind:"review"}
]}
function renderPlan(){
 const area=$("planArea");if(!currentPlan.length){area.innerHTML='<p class="muted">Your plan will appear here. Review it before running any step.</p>';return}
 area.innerHTML='<p class="muted small">Suggested plan · nothing runs automatically. Approve each step to mark it complete.</p>'+currentPlan.map((s,i)=>`<div class="planstep"><input type="checkbox" data-step="${i}" ${s.done?"checked":""} aria-label="Complete step ${i+1}"><div class="steptext">${esc(s.title)}</div><span class="stepstate">${s.done?"DONE":"REVIEW"}</span></div>`).join("")+'<div class="actions"><button id="approveAllBtn" class="secondary">Approve remaining steps</button><button id="clearPlanBtn" class="secondary">Clear plan</button></div>';
 area.querySelectorAll("[data-step]").forEach(el=>el.addEventListener("change",()=>runStep(Number(el.dataset.step),el.checked)));
 $("approveAllBtn").addEventListener("click",()=>{if(paused){log("Plan approval blocked: agent is paused.");return}if(settings.confirmSteps&&!confirm("Approve marking all remaining steps complete? This demo only records progress; it does not perform external actions."))return;currentPlan.forEach((s,i)=>{if(!s.done)runStep(i,true,true)});renderPlan()});
 $("clearPlanBtn").addEventListener("click",()=>{currentPlan=[];renderPlan();log("Cleared the current plan.")});
}
function runStep(i,checked,bulk=false){if(paused){log("Step blocked: agent is paused.");renderPlan();return}if(!settings.allowTools){log("Step blocked: local tools are disabled.");renderPlan();return}if(checked&&settings.confirmSteps&&!bulk&&!confirm(`Approve step ${i+1}?\n\n${currentPlan[i].title}`)){renderPlan();return}currentPlan[i].done=checked;log(`${checked?"Approved":"Reopened"} plan step ${i+1}: ${currentPlan[i].title}`);renderPlan()}
$("planBtn").addEventListener("click",()=>{if(!settings.allowPlanning){log("Planning blocked: planning is disabled in settings.");return}const goal=$("goalInput").value.trim();if(!goal){$("goalInput").focus();return}currentPlan=makePlan(goal);renderPlan();log("Created a suggested plan for your review.")});
$("rememberGoalBtn").addEventListener("click",()=>addMemory($("goalInput").value));
$("addMemoryBtn").addEventListener("click",()=>{addMemory($("memoryInput").value);$("memoryInput").value=""});
$("memoryInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("addMemoryBtn").click()});
$("memoryList").addEventListener("click",e=>{const b=e.target.closest("[data-del]");if(!b)return;const i=Number(b.dataset.del);if(confirm("Delete this memory from this browser?")){memories.splice(i,1);save(DB_KEY,memories);renderMemory();log("Deleted one local memory.")}});
$("clearMemoryBtn").addEventListener("click",()=>{if(confirm("Permanently clear all MAI memories stored in this browser?")){memories=[];save(DB_KEY,memories);renderMemory();log("Cleared all local memories.")}});
$("pauseBtn").addEventListener("click",()=>{paused=!paused;$("pauseBtn").textContent=paused?"Resume agent":"Pause agent";$("agentStatus").textContent=paused?"Paused — no steps can be approved":"Ready when you are";$("statusDot").style.background=paused?"#ff9c9c":"var(--accent)";log(paused?"Agent paused by user.":"Agent resumed by user.")});
for(const k of Object.keys(defaults))$(k).addEventListener("change",()=>{settings[k]=$(k).checked;save(SETTINGS_KEY,settings);log(`${k} ${settings[k]?"enabled":"disabled"}.`)});
renderMemory();renderLogs();syncSettings();renderPlan();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
