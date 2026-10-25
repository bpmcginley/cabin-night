/* ================= APP ================= */
(function(){
'use strict';
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const rid=()=>Math.random().toString(36).slice(2,8);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const sess={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- constants ---------- */
const P=['bruce','meredith'];
const NAME={bruce:'Bruce',meredith:'Meredith',team:'Team'};
const other=s=>s==='bruce'?'meredith':'bruce';
const ICON={
 gk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
 mus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
 thr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v6a8 8 0 0 1-16 0z"/><path d="M8 9h2M14 9h2M9 14c1.6 1.3 4.4 1.3 6 0"/></svg>',
 sci:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5.2 9.2A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.8L14 9V3"/><path d="M7.5 15h9"/></svg>',
 word:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 16l3-8 3 8M10.2 13h3.6"/></svg>',
 tune:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/></svg>',
 us:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
};
const CATS={
 gk:{name:'General Knowledge',short:'Knowledge',c:'#b29cf5',kind:'turn'},
 mus:{name:'Music',short:'Music',c:'#f6c453',kind:'turn'},
 thr:{name:'Theatre',short:'Theatre',c:'#ef6f8f',kind:'turn'},
 sci:{name:'Science',short:'Science',c:'#9ad66b',kind:'turn'},
 word:{name:'Word Play',short:'Words',c:'#7aa7f0',kind:'race'},
 tune:{name:'Name That Tune',short:'Tune',c:'#d68be0',kind:'race'},
 us:{name:'Guess Each Other',short:'Us',c:'#f2a6a0',kind:'us'},
};
const TIER=[null,{n:'Easy',time:20},{n:'Medium',time:25},{n:'Hard',time:35},{n:'Expert',time:45}];
const SAB={
 fuse:{n:'Short Fuse',d:t=>`Halves ${t}'s timer on their next question.`},
 blizzard:{n:'Blizzard',d:t=>`${t}'s next question jumps up one difficulty.`},
 fog:{n:'Fogged Window',d:t=>`No multiple choice for ${t} next time. They have to type it.`},
 drift:{n:'Snowdrift',d:t=>`${t} is snowed in and skips their next turn.`},
};
const MYS={
 card:{t:'Found a sabotage card',good:true},
 double:{t:'Double points',good:true},
 extra:{t:'Extra turn',good:true},
 ice:{t:'Thin ice',good:false},
 wolf:{t:'A wolf in the woods',good:false},
 wood:{t:'A dry woodpile',good:true},
 calm:{t:'The wind dies down',good:true},
 gust:{t:'A cold gust',good:false},
};
const SEASONS=[
 {id:'winter',n:'Winter Woods',need:0,sw:'linear-gradient(135deg,#f6fafc,#9fb4c2)'},
 {id:'autumn',n:'Autumn Ridge',need:3,sw:'linear-gradient(135deg,#e7c27a,#c7542b)'},
 {id:'spring',n:'Spring Thaw',need:6,sw:'linear-gradient(135deg,#bfe39a,#f2a9c6)'},
 {id:'aurora',n:'Aurora Night',need:10,sw:'linear-gradient(135deg,#3c4f7a,#5fe3c4)'},
];
const TERRAIN_NAME={meadow:'the meadow',pines:'the pines',lake:'the lake',ridge:'the ridge',peak:'the summit'};
const BANK_OBJS=BANK.concat(typeof BANK2!=='undefined'?BANK2:[]).map((b,i)=>({id:'b'+i,cat:b[0],tier:b[1],q:b[2],a:b[3],wrong:b[4],alts:b[5]||[]}));

/* ---------- in-memory db for practice mode ---------- */
function MemDB(){
 const data=new Map(); const subs=new Set();
 const snapDoc=p=>{const d=data.get(p);return {id:p.split('/').pop(),exists:!!d,data:()=>d?clone(d):undefined,metadata:{fromCache:false,hasPendingWrites:false}}};
 const notify=()=>queueMicrotask(()=>subs.forEach(f=>f()));
 const merge=(a,b)=>{for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],b[k]);else a[k]=clone(b[k])}return a};
 const docRef=p=>({id:p.split('/').pop(),path:p,
  get:async()=>snapDoc(p),
  set:async v=>{data.set(p,clone(v));notify()},
  update:async v=>{if(!data.has(p))throw{code:'invalid_argument'};data.set(p,merge(data.get(p),v));notify()},
  delete:async()=>{data.delete(p);notify()},
  onSnapshot(next){const f=()=>next(snapDoc(p));subs.add(f);queueMicrotask(f);return()=>subs.delete(f)},
  collection:c=>colRef(p+'/'+c)});
 const colRef=(c,filters=[],order=null,lim=0)=>{
  const run=()=>{let rows=[...data.keys()].filter(k=>k.startsWith(c+'/')&&k.split('/').length===c.split('/').length+1).map(snapDoc);
   rows=rows.filter(s=>filters.every(([f,op,v])=>{const x=s.data()[f];return op==='=='?x===v:op==='!='?x!==v:true}));
   if(order)rows.sort((a,b)=>{const x=a.data()[order[0]],y=b.data()[order[0]];return (x>y?1:x<y?-1:0)*(order[1]==='desc'?-1:1)});
   if(lim)rows=rows.slice(0,lim);return {docs:rows,size:rows.length,empty:!rows.length,docChanges:()=>[]}};
  return {path:c,
   where:(f,op,v)=>colRef(c,[...filters,[f,op,v]],order,lim),
   orderBy:(f,d='asc')=>colRef(c,filters,[f,d],lim),
   limit:n=>colRef(c,filters,order,n),
   get:async()=>run(),
   onSnapshot(next){const f=()=>next(run());subs.add(f);queueMicrotask(f);return()=>subs.delete(f)},
   doc:id=>docRef(c+'/'+(id||rid()+rid())),
   add:async v=>{const r=docRef(c+'/'+rid()+rid());await r.set(v);return r}};
 };
 return {doc:docRef,collection:c=>colRef(c)};
}

/* ---------- globals ---------- */
let DB=null,WORKER=null,AI_OK=false,ASSETS=null,UID=null,ONLINE=false,HOUSE=store.get('cn.house',null);
let ME=sess.get('cn.seat')||store.get('cn.me',null);
let ROOM=null,CODE=null,ANS={},unsubRoom=null,unsubAns=null;
let LOCAL={},RESOLVING=null,SEL=null,BUILT=null,OVKEY=null,HIDE_REVEAL=null,TIMER=null,LAST_FX=null,SEEN=new Set(),LEDGER=null;
let MUTED=store.get('cn.muted',false);

/* ---------- small ui helpers ---------- */
function toast(msg,ms=3200){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),ms)}
function show(name){$$('main > section').forEach(s=>s.hidden=s.id!=='scr-'+name);if(name!=='game'){closeOverlay();}window.scrollTo(0,0);document.onkeydown=null;}
function closeOverlay(){stopClip();const o=$('#overlay');o.hidden=true;o.innerHTML='';OVKEY=null;stopTimer();}
function icon(cat,size){return `<span class="ic" style="--c:${CATS[cat].c};${size?`width:${size}px;height:${size}px`:''}">${ICON[cat]}</span>`}
function pips(t){return `<span class="pips" aria-label="${TIER[t].n}">${[1,2,3,4].map(i=>`<i class="${i<=t?'on':''}"></i>`).join('')}</span>`}
function dot(s,txt){return `<span class="dot ${s}">${esc(txt||NAME[s][0])}</span>`}
function setMe(s){ME=s;store.set('cn.me',s);sess.set('cn.seat',s);$('#seatName').textContent=NAME[s];const d=$('#seatDot');d.className='dot '+s;d.textContent=NAME[s][0];if(ROOM)render();}
const PRACTICE=()=>!ONLINE;

/* ---------- audio ---------- */
let AC=null,MASTER=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();MASTER=AC.createGain();MASTER.gain.value=.9;const d=AC.createDelay();d.delayTime.value=.19;const fb=AC.createGain();fb.gain.value=.24;const wet=AC.createGain();wet.gain.value=.28;MASTER.connect(AC.destination);MASTER.connect(d);d.connect(fb);fb.connect(d);d.connect(wet);wet.connect(AC.destination)}catch(e){AC=null}}if(AC&&AC.state==='suspended')AC.resume();return AC}
document.addEventListener('pointerdown',()=>ac(),{once:true});
function midi(n){const m=/^([A-G])(#|b)?(\d)$/.exec(n);const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]];return 12*(+m[3]+1)+base+(m[2]==='#'?1:m[2]==='b'?-1:0)}
function pluck(f,t,dur,vol=.3){const c=AC;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(MASTER);[[1,1],[2,.3],[3,.08],[4.2,.04]].forEach(([m,a])=>{const o=c.createOscillator();o.type='sine';o.frequency.value=f*m;const og=c.createGain();og.gain.value=a;o.connect(og).connect(g);o.start(t);o.stop(t+dur+.05)})}
function playTune(t){const c=ac();if(!c)return 0;const notes=t.n.split(/\s+/).map(x=>{const [n,d]=x.split(':');return [n,parseFloat(d)]});const mids=notes.filter(n=>n[0]!=='R').map(n=>midi(n[0]));const shift=Math.max(...mids)<=76?12:0;const beat=60/t.bpm;let at=c.currentTime+.08;for(const [n,d] of notes){if(n!=='R'){const f=440*Math.pow(2,(midi(n)+shift-69)/12);pluck(f,at,Math.min(1.8,Math.max(.5,d*beat*2.2)),.28)}at+=d*beat}return at-c.currentTime+.4}
function sfx(k){if(MUTED)return;const c=ac();if(!c)return;const t=c.currentTime+.02;const N=m=>440*Math.pow(2,(m-69)/12);
 if(k==='good'){pluck(N(84),t,.6,.22);pluck(N(88),t+.09,.6,.22);pluck(N(91),t+.18,.9,.22)}
 else if(k==='bad'){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(110,t+.3);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(g).connect(MASTER);o.start(t);o.stop(t+.4)}
 else if(k==='lock'){pluck(N(79),t,.25,.15)}
 else if(k==='claim'){[72,76,79,84].forEach((m,i)=>pluck(N(m),t+i*.07,.7,.18))}
 else if(k==='turn'){pluck(N(76),t,.5,.14);pluck(N(83),t+.12,.7,.14)}
 else if(k==='tick'){pluck(N(96),t,.08,.05)}}
function setMuteIcon(){$('#muteBtn').innerHTML=MUTED?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/></svg>';$('#muteBtn').setAttribute('aria-label',MUTED?'Sound off':'Sound on')}

/* ---------- answer checking ---------- */
function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9.\-\/\s]/g,' ').replace(/\s+/g,' ').trim().replace(/^(the|a|an) /,'')}
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,i)=>i);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
function correct(q,ans){if(!ans||!ans.v)return false;const v=ans.v;if(v===q.a)return true;if(!ans.typed)return false;const n=norm(v);if(!n)return false;
 for(const c of [q.a,...(q.alts||[])].map(norm)){if(n===c)return true;if(q.exact)continue;const tol=c.length<=4?0:c.length<=8?1:2;if(lev(n,c)<=tol)return true;if(c.length>=6&&n.length>=c.length*.6&&c.includes(n)&&/\s/.test(c))return true}
 return false}

/* ---------- board / gifts generation ---------- */
function rep(x,n){return Array(n).fill(x)}
function mysKinds(mode,board){if(mode==='coop')return shuffle(['wood','wood','calm','gust','gust']);return shuffle(['card','card','double','extra',board==='territory'?pick(['ice','wolf']):'ice'])}
function makeMap(mode){
 const cats=shuffle([...rep('gk',4),...rep('mus',4),...rep('thr',4),...rep('sci',4),...rep('word',3),...rep('tune',3),...rep('us',3)]);
 const lake=pick([[15,16,20,21],[8,9,13,14],[3,4,9]]);
 const mysIdx=shuffle([...Array(25).keys()].filter(i=>i!==0)).slice(0,5);const kinds=mysKinds(mode,'territory');
 const spots=[[.22,.24],[.76,.28],[.26,.78],[.8,.74],[.5,.18],[.18,.52]];
 const slots=[];
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){const i=y*5+x,d=x+y;let terrain,tier,h;
  if(i===0){terrain='peak';tier=4;h=44}
  else if(d<=1){terrain='ridge';tier=4;h=32}
  else if(d===2){terrain='ridge';tier=3;h=24}
  else if(lake.includes(i)){terrain='lake';tier=Math.random()<.5?3:2;h=6}
  else if(d>=6||i===12){terrain='meadow';tier=d>=7?1:(Math.random()<.6?1:2);h=11}
  else{terrain=Math.random()<.22?'meadow':'pines';tier=terrain==='meadow'?1:(d<=4&&Math.random()<.35?3:2);h=terrain==='meadow'?11:16}
  if(i===12)tier=2;
  const deco=[];
  if(terrain==='pines'){shuffle(spots).slice(0,2+Math.floor(Math.random()*2)).forEach(p=>deco.push({k:'tree',x:p[0],y:p[1],s:.8+Math.random()*.4}))}
  else if(terrain==='meadow'&&i!==12&&Math.random()<.5){const p=pick(spots);deco.push({k:'tree',x:p[0],y:p[1],s:.7})}
  else if(terrain==='ridge'||terrain==='peak'){const p=pick(spots.slice(0,4));deco.push({k:'rock',x:p[0],y:p[1],s:1})}
  const mi=mysIdx.indexOf(i);
  slots.push({id:'t'+i,x,y,terrain,h,tier,cat:cats[i],mystery:mi>=0,mk:mi>=0?kinds[mi]:null,revealed:false,owner:null,dbl:false,deco,cabin:i===12});}
 return slots;
}
function giftTier(turnNo,max){const p=turnNo/max;const w=p<.34?[.45,.4,.15,0]:p<.67?[.2,.4,.3,.1]:[.05,.25,.4,.3];let r=Math.random(),acc=0;for(let i=0;i<4;i++){acc+=w[i];if(r<=acc)return i+1}return 4}
function newGift(mode,turnNo,max){const m=Math.random()<.25;return {id:'g'+rid(),cat:pick(Object.keys(CATS)),tier:giftTier(turnNo,max),mystery:m,mk:m?pick(mode==='coop'?['wood','calm','gust']:['card','double','extra','ice']):null,revealed:false,owner:null,dbl:false}}
function newState(code,o){
 const max=o.board==='territory'?45:16;
 return {v:1,code,createdAt:Date.now(),host:ME,board:o.board,mode:o.mode,season:o.season,stakes:o.stakes||'',
  seats:{bruce:null,meredith:null},phase:'lobby',turn:pick(P),turnNo:0,maxTurns:max,
  slots:o.board==='territory'?makeMap(o.mode):Array.from({length:5},()=>newGift(o.mode,0,max)),
  scores:{bruce:0,meredith:0},wood:8,cards:{bruce:[],meredith:[]},
  effects:{bruce:{fuse:false,fog:false,blizzard:false,skip:false},meredith:{fuse:false,fog:false,blizzard:false,skip:false}},
  playedCard:false,round:null,last:null,used:[],aiQs:o.aiQs||[],stats:{bruce:{},meredith:{}},result:null,next:null,ledgerDone:false};
}
function territoryScore(R,s){return R.slots.reduce((a,t)=>a+(t.owner===s?t.tier*(t.dbl?2:1):0),0)}
function score(R,s){return R.board==='territory'?territoryScore(R,s):R.scores[s]}

