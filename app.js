/* Minha Evolução 2.1 | Autenticação Supabase, sessão configurável e passkeys. */
'use strict';
const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
const KINDS = ['dose','measure','photo','workout','routine','prefs'];
const icons={
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 dose:'<path d="m18 2 4 4m-4-4-4 4m4-4-1 6M3 21l8-8m-4-4 8 8M7 17l-4 4m8-16 8 8m-9-2 3-3"/>',
 body:'<path d="M3 5h18v14H3zM7 5v5m4-5v3m4-3v5m4-5v3M7 19v-4m4 4v-3m4 3v-4m4 4v-3"/>',
 photos:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 workouts:'<path d="M6.5 6.5 17.5 17.5M4 9l5-5m6 16 5-5M2 7l5-5m10 20 5-5M2 10l8-8m4 20 8-8"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-1.9 1.9-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21h-3v-1.1a1.6 1.6 0 0 0-1.1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-1.9-1.9.1-.1a1.6 1.6 0 0 0 .3-1.8A1.6 1.6 0 0 0 6 14H5v-4h1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 1.9-1.9.1.1a1.6 1.6 0 0 0 1.8.3A1.6 1.6 0 0 0 12 4V3h3v1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 1.9 1.9-.1.1a1.6 1.6 0 0 0-.3 1.8A1.6 1.6 0 0 0 21 10h1v4h-1a1.6 1.6 0 0 0-1.6 1z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M12 20h9M16 4l4 4-12 12H4v-4z"/>',trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',weight:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 13a4 4 0 0 1 8 0M12 13l2-3"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',activity:'<path d="M2 12h4l3-8 5 16 3-8h5"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',download:'<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',upload:'<path d="M12 17V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',cloud:'<path d="M7 18h11a4 4 0 0 0 .8-7.9A7 7 0 0 0 5 12a3 3 0 0 0 2 6z"/>',check:'<path d="m4 12 5 5L20 6"/>',close:'<path d="M5 5l14 14M19 5 5 19"/>',camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.5 10A7 7 0 0 1 18.6 7M18.5 14a7 7 0 0 1-13.2 3"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
};
function ico(name,size=19){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.activity}</svg>`}
const nav=[['dashboard','Início','dashboard'],['doses','Medicação','dose'],['body','Medidas','body'],['photos','Fotos','photos'],['workouts','Treinos','workouts'],['settings','Ajustes','settings']];
const st={page:'dashboard',owner:'local',user:null,client:null,authMode:'login',showCloudForm:false,records:[],workoutView:'history',bodyMetric:'weight',compare:{a:'',b:'',angle:'frente'},photosFilter:'all',doseFilter:'all',syncing:false,urls:[],config:JSON.parse(localStorage.getItem('evolucao_cloud')||'null')};
const el={view:$('#view'),header:$('#topHeader'),dialog:$('#editor'),modal:$('#editorContent')};
const fmt=(n,d=1)=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeNum=v=>v===''||v===undefined||v===null?null:Number(v);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const localDate=d=>new Date(`${d}T12:00:00`);
const dateLabel=d=>d?localDate(d).toLocaleDateString('pt-BR'):'—';
const shortDate=d=>d?localDate(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—';
const diffDays=(a,b)=>Math.round((Date.UTC(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8,10))-Date.UTC(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8,10)))/86400000);
const addDays=(date,n)=>{const d=localDate(date);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const uuid=()=>crypto.randomUUID();
const sortByDate=a=>[...a].sort((x,y)=>(y.date+(y.data?.time||'')).localeCompare(x.date+(x.data?.time||'')));
const records=kind=>sortByDate(st.records.filter(r=>!r.deleted&&r.kind===kind));
const prefs=()=>records('prefs')[0]?.data||{goal:'',interval:7};
const tag=(s,cl='')=>`<span class="pill ${cl}">${escapeHTML(s)}</span>`;
let toastTimer;
function toast(message,isError=false){const t=$('#toast');t.textContent=message;t.className=`toast${isError?' error':''}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),4500)}
const DBNAME='minha-evolucao-db';let dbPromise;
function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const q=indexedDB.open(DBNAME,1);q.onupgradeneeded=()=>{q.result.createObjectStore('records',{keyPath:'pk'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});return dbPromise}
async function allStored(owner){const x=await db();return new Promise((resolve,reject)=>{const req=x.transaction('records','readonly').objectStore('records').getAll();req.onsuccess=()=>resolve(req.result.filter(v=>v.owner===owner).map(({pk,...v})=>v));req.onerror=()=>reject(req.error)})}
async function putStored(rec){const x=await db();return new Promise((resolve,reject)=>{const tx=x.transaction('records','readwrite');tx.objectStore('records').put({...rec,pk:`${rec.owner}:${rec.id}`});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function getStored(owner,id){const x=await db();return new Promise((resolve,reject)=>{const rq=x.transaction('records','readonly').objectStore('records').get(`${owner}:${id}`);rq.onsuccess=()=>resolve(rq.result);rq.onerror=()=>reject(rq.error)})}
async function loadOwner(owner){st.owner=owner;st.records=await allStored(owner);render()}
function getRec(id){return st.records.find(r=>r.id===id)}
function cleanImgUrls(){st.urls.forEach(u=>URL.revokeObjectURL(u));st.urls=[]}
function imgUrl(rec){if(!rec?.blob)return null;const u=URL.createObjectURL(rec.blob);st.urls.push(u);return u}
async function updateRecord(kind,date,data,old=null,blob=undefined){const now=new Date().toISOString();const rec={...(old||{}),id:old?.id||uuid(),owner:st.owner,kind,date,createdAt:old?.createdAt||now,updatedAt:now,dirty:true,deleted:false,data};if(blob!==undefined)rec.blob=blob;await putStored(rec);st.records=st.records.filter(r=>r.id!==rec.id).concat(rec);render();if(st.client&&st.user){try{await pushRecord(rec)}catch(err){toast('Registro salvo neste aparelho, mas ainda não sincronizado: '+err.message,true);render()}}else toast('Registro salvo no aparelho');return rec}
async function deleteRecord(id){const old=getRec(id);if(!old)return;if(!confirm(`Excluir este registro de ${dateLabel(old.date)}?`))return;const rec={...old,deleted:true,dirty:true,updatedAt:new Date().toISOString()};await putStored(rec);st.records=st.records.filter(r=>r.id!==id).concat(rec);render();if(st.client&&st.user){try{await pushRecord(rec)}catch(err){toast('Excluído neste aparelho; sincronização pendente',true)}}else toast('Registro excluído')}
function registerSW(){if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{})}
function cloudStatus(){const n=st.records.filter(r=>r.dirty).length;return st.user?`<span class="cloud-status ${n?'pending':'online'}"><span class="cloud-dot"></span>${n?`${n} pendente(s)`:'Nuvem conectada'}</span>`:`<span class="cloud-status"><span class="cloud-dot"></span>Armazenamento neste aparelho</span>`}
let supabaseLoad;
function loadSupabase(){if(window.supabase)return Promise.resolve();if(!supabaseLoad)supabaseLoad=new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';sc.async=true;const timer=setTimeout(()=>reject(Error('Não foi possível carregar a biblioteca online.')),10000);sc.onload=()=>{clearTimeout(timer);window.supabase?resolve():reject(Error('Biblioteca não disponível'))};sc.onerror=()=>{clearTimeout(timer);reject(Error('Sem conexão com a biblioteca online'))};document.head.append(sc)});return supabaseLoad}
// Supabase keeps its token only in the chosen browser storage; no password is kept by the app.
const REMEMBER_KEY='evolucao_remember';
const rememberSession=()=>localStorage.getItem(REMEMBER_KEY)!=='0';
const authStorage={
 getItem:key=>(rememberSession()?localStorage:sessionStorage).getItem(key),
 setItem:(key,value)=>{const target=rememberSession()?localStorage:sessionStorage;const other=rememberSession()?sessionStorage:localStorage;target.setItem(key,value);other.removeItem(key)},
 removeItem:key=>{localStorage.removeItem(key);sessionStorage.removeItem(key)}
};
function newCloudClient(url,key){
 return window.supabase.createClient(url,key,{
  auth:{storage:authStorage,persistSession:true,autoRefreshToken:true,experimental:{passkey:true}}
 });
}
function showAuthMessage(message,error=false){const box=$('#authMessage');if(box){box.hidden=false;box.textContent=message;box.className=`auth-message ${error?'bad':'good'}`;}else toast(message,error)}
function canUsePasskey(){return !!(window.isSecureContext&&window.PublicKeyCredential&&st.client?.auth?.signInWithPasskey)}
function renderAuthGate(){
 document.body.classList.remove('unlocked');document.body.classList.add('locked');
 const gate=$('#authGate');gate.hidden=false;
 gate.innerHTML=`<div class="auth-shell"><section class="auth-story">
  <div class="auth-story-brand"><img src="icon-192.png" alt=""><div><strong>Minha Evolução</strong><span>SEU ESPAÇO DE SAÚDE</span></div></div>
  <div class="auth-story-main"><span class="auth-tag">UMA EVOLUÇÃO DE CADA VEZ</span><h1>Seu progresso merece um lugar só seu.</h1><p>Acompanhe suas aplicações, medidas, fotos e treinos com privacidade e tranquilidade.</p>
  <div class="auth-story-pills"><span>${ico('dose',17)} Medicação</span><span>${ico('body',17)} Medidas</span><span>${ico('workouts',17)} Treinos</span></div></div>
  <div class="auth-story-footer">Organizado. Privado. No seu ritmo.</div>
 </section><section class="auth-panel"><div class="auth-panel-inner">
  <div class="auth-mobile-logo"><img src="icon-192.png" alt=""><div><strong>Minha Evolução</strong><small>Seu histórico em um só lugar</small></div></div>
  <div class="auth-kicker"><span class="auth-kicker-dot"></span> ÁREA PESSOAL</div>
  <h2>${st.authMode==='signup'?'Crie sua conta':'Bem-vindo de volta'}</h2>
  <p class="auth-sub">${st.authMode==='signup'?'Cadastre-se para proteger e sincronizar sua evolução.':'Entre para acessar seus registros com segurança.'}</p>
  <div class="auth-switch"><button type="button" data-authmode="login" class="${st.authMode==='login'?'selected':''}">Entrar</button><button type="button" data-authmode="signup" class="${st.authMode==='signup'?'selected':''}">Criar conta</button></div>
  <form id="entryAuthForm" class="auth-form">
   <label for="entryEmail">E-mail</label><div class="auth-input">${ico('cloud',19)}<input id="entryEmail" name="email" type="email" inputmode="email" autocapitalize="off" autocomplete="username webauthn" placeholder="seuemail@exemplo.com" required></div>
   <label for="entryPassword">Senha</label><div class="auth-input">${ico('shield',19)}<input id="entryPassword" name="password" type="password" autocomplete="${st.authMode==='signup'?'new-password':'current-password'}" placeholder="Digite sua senha" minlength="6" required><button type="button" class="auth-eye" data-action="togglePassword" aria-label="Mostrar ou ocultar senha">${ico('activity',17)}</button></div>
   <label class="auth-remember"><input name="remember" type="checkbox" ${rememberSession()?'checked':''}><span><strong>Manter conectado neste aparelho</strong><small>Salva apenas a sessão, nunca a sua senha.</small></span></label>
   <button type="submit" class="auth-primary" ${!st.client?'disabled':''}>${st.authMode==='signup'?'Criar minha conta':'Entrar na minha conta'} ${ico('arrow',18)}</button>
  </form>
  <div class="auth-separator"><span>ou</span></div>
  <button class="auth-face" type="button" data-action="passkeyLogin" ${!canUsePasskey()?'disabled':''}>${ico('shield',19)} Entrar com Face ID / passkey</button>
  <p class="auth-passkey-hint">Primeiro cadastre uma passkey em Ajustes após entrar com senha. No iPhone, você poderá confirmar com Face ID.</p>
  <p id="authMessage" class="auth-message" hidden aria-live="polite"></p>
  <div class="auth-config">
    <button type="button" data-action="toggleCloudSetup" class="auth-config-toggle">${ico('settings',16)} ${st.config?'Configurações do Supabase':'Primeiro acesso? Conecte seu Supabase'} ${ico('arrow',14)}</button>
    ${!st.client?'<p class="auth-setup-warning">Conecte seu projeto Supabase para ativar o acesso.</p>':''}
    ${st.showCloudForm?`<form id="entryCloudConfigForm" class="auth-cloud-form"><label>Project URL</label><input name="url" type="url" required placeholder="https://projeto.supabase.co" value="${escapeHTML(st.config?.url||'')}"><label>Publishable key (chave pública)</label><input name="key" type="text" required spellcheck="false" autocomplete="off" placeholder="sb_publishable_..." value="${escapeHTML(st.config?.key||'')}"><button type="submit" class="auth-primary small">Salvar conexão</button><small>Não informe a senha do banco ou uma chave secreta.</small></form>`:''}
  </div>
  <p class="auth-bottom-note">${ico('shield',14)} Seus registros só aparecem após a autenticação.</p>
 </div></section></div>`;
}
function showApp(){document.body.classList.remove('locked');document.body.classList.add('unlocked');$('#authGate').hidden=true}
async function onAuthenticated(user){if(!user?.id)throw Error('Não foi possível validar esta conta.');st.user=user;showApp();await loadOwner(user.id);await syncAll();}
async function setupCloud(){
 if(!st.config?.url||!st.config?.key)return;
 try{
  await loadSupabase();st.client=newCloudClient(st.config.url,st.config.key);
  const {data:sessionData,error:sErr}=await st.client.auth.getSession();if(sErr)throw sErr;
  if(sessionData.session?.user){const {data,error}=await st.client.auth.getUser();if(error)throw error;if(data?.user){await onAuthenticated(data.user);}}
  st.client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'&&st.user){st.user=null;st.records=[];render();}});
 }catch(err){showAuthMessage('Não foi possível conectar ao Supabase: '+err.message,true);}
}

async function pushRecord(rec){if(!st.client||!st.user)return;const owner=st.user.id;if(rec.kind==='photo'&&!rec.deleted&&rec.blob&&!rec.data.remotePath){const path=`${owner}/${rec.id}.jpg`;const {error}=await st.client.storage.from('evolution_photos').upload(path,rec.blob,{upsert:true,contentType:'image/jpeg'});if(error)throw error;rec.data.remotePath=path;await putStored(rec)}
 const {error}=await st.client.from('evolution_records').upsert({id:rec.id,user_id:owner,kind:rec.kind,occurred_on:rec.date,payload:{...rec.data,deleted:!!rec.deleted},updated_at:rec.updatedAt},{onConflict:'id'});if(error)throw error;
 rec.dirty=false;await putStored(rec);
 if(rec.kind==='photo'&&rec.deleted&&rec.data.remotePath){await st.client.storage.from('evolution_photos').remove([rec.data.remotePath]).catch(()=>{})}
}
async function syncAll(){if(!st.client||!st.user||st.syncing)return;st.syncing=true;render();let fail=0;try{
 const remote=[];for(let from=0;from<10000;from+=500){const {data,error}=await st.client.from('evolution_records').select('*').eq('user_id',st.user.id).order('updated_at',{ascending:false}).range(from,from+499);if(error)throw error;remote.push(...(data||[]));if(!data||data.length<500)break}
 const local=new Map(st.records.map(r=>[r.id,r]));for(const row of remote){const old=local.get(row.id);if(old?.dirty)continue;if(old&&old.updatedAt>row.updated_at)continue;const rec={id:row.id,owner:st.user.id,kind:row.kind,date:row.occurred_on,createdAt:old?.createdAt||row.updated_at,updatedAt:row.updated_at,data:{...(row.payload||{})},deleted:!!row.payload?.deleted,dirty:false};delete rec.data.deleted;if(old?.blob)rec.blob=old.blob;await putStored(rec);local.set(rec.id,rec)}
 for(const rec of local.values())if(rec.dirty){try{await pushRecord(rec)}catch(err){fail++;console.warn('Sync failed',err)}}
 st.records=[...local.values()];if(fail)toast(`${fail} registro(s) aguardam sincronização. Confira a internet e a configuração da nuvem.`,true);else toast('Sincronização concluída');
 }catch(err){toast('Falha ao sincronizar: '+err.message,true)}finally{st.syncing=false;render()}}
async function retrievePhoto(id){const rec=getRec(id);if(!rec?.data.remotePath||!st.client||!st.user)return;try{const {data,error}=await st.client.storage.from('evolution_photos').download(rec.data.remotePath);if(error)throw error;rec.blob=data;await putStored(rec);render();toast('Foto carregada com segurança')}catch(err){toast('Não foi possível carregar a foto: '+err.message,true)}}
function renderNav(){
 const btn=(v,alias=false)=>`<button type="button" data-page="${v[0]}" class="${st.page===v[0]||(alias&&v[0]==='body'&&st.page==='photos')?'active':''}" aria-label="${v[1]}">${ico(v[2])}<span>${v[1]}</span></button>`;
 $('#desktopNav').innerHTML=nav.map(v=>btn(v)).join('');
 $('#bottomNav').innerHTML=[['dashboard','Início','dashboard'],['doses','Mounjaro','dose'],['body','Evolução','body'],['workouts','Treinos','workouts'],['settings','Mais','settings']].map(v=>btn(v,true)).join('');
 $('#sideCloud').innerHTML=cloudStatus();
}
function mobileSegments(){return `<div class="mobile-segments" role="navigation" aria-label="Áreas da evolução"><button data-page="body" class="${st.page==='body'?'active':''}">Medidas</button><button data-page="photos" class="${st.page==='photos'?'active':''}">Fotos</button><button data-page="workouts">Treinos</button></div>`}

function render(){
 cleanImgUrls();if(!st.user){el.view.innerHTML='';el.header.innerHTML='';$('#desktopNav').innerHTML='';$('#bottomNav').innerHTML='';renderAuthGate();return;}showApp();renderNav();let title,desc,action='';
 switch(st.page){
 case 'dashboard':title='Minha Evolução';desc='O seu progresso merece ser acompanhado.';break;
 case 'doses':title='Mounjaro';desc='Aplicações, datas e histórico de doses.';action=addButton('Nova aplicação','dose');break;
 case 'body':title='Evolução corporal';desc='Seu peso e suas medidas em perspectiva.';action=addButton('Nova medição','measure');break;
 case 'photos':title='Suas fotos';desc='Compare sua evolução com fotos antigas.';action=addButton('Adicionar fotos','photo');break;
 case 'workouts':title='Meus treinos';desc='Fichas, exercícios e sessões.';action=addButton('Novo treino','workout');break;
 default:title='Configurações';desc='Personalize sua experiência e seus dados.';
 }
 const date=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 el.header.innerHTML=`<div><span class="eyebrow">${st.page==='dashboard'?'SEU PAINEL DE SAÚDE':'MINHA EVOLUÇÃO'}</span><h1>${title}</h1><p class="sub">${desc}</p></div><div class="top-actions"><span class="header-date">${escapeHTML(date)}</span>${action||''}<button class="top-avatar" title="Configurações" aria-label="Abrir configurações" data-page="settings">${ico('settings')}</button></div>`;
 const content={dashboard:renderDashboard,doses:renderDoses,body:renderBody,photos:renderPhotos,workouts:renderWorkouts,settings:renderSettings}[st.page];el.view.innerHTML=content();
}

function addButton(text,kind){return `<button class="button" data-add="${kind}">${ico('plus')}<span>${escapeHTML(text)}</span></button>`}
function empty(iconName,title,desc){return `<div class="empty">${ico(iconName,29)}<strong>${title}</strong><p>${desc}</p></div>`}
function section(title,subtitle,action=''){return `<div class="section-heading"><div><h2>${title}</h2>${subtitle?`<p class="sub">${subtitle}</p>`:''}</div>${action}</div>`}
function statCard(name,num,note,iconName){return `<div class="card stat"><div class="stat-head"><span>${name}</span><div class="icon-bubble">${ico(iconName)}</div></div><div><div class="stat-value">${num}</div><p class="stat-note">${note}</p></div></div>`}
function lastDose(){return records('dose')[0]}
function dosageNext(){const last=lastDose();const days=Number(prefs().interval)||7;return last?{date:addDays(last.date,days),delta:diffDays(today(),addDays(last.date,days))}:null}
function weightChanges(){const ms=records('measure').filter(r=>r.data.weight!=null);if(!ms.length)return null;const latest=ms[0],oldest=ms[ms.length-1];return{current:latest.data.weight,first:oldest.data.weight,diff:latest.data.weight-oldest.data.weight}}
function renderDashboard(){
 const ds=records('dose'),ms=records('measure'),photos=records('photo'),workouts=records('workout'),routines=records('routine');
 const w=weightChanges(),next=dosageNext(),goal=Number(prefs().goal)||null,last=lastDose();
 const last30=workouts.filter(r=>diffDays(r.date,today())<=30&&diffDays(r.date,today())>=0).length;
 const weekCount=workouts.filter(r=>diffDays(r.date,today())>=0&&diffDays(r.date,today())<7).length;
 const photo2=photos.slice(0,2);
 const photoCards=photo2.map(r=>{const u=imgUrl(r);return `<div class="photo-preview">${u?`<img src="${u}" alt="Foto da evolução em ${dateLabel(r.date)}" loading="lazy">`:ico('camera')}</div>`}).join('');
 return `<div class="hero"><div class="hero-copy"><div class="hero-kicker">UM DIA DE CADA VEZ</div><h2>Seu progresso tem uma história.</h2><p>Acompanhe cada aplicação, medida, foto e treino em um só lugar.</p><button class="button hero-action" data-add="measure">${ico('plus',15)} Registrar evolução</button></div><div class="hero-art"><img src="icon-192.png" alt=""></div></div>
 <div class="overview-grid">
 <div class="card overview"><div class="metric-title">Peso atual ${ico('weight',19)}</div><div><div class="metric-value">${w?`${fmt(w.current)} <small style="font-size:.56em">kg</small>`:'—'}</div><div class="metric-foot ${w&&w.diff<0?'positive':''}">${w&&w.diff!==0?`${w.diff<0?'↓':'↑'} ${fmt(Math.abs(w.diff))} kg no histórico`:'Registre seu primeiro peso'}</div></div></div>
 <div class="card overview"><div class="metric-title">Sua meta ${ico('body',19)}</div><div><div class="metric-value">${goal?`${fmt(goal)} <small style="font-size:.56em">kg</small>`:'—'}</div><div class="metric-foot">${goal&&w?`${fmt(Math.abs(w.current-goal))} kg até a meta`:'Defina em Configurações'}</div></div></div>
 <div class="card overview"><div class="metric-title">Treinos (7 dias) ${ico('workouts',19)}</div><div><div class="metric-value">${weekCount}</div><div class="metric-foot">${last30} nos últimos 30 dias</div></div></div>
 </div>
 ${section('Acompanhamento','Seus registros mais importantes','<button class="accent-link" data-page="doses">Ver aplicações '+ico('arrow')+'</button>')}
 <div class="home-two-col">
 <div class="card med-highlight"><div class="med-top"><div class="med-title"><div class="icon-bubble">${ico('dose',23)}</div><span>Mounjaro</span></div><span class="pill green">${last?'Acompanhamento ativo':'Sem registros'}</span></div><div class="med-values"><div><div class="hint">Última dose registrada</div><strong>${last?`${fmt(last.data.mg,2)} mg`:'—'}</strong><p class="sub">${last?dateLabel(last.date):'Nenhuma aplicação cadastrada'}</p></div><div><div class="hint">Próxima data de referência</div><strong>${next?dateLabel(next.date):'—'}</strong><p class="sub">${next?(next.delta<0?'Referência passada':next.delta===0?'Hoje':`Daqui a ${next.delta} dia(s)`):'Conforme intervalo configurado'}</p></div></div><div class="med-actions"><button class="button" data-add="dose">${ico('plus',16)} Registrar aplicação</button></div></div>
 <div class="card"><div class="metric-head"><strong>Evolução do peso</strong><button class="accent-link" data-page="body">Detalhes ${ico('arrow')}</button></div><p class="sub">Gráfico das suas medições</p><div class="inline-chart">${weightChart(ms,'weight')}</div></div>
 </div>
 ${section('Acesso rápido','Tudo ao alcance de um toque')}
 <div class="quick-grid four"><button class="quick-square" data-add="dose"><span class="icon-bubble">${ico('dose')}</span><span>Mounjaro</span></button><button class="quick-square" data-add="measure"><span class="icon-bubble">${ico('body')}</span><span>Medidas</span></button><button class="quick-square" data-page="photos"><span class="icon-bubble">${ico('camera')}</span><span>Fotos</span></button><button class="quick-square" data-page="workouts"><span class="icon-bubble">${ico('workouts')}</span><span>Treinos</span></button></div>
 <div class="home-two-col" style="margin-top:22px">
 <div><div class="tool-row" style="margin-bottom:12px"><h2>Atividades recentes</h2><button class="accent-link" data-page="doses">Histórico ${ico('arrow')}</button></div>${renderRecent()}</div>
 <div><div class="tool-row" style="margin-bottom:12px"><h2>Diário visual</h2><button class="accent-link" data-page="photos">Ver fotos ${ico('arrow')}</button></div><div class="card"><p class="sub">Fotos semanais, inclusive as antigas.</p><div class="photo-preview-grid">${photoCards}${photo2.length<2?Array.from({length:2-photo2.length},()=>`<div class="photo-preview">${ico('camera',27)}</div>`).join(''):''}</div><div style="margin-top:14px"><button class="button secondary" style="width:100%" data-add="photo">${ico('plus')} Adicionar fotos</button></div></div></div>
 </div><p class="clinical-caption">A data da próxima aplicação é uma referência pessoal, não uma recomendação de dose ou intervalo.</p>`;
}

function renderRecent(){const arr=sortByDate(st.records.filter(r=>!r.deleted&&['dose','measure','photo','workout'].includes(r.kind))).slice(0,5);return arr.length?`<div class="timeline">${arr.map(entryHTML).join('')}</div>`:empty('activity','Seu histórico começa aqui','Registre uma aplicação, medição, foto ou treino para visualizar a linha do tempo.')}
function entryHTML(r){const d=r.data||{};let title='',details='',iconName='activity';if(r.kind==='dose'){title=`Aplicação de ${fmt(d.mg,2)} mg`;details=[d.site,d.symptoms].filter(Boolean).join(' · ');iconName='dose'}else if(r.kind==='measure'){title=`Medição corporal`;details=[d.weight!=null?`${fmt(d.weight)} kg`:'',d.waist!=null?`Cintura ${fmt(d.waist)} cm`:''].filter(Boolean).join(' · ');iconName='body'}else if(r.kind==='workout'){title=d.name||'Treino realizado';details=[d.duration?`${d.duration} min`:'',d.cardio?`Cardio ${d.cardio} min`:'',d.exercises?.length?`${d.exercises.length} exercício(s)`:''].filter(Boolean).join(' · ');iconName='workouts'}else if(r.kind==='photo'){title=`Foto · ${positionName(d.angle)}`;details=d.note||'Fotografia de acompanhamento';iconName='photos'}else{title=d.name||'Ficha';details=(d.days||[]).map(dayName).join(', ');iconName='workouts'}
 return `<div class="entry"><div class="entry-main"><div class="circle-icon">${ico(iconName)}</div><div style="min-width:0"><strong>${escapeHTML(title)}</strong><div class="muted">${dateLabel(r.date)} ${d.time?'· '+escapeHTML(d.time):''}</div>${details?`<div class="summary">${escapeHTML(details)}</div>`:''}</div></div><div class="entry-actions"><button class="iconbtn" title="Editar" data-edit="${r.id}">${ico('edit')}</button><button class="iconbtn" title="Excluir" data-delete="${r.id}">${ico('trash')}</button></div></div>`}
function renderDoses(){const ds=records('dose').filter(r=>st.doseFilter==='all'||r.data.mg===Number(st.doseFilter));const unique=[...new Set(records('dose').map(r=>Number(r.data.mg)))].sort((a,b)=>a-b);const next=dosageNext();const last=lastDose();return `<div class="dose-head"><div><div class="eyebrow">HISTÓRICO DE MEDICAÇÃO</div><h2>Seu controle de aplicações</h2><p>Registre a dose real, a data, o local e os efeitos percebidos. Consulte tudo depois.</p></div><div class="dose-head-mark">${ico('dose',56)}</div></div><div class="stat-grid">
 ${statCard('Total de aplicações',records('dose').length,'Registros salvos','dose')}
 ${statCard('Dose mais recente',last?fmt(last.data.mg,2)+' mg':'—',last?dateLabel(last.date):'Sem histórico','activity')}
 ${statCard('Intervalo de referência',`${prefs().interval||7} dias`,'Você altera em Ajustes','calendar')}
 ${statCard('Próxima data',next?dateLabel(next.date):'—','Referência informativa','clock')}
 </div>${section('Histórico de aplicações','Inclua datas anteriores e registre o que realmente utilizou')}
 <div class="tool-row" style="margin-bottom:12px"><div class="filters"><button class="filter ${st.doseFilter==='all'?'active':''}" data-dosefilter="all">Todas</button>${unique.map(x=>`<button class="filter ${st.doseFilter===String(x)?'active':''}" data-dosefilter="${x}">${fmt(x,2)} mg</button>`).join('')}</div></div>
 ${ds.length?`<div class="timeline">${ds.map(entryHTML).join('')}</div>`:empty('dose','Nenhuma aplicação cadastrada','Toque em “Nova aplicação” para registrar sua dose e a data real.')}
 ${section('Sobre seu controle')}
 <div class="note">Registre apenas as doses efetivamente usadas, em mg, conforme o rótulo/prescrição. O app não converte unidades de seringa em mg nem sugere ajustes de dose. Efeitos e sintomas ficam anotados para consulta pessoal.</div>`}
function metricList(){return [['weight','Peso','kg'],['waist','Cintura','cm'],['abdomen','Abdômen','cm'],['hip','Quadril','cm'],['chest','Peito','cm'],['arm','Braço','cm'],['thigh','Coxa','cm'],['neck','Pescoço','cm']]}
function weightChart(ms,metric){const arr=sortByDate(ms).reverse().filter(r=>r.data?.[metric]!=null).map(r=>({date:r.date,y:Number(r.data[metric])}));if(!arr.length)return `<div class="chart-area">${empty('weight','Sem dados para o gráfico','Adicione uma medida para começar.')}</div>`;const W=640,H=238,L=52,R=17,T=20,B=38;let min=Math.min(...arr.map(x=>x.y)),max=Math.max(...arr.map(x=>x.y));if(min===max){min-=2;max+=2}else{const pad=(max-min)*.18;min-=pad;max+=pad}const x=i=>L+(arr.length===1?(W-L-R)/2:i*(W-L-R)/(arr.length-1));const y=v=>T+(max-v)*(H-T-B)/(max-min);const pts=arr.map((p,i)=>`${x(i)},${y(p.y)}`).join(' ');let svg='';for(let i=0;i<4;i++){const val=min+(max-min)*i/3,Y=y(val);svg+=`<path d="M${L} ${Y} H${W-R}" stroke="#e4f0e7" stroke-dasharray="4 5"/><text x="${L-9}" y="${Y+4}" fill="#809687" font-size="12" text-anchor="end">${fmt(val,1)}</text>`}svg+=`<polyline points="${pts}" fill="none" stroke="#008b47" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;for(let i=0;i<arr.length;i++){if(i===0||i===arr.length-1||arr.length<=8){svg+=`<circle cx="${x(i)}" cy="${y(arr[i].y)}" r="4.4" fill="#fff" stroke="#008b47" stroke-width="2.5"/>`}}for(const i of [...new Set([0,Math.floor((arr.length-1)/2),arr.length-1])])svg+=`<text x="${x(i)}" y="${H-9}" fill="#809687" font-size="12" text-anchor="middle">${shortDate(arr[i].date)}</text>`;return `<div class="chart-area"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de evolução de ${metric}, com ${arr.length} medições">${svg}</svg></div>`}
function renderBody(){const ms=records('measure'),w=weightChanges(),p=ms[0]?.data||{},goal=safeNum(prefs().goal);const active=metricList().find(m=>m[0]===st.bodyMetric)||metricList()[0];return `${mobileSegments()}<div class="stat-grid">
 ${statCard('Peso atual',p.weight!=null?fmt(p.weight)+' kg':'—',ms[0]?dateLabel(ms[0].date):'Sem medição','weight')}
 ${statCard('Evolução do peso',w&&w.diff!==0?(w.diff>0?'+':'')+fmt(w.diff)+' kg':w?'0,0 kg':'—','Entre o 1º e o último registros','activity')}
 ${statCard('Meta pessoal',goal?fmt(goal)+' kg':'—',goal&&p.weight!=null?`Diferença: ${fmt(Math.abs(p.weight-goal))} kg`:'Defina em Ajustes','body')}
 ${statCard('Registros de medidas',ms.length,'Histórico por data','calendar')}
 </div>${section('Evolução das medidas','Selecione uma métrica para analisar')}
 <div class="card"><div class="filters">${metricList().map(([key,label])=>`<button class="filter ${st.bodyMetric===key?'active':''}" data-metric="${key}">${label}</button>`).join('')}</div><div style="margin-top:14px"><h3>${active[1]} (${active[2]})</h3><p class="sub">Evolução registrada ao longo do tempo</p>${weightChart(ms,active[0])}</div></div>
 ${section('Medições cadastradas','Você pode registrar semanas e meses anteriores')}
 ${ms.length?`<div class="timeline">${ms.map(r=>`<div class="card"><div class="tool-row"><div><strong>${dateLabel(r.date)}</strong><div class="meta-row">${metricList().filter(([key])=>r.data[key]!=null).map(([key,label,unit])=>tag(`${label}: ${fmt(r.data[key])} ${unit}`)).join('')}</div>${r.data.note?`<p class="summary" style="margin-top:9px">${escapeHTML(r.data.note)}</p>`:''}</div><div class="entry-actions"><button class="iconbtn" data-edit="${r.id}" title="Editar">${ico('edit')}</button><button class="iconbtn" data-delete="${r.id}" title="Excluir">${ico('trash')}</button></div></div></div>`).join('')}</div>`:empty('body','Nenhuma medida ainda','Registre seu peso e qualquer medida que queira acompanhar.')}`}
function positionName(x){return({'frente':'Frente','costas':'Costas','lado':'Lateral','livre':'Outro ângulo'})[x]||'Foto'}
function uniqueDates(arr){return [...new Set(arr.map(x=>x.date))].sort()}
function photoPanel(date,angle){const r=records('photo').find(p=>p.date===date&&p.data.angle===angle);if(!r)return `<div class="compare-slot"><div class="photo-placeholder">Sem foto para essa data e ângulo</div><div class="label">${dateLabel(date)}</div></div>`;const url=imgUrl(r);return `<div class="compare-slot">${url?`<img src="${url}" alt="${positionName(angle)} em ${dateLabel(date)}">`:`<div class="photo-placeholder"><button class="button small secondary" data-loadphoto="${r.id}">Carregar foto da nuvem</button></div>`}<div class="label">${dateLabel(date)}</div></div>`}
function renderPhotos(){let photos=records('photo'),dates=uniqueDates(photos);if(!st.compare.a||!dates.includes(st.compare.a))st.compare.a=dates.at(-1)||'';if(!st.compare.b||!dates.includes(st.compare.b))st.compare.b=dates[0]||'';const byAngle=photos.filter(p=>st.photosFilter==='all'||p.data.angle===st.photosFilter);const optionDate=dates.map(d=>`<option value="${d}">${dateLabel(d)}</option>`).join('');return `${mobileSegments()}<div class="feature-banner"><div><div class="eyebrow">DIÁRIO VISUAL</div><h2>Seu progresso também é visual</h2><p>Você pode enviar fotos antigas e organizá-las pela data em que foram tiradas.</p></div>${addButton('Adicionar fotos','photo')}</div>
 ${section('Compare duas datas','Escolha datas e o mesmo ângulo para comparar')}
 <div class="card"><div class="compare-controls"><div class="field"><label for="compareA">Foto anterior</label><select id="compareA" data-compare="a">${optionDate}</select></div><div class="field"><label for="compareB">Foto posterior</label><select id="compareB" data-compare="b">${optionDate}</select></div><div class="field"><label for="compareAngle">Ângulo</label><select id="compareAngle" data-compare="angle">${['frente','costas','lado','livre'].map(x=>`<option value="${x}">${positionName(x)}</option>`).join('')}</select></div></div>${photos.length?`<div class="compare-grid">${photoPanel(st.compare.a,st.compare.angle)}${photoPanel(st.compare.b,st.compare.angle)}</div>`:empty('photos','Adicione a primeira foto','Selecione uma data passada ou atual no cadastro.')}<p class="input-help">As fotos são privadas. Só são enviadas à nuvem se você ativar a conta e a sincronização.</p></div>
 ${section('Galeria de evolução',`${photos.length} foto(s) registrada(s)`)}
 <div class="filters" style="margin-bottom:12px">${[['all','Todos'],['frente','Frente'],['costas','Costas'],['lado','Lateral'],['livre','Outros']].map(([v,t])=>`<button class="filter ${st.photosFilter===v?'active':''}" data-photofilter="${v}">${t}</button>`).join('')}</div>
 ${byAngle.length?`<div class="photo-grid">${byAngle.map(r=>{const u=imgUrl(r);return `<div class="photo-tile">${u?`<img src="${u}" alt="Foto corporal ${positionName(r.data.angle)} de ${dateLabel(r.date)}" loading="lazy">`:`<div class="photo-placeholder"><button class="button small secondary" data-loadphoto="${r.id}">Carregar foto</button></div>`}<div class="info"><strong>${dateLabel(r.date)}</strong><p class="sub">${positionName(r.data.angle)}</p>${r.data.note?`<p class="sub" style="margin-top:5px">${escapeHTML(r.data.note)}</p>`:''}<div class="actions"><button class="button small secondary" data-edit="${r.id}">Editar</button><button class="button small danger" data-delete="${r.id}">Excluir</button></div></div></div>`}).join('')}</div>`:empty('camera','Nenhuma foto nesta categoria','Escolha outro ângulo ou adicione fotos antigas.')}`}
function dayName(x){return ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][Number(x)]||x}
function renderWorkouts(){const ws=records('workout'),rs=records('routine');const v=st.workoutView;return `<div class="stat-grid">${statCard('Treinos registrados',ws.length,'Todas as datas','workouts')}${statCard('Último treino',ws[0]?dateLabel(ws[0].date):'—',ws[0]?escapeHTML(ws[0].data.name||'Treino'):'Sem sessões','calendar')}${statCard('Tempo total',`${ws.reduce((s,r)=>s+(Number(r.data.duration)||0),0)} min`,'Nas sessões cadastradas','clock')}${statCard('Fichas salvas',rs.length,'Modelos reutilizáveis','body')}</div>
 ${section('Organização dos treinos','Crie fichas com exercícios ou registre sessões realizadas')}
 <div class="tool-row" style="margin-bottom:13px"><div class="filters"><button class="filter ${v==='history'?'active':''}" data-workoutview="history">Histórico</button><button class="filter ${v==='routines'?'active':''}" data-workoutview="routines">Minhas fichas</button></div>${v==='routines'?addButton('Nova ficha','routine'):addButton('Registrar treino','workout')}</div>
 ${v==='history'?(ws.length?`<div class="timeline">${ws.map(r=>`<div class="card"><div class="tool-row"><div><h3>${escapeHTML(r.data.name||'Treino')}</h3><p class="sub">${dateLabel(r.date)} · ${r.data.duration||0} min ${r.data.cardio?`· ${r.data.cardio} min de cardio`:''}</p></div><div class="entry-actions"><button class="iconbtn" data-edit="${r.id}" title="Editar">${ico('edit')}</button><button class="iconbtn" data-delete="${r.id}" title="Excluir">${ico('trash')}</button></div></div>${renderExerciseList(r.data.exercises)}${r.data.note?`<p class="sub" style="margin-top:12px">${escapeHTML(r.data.note)}</p>`:''}</div>`).join('')}</div>`:empty('workouts','Nenhum treino ainda','Registre a data, os exercícios, séries e cargas de cada treino.')):(rs.length?`<div class="timeline">${rs.map(r=>`<div class="card"><div class="tool-row"><div><h3>${escapeHTML(r.data.name)}</h3><div class="meta-row">${(r.data.days||[]).map(x=>tag(dayName(x),'grey')).join('')||tag('Sem dia fixo','grey')}</div></div><div class="entry-actions"><button class="iconbtn" data-edit="${r.id}" title="Editar ficha">${ico('edit')}</button><button class="iconbtn" data-delete="${r.id}" title="Excluir ficha">${ico('trash')}</button></div></div>${renderExerciseList(r.data.exercises)}<div style="margin-top:15px"><button class="button small ghost" data-startroutine="${r.id}">${ico('plus',14)} Registrar treino com esta ficha</button></div></div>`).join('')}</div>`:empty('workouts','Crie sua primeira ficha','Monte exercícios, séries e repetições e use a ficha quantas vezes quiser.'))}`}
function renderExerciseList(ex){if(!ex?.length)return `<p class="sub" style="margin-top:11px">Nenhum exercício detalhado</p>`;return `<div class="split-list" style="margin-top:12px">${ex.map(e=>`<div class="kv"><span>${escapeHTML(e.name||'Exercício')}</span><strong>${escapeHTML(String(e.sets||'—'))} × ${escapeHTML(String(e.reps||'—'))}${e.kg?` · ${escapeHTML(e.kg)} kg`:''}</strong></div>`).join('')}</div>`}
function renderSettings(){const p=prefs(),cloud=st.config;return `<div class="settings-intro"><h2>Do seu jeito.</h2><p>Seu histórico, suas metas e seus backups organizados em um único lugar.</p></div><div class="settings-grid"><div class="card"><h2>Metas e referências</h2><p class="sub" style="margin:5px 0 18px">Configure sem alterar registros antigos.</p><form id="prefsForm" class="stack"><div class="field"><label>Meta pessoal de peso (kg)</label><input name="goal" type="number" step="0.1" min="1" max="600" value="${escapeHTML(p.goal??'')}" placeholder="Ex.: 80"></div><div class="field"><label>Intervalo de referência entre aplicações (dias)</label><input name="interval" type="number" min="1" max="365" required value="${escapeHTML(p.interval||7)}"><small>O app calcula uma referência a partir da última aplicação, sem sugerir mudanças no tratamento.</small></div><button class="button" type="submit">Salvar preferências</button></form></div>
 <div class="card"><h2>Seu histórico e backup</h2><p class="sub" style="margin:5px 0 18px">Proteja suas anotações e suas fotos.</p><div class="stack"><button class="button secondary" data-action="export">${ico('download')} Exportar backup completo (.json)</button><button class="button secondary" data-action="import">${ico('upload')} Importar backup anterior</button><div class="note warning">O backup pode conter fotos e informações pessoais sensíveis. Guarde o arquivo em local privado. Excluir os dados do navegador pode apagar itens ainda não sincronizados.</div></div></div>
 <div class="card span"><div class="tool-row"><div><h2>Nuvem e acesso em outros dispositivos</h2><p class="sub" style="margin:5px 0 0">Login pelo Supabase e fotos em armazenamento privado.</p></div>${cloudStatus()}</div><div class="hairline"></div>
 ${st.user?`<div class="tool-row"><div><strong>${escapeHTML(st.user.email||'Conta conectada')}</strong><p class="sub">Sincronização com sua conta do Supabase.</p></div><div class="filters"><button class="button secondary small" data-action="sync">${ico('refresh',14)} Sincronizar</button><button class="button small danger" data-action="logout">Sair</button></div></div><div class="hairline"></div><div class="tool-row"><div><strong>Registros salvos só neste aparelho</strong><p class="sub">Você pode copiar seu histórico local para a conta atual.</p></div><button class="button ghost small" data-action="migrate">Copiar dados locais para a nuvem</button></div>`:
 `<p class="sub" style="margin-bottom:14px">Se você já tem um projeto Supabase dos outros aplicativos, use o mesmo projeto, com as tabelas e políticas SQL fornecidas no pacote. Não use a chave secreta (service_role).</p><form class="form-grid" id="cloudConfigForm"><div class="field"><label>URL do projeto Supabase</label><input name="url" type="url" autocomplete="url" placeholder="https://projeto.supabase.co" value="${escapeHTML(cloud?.url||'')}"></div><div class="field"><label>Chave pública / anon (publishable)</label><input name="key" type="text" autocomplete="off" placeholder="sb_publishable_... ou eyJ..." value="${escapeHTML(cloud?.key||'')}"></div><div class="wide"><button class="button secondary" type="submit">Salvar conexão de nuvem</button></div></form>
 ${st.client?`<div class="hairline"></div><form id="authForm" class="form-grid"><div class="field"><label>E-mail</label><input name="email" type="email" autocomplete="username" required></div><div class="field"><label>Senha</label><input name="password" type="password" autocomplete="current-password" minlength="6" required></div><div class="wide filters"><button type="submit" name="mode" value="login" class="button">Entrar</button><button type="submit" name="mode" value="signup" class="button secondary">Criar conta</button></div></form>`:''}`}
 </div><div class="card span"><div class="tool-row"><div><h2>Login e Face ID</h2><p class="sub">Ative uma passkey para entrar usando a autenticação do seu dispositivo.</p></div>${ico('shield',23)}</div><div class="hairline"></div><div class="tool-row"><div><strong>Acesso com Face ID ou passkey</strong><p class="sub">Depois de cadastrar, você pode entrar sem digitar a senha em aparelhos compatíveis.</p></div><button class="button secondary small" data-action="registerPasskey">${ico('shield',15)} Cadastrar Face ID</button></div><p class="tagline" style="margin-top:12px">Ative primeiro em Supabase → Authentication → Passkeys e configure o domínio HTTPS do seu site. O recurso do Supabase está em fase beta. No iPhone, o sistema pode usar Face ID; em outros aparelhos, PIN ou outro autenticador.</p></div><div class="card span"><div class="tool-row"><div><h2>Privacidade e funcionamento</h2><p class="sub">Controle dos seus próprios dados</p></div>${ico('shield',23)}</div><p class="tagline" style="margin-top:12px">O login Supabase é necessário para abrir o app. Os registros também são armazenados localmente para sincronização, e as políticas de acesso do Supabase protegem os arquivos na nuvem. Não compartilhe o backup com terceiros. Sem módulo de alimentação nesta versão.</p></div></div>`}
function numeric(name,label,unit='',val='',opts=''){return `<div class="field"><label>${label}${unit?` (${unit})`:''}</label><input name="${name}" type="number" min="0" step="0.1" value="${escapeHTML(val??'')}" placeholder="Opcional" ${opts}></div>`}
function input(name,label,val='',opts=''){return `<div class="field"><label>${label}</label><input name="${name}" value="${escapeHTML(val??'')}" ${opts}></div>`}
function textArea(name,label,val=''){return `<div class="field"><label>${label}</label><textarea name="${name}" placeholder="Observações livres...">${escapeHTML(val??'')}</textarea></div>`}
function exerciseRow(e={}){return `<div class="exercise-row" data-exercise-row><div class="exercise-fields"><div class="field name"><label>Exercício</label><input name="exname" placeholder="Nome do exercício" value="${escapeHTML(e.name||'')}"></div><div class="field"><label>Séries</label><input name="exsets" inputmode="numeric" type="number" min="0" value="${escapeHTML(e.sets??'')}"></div><div class="field"><label>Reps.</label><input name="exreps" placeholder="8-12" value="${escapeHTML(e.reps??'')}"></div><div class="field"><label>Kg</label><input name="exkg" type="number" min="0" step="0.5" value="${escapeHTML(e.kg??'')}"></div><button class="iconbtn remove" type="button" data-action="removeExercise" title="Remover exercício">${ico('close')}</button></div></div>`}
function exerciseFields(ex=[]){return `<div class="wide"><div class="heading-line"><strong>Exercícios</strong><button class="button small ghost" type="button" data-action="addExercise">${ico('plus',14)} Adicionar</button></div><div id="exerciseRows">${(ex.length?ex:[{}]).map(exerciseRow).join('')}</div></div>`}
function modalShell(title,html,kind,id=''){el.modal.innerHTML=`<div class="modal-head"><div><span class="mini-title">MINHA EVOLUÇÃO</span><h2>${title}</h2></div><button class="iconbtn" type="button" data-action="closeModal" aria-label="Fechar">${ico('close')}</button></div><div class="modal-body"><form id="recordForm" data-kind="${kind}" data-id="${id}"><div class="form-grid">${html}</div><div class="form-footer"><button type="button" class="button secondary" data-action="closeModal">Cancelar</button><button class="button" type="submit">${id?'Salvar alterações':'Salvar registro'}</button></div></form></div>`;el.dialog.showModal()}
function openForm(kind,id='',routineFrom=''){const old=id?getRec(id):null;const d=old?.data||{},date=old?.date||today();let title='',html='';if(kind==='dose'){title=id?'Editar aplicação':'Registrar aplicação';html=`<div class="field"><label>Data da aplicação</label><input name="date" type="date" required value="${date}"></div><div class="field"><label>Horário (opcional)</label><input name="time" type="time" value="${escapeHTML(d.time||'')}"></div>${numeric('mg','Dose aplicada','mg',d.mg??'','required step="0.01" min="0.01" max="100"')}<div class="field"><label>Local da aplicação</label><select name="site"><option value="">Não informado</option>${['Abdômen','Coxa direita','Coxa esquerda','Braço direito','Braço esquerdo','Outro'].map(x=>`<option ${d.site===x?'selected':''}>${x}</option>`).join('')}</select></div>${input('brand','Medicamento / fabricante',d.brand||'','placeholder="Ex.: Mounjaro"')}${input('lot','Lote (opcional)',d.lot||'')}${input('symptoms','Sintomas / efeitos percebidos',d.symptoms||'','placeholder="Ex.: náusea, nenhum..."')}<div class="wide">${textArea('note','Observações',d.note||'')}</div><div class="wide note">Informe a dose real em mg. Não utilize este campo para calcular unidades de seringa ou decidir uma nova dose.</div>`}
 else if(kind==='measure'){title=id?'Editar medição':'Nova medição corporal';html=`<div class="field"><label>Data da medição</label><input name="date" type="date" required value="${date}"></div><div></div>${metricList().map(([key,label,unit])=>numeric(key,label,unit,d[key]??'')).join('')}<div class="wide">${textArea('note','Observações',d.note||'')}</div>`}
 else if(kind==='photo'){title=id?'Editar foto':'Adicionar fotos da evolução';html=`<div class="field"><label>Data em que a foto foi tirada</label><input name="date" type="date" required value="${date}"></div><div class="field"><label>Ângulo da foto</label><select name="angle">${['frente','costas','lado','livre'].map(x=>`<option value="${x}" ${d.angle===x?'selected':''}>${positionName(x)}</option>`).join('')}</select></div><div class="field wide"><label>${id?'Substituir foto (opcional)':'Selecione uma ou mais fotos'}</label><input name="files" type="file" accept="image/*" ${id?'':'required multiple'}><small>Fotos novas e antigas são aceitas. As imagens são otimizadas para economizar espaço e não preservam metadados EXIF.</small></div><div class="wide">${textArea('note','Anotação (opcional)',d.note||'')}</div>`}
 else if(kind==='routine'||kind==='workout'){const from=routineFrom?getRec(routineFrom):null;const x=old?.data||from?.data||{};title=kind==='routine'?(id?'Editar ficha':'Criar ficha de treino'):(id?'Editar treino':'Registrar treino');html=kind==='workout'?`<div class="field"><label>Data do treino</label><input type="date" name="date" required value="${date}"></div>${input('name','Nome do treino',x.name||'','required placeholder="Ex.: Treino A · Costas"')}${numeric('duration','Duração total','min',x.duration??'')}${numeric('cardio','Tempo de cardio','min',x.cardio??'')}`:`${input('name','Nome da ficha',x.name||'','required placeholder="Ex.: Treino A · Inferiores"')}<div class="field"><label>Dias da semana</label><div class="day-chips">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((l,i)=>`<label class="day-chip"><input type="checkbox" name="days" value="${i}" ${(x.days||[]).map(String).includes(String(i))?'checked':''}> ${l}</label>`).join('')}</div></div>`;html+=`${exerciseFields(x.exercises||[])}<div class="wide">${textArea('note','Observações',x.note||'')}</div>`}
 else return;modalShell(title,html,kind,id)}
function extractExercises(f){return $$('[data-exercise-row]',f).map(r=>({name:$('[name="exname"]',r).value.trim(),sets:$('[name="exsets"]',r).value.trim(),reps:$('[name="exreps"]',r).value.trim(),kg:$('[name="exkg"]',r).value.trim()})).filter(e=>e.name)}
async function imageToJpeg(file){
 if(!file.type.startsWith('image/'))throw Error('Selecione uma imagem válida.');
 if(file.size>35*1024*1024)throw Error('A foto é muito grande (máximo: 35 MB).');
 let src=null,temporaryURL='';
 try{
   src=await createImageBitmap(file).catch(()=>null);
   if(!src){
     // iPhone: fallback para imagens HEIC/HEIF aceitas pelo Safari.
     temporaryURL=URL.createObjectURL(file);
     src=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Não foi possível abrir esta imagem. Tente JPG ou PNG.'));im.src=temporaryURL});
   }
   const width=src.width||src.naturalWidth,height=src.height||src.naturalHeight;
   if(!width||!height)throw Error('Arquivo de imagem sem dimensões válidas.');
   const max=1600,scale=Math.min(1,max/Math.max(width,height));
   const cv=document.createElement('canvas');cv.width=Math.round(width*scale);cv.height=Math.round(height*scale);
   const ctx=cv.getContext('2d');if(!ctx)throw Error('Seu navegador não conseguiu processar a foto.');
   ctx.drawImage(src,0,0,cv.width,cv.height);
   return await new Promise((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('Erro ao otimizar imagem')),'image/jpeg',.84));
 }finally{src?.close?.();if(temporaryURL)URL.revokeObjectURL(temporaryURL)}
}
async function saveForm(form){const kind=form.dataset.kind,old=form.dataset.id?getRec(form.dataset.id):null,fd=new FormData(form);let date=fd.get('date')||today(),data={};if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Escolha uma data válida.');if(kind==='dose'){const mg=Number(fd.get('mg'));if(!Number.isFinite(mg)||mg<=0)throw Error('Informe uma dose válida em mg.');data={mg,time:fd.get('time')||'',site:fd.get('site')||'',brand:fd.get('brand')||'',lot:fd.get('lot')||'',symptoms:fd.get('symptoms')||'',note:fd.get('note')||''}}
 else if(kind==='measure'){data={note:fd.get('note')||''};for(const [key] of metricList()){const v=fd.get(key);data[key]=v===''?null:Number(v);if(data[key]!=null&&(!Number.isFinite(data[key])||data[key]<0))throw Error('Confira os valores das medidas.')}if(!metricList().some(([k])=>data[k]!=null))throw Error('Preencha pelo menos uma medida.')}
 else if(kind==='photo'){data={angle:fd.get('angle'),note:fd.get('note')||'',remotePath:old?.data.remotePath||''};const fs=$('[name="files"]',form).files;if(!fs.length&&!old)throw Error('Selecione ao menos uma imagem.');if(fs.length>12)throw Error('Adicione até 12 fotos por vez.');const processed=[];for(const file of fs)processed.push(await imageToJpeg(file));el.dialog.close();if(old){if(processed.length){data.remotePath='';}await updateRecord(kind,date,data,old,processed.length?processed[0]:undefined);for(const blob of processed.slice(1))await updateRecord(kind,date,{...data,remotePath:''},null,blob)}else for(const blob of processed)await updateRecord(kind,date,{...data},null,blob);return}
 else if(kind==='workout'||kind==='routine'){data={name:(fd.get('name')||'').trim(),note:fd.get('note')||'',exercises:extractExercises(form)};if(!data.name)throw Error('Informe o nome do treino.');if(kind==='workout'){data.duration=Number(fd.get('duration')||0);data.cardio=Number(fd.get('cardio')||0)}else{data.days=fd.getAll('days').map(Number);date=today()}}
 else throw Error('Tipo não reconhecido');el.dialog.close();await updateRecord(kind,date,data,old)}
function setSelectState(){const a=$('#compareA'),b=$('#compareB'),ang=$('#compareAngle');if(a)a.value=st.compare.a;if(b)b.value=st.compare.b;if(ang)ang.value=st.compare.angle}
async function backup(){const data=[];for(const r of st.records){if(r.deleted)continue;const item={kind:r.kind,date:r.date,data:r.data,createdAt:r.createdAt};if(r.blob)item.image=await blobToDataURL(r.blob);data.push(item)}const pack={app:'Minha Evolução',version:1,exportedAt:new Date().toISOString(),records:data};const file=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});download(file,`minha-evolucao-backup-${today()}.json`);toast('Backup exportado. Guarde em local privado.')}
function blobToDataURL(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(fr.error);fr.readAsDataURL(blob)})}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
function dataURLToBlob(url){const parts=url.split(','),mime=/data:([^;]+);base64/.exec(parts[0])?.[1]||'image/jpeg';if(!url.startsWith('data:image/')||!parts[1])throw Error('Imagem de backup inválida');const bin=atob(parts[1]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:mime})}
async function restore(file){if(!file)return;const text=await file.text(),pack=JSON.parse(text);if(pack.app!=='Minha Evolução'||pack.version!==1||!Array.isArray(pack.records))throw Error('Arquivo de backup incompatível.');if(pack.records.length>10000)throw Error('Backup acima do limite de registros.');if(!confirm(`Importar ${pack.records.length} registro(s) para o perfil atual? Os itens serão adicionados ao histórico.`))return;const now=new Date().toISOString();let count=0;for(const r of pack.records){if(!KINDS.includes(r.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!r.data||typeof r.data!=='object')continue;const data={...r.data};if(r.kind==='photo')data.remotePath='';const rec={id:uuid(),owner:st.owner,kind:r.kind,date:r.date,createdAt:now,updatedAt:now,dirty:true,deleted:false,data};if(r.image)rec.blob=dataURLToBlob(r.image);await putStored(rec);count++}st.records=await allStored(st.owner);render();toast(`${count} registros importados no aparelho`);if(st.user)await syncAll()}
async function migrate(){if(!st.user)return;const local=(await allStored('local')).filter(r=>!r.deleted);if(!local.length)return toast('Não há registros locais para copiar');if(!confirm(`Copiar ${local.length} registro(s) deste aparelho para sua conta? Os dados locais serão preservados.`))return;for(const r of local){const rec={...r,id:uuid(),owner:st.user.id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),dirty:true};if(rec.kind==='photo')rec.data={...rec.data,remotePath:''};await putStored(rec)}st.records=await allStored(st.user.id);await syncAll();toast('Cópia finalizada; confira o status de sincronização')}
async function saveCloudConfig(f){
 const x=new FormData(f),url=String(x.get('url')||'').trim().replace(/\/$/,''),key=String(x.get('key')||'').trim();
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))throw Error('Informe a URL HTTPS do seu projeto Supabase.');
 if(!key||/service.role|sb_secret_/i.test(key))throw Error('Use somente a chave pública (publishable/anon), nunca uma chave secreta.');
 if(st.user&&(url!==st.config?.url||key!==st.config?.key))throw Error('Saia da conta antes de trocar de projeto Supabase.');
 await loadSupabase();st.config={url,key};localStorage.setItem('evolucao_cloud',JSON.stringify(st.config));
 st.client=newCloudClient(url,key);st.showCloudForm=false;render();showAuthMessage('Supabase conectado. Faça login ou crie sua conta.');
}
async function authenticate(f,mode){
 if(!st.client)throw Error('Configure o Supabase primeiro.');
 const fd=new FormData(f),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||'');
 if(!email||password.length<6)throw Error('Informe um e-mail e senha com pelo menos 6 caracteres.');
 localStorage.setItem(REMEMBER_KEY,fd.get('remember')==='on'?'1':'0');
 const {data,error}=mode==='signup'?await st.client.auth.signUp({email,password}):await st.client.auth.signInWithPassword({email,password});
 if(error)throw error;
 if(data.session?.user){await onAuthenticated(data.session.user);toast('Bem-vindo ao Minha Evolução');}
 else showAuthMessage('Conta criada. Confirme seu e-mail, se solicitado pelo Supabase, e depois faça login.');
}
async function loginWithPasskey(){
 if(!st.client)throw Error('Conecte o Supabase antes de usar Face ID.');
 if(!canUsePasskey())throw Error('Face ID/passkey requer HTTPS, navegador compatível e uma versão atual do Supabase.');
 const remember=$('#entryAuthForm [name="remember"]')?.checked??true;
 localStorage.setItem(REMEMBER_KEY,remember?'1':'0');
 const {data,error}=await st.client.auth.signInWithPasskey();if(error)throw error;
 if(!data?.user)throw Error('O Face ID não concluiu a autenticação.');
 await onAuthenticated(data.user);toast('Acesso autorizado');
}
async function registerPasskey(){
 if(!st.client||!st.user)throw Error('Entre com sua conta antes de cadastrar o Face ID.');
 if(!window.isSecureContext||!window.PublicKeyCredential||typeof st.client.auth.registerPasskey!=='function')throw Error('Esta opção exige HTTPS e suporte a passkeys no aparelho.');
 const {error}=await st.client.auth.registerPasskey();if(error)throw error;
 toast('Passkey cadastrada! Agora você pode entrar usando Face ID neste iPhone, quando disponível.');
}
async function logout(){
 if(!st.client)return;
 const {error}=await st.client.auth.signOut();if(error)throw error;
 st.user=null;st.records=[];st.page='dashboard';await loadOwner('local');
 toast('Sessão encerrada. Faça login para ver seus registros.');
}
async function main(){registerSW();await loadOwner('local');setSelectState();await setupCloud();render();setSelectState()}
// UI event delegation
window.addEventListener('DOMContentLoaded',()=>main().catch(err=>toast('Não foi possível abrir a base local: '+err.message,true)));
window.addEventListener('online',()=>{if(st.user)syncAll()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&st.user)syncAll()});
document.addEventListener('click',async e=>{const btn=e.target.closest('button');if(!btn)return;try{
 if(btn.dataset.authmode){st.authMode=btn.dataset.authmode;renderAuthGate();return}
 if(btn.dataset.page){if(!st.user)return;st.page=btn.dataset.page;render();setSelectState();window.scrollTo({top:0,behavior:'smooth'});return}
 if(btn.dataset.add){openForm(btn.dataset.add);return}
 if(btn.dataset.edit){const r=getRec(btn.dataset.edit);if(r)openForm(r.kind,r.id);return}
 if(btn.dataset.delete){await deleteRecord(btn.dataset.delete);return}
 if(btn.dataset.startroutine){openForm('workout','',''+btn.dataset.startroutine);return}
 if(btn.dataset.loadphoto){await retrievePhoto(btn.dataset.loadphoto);setSelectState();return}
 if(btn.dataset.workoutview){st.workoutView=btn.dataset.workoutview;render();return}
 if(btn.dataset.metric){st.bodyMetric=btn.dataset.metric;render();return}
 if(btn.dataset.dosefilter){st.doseFilter=btn.dataset.dosefilter;render();return}
 if(btn.dataset.photofilter){st.photosFilter=btn.dataset.photofilter;render();setSelectState();return}
 const a=btn.dataset.action;if(!a)return;
 if(a==='toggleCloudSetup'){st.showCloudForm=!st.showCloudForm;renderAuthGate();return}
 if(a==='togglePassword'){const field=$('#entryPassword');if(field){field.type=field.type==='password'?'text':'password';btn.setAttribute('aria-label',field.type==='password'?'Mostrar senha':'Ocultar senha');}return}
 if(a==='passkeyLogin'){await loginWithPasskey();return}
 if(a==='registerPasskey'){await registerPasskey();return}
 if(a==='closeModal'){el.dialog.close();return}
 if(a==='addExercise'){$('#exerciseRows',el.dialog).insertAdjacentHTML('beforeend',exerciseRow());return}
 if(a==='removeExercise'){btn.closest('[data-exercise-row]')?.remove();return}
 if(a==='export'){await backup();return}
 if(a==='import'){$('#importFile').click();return}
 if(a==='sync'){await syncAll();return}
 if(a==='logout'){await logout();return}
 if(a==='migrate'){await migrate();return}
 }catch(err){if(!st.user)showAuthMessage(err.message||String(err),true);else toast(err.message||String(err),true)}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.compare){st.compare[t.dataset.compare]=t.value;render();setSelectState()}});