/* ---------- db helpers ---------- */
const roomRef=()=>DB.doc('rooms/'+CODE);
let writeChain=Promise.resolve();
function setRoom(R){writeChain=writeChain.then(()=>roomRef().set(R)).catch(e=>{toast('Could not save that move. Check your connection.');throw e});return writeChain}
function ansId(r,s){return `${r.id}-${r.stage}-${s}`}
function needSeats(R){const r=R.round;if(!r)return[];if(R.mode==='coop')return[...P];if(r.kind==='turn')return r.stage==='main'?[r.active]:[other(r.active)];return[r.active,other(r.active)]}
function hasAns(R,s){return !!ANS[ansId(R.round,s)]}
function actingSeat(){const R=ROOM;if(!PRACTICE()||!R)return ME;if(R.phase==='round'){const n=needSeats(R).find(s=>!hasAns(R,s));return n||R.round.active}return R.turn}
function roleOf(R,s){const r=R.round;if(!r||!needSeats(R).includes(s))return'watch';if(r.kind==='us')return s===r.active?'predict':'self';return'answer'}
function typedFor(R,s){const r=R.round,q=r.q;if(q.kind==='us')return false;if(r.kind==='race'&&q.kind!=='tune')return true;if(r.stage==='main'&&s===r.active&&r.fx&&r.fx.fog)return true;if(q.kind==='trivia'&&q.tier>=3)return true;return !q.ch}

/* ---------- question building ---------- */
async function makeQuestion(R,cat,tier,act){
 const opp=other(act);
 if(['gk','mus','thr','sci'].includes(cat)){
  if(ONLINE&&Math.random()<.45){try{const qs=await DB.collection('custom').where('used','==',false).get();const c=qs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.cat===cat&&(R.mode==='coop'||x.author===opp));if(c.length){const x=pick(c);DB.doc('custom/'+x.id).update({used:true}).catch(()=>{});return {kind:'trivia',tier,text:x.q,a:x.a,alts:x.alts||[],ch:x.wrong&&x.wrong.length>=3?shuffle([x.a,...x.wrong.slice(0,3)]):null,src:'custom',by:x.author}}}catch(e){}}
  const ai=(R.aiQs||[]).filter(x=>x.cat===cat&&x.tier===tier&&!R.used.includes(x.id));
  let x;
  if(ai.length&&Math.random()<.7)x=pick(ai);
  else{let pool=BANK_OBJS.filter(b=>b.cat===cat&&b.tier===tier&&!R.used.includes(b.id));if(!pool.length)pool=ai.length?ai:BANK_OBJS.filter(b=>b.cat===cat&&!R.used.includes(b.id));if(!pool.length)pool=BANK_OBJS.filter(b=>b.cat===cat);x=pick(pool)}
  R.used.push(x.id);
  return {kind:'trivia',tier,text:x.q,a:x.a,alts:x.alts||[],ch:shuffle([x.a,...x.wrong.slice(0,3)]),src:x.id.startsWith('ai')?'ai':'bank'};
 }
 if(cat==='word'){
  if(tier>=3&&Math.random()<.5){const pool=VOWELLESS[tier].filter(p=>!R.used.includes('v'+p[0]));const [p,h]=pick(pool.length?pool:VOWELLESS[tier]);R.used.push('v'+p);return {kind:'vowel',tier,text:'Put the vowels back in. Spaces stay where they are.',shown:p.replace(/[AEIOU]/g,''),a:p,alts:[],hint:h,src:'bank'}}
  const pool=WORDS[tier].filter(w=>!R.used.includes('w'+w[0]));const [w,h]=pick(pool.length?pool:WORDS[tier]);R.used.push('w'+w);
  let s=w;for(let i=0;i<20&&s===w;i++)s=shuffle(w.split('')).join('');
  return {kind:'anagram',tier,text:'Unscramble the word.',shown:s,a:w,alts:[],hint:h,exact:true,src:'bank'};
 }
 if(cat==='tune'){
  if(ONLINE&&Math.random()<.4){try{const qs=await DB.collection('custom').where('used','==',false).get();const c=qs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.cat==='tune'&&x.audio&&(R.mode==='coop'||x.author===opp));if(c.length){const x=pick(c);DB.doc('custom/'+x.id).update({used:true}).catch(()=>{});return {kind:'tune',tier,text:x.q||'Name that tune!',audio:x.audio,a:x.a,alts:x.alts||[],ch:tier<=2&&x.wrong&&x.wrong.length>=3?shuffle([x.a,...x.wrong.slice(0,3)]):null,src:'custom',by:x.author}}}catch(e){}}
  if(WORKER&&typeof SONGS!=='undefined'&&Math.random()<.75){
   const all=SONGS[tier]||[];let pool=all.filter(s=>!R.used.includes('s'+s.t));if(!pool.length)pool=all;
   for(const s of shuffle(pool).slice(0,3)){try{const res=await WORKER.tune(s.q||`artist:"${s.a}" track:"${s.t}"`);if(res&&res.found&&res.preview){R.used.push('s'+s.t);
     const others=shuffle(all.filter(o=>o.t!==s.t)).slice(0,3).map(o=>o.t);
     return {kind:'tune',tier,text:'Name that song!',preview:res.preview,clip:CLIP_SECONDS[tier],a:s.t,alts:[s.t.replace(/\s*\(.*?\)\s*/g,' ').trim(),...(s.alts||[])],ch:tier<=2?shuffle([s.t,...others]):null,artist:res.artist||s.a||'',show:s.s||'',src:'deezer'}}}catch(e){if(e&&e.code==='forbidden'){toast('The song server rejected your house key.');break}}}
  }
  let pool=TUNES.filter(t=>t.t===tier&&!R.used.includes(t.id));if(!pool.length)pool=TUNES.filter(t=>t.t===tier);const t=pick(pool);R.used.push(t.id);
  const others=shuffle(TUNES.filter(o=>o.id!==t.id&&Math.abs(o.t-t.t)<=1)).slice(0,3).map(o=>o.title);
  return {kind:'tune',tier,text:'Name that tune!',tune:t.id,a:t.title,alts:t.alts,ch:tier<=2?shuffle([t.title,...others]):null,src:'bank'};
 }
 let pool=US.filter((u,i)=>u.t===tier&&!R.used.includes('u'+i));if(!pool.length)pool=US.filter(u=>u.t===tier);const u=pick(pool);R.used.push('u'+US.indexOf(u));
 return {kind:'us',tier,text:u.q,opts:u.o,src:'bank'};
}

/* ---------- game actions ---------- */
async function pickSlot(id){
 const R=clone(ROOM);const slot=R.slots.find(s=>s.id===id);if(!slot)return;
 const act=R.turn;const fx=R.mode==='versus'?{...R.effects[act]}:{};
 if(R.mode==='versus')R.effects[act]={...R.effects[act],fuse:false,fog:false,blizzard:false};
 const tier=Math.min(4,slot.tier+(fx.blizzard?1:0));
 const q=await makeQuestion(R,slot.cat,tier,act);
 R.round={id:'r'+(R.turnNo+1)+rid(),slotId:id,cat:slot.cat,tier,kind:CATS[slot.cat].kind,q,stage:'main',active:act,resolver:act,fx:{fuse:!!fx.fuse,fog:!!fx.fog,blizzard:!!fx.blizzard},res:null};
 R.phase='round';SEL=null;HIDE_REVEAL=null;
 await setRoom(R);
}
async function playCard(i){
 const R=clone(ROOM);const me=R.turn;const opp=other(me);const k=R.cards[me][i];if(!k||R.playedCard)return;
 R.cards[me].splice(i,1);R.effects[opp][k==='drift'?'skip':k]=true;R.playedCard=true;
 await setRoom(R);sfx('lock');toast(`${SAB[k].n} sent to ${NAME[opp]}.`);
}
async function startTurn(){const R=clone(ROOM);R.phase='pick';R.round=null;R.playedCard=false;HIDE_REVEAL=null;await setRoom(R);sfx('turn')}
async function submit(value,typed){
 const R=ROOM;if(!R||R.phase!=='round')return;const s=actingSeat();const k=LOCAL.key;if(LOCAL.submitted)return;LOCAL.submitted=true;stopTimer();
 const ms=Math.round(performance.now()-LOCAL.startT);
 try{await DB.doc(`rooms/${CODE}/answers/${ansId(R.round,s)}`).set({seat:s,v:String(value??'').slice(0,200),typed:!!typed,ms,rid:R.round.id,stage:R.round.stage,at:Date.now()});}
 catch(e){LOCAL.submitted=false;toast('Your answer did not send. Try again.');return}
 if(LOCAL.key===k){sfx('lock');OVKEY=null;renderOverlay();}
}
function bumpStat(R,s,cat,ok){const st=R.stats[s]||(R.stats[s]={});const v=st[cat]||[0,0];v[1]++;if(ok)v[0]++;st[cat]=v}

function applyMystery(R,slot,who,info){
 slot.revealed=true;const k=slot.mk;const m={kind:k,title:MYS[k].t,good:MYS[k].good,text:''};
 const nm=NAME[who];
 if(k==='card'){if(R.cards[who].length<3){const c=pick(Object.keys(SAB));R.cards[who].push(c);m.text=`${nm} pockets “${SAB[c].n}”. Use it on ${NAME[other(who)]} at the start of a turn.`}else m.text=`${nm}'s hand is full (3 cards), so the card blows away.`}
 else if(k==='double'){slot.dbl=true;m.text=`This one is worth double: ${slot.tier*2} points.`;if(R.board==='fireside')R.scores[who]+=slot.tier}
 else if(k==='extra'){info.extra=true;m.text=`${nm} goes again.`}
 else if(k==='ice'){R.effects[who].skip=true;m.text=`${nm} falls through the ice and skips their next turn.`}
 else if(k==='wolf'){const mine=R.slots.filter(t=>t.owner===who&&t.id!==slot.id);if(mine.length){const t=pick(mine);t.owner=null;m.text=`A wolf chases ${nm} off ${TERRAIN_NAME[t.terrain]}. That tile is open again.`;m.lost=t.id}else m.text=`A wolf prowls, but ${nm} has nothing else to lose. Lucky.`}
 else if(k==='wood'){R.wood+=3;m.text='Three extra logs for the fire.'}
 else if(k==='calm'){info.calm=true;m.text='No storm damage this round.'}
 else if(k==='gust'){R.wood-=2;m.text='The gust costs you two logs.'}
 return m;
}

async function resolveRound(){
 const R=clone(ROOM);const r=R.round;const q=r.q;const act=r.active,opp=other(act);const A=s=>ANS[ansId(r,s)]||{v:'',ms:1e9};
 let claim=null;const res={};const info={};
 if(R.mode==='versus'){
  if(r.kind==='turn'){
   if(r.stage==='main'){const a=A(act);const ok=correct(q,a);bumpStat(R,act,r.cat,ok);res[act]={v:a.v,ok};
    if(ok)claim=act;else{r.stage='steal';r.res=res;R.round=r;await setRoom(R);cleanupAns(ROOM.round,[act]);return}}
   else{const a=A(opp);const ok=correct(q,a);bumpStat(R,opp,r.cat,ok);Object.assign(res,r.res||{});res[opp]={v:a.v,ok,steal:true};if(ok)claim=opp}
  }else if(r.kind==='race'){const a1=A(act),a2=A(opp);const o1=correct(q,a1),o2=correct(q,a2);bumpStat(R,act,r.cat,o1);bumpStat(R,opp,r.cat,o2);
   res[act]={v:a1.v,ok:o1,ms:a1.ms};res[opp]={v:a2.v,ok:o2,ms:a2.ms};if(o1&&o2)claim=a1.ms<=a2.ms?act:opp;else if(o1)claim=act;else if(o2)claim=opp}
  else{const p=A(act),s=A(opp);const ok=!!p.v&&p.v===s.v;bumpStat(R,act,'us',ok);res[act]={v:p.v,ok,role:'guess'};res[opp]={v:s.v,role:'truth'};if(ok)claim=act}
 }else{
  if(r.kind==='us'){const p=A(act),s=A(opp);const ok=!!p.v&&p.v===s.v;bumpStat(R,act,'us',ok);res[act]={v:p.v,ok,role:'guess'};res[opp]={v:s.v,role:'truth'};if(ok)claim='team'}
  else{let any=false;for(const s of P){const a=A(s);const ok=correct(q,a);bumpStat(R,s,r.cat,ok);res[s]={v:a.v,ok,ms:a.ms};if(ok)any=true}if(any)claim='team'}
 }
 // apply
 const slot=R.slots.find(s=>s.id===r.slotId);const before=clone(slot);let mys=null;
 if(claim){
  if(R.board==='territory')slot.owner=claim;
  if(slot.mystery&&!slot.revealed)mys=applyMystery(R,slot,claim==='team'?act:claim,info);
  if(R.board==='fireside'&&R.mode==='versus')R.scores[claim]+=slot.tier;
 }else if(slot.mystery&&!slot.revealed&&R.mode==='coop'&&R.board==='fireside'){/* unopened */}
 let woodDelta=0,storm=0;
 if(R.mode==='coop'){woodDelta=claim?2:-1;R.wood+=woodDelta;if(!info.calm){R.wood-=1;storm=1}}
 const pts=before.tier*(slot.dbl?2:1);
 if(R.board==='fireside'){const i=R.slots.findIndex(s=>s.id===r.slotId);R.slots[i]=newGift(R.mode,R.turnNo+1,R.maxTurns)}
 R.turnNo++;
 let next=info.extra?act:opp,skipped=null;
 if(R.effects[next]&&R.effects[next].skip){R.effects[next].skip=false;skipped=next;next=other(next)}
 R.turn=next;
 // headline
 let headline;const where=R.board==='territory'?TERRAIN_NAME[before.terrain]:'the gift';
 if(R.mode==='versus'){
  if(claim){const stole=res[claim]&&res[claim].steal;headline=r.kind==='us'?`${NAME[act]} read ${NAME[opp]} perfectly!`:stole?`${NAME[claim]} steals ${where}!`:R.board==='territory'?`${NAME[claim]} claims ${where}!`:`${NAME[claim]} wins the gift: +${pts}`}
  else headline=r.kind==='us'?`Not quite. ${NAME[opp]} picked something else.`:R.board==='territory'?`Nobody got it. ${where[0].toUpperCase()+where.slice(1)} stays open.`:'Nobody got it.';
 }else headline=claim?(r.kind==='us'?'You two are in sync. The fire grows.':'Nice teamwork. The fire grows.'):'Missed it. The storm bites.';
 R.last={rid:r.id,slotId:r.slotId,cat:r.cat,tier:before.tier,pts,kind:r.kind,q:{text:q.text,a:q.a,kind:q.kind,shown:q.shown||null,artist:q.artist||null,show:q.show||null},res,claim,headline,mys,next,skipped,extra:!!info.extra,woodDelta,storm,terrain:before.terrain||null,active:act};
 // end check
 let over=false,result=null;
 if(R.mode==='coop'){
  if(R.wood<=0){over=true;result={coop:true,win:false}}
  else if(R.board==='territory'&&R.slots.every(t=>t.owner))over=true,result={coop:true,win:true};
  else if(R.board==='fireside'&&R.turnNo>=R.maxTurns)over=true,result={coop:true,win:true};
  else if(R.board==='territory'&&R.turnNo>=R.maxTurns)over=true,result={coop:true,win:false,timeout:true};
 }else{
  const done=R.board==='territory'?(R.slots.every(t=>t.owner)||R.turnNo>=R.maxTurns):R.turnNo>=R.maxTurns;
  if(done){over=true;const b=score(R,'bruce'),m=score(R,'meredith');result={coop:false,winner:b>m?'bruce':m>b?'meredith':'tie',scores:{bruce:b,meredith:m}}}
 }
 if(R.mode==='coop'&&result)result.wood=Math.max(0,R.wood),result.claimed=R.slots.filter(t=>t.owner).length;
 R.phase=over?'over':'reveal';R.result=result;R.round=null;
 await setRoom(R);cleanupAns(r,null);
 if(over)await writeLedger(R);
}
function cleanupAns(r,seats){const stage=r.stage;(seats||P).forEach(s=>DB.doc(`rooms/${CODE}/answers/${r.id}-${stage}-${s}`).delete().catch(()=>{}));if(!seats)P.forEach(s=>DB.doc(`rooms/${CODE}/answers/${r.id}-main-${s}`).delete().catch(()=>{}))}
function maybeResolve(){
 const R=ROOM;if(!R||R.phase!=='round'||!R.round)return;
 if(!PRACTICE()&&R.round.resolver!==ME)return;
 if(!needSeats(R).every(s=>hasAns(R,s)))return;
 const k=R.round.id+R.round.stage;if(RESOLVING===k)return;RESOLVING=k;
 resolveRound().catch(e=>{RESOLVING=null;console.error(e)});
}

/* ---------- ledger ---------- */
function blankLedger(){return {wins:{bruce:0,meredith:0},ties:0,games:0,versus:0,coop:{wins:0,games:0,bestWood:0},stats:{bruce:{},meredith:{}},history:[]}}
async function loadLedger(){try{const s=await DB.doc('meta/ledger').get();LEDGER=s.exists?{...blankLedger(),...s.data()}:blankLedger()}catch(e){LEDGER=blankLedger()}return LEDGER}
async function writeLedger(R){
 if(R.ledgerDone)return;const L=await loadLedger();const res=R.result;L.games++;
 if(res.coop){L.coop.games++;if(res.win)L.coop.wins++;L.coop.bestWood=Math.max(L.coop.bestWood||0,res.wood||0)}
 else{L.versus=(L.versus||0)+1;if(res.winner==='tie')L.ties++;else L.wins[res.winner]++}
 for(const s of P)for(const [c,v] of Object.entries(R.stats[s]||{})){const t=(L.stats[s]=L.stats[s]||{})[c]||[0,0];L.stats[s][c]=[t[0]+v[0],t[1]+v[1]]}
 L.history=[{at:Date.now(),board:R.board,mode:R.mode,result:res,stakes:R.stakes||''},...(L.history||[])].slice(0,25);
 try{await DB.doc('meta/ledger').set(L);await roomRef().update({ledgerDone:true})}catch(e){}
 LEDGER=L;
}

/* ---------- AI questions ---------- */
async function generateAI(onCount,signal){
 const spice=shuffle(['film scores','space missions','famous inventors','world geography','2000s pop','classic rock','Broadway revivals','Shakespeare','the human body','ocean life','the Olympics','food origins','classical composers','weather','kitchen chemistry','landmarks','jazz','dinosaurs','languages','art history','animals','physics','the West End','opera']).slice(0,7).join(', ');
 let n=0;const tick=setInterval(()=>{n=Math.min(44,n+1);onCount(n)},1600);
 let res;try{res=await WORKER.questions(spice,signal)}finally{clearInterval(tick)}
 const txt=String(res&&res.text||'');const a=txt.indexOf('['),b=txt.lastIndexOf(']');
 let out;try{out=JSON.parse(txt.slice(a,b+1))}catch(e){throw{code:'invalid_json'}}
 if(!Array.isArray(out))throw{code:'invalid_json'};onCount(48);
 return out.filter(x=>x&&CATS[x.cat]&&CATS[x.cat].kind==='turn'&&[1,2,3,4].includes(+x.tier)&&x.q&&x.a&&Array.isArray(x.wrong)&&x.wrong.length>=3)
  .map((x,i)=>({id:'ai'+i,cat:x.cat,tier:+x.tier,q:String(x.q).slice(0,220),a:String(x.a).slice(0,80),alts:Array.isArray(x.alts)?x.alts.map(String).slice(0,5):[],wrong:x.wrong.map(String).slice(0,3)}));
}

/* ================= SCREENS ================= */
/* ---------- home ---------- */
function windowArt(){return `<div class="window" aria-hidden="true"><div class="moon"></div><div class="hill"></div><div class="hill b"></div>
 <div class="pine" style="left:12%;bottom:20%"></div><div class="pine" style="left:24%;bottom:16%;transform:scale(.8)"></div><div class="pine" style="left:70%;bottom:18%;transform:scale(1.1)"></div><div class="pine" style="left:84%;bottom:14%;transform:scale(.75)"></div>
 <div class="glass"></div><div class="sill"></div></div>`}
function renderHome(){
 const el=$('#scr-home');const them=ME?NAME[other(ME)]:'your partner';
 el.innerHTML=`<div class="hero"><div>
  <div class="label">Bruce &amp; Meredith's game night</div>
  <h1>Cabin Night</h1>
  <p>Trivia, music-box tunes, word puzzles and “how well do you know me” rounds. Race each other across a snowy map, or team up to keep the fire burning.</p>
  <div class="who"><span class="muted">Who's on this device?</span><div class="seg" role="group" aria-label="Who is playing">${P.map(s=>`<button data-me="${s}" aria-pressed="${ME===s}">${dot(s)} ${NAME[s]}</button>`).join('')}</div></div>
 </div>${windowArt()}</div>
 <div class="home-grid">
  <div class="panel action primary"><div class="label">New game</div><h2>Start a game</h2><p>Pick a board, choose versus or co-op and set the stakes. You'll get a 4-letter code to send.</p><div class="grow"></div><button class="btn big" id="hStart">Start a game</button></div>
  <div class="panel action"><div class="label">Have a code?</div><h2>Join a game</h2><p>Type the code ${esc(them)} sent you.</p><div class="grow"></div><input type="text" class="code-input" id="hCode" maxlength="4" placeholder="ABCD" autocomplete="off" aria-label="Game code"><button class="btn ghost" id="hJoin">Join game</button></div>
  <div class="panel action"><div class="label">Daily · play anytime</div><h2>Daily Thaw</h2><p id="hDaily">One five-letter word a day, six tries. See each other's results once you've both played.</p><div class="grow"></div><button class="btn ghost" id="hDailyBtn">Play today's word</button></div>
 </div>
 <div class="home-lower">
  <div class="panel stack"><h3>Games in progress</h3><div class="list" id="hGames"><div class="empty">Looking for games…</div></div></div>
  <div class="panel stack"><div class="row" style="justify-content:space-between"><h3>Rivalry</h3><button class="btn ghost small" id="hLedger">Open the ledger</button></div><div id="hRivalry" class="muted">Loading…</div>
   <div class="row"><button class="btn ghost small" id="hWrite">Write a question for ${esc(them)}</button><button class="btn ghost small" id="hHow">How to play</button>${window.CNBackend&&CNBackend.configured()?'<button class="btn ghost small" id="hHouse">House key</button>':''}</div></div>
 </div>`;
 $$('[data-me]',el).forEach(b=>b.onclick=()=>{setMe(b.dataset.me);renderHome()});
 $('#hStart').onclick=()=>needMe(openSetup);
 $('#hJoin').onclick=()=>needMe(()=>{const c=$('#hCode').value.trim().toUpperCase();if(c.length!==4)return toast('Codes are 4 letters.');joinRoom(c)});
 $('#hCode').onkeydown=e=>{if(e.key==='Enter')$('#hJoin').click()};
 $('#hDailyBtn').onclick=()=>needMe(openDaily);
 $('#hLedger').onclick=openLedger;$('#hHouse')&&($('#hHouse').onclick=()=>renderHouse());$('#hWrite').onclick=()=>needMe(openWrite);$('#hHow').onclick=showHowTo;
 if(DB)fillHome();
}
function needMe(fn){if(ME)return fn();toast('First, tap who is playing on this device.');$('.seg')?.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:300})}
async function fillHome(){
 try{const qs=await DB.collection('rooms').orderBy('createdAt','desc').limit(8).get();const live=qs.docs.map(d=>d.data()).filter(r=>r&&r.phase!=='over');
  $('#hGames').innerHTML=live.length?live.map(r=>`<div class="list-item"><div><b>${esc(r.code)}</b> <span class="muted">· ${r.board==='territory'?'Territory':'Fireside'} · ${r.mode==='coop'?'Co-op':'Versus'}${r.phase==='lobby'?' · waiting to start':` · turn ${r.turnNo+1}`}</span></div><button class="btn small" data-join="${esc(r.code)}">Rejoin</button></div>`).join(''):'<div class="empty">No games running. Start one and send the code.</div>';
  $$('[data-join]').forEach(b=>b.onclick=()=>needMe(()=>joinRoom(b.dataset.join)));
 }catch(e){$('#hGames').innerHTML='<div class="empty">Could not load games.</div>'}
 const L=await loadLedger();const v=L.wins;
 $('#hRivalry').innerHTML=L.games?`<div class="h2h"><div class="row">${dot('bruce')}<b class="num" style="font-family:var(--display);font-size:30px">${v.bruce}</b></div><span class="muted">${L.games} game${L.games===1?'':'s'} · ${L.ties} tie${L.ties===1?'':'s'}</span><div class="row"><b class="num" style="font-family:var(--display);font-size:30px">${v.meredith}</b>${dot('meredith')}</div></div><div class="bar2"><i style="width:${(v.bruce/Math.max(1,v.bruce+v.meredith))*100}%;background:var(--bruce)"></i><i style="flex:1;background:var(--meredith)"></i></div><div class="muted" style="margin-top:8px;font-size:14px">Co-op: ${L.coop.wins} of ${L.coop.games} storms survived</div>`:'<span class="muted">No games yet. The first win starts the rivalry.</span>';
 try{const d=todayKey();const mine=await DB.doc(`daily/${d}/plays/${ME||'x'}`).get();const theirs=ME?await DB.doc(`daily/${d}/plays/${other(ME)}`).get():null;
  const md=mine.exists&&mine.data().done,td=theirs&&theirs.exists&&theirs.data().done;
  $('#hDaily').textContent=md?(td?`You've both played today. Open it to compare.`:`Done for today. Waiting on ${NAME[other(ME)]}.`):td?`${NAME[other(ME)]} already played today. Your turn.`:'One five-letter word a day, six tries. See each other\'s results once you\'ve both played.';}catch(e){}
}
function showHowTo(){const o=$('#overlay');o.hidden=false;OVKEY='howto';o.innerHTML=`<div class="qcard flip howto" style="--c:var(--ember)"><button class="icon-btn close-x" id="hx" aria-label="Close">✕</button><h2 style="margin-bottom:12px">How to play</h2><ol>
 <li><b>Start a game</b> and send the 4-letter code. Both of you open this page and join with it.</li>
 <li><b>On your turn</b>, pick a glowing tile (Territory) or a gift on the mantel (Fireside). The icon is the category. The dots are difficulty: 1 Easy to 4 Expert. Harder means more points.</li>
 <li><b>Trivia</b> (Knowledge, Music, Theatre, Science): you answer first. Miss it, and the other player can steal. <b>Tunes and Word Play</b> are races: you both answer, fastest correct answer wins. <b>Guess Each Other</b>: they answer about themselves, you guess what they picked.</li>
 <li><b>Lanterns</b> mark mystery tiles and plaid gifts mark mystery gifts. Win one to reveal a bonus or a trap. Some bonuses are sabotage cards you can play on each other at the start of your turn.</li>
 <li><b>Co-op</b>: you both answer every question. Right answers add logs; misses and the storm burn them. Keep the fire going.</li>
 <li>Easy and Medium questions are multiple choice; Hard and Expert you type. Small typos are fine.</li></ol></div>`;$('#hx').onclick=closeOverlay;}