document.addEventListener('submit',async e=>{const f=e.target;if(!['recordForm','prefsForm','cloudConfigForm','authForm','entryAuthForm','entryCloudConfigForm'].includes(f.id))return;e.preventDefault();const submit=e.submitter;try{if(f.id==='recordForm'){await saveForm(f);setSelectState()}else if(f.id==='prefsForm'){const fd=new FormData(f),goal=fd.get('goal')===''?'':Number(fd.get('goal')),interval=Number(fd.get('interval'));if(interval<1||interval>365||!Number.isInteger(interval))throw Error('Intervalo deve ser um número de dias válido.');const old=records('prefs')[0];await updateRecord('prefs',today(),{goal,interval},old)}else if(f.id==='cloudConfigForm'||f.id==='entryCloudConfigForm'){await saveCloudConfig(f)}else if(f.id==='authForm'||f.id==='entryAuthForm'){await authenticate(f, f.id==='entryAuthForm'?st.authMode:(submit?.value||'login'))}}catch(err){if(!st.user)showAuthMessage(err.message||String(err),true);else toast(err.message||String(err),true)}});
$('#importFile').addEventListener('change',async e=>{try{await restore(e.target.files[0])}catch(err){toast('Falha na importação: '+err.message,true)}finally{e.target.value=''}});
el.dialog.addEventListener('click',e=>{if(e.target===el.dialog)el.dialog.close()});