/* ---------- setup ---------- */
let SETUP={board:'territory',mode:'versus',season:'winter',ai:true,stakes:''};
async function openSetup(){
 show('setup');const L=LEDGER||await loadLedger();const el=$('#scr-setup');const them=NAME[other(ME)];
 const ch=(k,v,t,d,extra='')=>`<button class="choice" data-k="${k}" data-v="${v}" aria-pressed="${SETUP[k]===v}" ${extra}><b>${t}</b><span>${d}</span></button>`;
 el.innerHTML=`<div class="setup">
  <div><div class="label">New game</div><h1 style="font-size:40px">Set the table</h1></div>
  <div class="panel stack"><h3>Board</h3><div class="choice-grid">
   ${ch('board','territory','Territory','A 3D map of 25 tiles around the cabin. Win a round to claim a tile. Most points of land wins. About 45–60 minutes.')}
   ${ch('board','fireside','Fireside','No map. Five wrapped gifts on the mantel; open one each turn. 16 rounds, scored on the chalk slate. About 30–40 minutes.')}
  </div></div>
  <div class="panel stack"><h3>How you play</h3><div class="choice-grid">
   ${ch('mode','versus','Versus','Head to head with steals, races and sabotage cards.')}
   ${ch('mode','coop','Co-op · Survive the storm','Answer together. Right answers feed the fire; misses and the storm burn it down.')}
  </div></div>
  <div class="panel stack"><h3>Season</h3><p class="muted" style="margin:0">New seasons unlock as you play more games together (${L.games} played).</p><div class="season-grid">
   ${SEASONS.map(s=>{const lock=L.games<s.need;return `<button class="choice" data-k="season" data-v="${s.id}" aria-pressed="${SETUP.season===s.id}" ${lock?'disabled':''}><div class="swatch" style="background:${s.sw}"></div><b style="font-size:16px">${s.n}</b><span>${lock?`Unlocks at ${s.need} games`:'Unlocked'}</span></button>`}).join('')}
  </div></div>
  <label class="toggle"><input type="checkbox" id="sAI" ${SETUP.ai&&AI_OK?'checked':''} ${AI_OK?'':'disabled'}><span><b>Mix in fresh questions written by Claude</b><br><span class="muted">${AI_OK?'Writes 48 new questions before the game starts (about a minute). Built-in questions fill any gaps.':'Not set up yet (add your Claude API key to the Worker). The built-in set has 230+ questions.'}</span></span></label>
  <div class="panel stack"><h3>Stakes <span class="muted" style="font-family:var(--body);font-size:14px">(optional)</span></h3>
   <input type="text" id="sStakes" maxlength="80" placeholder="Winner picks the next movie" value="${esc(SETUP.stakes)}">
   <div class="stake-chips">${['Winner picks the next movie','Loser writes a love note','Winner picks dinner','Loser plans the next date','Winner gets a 10-minute back rub'].map(s=>`<button data-stake="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>
  <div id="sGen" class="panel stack" hidden><h3>Writing fresh questions…</h3><div class="progress"><i id="sBar"></i></div><div class="row" style="justify-content:space-between"><span class="muted" id="sCount">Asking Claude…</span><button class="btn ghost small" id="sSkip">Skip and use built-in questions</button></div></div>
  <div class="row" style="justify-content:space-between"><button class="btn ghost" id="sBack">Back</button><button class="btn big" id="sGo">Create game &amp; get a code</button></div>
 </div>`;
 $$('[data-k]',el).forEach(b=>b.onclick=()=>{if(b.disabled)return;SETUP[b.dataset.k]=b.dataset.v;$$(`[data-k="${b.dataset.k}"]`,el).forEach(x=>x.setAttribute('aria-pressed',x===b))});
 $$('[data-stake]',el).forEach(b=>b.onclick=()=>{$('#sStakes').value=b.dataset.stake});
 $('#sBack').onclick=()=>{show('home');renderHome()};
 $('#sGo').onclick=async()=>{
  SETUP.stakes=$('#sStakes').value.trim();SETUP.ai=$('#sAI').checked;const go=$('#sGo');go.disabled=true;
  let aiQs=[];
  if(SETUP.ai&&AI_OK){const box=$('#sGen');box.hidden=false;const ctl=new AbortController();$('#sSkip').onclick=()=>ctl.abort();
   try{aiQs=await generateAI(n=>{$('#sBar').style.width=Math.min(100,n/48*100)+'%';$('#sCount').textContent=`${n} of 48 written`},ctl.signal);toast(`${aiQs.length} fresh questions added.`)}
   catch(e){if(e&&e.code!=='cancelled')toast(e&&e.code==='forbidden'?'The Worker rejected your house key. Using the built-in set.':'Could not write fresh questions this time. Using the built-in set.')}
   box.hidden=true}
  try{const code=await newCode();const R=newState(code,{...SETUP,aiQs});await DB.doc('rooms/'+code).set(R);await joinRoom(code)}catch(e){toast('Could not create the game. Check your connection and try again.')}
  go.disabled=false;
 };
}
async function newCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ';for(let i=0;i<20;i++){const c=Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join('');const s=await DB.doc('rooms/'+c).get();if(!s.exists)return c}throw new Error('no code')}

/* ---------- room join / subscribe ---------- */
function leaveRoom(){if(unsubRoom)unsubRoom();if(unsubAns)unsubAns();unsubRoom=unsubAns=null;ROOM=null;CODE=null;ANS={};BUILT=null;LOCAL={};SEL=null;closeOverlay();}
async function joinRoom(code){
 let snap;try{snap=await DB.doc('rooms/'+code).get()}catch(e){return toast('Could not reach the game. Check your connection.')}
 if(!snap.exists)return toast(`No game found with code ${code}.`);
 leaveRoom();CODE=code;show('game');$('#hud').innerHTML='';$('#stage').innerHTML='';$('#dock').innerHTML='';SEEN=new Set();
 const R=snap.data();
 try{if(PRACTICE())await DB.doc('rooms/'+code).update({seats:{bruce:'local',meredith:'local'}});else if(R.seats[ME]!==(UID||'guest'))await DB.doc('rooms/'+code).update({seats:{[ME]:UID||'guest'}})}catch(e){}
 unsubRoom=DB.doc('rooms/'+code).onSnapshot(s=>{if(!s.exists){toast('That game was removed.');return}ROOM=s.data();onRoom()},()=>toast('Lost the live connection. Reload the page to reconnect.'));
 unsubAns=DB.collection('rooms/'+code+'/answers').onSnapshot(qs=>{ANS={};qs.docs.forEach(d=>{ANS[d.id]=d.data()});onAnswers()},()=>{});
}
function onAnswers(){if(!ROOM)return;maybeResolve();if(ROOM.phase==='round'){renderOverlay();renderDock()}}
let lastPhaseKey=null;
function onRoom(){
 const R=ROOM;const pk=R.phase+'|'+(R.last&&R.last.rid)+'|'+R.turn;
 if(pk!==lastPhaseKey){
  if(R.phase==='reveal'&&R.last&&lastPhaseKey!==null){const me=PRACTICE()?null:ME;const won=R.mode==='coop'?!!R.last.claim:(me?R.last.claim===me:!!R.last.claim);sfx(R.last.claim?(won?'claim':'bad'):'bad')}
  if(R.phase==='pick'&&!PRACTICE()&&R.turn===ME&&lastPhaseKey!==null)sfx('turn');
  lastPhaseKey=pk;
 }
 render();maybeResolve();
}

/* ---------- game render ---------- */
function render(){if(!ROOM)return;renderHud();renderStage();renderDock();renderOverlay()}
function renderHud(){
 const R=ROOM;const el=$('#hud');const activeSeat=R.phase==='round'&&R.round?R.round.active:R.turn;const live=['pick','round','reveal'].includes(R.phase);
 const plate=(s,right)=>{const tiles=R.slots.filter(t=>t.owner===s).length;const st=Object.values(R.stats[s]||{}).reduce((a,v)=>a+v[0],0);
  const sub=R.mode==='coop'?`${st} correct`:R.board==='territory'?`${tiles} tile${tiles===1?'':'s'} · ${R.cards[s].length} card${R.cards[s].length===1?'':'s'}`:`${R.cards[s].length} card${R.cards[s].length===1?'':'s'}`;
  const fx=R.effects[s];const warn=R.mode==='versus'?[fx.skip&&'snowed in',fx.blizzard&&'blizzard',fx.fuse&&'short fuse',fx.fog&&'fogged'].filter(Boolean):[];
  return `<div class="plate ${s} ${right?'right':''} ${live&&activeSeat===s?'active':''}">${dot(s)}<div class="meta"><div class="row" style="gap:8px;${right?'justify-content:flex-end':''}"><span class="name">${NAME[s]}${s===ME&&!PRACTICE()?' (you)':''}</span><span class="turnpill">${live&&activeSeat===s?'Turn':'Waiting'}</span></div><div class="sub">${sub}${warn.length?` · <span style="color:#ffd08a">${warn.join(', ')}</span>`:''}</div></div>${R.mode==='versus'?`<div class="score num">${score(R,s)}</div>`:''}</div>`};
 let center;
 if(R.mode==='coop'){const w=Math.max(0,R.wood);center=`<div class="center-hud"><span class="label">Firewood</span><div class="wood" aria-label="${w} logs">${Array.from({length:Math.max(12,w)},(_,i)=>`<i class="${i<w?'':'out'}"></i>`).join('')}</div><span class="muted" style="font-size:13px">${R.board==='territory'?`${R.slots.filter(t=>t.owner).length}/25 claimed · turn ${R.turnNo+1}/${R.maxTurns}`:`Round ${Math.min(R.turnNo+1,R.maxTurns)} of ${R.maxTurns}`}</span></div>`}
 else center=`<div class="center-hud"><span class="label">${R.board==='territory'?'Territory':'Fireside'} · Versus</span><span class="big num">${R.board==='territory'?`${R.slots.filter(t=>!t.owner).length} tiles open`:`Round ${Math.min(R.turnNo+1,R.maxTurns)} of ${R.maxTurns}`}</span><span class="muted" style="font-size:13px">Code ${esc(R.code)}</span></div>`;
 el.innerHTML=plate('bruce')+center+plate('meredith',true);
}
function canPick(){const R=ROOM;return R.phase==='pick'&&(PRACTICE()||R.turn===ME)}
function renderStage(){
 const R=ROOM;const st=$('#stage');
 if(R.phase==='lobby'){BUILT=null;return renderLobby(st)}
 if(R.board==='territory'){
  const key=R.code+R.season;if(BUILT!==key){buildBoard(st);BUILT=key}
  updateBoard();
 }else{BUILT=null;renderFireside(st)}
}
function legendHTML(){return `<div class="legend" aria-label="Legend">${Object.keys(CATS).map(c=>`<span class="lg">${icon(c)}${CATS[c].short}</span>`).join('')}<span class="lg" style="padding-left:9px">${pips(2)} difficulty</span></div>`}
const TREE_SVG=`<svg viewBox="0 0 26 42"><rect x="11.5" y="33" width="3" height="9" fill="var(--trunk)"/><path d="M13 0 25 18H18L24 28H16L22 36H4L10 28H2L8 18H1Z" fill="var(--tree1)"/><path d="M13 0 25 18H18L24 28H16L22 36H13Z" fill="var(--tree2)" opacity=".55"/><path d="M13 0 18 8 15 7 13 9 11 7 8 8Z" fill="var(--snowcap)"/></svg>`;
const ROCK_SVG=`<svg viewBox="0 0 30 20"><path d="M2 20 7 8 13 4 20 7 27 12 29 20Z" fill="#7d8b95"/><path d="M13 4 20 7 27 12 29 20H16Z" fill="#5d6a73"/><path d="M7 8 13 4 20 7 15 9 10 10Z" fill="var(--snowcap)"/></svg>`;
const CABIN_SVG=`<svg viewBox="0 0 56 50"><path d="M4 26 28 8l24 18v24H4z" fill="#7a4f33"/><path d="M4 32h48M4 38h48M4 44h48" stroke="#5a3824" stroke-width="2"/><path d="M0 28 28 6l28 22-4 3L28 12 4 31z" fill="var(--snowcap)" stroke="#e9eef1" stroke-width="1"/><rect x="38" y="6" width="7" height="12" fill="#5d6064"/><rect x="12" y="32" width="10" height="8" fill="#ffc46b"/><rect x="31" y="36" width="9" height="14" fill="#3a2618"/></svg><span class="smoke"></span><span class="smoke b"></span><span class="smoke c"></span>`;
function badgeHTML(t){
 if(t.owner)return `<div class="bb flag" style="left:calc(50% - var(--s)*.25);top:calc(50% - var(--s)*.85);--fc:var(--${t.owner})"><span class="pole"></span><span class="cloth">${t.owner==='team'?'★':NAME[t.owner][0]}</span></div>`;
 return `<div class="bb badge" style="left:calc(50% - var(--s)*.25);top:calc(50% - var(--s)*.66);--c:${CATS[t.cat].c};--d:${(t.x*3+t.y*7)%10*.3}s"><div class="float"><div class="disc">${ICON[t.cat]}</div>${pips(t.tier)}</div>${t.mystery&&!t.revealed?'<span class="lantern">?</span>':''}</div>`;
}
function buildBoard(st){
 const R=ROOM;const tvar={meadow:'meadow',pines:'pines',lake:'lake',ridge:'ridge',peak:'ridge'};
 st.innerHTML=legendHTML()+`<div class="scene" data-season="${R.season}"><div class="board" id="board">${R.slots.map(t=>{const v=tvar[t.terrain];
  const deco=t.deco.map(({k,x:px,y:py,s:sc})=>k==='tree'?`<div class="bb tree" style="left:calc(${px*100}% - var(--s)*${.13*sc});top:calc(${py*100}% - var(--s)*${.42*sc});width:calc(var(--s)*${.26*sc});height:calc(var(--s)*${.42*sc})">${TREE_SVG}</div>`:`<div class="bb rock" style="left:calc(${px*100}% - var(--s)*.15);top:calc(${py*100}% - var(--s)*.2)">${ROCK_SVG}</div>`).join('');
  const cabin=t.cabin?`<div class="bb cabin-deco" style="left:calc(30% - var(--s)*.27);top:calc(26% - var(--s)*.5)">${CABIN_SVG}</div>`:'';
  return `<div class="tile ${t.terrain} enter" data-id="${t.id}" role="button" tabindex="-1" aria-label="${CATS[t.cat].name}, ${TIER[t.tier].n}" style="left:calc(var(--s)*${t.x});top:calc(var(--s)*${t.y});--h:calc(var(--s)*${(t.h/96).toFixed(3)});--top:var(--${v});--side:var(--${v}-s);--d:${(t.x+t.y)*70}ms"><div class="fe"></div><div class="fs"></div><div class="top"><i class="mark" style="--c:${CATS[t.cat].c}"></i></div>${deco}${cabin}<div class="slotbb" data-owner="">${badgeHTML(t)}</div></div>`}).join('')}</div></div>`;
 $('#board').onclick=e=>{const tile=e.target.closest('.tile');if(!tile||!tile.classList.contains('can'))return;SEL=tile.dataset.id;updateBoard();renderDock()};
 $('#board').onkeydown=e=>{if(e.key!=='Enter'&&e.key!==' ')return;const tile=e.target.closest('.tile');if(!tile||!tile.classList.contains('can'))return;e.preventDefault();SEL=tile.dataset.id;updateBoard();renderDock();$('#dPlay')&&$('#dPlay').focus()};
 setTimeout(()=>$$('.tile.enter').forEach(t=>t.classList.remove('enter')),1800);
}
function updateBoard(){
 const R=ROOM;const can=canPick();const lostId=R.last&&R.last.mys&&R.last.mys.lost;
 for(const t of R.slots){const el=$(`.tile[data-id="${t.id}"]`);if(!el)continue;
  const open=!t.owner;el.classList.toggle('can',can&&open);el.classList.toggle('sel',SEL===t.id);
  P.concat('team').forEach(s=>el.classList.toggle('own-'+s,t.owner===s));
  el.classList.toggle('dim',R.phase==='pick'&&can&&!open);
  const holder=el.querySelector('.slotbb');const sig=(t.owner||'')+'|'+(t.revealed?1:0);
  if(holder.dataset.owner!==sig){const first=holder.dataset.owner==='';holder.dataset.owner=sig;holder.innerHTML=badgeHTML(t);if(!first&&t.owner){el.classList.add('claimed-now');setTimeout(()=>el.classList.remove('claimed-now'),1000)}}
  el.setAttribute('tabindex',can&&open?'0':'-1');
 }
 if(lostId){}
}
function renderFireside(st){
 const R=ROOM;const can=canPick();const w=Math.max(0,R.wood);const fire=R.mode==='coop'?Math.max(.25,Math.min(1.25,w/8)):1;
 const slate=R.mode==='versus'?`<div class="slate"><div class="t">Chalk slate · round ${Math.min(R.turnNo+1,R.maxTurns)} of ${R.maxTurns}</div>${P.map(s=>`<div class="r"><span>${NAME[s]}</span><b class="num">${R.scores[s]}</b></div><div class="tally">${'/'.repeat(Math.min(30,R.scores[s]))}</div>`).join('')}</div>`
  :`<div class="slate"><div class="t">Survive the storm</div><div class="r"><span>Logs</span><b class="num">${w}</b></div><div class="r"><span>Round</span><b class="num">${Math.min(R.turnNo+1,R.maxTurns)}/${R.maxTurns}</b></div></div>`;
 const gifts=R.slots.map((g,i)=>{const fresh=!SEEN.has(g.id);SEEN.add(g.id);return `<button class="gift ${g.mystery?'mys':''} ${can?'can':''} ${SEL===g.id?'sel':''} ${fresh?'enter':''}" data-id="${g.id}" ${can?'':'disabled'} style="--gc:${CATS[g.cat].c};--d:${i*90}ms" aria-label="${CATS[g.cat].name}, ${TIER[g.tier].n}${g.mystery?', mystery gift':''}"><div class="box"><div class="rt"></div><div class="f"></div><div class="tp"></div></div><span class="tag">${icon(g.cat)}${pips(g.tier)}${g.mystery?' <b style="color:#ffd08a">?</b>':''}</span></button>`}).join('');
 st.innerHTML=`<div class="fireside">${slate}<div class="hearth"><div class="mantel">${gifts}</div><div class="shelf"></div><div class="firebox"><div class="logs"></div><div style="position:absolute;inset:0;transform-origin:50% 100%;transform:scale(${fire})"><div class="flame a"></div><div class="flame b"></div><div class="flame c"></div></div></div><div class="hearth-glow" style="opacity:${fire}"></div></div><div class="fs-window" aria-hidden="true">${Array.from({length:22},(_,i)=>`<i style="left:${(i*37)%100}%;animation-duration:${4+(i%5)}s;animation-delay:-${i*.7}s"></i>`).join('')}</div></div>`;
 $$('.gift.can',st).forEach(b=>b.onclick=()=>{SEL=b.dataset.id;renderStage();renderDock()});
}
function renderLobby(st){
 const R=ROOM;const both=R.seats.bruce&&R.seats.meredith;
 st.innerHTML=`<div class="lobby"><div class="label">Send this code to ${esc(NAME[other(ME)])}</div><div class="codebox" aria-label="Game code ${esc(R.code)}">${R.code.split('').map((c,i)=>`<span style="animation-delay:${i*80}ms">${c}</span>`).join('')}</div>
  <button class="btn ghost small" id="lCopy">Copy code</button>
  <div class="seats">${P.map(s=>`<div class="seatcard">${dot(s)}<div style="text-align:left"><b>${NAME[s]}</b><div class="muted" style="font-size:13px">${R.seats[s]?'At the table':'Not here yet'}</div></div></div>`).join('')}</div>
  <div class="muted">${R.board==='territory'?'Territory':'Fireside'} · ${R.mode==='coop'?'Co-op':'Versus'} · ${SEASONS.find(s=>s.id===R.season).n}${R.aiQs&&R.aiQs.length?` · ${R.aiQs.length} fresh questions`:''}</div>
  ${R.stakes?`<div class="stakes">Stakes: ${esc(R.stakes)}</div>`:''}
  <button class="btn big" id="lStart" ${both||PRACTICE()?'':'disabled'}>${both||PRACTICE()?'Light the fire &amp; start':`Waiting for ${esc(NAME[R.seats.bruce?'meredith':'bruce'])}…`}</button>
  <p class="muted" style="font-size:14px;max-width:46ch">${NAME[R.turn]} goes first. Either of you can start once you're both here.</p></div>`;
 $('#lCopy').onclick=()=>{navigator.clipboard?.writeText(R.code).then(()=>toast('Code copied.'),()=>toast('Copy failed. The code is '+R.code))};
 $('#lStart').onclick=async()=>{const N=clone(ROOM);N.phase='pick';await setRoom(N);sfx('turn')};
}
function renderDock(){
 const R=ROOM;const el=$('#dock');if(!R)return;
 if(R.phase==='lobby'){el.innerHTML=`<div class="status"><div class="say">Waiting at the door</div><div class="hint">Share the code. The game starts when you both press start.</div></div><div class="dock-actions"><button class="btn ghost small" id="dHome">Leave</button></div>`;$('#dHome').onclick=goHome;return}
 const act=actingSeat();const mine=PRACTICE()||R.turn===ME;let say='',hint='',acts='';
 if(R.phase==='pick'){
  if(mine){
   if(SEL){const t=R.slots.find(s=>s.id===SEL);if(t){say=`${CATS[t.cat].name} · ${TIER[t.tier].n}`;hint=`${t.tier} point${t.tier>1?'s':''}${t.mystery&&!t.revealed?' · mystery inside':''}${R.effects[R.turn].blizzard?' · Blizzard: question will be one step harder':''}`;acts=`<button class="btn ghost" id="dCancel">Choose another</button><button class="btn big" id="dPlay">${R.board==='territory'?'Play this tile':'Open this gift'}</button>`}}
   else{say=`${PRACTICE()?NAME[R.turn]+"'s":'Your'} turn: ${R.board==='territory'?'pick a glowing tile':'choose a gift'}`;hint=R.board==='territory'?'The icon shows the category. More dots means harder and more points.':'More dots means harder and more points. Plaid paper hides a surprise.';}
  }else{say=`${NAME[R.turn]} is choosing…`;const fx=R.effects[ME];hint=fx&&(fx.blizzard||fx.fuse||fx.fog||fx.skip)?`Heads up: ${[fx.skip&&'you\'re snowed in next turn',fx.blizzard&&'Blizzard is waiting for you',fx.fuse&&'Short Fuse is waiting for you',fx.fog&&'your next question is fogged'].filter(Boolean).join('; ')}.`:'You can look around the map while you wait.'}
 }else if(R.phase==='round'){say='Question in play';hint='Answer in the card.';acts=`<button class="btn ghost small" id="dShow">Show question</button>`}
 else if(R.phase==='reveal'){const L=R.last;say=L?L.headline:'';const nextMine=PRACTICE()||R.turn===ME;hint=L&&L.skipped?`${NAME[L.skipped]} is snowed in, so ${NAME[R.turn]} goes again.`:`Next up: ${NAME[R.turn]}.`;acts=nextMine?`<button class="btn big" id="dNext">${PRACTICE()?`Start ${NAME[R.turn]}'s turn`:'Start my turn'}</button>`:`<span class="muted">Waiting for ${NAME[R.turn]}…</span>`}
 else if(R.phase==='over'){say='Game over';acts=`<button class="btn" id="dOver">See results</button>`}
 const hand=R.mode==='versus'&&R.phase==='pick'&&mine?R.cards[R.turn]:[];
 el.innerHTML=`<div class="status"><div class="say">${esc(say)}</div><div class="hint">${esc(hint)}</div>
  ${hand.length?`<div class="hand" style="margin-top:8px">${hand.map((k,i)=>`<div class="scard"><b>${SAB[k].n}</b><span>${esc(SAB[k].d(NAME[other(R.turn)]))}</span><button class="btn small ghost" data-card="${i}" ${R.playedCard?'disabled':''}>${R.playedCard?'One card per turn':`Use on ${NAME[other(R.turn)]}`}</button></div>`).join('')}</div>`:''}</div>
  <div class="dock-actions">${R.stakes?`<span class="stakes" title="Stakes">${esc(R.stakes)}</span>`:''}${acts}<button class="btn ghost small" id="dHow">Rules</button><button class="btn ghost small" id="dHome">Leave</button></div>`;
 $('#dHome').onclick=goHome;$('#dHow').onclick=showHowTo;
 $('#dCancel')&&($('#dCancel').onclick=()=>{SEL=null;renderStage();renderDock()});
 $('#dPlay')&&($('#dPlay').onclick=async e=>{e.target.disabled=true;await pickSlot(SEL).catch(()=>{e.target.disabled=false})});
 $('#dNext')&&($('#dNext').onclick=e=>{e.target.disabled=true;startTurn()});
 $('#dShow')&&($('#dShow').onclick=()=>{OVKEY=null;renderOverlay(true)});
 $('#dOver')&&($('#dOver').onclick=()=>{HIDE_REVEAL=null;OVKEY=null;renderOverlay(true)});
 $$('[data-card]').forEach(b=>b.onclick=()=>playCard(+b.dataset.card));
}
function goHome(){leaveRoom();show('home');renderHome()}

/* ---------- overlay: question / reveal / over ---------- */
function stopTimer(){if(TIMER){clearInterval(TIMER);TIMER=null}}
let AUD=null;function clipPlayer(url){if(!AUD)AUD=new Audio();if(AUD.dataset.src!==url){AUD.dataset.src=url;AUD.src=url;AUD.preload='auto'}return AUD}
const CLIPCACHE={};async function resolveAudio(src){if(!src||!src.startsWith('clip:'))return src;if(CLIPCACHE[src])return CLIPCACHE[src];try{const s=await DB.doc('clips/'+src.slice(5)).get();const d=s.exists?s.data().data:null;if(d)CLIPCACHE[src]=d;return d}catch(e){return null}}
function stopClip(){if(AUD){try{AUD.pause()}catch(e){}}clearTimeout(LOCAL.clipT)}
function srcChip(q){return q.src==='ai'?'<span class="chip src">Fresh · by Claude</span>':q.src==='custom'?`<span class="chip src">Written by ${NAME[q.by]}</span>`:'<span class="chip src">Built-in</span>'}
function renderOverlay(force){
 const R=ROOM;const o=$('#overlay');if(!R){return}
 if(R.phase==='round'&&R.round){
  const r=R.round;const s=actingSeat();const role=roleOf(R,s);const mineDone=hasAns(R,s);
  const lk=r.id+r.stage+'|'+s;
  if(LOCAL.key!==lk){stopTimer();stopClip();LOCAL={key:lk,submitted:mineDone,startT:performance.now(),played:0,handed:!PRACTICE()}}
  if(HIDE_REVEAL===lk&&!force)return;
  const need=needSeats(R).map(x=>x+(hasAns(R,x)?1:0)).join();
  const key=`round|${lk}|${role}|${LOCAL.submitted}|${need}|${LOCAL.handed}`;
  if(key===OVKEY&&!force)return;
  const prev=OVKEY;OVKEY=key;o.hidden=false;o.innerHTML=questionCard(R,s,role,!(prev&&prev.startsWith('round|'+lk+'|')));wireQuestion(R,s,role);return;
 }
 if(R.phase==='reveal'&&R.last){stopClip();const key='reveal|'+R.last.rid+'|'+R.turn;if(HIDE_REVEAL===key&&!force){return}if(key===OVKEY&&!force)return;OVKEY=key;stopTimer();o.hidden=false;o.innerHTML=revealCard(R);wireReveal(R,key);return}
 if(R.phase==='over'){const key='over|'+R.code+'|'+(R.next||'');if(HIDE_REVEAL===key&&!force)return;if(key===OVKEY&&!force)return;OVKEY=key;stopTimer();o.hidden=false;o.innerHTML=overCard(R);wireOver(R,key);return}
 if(OVKEY&&OVKEY!=='howto')closeOverlay();
}
function qHead(R,q,r){const pts=R.slots.find(t=>t.id===r.slotId);return `<div class="qhead">${icon(r.cat,34)}<div><div class="cat">${CATS[r.cat].name}</div><div class="row" style="gap:8px;font-size:13px">${pips(q.tier)}<span class="muted">${TIER[q.tier].n}${pts?` · ${pts.tier} pt${pts.tier>1?'s':''}`:''}${r.fx&&r.fx.blizzard?' · Blizzard!':''}</span></div></div>${srcChip(q)}<div class="timer" id="tmr" hidden><svg viewBox="0 0 54 54"><circle class="bg" cx="27" cy="27" r="23"/><circle class="fg" cx="27" cy="27" r="23" stroke-dasharray="144.5" stroke-dashoffset="0"/></svg><b>--</b></div></div>`}
function questionCard(R,s,role,doFlip){
 const r=R.round,q=r.q;const them=other(s);const act=r.active;
 if(PRACTICE()&&role!=='watch'&&!LOCAL.handed){return `<div class="qcard flip hand-over" style="--c:${CATS[r.cat].c}">${dot(s)}<h2>${NAME[s]}'s answer</h2><p class="muted">Hand the laptop to ${NAME[s]} so ${NAME[them]} can't peek.</p><button class="btn big" id="qHand">I'm ${NAME[s]}, show me</button></div>`}
 let body='';
 const text=q.kind==='us'?(role==='predict'?`What would ${NAME[them]} pick?`:role==='self'?'Answer about yourself, honestly.':'Guess Each Other'):'';
 if(q.kind==='us'){body+=`<div class="qtext">${esc(q.text.replace(/\{them\}/g,role==='self'?NAME[s]:NAME[r.active===s?them:other(r.active)]))}</div><p class="muted" style="margin-top:-8px">${esc(text)}</p>`}
 else if(q.kind==='anagram'||q.kind==='vowel'){body+=`<div class="qtext">${esc(q.text)}</div><div class="letters">${q.shown.split('').map((c,i)=>c===' '?'<span class="gap"></span>':`<span style="animation-delay:${i*60}ms">${esc(c)}</span>`).join('')}</div><p class="muted" style="margin:-6px 0 14px;text-align:center">Hint: ${esc(q.hint)}</p>`}
 else if(q.kind==='tune'){body+=`<div class="qtext">${esc(q.text)}</div><div class="musicbox"><div class="drum" id="drum"></div><div class="bars" id="bars" style="--c:${CATS.tune.c}"><i></i><i></i><i></i><i></i><i></i></div><button class="btn ghost small" id="qReplay">Play again</button></div>${q.src==='deezer'?'<p class="muted" style="font-size:12px;text-align:center;margin:-10px 0 14px">Preview courtesy of Deezer</p>':''}`}
 else body+=`<div class="qtext">${esc(q.text)}</div>`;
 if(r.stage==='steal'){const miss=r.res&&r.res[act];body=`<div class="mys bad" style="animation:none;margin-bottom:12px"><div><b>${NAME[act]} answered “${esc(miss&&miss.v||'nothing')}”, which is wrong.</b><br><span class="muted">${s===other(act)&&role==='answer'?'Steal it! Get it right and it\'s yours.':`${NAME[other(act)]} gets one shot to steal.`}</span></div></div>`+body}
 let ans='';
 if(role==='watch'){const who=needSeats(R).filter(x=>!hasAns(R,x));ans=`<div class="waiting" style="--c2:var(--${who[0]||'ember'})"><span class="pulse"></span>${who.length?`${who.map(x=>NAME[x]).join(' and ')} ${who.length>1?'are':'is'} answering…`:'Checking answers…'}</div>`;
  if(q.ch&&q.kind!=='us'&&needSeats(R).length&&!typedFor(R,needSeats(R)[0]))ans=`<div class="choices" aria-disabled="true">${q.ch.map((c,i)=>`<div class="opt" style="opacity:.7"><kbd>${i+1}</kbd>${esc(c)}</div>`).join('')}</div><div style="height:12px"></div>`+ans}
 else if(LOCAL.submitted){const mineA=ANS[ansId(r,s)];const wait=needSeats(R).filter(x=>!hasAns(R,x));ans=`<div class="waiting" style="--c2:var(--${s})"><span class="pulse"></span>Locked in${mineA&&mineA.v?`: “${esc(mineA.v)}”`:''}. ${wait.length?`Waiting for ${wait.map(x=>NAME[x]).join(' and ')}…`:'Checking…'}</div><div id="qStuck"></div>`}
 else if(q.kind==='us'){ans=`<div class="choices">${q.opts.map((c,i)=>`<button class="opt" data-v="${esc(c)}"><kbd>${i+1}</kbd>${esc(c)}</button>`).join('')}</div>`}
 else if(typedFor(R,s)){ans=`<form class="typed" id="qForm"><input type="text" id="qIn" autocomplete="off" placeholder="${q.kind==='tune'?'Song or piece title':'Your answer'}" aria-label="Your answer"><button class="btn" type="submit">Lock in</button></form>${r.fx&&r.fx.fog&&s===act&&r.stage==='main'?'<p class="muted" style="font-size:13px;margin:8px 0 0">Fogged Window: no choices this time.</p>':''}`}
 else ans=`<div class="choices">${q.ch.map((c,i)=>`<button class="opt" data-v="${esc(c)}"><kbd>${i+1}</kbd>${esc(c)}</button>`).join('')}</div>`;
 const flip=doFlip?'flip':'';
 return `<div class="qcard ${flip}" style="--c:${CATS[r.cat].c}">${qHead(R,q,r)}${body}${ans}</div>`;
}
function wireQuestion(R,s,role){
 const r=R.round,q=r.q;
 const hb=$('#qHand');if(hb){hb.onclick=()=>{LOCAL.handed=true;LOCAL.startT=performance.now();OVKEY=null;renderOverlay(true)};return}
 const playing=()=>{const d=$('#drum'),b=$('#bars');if(d)d.classList.add('playing');if(b)b.classList.add('on');return dur=>setTimeout(()=>{d&&d.classList.remove('playing');b&&b.classList.remove('on')},dur*1000)};
 const doPlay=()=>{if(q.audio||q.preview){const len=q.preview?(q.clip||10):20;clearTimeout(LOCAL.clipT);const done=playing();const key=LOCAL.key;resolveAudio(q.audio||q.preview).then(u=>{if(LOCAL.key!==key)return;if(!u){toast('That clip could not be loaded.');done(0);return}const a=clipPlayer(u);a.currentTime=0;a.play().catch(()=>toast('Tap Play again to hear the clip.'));a.onended=()=>done(0);LOCAL.clipT=setTimeout(()=>{a.pause();done(0)},len*1000)});return len}const t=TUNES.find(x=>x.id===q.tune);if(!t)return 0;const d=playTune(t);playing()(d);return d};
 if(q.kind==='tune'){$('#qReplay').onclick=()=>{if(LOCAL.played>=3)return toast('That was the last replay.');LOCAL.played++;doPlay()};}
 if(role==='watch'||LOCAL.submitted){if(q.kind==='tune'&&!LOCAL.played&&role==='watch'){LOCAL.played=1;doPlay()}if(LOCAL.submitted)watchStuck(R);return}
 // timer
 let extra=0;if(q.kind==='tune'&&!LOCAL.played){LOCAL.played=1;extra=doPlay()||(q.preview?(q.clip||10):q.audio?20:0)}
 let base=r.stage==='steal'?15:TIER[q.tier].time;if(r.fx&&r.fx.fuse&&s===r.active&&r.stage==='main')base=Math.ceil(base/2);
 if(!LOCAL.deadline)LOCAL.deadline=LOCAL.startT+(base+extra)*1000;
 const total=LOCAL.deadline-LOCAL.startT;const tm=$('#tmr');tm.hidden=false;const fg=tm.querySelector('.fg'),lbl=tm.querySelector('b');let lastSec=null;
 const tick=()=>{const left=Math.max(0,LOCAL.deadline-performance.now());const sec=Math.ceil(left/1000);lbl.textContent=sec;fg.style.strokeDashoffset=144.5*(1-left/total);tm.classList.toggle('low',sec<=5);if(sec<=5&&sec!==lastSec&&sec>0)sfx('tick');lastSec=sec;
  if(left<=0){stopTimer();const inp=$('#qIn');submit(inp?inp.value:'',!!inp)}};
 stopTimer();tick();TIMER=setInterval(tick,200);
 $$('.opt[data-v]').forEach(b=>b.onclick=()=>{$$('.opt').forEach(x=>x.classList.remove('picked'));b.classList.add('picked');submit(b.dataset.v,false)});
 const f=$('#qForm');if(f){const inp=$('#qIn');setTimeout(()=>inp.focus(),300);f.onsubmit=e=>{e.preventDefault();if(!inp.value.trim())return inp.focus();submit(inp.value.trim(),true)}}
 document.onkeydown=e=>{if($('#qIn')&&document.activeElement===$('#qIn'))return;const n=+e.key;if(n>=1&&n<=4){const b=$$('.opt[data-v]')[n-1];if(b)b.click()}};
}
function watchStuck(R){
 if(PRACTICE())return;const r=R.round;const t0=performance.now();stopTimer();
 TIMER=setInterval(()=>{const el=$('#qStuck');if(!el||!ROOM||ROOM.phase!=='round'){stopTimer();return}const waited=(performance.now()-t0)/1000;const all=needSeats(ROOM).every(x=>hasAns(ROOM,x));
  if(all&&ROOM.round.resolver!==ME&&waited>12&&!el.innerHTML){el.innerHTML=`<button class="btn ghost small" style="margin-top:10px" id="qForce">${NAME[ROOM.round.resolver]} seems away. Reveal the answer</button>`;$('#qForce').onclick=()=>roomRef().update({round:{resolver:ME}})}
  else if(!all&&waited>TIER[r.q.tier].time+25&&!el.innerHTML){const miss=needSeats(ROOM).filter(x=>!hasAns(ROOM,x));el.innerHTML=`<button class="btn ghost small" style="margin-top:10px" id="qSkip">Skip ${NAME[miss[0]]}'s answer</button>`;$('#qSkip').onclick=()=>{const rr=ROOM.round;miss.forEach(x=>DB.doc(`rooms/${CODE}/answers/${ansId(rr,x)}`).set({seat:x,v:'',typed:false,ms:1e9,rid:rr.id,stage:rr.stage,at:Date.now()}));if(rr.resolver!==ME)roomRef().update({round:{resolver:ME}})}}
 },1000);
}
function resLine(L,s){const x=L.res[s];if(!x)return'';const role=x.role==='truth'?'Their real answer':x.role==='guess'?'Guessed':x.steal?'Steal attempt':'Answered';
 const mark=x.role==='truth'?'':x.ok?'<span class="ok">✓ right</span>':'<span class="no">✗</span>';const sp=x.ms&&x.ms<1e8&&L.kind==='race'?` <span class="muted">${(x.ms/1000).toFixed(1)}s</span>`:'';
 return `<div class="pr">${dot(s)} <span class="muted" style="font-size:13px">${role}</span><div class="v">${x.v?esc(x.v):'<span class="muted">No answer</span>'} ${mark}${sp}</div></div>`}
function revealCard(R){
 const L=R.last;const showAns=L.q.kind!=='us';const nextMine=PRACTICE()||R.turn===ME;
 const coopLine=R.mode==='coop'?`<div class="muted">${L.woodDelta>0?`+${L.woodDelta} logs`:`${L.woodDelta} log`}${L.storm?' · the storm took 1 log':''} · ${Math.max(0,R.wood)} left</div>`:'';
 return `<div class="qcard flip" style="--c:${CATS[L.cat].c}"><div class="qhead">${icon(L.cat,34)}<div><div class="cat">${CATS[L.cat].name}</div><div class="row" style="gap:8px;font-size:13px">${pips(L.tier)}<span class="muted">${TIER[L.tier].n}</span></div></div></div>
 <div class="result"><div class="headline">${esc(L.headline)}</div>
 ${showAns?`<div class="answer-line"><span class="muted" style="font-size:13px">Answer</span><div style="font-weight:700;font-size:20px">${esc(L.q.a)}</div>${L.q.artist?`<div class="muted" style="font-size:14px">${esc(L.q.artist)}${L.q.show?` · from ${esc(L.q.show)}`:''}</div>`:''}<div class="muted" style="font-size:14px">${esc(L.q.text)}${L.q.shown?` <b>${esc(L.q.shown)}</b>`:''}</div></div>`:''}
 <div class="pl-res">${P.map(s=>resLine(L,s)).join('')}</div>${coopLine}
 ${L.mys?`<div class="mys ${L.mys.good?'':'bad'}"><span class="lamp"></span><div><b>${esc(L.mys.title)}</b><br><span class="muted">${esc(L.mys.text)}</span></div></div>`:''}
 ${L.skipped?`<div class="muted">${NAME[L.skipped]} is snowed in, so ${NAME[R.turn]} goes again.</div>`:L.extra?`<div class="muted">${NAME[R.turn]} takes another turn.</div>`:''}
 <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost" id="rView">See the ${R.board==='territory'?'map':'mantel'}</button>${nextMine?`<button class="btn" id="rNext">${PRACTICE()?`Start ${NAME[R.turn]}'s turn`:'Start my turn'}</button>`:`<span class="muted">Next: ${NAME[R.turn]}</span>`}</div></div></div>`;
}
function wireReveal(R,key){$('#rView').onclick=()=>{HIDE_REVEAL=key;closeOverlay()};const n=$('#rNext');if(n)n.onclick=()=>{n.disabled=true;startTurn()}}
function overCard(R){
 const res=R.result||{};let head,sub='';
 if(res.coop){head=res.win?'You survived the storm!':res.timeout?'Dawn came before the woods were claimed':'The fire went out';sub=res.win?`${res.wood} logs left${R.board==='territory'?` and all 25 tiles claimed`:''}.`:`You claimed ${res.claimed||0} tiles together. Try again?`}
 else{head=res.winner==='tie'?"It's a tie!":`${NAME[res.winner]} wins!`;if(R.stakes)sub=res.winner==='tie'?`Stakes (“${R.stakes}”) are a wash. Rematch?`:`Stakes: ${R.stakes}. ${NAME[res.winner]} collects.`}
 return `<div class="qcard flip" style="--c:var(--${res.coop?'team':res.winner==='tie'?'ember':res.winner})"><div class="result" style="text-align:center;justify-items:center"><div class="label">Game over</div><div class="headline" style="font-size:40px">${esc(head)}</div>
 ${res.coop?'':`<div class="over-scores">${P.map(s=>`<div class="s">${dot(s)}<b class="num">${res.scores[s]}</b><span class="muted">${NAME[s]}</span></div>`).join('')}</div>`}
 <p class="muted" style="margin:0">${esc(sub)}</p>
 <div class="row" style="justify-content:center">${R.next?`<button class="btn" id="oNext">Join the rematch (${esc(R.next)})</button>`:`<button class="btn" id="oRe">Rematch</button>`}<button class="btn ghost" id="oLedger">Open the ledger</button><button class="btn ghost" id="oHome">Home</button><button class="btn ghost" id="oView">See the board</button></div></div></div>`;
}
function wireOver(R,key){
 if(!wireOver.done)wireOver.done={};if(!wireOver.done[key]){wireOver.done[key]=1;const res=R.result||{};if(res.coop?res.win:(PRACTICE()||res.winner===ME||res.winner==='tie'))confetti()}
 $('#oHome').onclick=goHome;$('#oLedger').onclick=()=>{leaveRoom();openLedger()};$('#oView').onclick=()=>{HIDE_REVEAL=key;closeOverlay()};
 const re=$('#oRe');if(re)re.onclick=async()=>{re.disabled=true;try{const code=await newCode();const N=newState(code,{board:R.board,mode:R.mode,season:R.season,stakes:R.stakes,aiQs:(R.aiQs||[]).filter(x=>!R.used.includes(x.id))});await DB.doc('rooms/'+code).set(N);await roomRef().update({next:code});joinRoom(code)}catch(e){re.disabled=false;toast('Could not start a rematch.')}};
 const nx=$('#oNext');if(nx)nx.onclick=()=>joinRoom(R.next);
}

/* ---------- daily thaw ---------- */
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dailyWord(){const d=new Date();const n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);return DAILY[(n*7+3)%DAILY.length]}
function scoreGuess(g,w){const res=Array(5).fill('x');const left={};for(let i=0;i<5;i++){if(g[i]===w[i])res[i]='g';else left[w[i]]=(left[w[i]]||0)+1}for(let i=0;i<5;i++){if(res[i]!=='g'&&left[g[i]]){res[i]='y';left[g[i]]--}}return res}
let DSTATE=null,dUnsub=null;
async function openDaily(){
 show('daily');const key=todayKey(),word=dailyWord();const ref=DB.doc(`daily/${key}/plays/${ME}`);
 let s={guesses:[],done:false,won:false,started:Date.now()};try{const g=await ref.get();if(g.exists)s={...s,...g.data()}}catch(e){}
 DSTATE={key,word,ref,s,cur:'',partner:null};drawDaily();
 if(dUnsub)dUnsub();dUnsub=DB.doc(`daily/${key}/plays/${other(ME)}`).onSnapshot(p=>{DSTATE&&(DSTATE.partner=p.exists?p.data():null);drawDailySide()},()=>{});
 document.onkeydown=e=>{if(!DSTATE||$('#scr-daily').hidden)return;if(e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='Enter')dKey('enter');else if(e.key==='Backspace')dKey('back');else if(/^[a-z]$/i.test(e.key))dKey(e.key.toUpperCase())};
}
function drawDaily(){
 const D=DSTATE,el=$('#scr-daily');const rows=[];
 for(let r=0;r<6;r++){const g=D.s.guesses[r];const cur=r===D.s.guesses.length&&!D.s.done?D.cur:'';const sc=g?scoreGuess(g,D.word):null;
  rows.push(`<div class="wrow" data-r="${r}">${Array.from({length:5},(_,i)=>{const ch=g?g[i]:cur[i]||'';return `<div class="wcell ${sc?sc[i]:ch?'filled':''}" style="--d:${i*.12}s">${esc(ch)}</div>`}).join('')}</div>`)}
 const kstate={};D.s.guesses.forEach(g=>scoreGuess(g,D.word).forEach((c,i)=>{const k=g[i];const rank={g:3,y:2,x:1};if(!kstate[k]||rank[c]>rank[kstate[k]])kstate[k]=c}));
 const kb=['QWERTYUIOP','ASDFGHJKL','>ZXCVBNM<'].map(row=>`<div>${row.split('').map(k=>k==='>'?'<button class="wide" data-k="enter">Enter</button>':k==='<'?'<button class="wide" data-k="back" aria-label="Delete">⌫</button>':`<button data-k="${k}" class="${kstate[k]||''}">${k}</button>`).join('')}</div>`).join('');
 el.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:18px"><div><div class="label">Daily · ${esc(D.key)}</div><h1 style="font-size:40px">Daily Thaw</h1></div><button class="btn ghost" id="dBack">Back home</button></div>
 <div class="daily"><div><div class="wgrid">${rows.join('')}</div><div class="kb">${kb}</div></div><div class="panel stack" id="dSide"></div></div>`;
 $('#dBack').onclick=()=>{if(dUnsub)dUnsub();dUnsub=null;DSTATE=null;show('home');renderHome()};
 $$('.kb [data-k]').forEach(b=>b.onclick=()=>dKey(b.dataset.k));drawDailySide();
}
function drawDailySide(){
 const D=DSTATE;const el=$('#dSide');if(!D||!el)return;const p=D.partner;const them=NAME[other(ME)];
 const mine=D.s.done?(D.s.won?`You thawed it in ${D.s.guesses.length}/6.`:`The word was ${D.word}.`):'Guess the five-letter word. Green: right spot. Gold: in the word, wrong spot.';
 let theirs;if(!p||!p.guesses||!p.guesses.length)theirs=`${them} hasn't played yet.`;else if(!p.done)theirs=`${them} is mid-puzzle.`;else if(!D.s.done)theirs=`${them} finished. Finish yours to compare.`;else theirs=p.won?`${them} got it in ${p.guesses.length}/6.`:`${them} didn't get it today.`;
 const grid=(g)=>g.map(x=>scoreGuess(x,D.word).map(c=>`<i style="display:inline-block;width:14px;height:14px;border-radius:3px;margin:1px;background:${c==='g'?'#4f9a62':c==='y'?'#c99a2e':'#2c3d47'}"></i>`).join('')).join('<br>');
 el.innerHTML=`<h3>Today</h3><p style="margin:0">${esc(mine)}</p>${D.s.done?`<div>${grid(D.s.guesses)}</div>`:''}<hr style="border:0;border-top:1px solid var(--line);width:100%"><div class="row">${dot(other(ME))}<b>${them}</b></div><p class="muted" style="margin:0">${esc(theirs)}</p>${D.s.done&&p&&p.done?`<div>${grid(p.guesses)}</div>`:''}<p class="muted" style="font-size:13px;margin:0">A new word appears every day at midnight.</p>`;
}
async function dKey(k){
 const D=DSTATE;if(!D||D.s.done)return;
 if(k==='back'){D.cur=D.cur.slice(0,-1)}
 else if(k==='enter'){if(D.cur.length<5){const row=$(`.wrow[data-r="${D.s.guesses.length}"]`);row&&row.classList.remove('shake');void(row&&row.offsetWidth);row&&row.classList.add('shake');return toast('Five letters, please.')}
  D.s.guesses.push(D.cur);D.cur='';const won=D.s.guesses[D.s.guesses.length-1]===D.word;if(won||D.s.guesses.length>=6){D.s.done=true;D.s.won=won;D.s.finished=Date.now();setTimeout(()=>{sfx(won?'claim':'bad');if(won)confetti()},800)}
  try{await D.ref.set(D.s)}catch(e){toast('Could not save your guess.')}}
 else if(D.cur.length<5)D.cur+=k;
 drawDaily();
}

/* ---------- write a question ---------- */
async function openWrite(){
 show('write');const el=$('#scr-write');const them=NAME[other(ME)];
 el.innerHTML=`<div class="setup"><div class="row" style="justify-content:space-between"><div><div class="label">For ${esc(them)}</div><h1 style="font-size:40px">Write a question</h1></div><button class="btn ghost" id="wBack">Back home</button></div>
 <p class="muted" style="margin:0">Questions you write show up in ${esc(them)}'s games when they land on that category. Each one is used once.</p>
 <form class="panel stack" id="wForm">
  <div class="choice-grid"><label class="stack" style="gap:6px"><span class="label">Category</span><select id="wCat">${['gk','mus','thr','sci','tune'].map(c=>`<option value="${c}">${CATS[c].name}</option>`).join('')}</select></label>
  <label class="stack" style="gap:6px"><span class="label">Difficulty you'd guess</span><select id="wTier">${[1,2,3,4].map(t=>`<option value="${t}">${TIER[t].n}</option>`).join('')}</select></label></div>
  <label class="stack" style="gap:6px"><span class="label" id="wQl">Question</span><textarea id="wQ" maxlength="220" placeholder="What was the first concert we went to together?"></textarea></label>
  <div id="wAudioRow" class="stack" hidden><span class="label">Song clip</span><input type="file" id="wAudio" accept="audio/*"><span class="muted" style="font-size:13px">Upload a short audio clip you own, under 700 KB (about 30 seconds of MP3). The first 20 seconds play.</span></div>
  <label class="stack" style="gap:6px"><span class="label">Answer</span><input type="text" id="wA" maxlength="80" placeholder="The answer"></label>
  <label class="stack" style="gap:6px"><span class="label">Also accept (optional, comma separated)</span><input type="text" id="wAlts" maxlength="160" placeholder="Other spellings or short forms"></label>
  <label class="stack" style="gap:6px"><span class="label">Three wrong answers (optional, comma separated)</span><input type="text" id="wWrong" maxlength="200" placeholder="Leave empty to make it type-in only"></label>
  <div class="row" style="justify-content:flex-end"><button class="btn" type="submit" id="wSave">Save question</button></div>
 </form><div class="panel stack"><h3>Your questions</h3><div class="list" id="wList"><div class="empty">Loading…</div></div></div></div>`;
 $('#wBack').onclick=()=>{show('home');renderHome()};
 const syncAudio=()=>{const t=$('#wCat').value==='tune';$('#wAudioRow').hidden=!t;$('#wQl').textContent=t?'Prompt (optional)':'Question';$('#wQ').placeholder=t?'Name the song that played at our first dance':'What was the first concert we went to together?'};$('#wCat').onchange=syncAudio;
 $('#wForm').onsubmit=async e=>{e.preventDefault();const cat=$('#wCat').value;const q=$('#wQ').value.trim(),a=$('#wA').value.trim();
  if(!a)return toast('Add the answer.');if(cat!=='tune'&&!q)return toast('Add the question.');
  const wrong=$('#wWrong').value.split(',').map(x=>x.trim()).filter(Boolean);if(wrong.length&&wrong.length<3)return toast('Add three wrong answers, or leave that box empty.');
  const btn=$('#wSave');btn.disabled=true;let audio=null;
  if(cat==='tune'){const f=$('#wAudio').files[0];if(!f){btn.disabled=false;return toast('Choose a song clip to upload.')}if(!ASSETS){btn.disabled=false;return toast('Clip uploads need the Firebase setup (see README).')}
   if(f.size>(ASSETS.maxBytes||720000)){btn.disabled=false;return toast('That file is too big. Use a clip under 700 KB (about 30 seconds of MP3).')}
   try{const up=await ASSETS.upload(f);audio=up.url}catch(err){btn.disabled=false;return toast('The clip did not upload. Check your connection and try again.')}}
  try{await DB.collection('custom').add({author:ME,cat,tier:+$('#wTier').value,q:q||'Name that tune!',a,alts:$('#wAlts').value.split(',').map(x=>x.trim()).filter(Boolean),wrong:wrong.slice(0,3),audio,used:false,at:Date.now()});toast(`Saved. It's waiting for ${them}.`);$('#wForm').reset();syncAudio();listMine()}catch(err){toast('Could not save. Check your connection.')}
  btn.disabled=false};
 listMine();
}
async function listMine(){
 try{const qs=await DB.collection('custom').where('author','==',ME).get();const rows=qs.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.at-a.at);
  $('#wList').innerHTML=rows.length?rows.map(r=>`<div class="list-item"><div class="row" style="gap:10px;min-width:0">${icon(r.cat)}<div style="min-width:0"><div style="overflow-wrap:anywhere">${esc(r.q)}</div><div class="muted" style="font-size:13px">${esc(r.a)} · ${TIER[r.tier].n}${r.audio?' · with clip':''} · ${r.used?'used':'waiting'}</div></div></div><button class="btn ghost small" data-del="${r.id}">Delete</button></div>`).join(''):'<div class="empty">Nothing yet.</div>';
  $$('[data-del]').forEach(b=>b.onclick=async()=>{b.disabled=true;const row=rows.find(x=>x.id===b.dataset.del);if(row&&row.audio&&String(row.audio).startsWith('clip:'))await DB.doc('clips/'+row.audio.slice(5)).delete().catch(()=>{});await DB.doc('custom/'+b.dataset.del).delete().catch(()=>{});listMine()});
 }catch(e){$('#wList').innerHTML='<div class="empty">Could not load your questions.</div>'}
}

/* ---------- ledger ---------- */
async function openLedger(){
 show('ledger');const el=$('#scr-ledger');el.innerHTML='<p class="muted">Loading…</p>';const L=await loadLedger();const w=L.wins;
 const acc=(s,c)=>{const v=(L.stats[s]||{})[c]||[0,0];return v[1]?Math.round(v[0]/v[1]*100):null};
 const nextS=SEASONS.find(s=>L.games<s.need);
 el.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:18px"><div><div class="label">Bruce vs Meredith</div><h1 style="font-size:40px">The ledger</h1></div><button class="btn ghost" id="lgBack">Back home</button></div>
 <div class="ledger-top">
  <div class="panel bigstat"><span class="label">Head to head</span><div class="h2h"><div class="row">${dot('bruce')}<b class="num">${w.bruce}</b></div><span class="muted">vs</span><div class="row"><b class="num">${w.meredith}</b>${dot('meredith')}</div></div><span class="muted">${L.versus||0} versus games · ${L.ties} tie${L.ties===1?'':'s'}</span></div>
  <div class="panel bigstat"><span class="label">Co-op</span><b class="num">${L.coop.wins}<span class="muted" style="font-size:24px">/${L.coop.games}</span></b><span class="muted">storms survived · most logs left: ${L.coop.bestWood||0}</span></div>
  <div class="panel bigstat"><span class="label">Seasons</span><b class="num">${SEASONS.filter(s=>L.games>=s.need).length}<span class="muted" style="font-size:24px">/4</span></b><span class="muted">${nextS?`${nextS.n} unlocks in ${nextS.need-L.games} more game${nextS.need-L.games===1?'':'s'}`:'Every season unlocked'}</span></div>
 </div>
 <div class="panel stack" style="margin-top:16px"><h3>Accuracy by category</h3><div class="catbars"><div class="catbar"><span></span><span class="row" style="gap:6px">${dot('bruce')} Bruce</span><span class="row" style="gap:6px">${dot('meredith')} Meredith</span></div>
  ${Object.keys(CATS).map(c=>`<div class="catbar"><span class="row" style="gap:8px">${icon(c)}${CATS[c].short}</span>${P.map(s=>{const a=acc(s,c);return `<div class="row" style="gap:8px;flex-wrap:nowrap"><div class="meter" style="flex:1"><i style="width:${a||0}%;background:var(--${s})"></i></div><span class="num muted" style="width:40px;text-align:right">${a==null?'–':a+'%'}</span></div>`}).join('')}</div>`).join('')}</div></div>
 <div class="panel stack" style="margin-top:16px"><h3>Recent games</h3>${L.history&&L.history.length?`<div class="tablewrap"><table class="hist"><thead><tr><th>Date</th><th>Game</th><th>Result</th><th>Stakes</th></tr></thead><tbody>${L.history.map(h=>`<tr><td class="num">${new Date(h.at).toLocaleDateString()}</td><td>${h.board==='territory'?'Territory':'Fireside'} · ${h.mode==='coop'?'Co-op':'Versus'}</td><td>${h.result.coop?(h.result.win?'Survived':'Fire went out'):h.result.winner==='tie'?`Tie ${h.result.scores.bruce}–${h.result.scores.meredith}`:`${NAME[h.result.winner]} won ${h.result.scores.bruce}–${h.result.scores.meredith}`}</td><td>${esc(h.stakes||'–')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Finished games will show up here.</div>'}</div>`;
 $('#lgBack').onclick=()=>{show('home');renderHome()};
}

/* ---------- ambient: snow + confetti ---------- */
function startSnow(){if(reduced)return;const c=$('#snow'),x=c.getContext('2d');let W,H;const fl=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.8,s:.15+Math.random()*.45,w:Math.random()*6}));
 const size=()=>{W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px'};size();addEventListener('resize',size);
 const step=t=>{x.clearRect(0,0,W,H);x.fillStyle='rgba(235,243,247,.75)';for(const f of fl){f.y+=f.s/innerHeight*1.2;if(f.y>1.02){f.y=-.02;f.x=Math.random()}const px=(f.x+Math.sin(t/2400+f.w)*.01)*W;x.beginPath();x.arc(px,f.y*H,f.r*devicePixelRatio,0,7);x.fill()}requestAnimationFrame(step)};requestAnimationFrame(step)}
function confetti(){if(reduced)return;const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#ff8a4c','#4fd1c5','#f2c95b','#f6c453','#b29cf5','#eef3f5'];
 const ps=Array.from({length:140},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.35,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,c:pick(cols),s:5+Math.random()*6}));let n=0;
 const step=()=>{x.clearRect(0,0,c.width,c.height);for(const p of ps){p.vy+=.32;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()}if(++n<200)requestAnimationFrame(step);else x.clearRect(0,0,c.width,c.height)};step()}

/* ---------- house key + boot ---------- */
function cleanHouse(s){return String(s||'').toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}
function renderHouse(msg){
 show('house');const el=$('#scr-house');
 el.innerHTML=`<div class="setup" style="max-width:560px"><div><div class="label">One-time setup on this device</div><h1 style="font-size:40px">Your house key</h1></div>
 <div class="panel stack"><p style="margin:0">Type the secret house key you two agreed on. It keeps your games private and must match on both devices (and the Worker's HOUSE_KEY, if you set one up).</p>
 <input type="text" id="hk" autocomplete="off" placeholder="at least 8 letters or numbers" value="${esc(HOUSE||'')}" aria-label="House key">
 ${msg?`<p class="no" style="margin:0">${esc(msg)}</p>`:''}
 <div class="row" style="justify-content:flex-end">${HOUSE?'<button class="btn ghost" id="hkCancel">Cancel</button>':''}<button class="btn" id="hkGo">Enter the cabin</button></div></div>
 <p class="muted" style="font-size:14px">Letters, numbers and dashes only. Spaces turn into dashes and capitals don't matter.</p></div>`;
 $('#hkGo').onclick=()=>{const k=cleanHouse($('#hk').value);if(k.length<8)return renderHouse('Use at least 8 letters or numbers.');HOUSE=k;store.set('cn.house',k);location.reload()};
 $('#hk').onkeydown=e=>{if(e.key==='Enter')$('#hkGo').click()};
 const c=$('#hkCancel');if(c)c.onclick=()=>{show('home');renderHome()};
}
async function boot(){
 const tb=$('.topbar');const setTop=()=>document.documentElement.style.setProperty('--top-h',tb.offsetHeight+'px');setTop();try{new ResizeObserver(setTop).observe(tb)}catch(e){addEventListener('resize',setTop)}
 setMuteIcon();$('#muteBtn').onclick=()=>{MUTED=!MUTED;store.set('cn.muted',MUTED);setMuteIcon()};
 $('#goHome').onclick=()=>{if(ROOM)goHome();else{show('home');renderHome()}};
 $('#seatBtn').onclick=()=>setMe(ME==='bruce'?'meredith':'bruce');
 if(ME)setMe(ME);else{$('#seatName').textContent='who?'}
 startSnow();
 const configured=window.CNBackend&&CNBackend.configured();
 if(configured&&!HOUSE)return renderHouse();
 renderHome();show('home');
 let be=null;
 if(configured){try{be=await CNBackend.init(HOUSE)}catch(e){console.error(e);toast('Could not connect to Firebase. Check js/config.js and that Anonymous sign-in is on.',6000)}}
 if(be){DB=be.db;UID=be.uid;ASSETS=be.assets;WORKER=be.worker;ONLINE=true;
  if(WORKER){WORKER.ping().then(r=>{AI_OK=!!(r&&r.ai);if(AI_OK)SETUP.ai=true}).catch(e=>{WORKER=null;toast(e&&e.code==='forbidden'?'The Worker did not accept your house key, so Deezer songs are off.':'Could not reach the Worker, so Deezer songs are off.',6000)})}}
 else{DB=MemDB();ONLINE=false;$('#modeChip').hidden=false;$('#modeChip').textContent=configured?'Offline practice · not connected':'Practice mode · backend not set up'}
 SETUP.ai=false;
 renderHome();
}
boot();
})();
