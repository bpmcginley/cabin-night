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
 his:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/></svg>',
 bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
};
const CATS={
 gk:{name:'General Knowledge',short:'Knowledge',c:'#b29cf5',kind:'turn'},
 mus:{name:'Music',short:'Music',c:'#f6c453',kind:'turn'},
 thr:{name:'Theatre',short:'Theatre',c:'#ef6f8f',kind:'turn'},
 sci:{name:'Science',short:'Science',c:'#9ad66b',kind:'turn'},
 his:{name:'History',short:'History',c:'#e8c58f',kind:'turn'},
 word:{name:'Word Play',short:'Words',c:'#7aa7f0',kind:'race'},
 tune:{name:'Name That Tune',short:'Tune',c:'#d68be0',kind:'race'},
 us:{name:'Guess Each Other',short:'Us',c:'#f2a6a0',kind:'us'},
};
const TIER=[null,{n:'Easy',time:20},{n:'Medium',time:25},{n:'Hard',time:35},{n:'Expert',time:45}];
const SAB={
 fuse:{n:'Short Fuse',d:t=>`Halves ${t}'s timer on their next question.`},
 blizzard:{n:'Blizzard',d:t=>`${t}'s next trivia question jumps up one difficulty. It waits for a trivia tile below Expert.`},
 fog:{n:'Fogged Window',d:t=>`Takes away ${t}'s multiple choice. It waits for a question that has choices.`},
 drift:{n:'Snowdrift',d:t=>`${t} is snowed in and skips their next turn.`},
};
const BOARD_NAME={territory:'Territory',frontier:'Frontier',fireside:'Fireside'};
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
const hashId=s=>{let x=7;for(const c of String(s))x=(x*31+c.charCodeAt(0))|0;return 'b'+(x>>>0).toString(36)};
// Old music rows (BANK/BANK2) are replaced by BANK3's 1970s-to-today music set.
const BANK_OBJS=(()=>{const rows=[...BANK,...(typeof BANK2!=='undefined'?BANK2:[])].filter(b=>b[0]!=='mus').concat(typeof BANK3!=='undefined'?BANK3:[],typeof BANK_PICK!=='undefined'?BANK_PICK:[]);
 const seen=new Set(),out=[];for(const b of rows){const id=hashId(b[2]);if(seen.has(id))continue;seen.add(id);out.push({id,cat:b[0],tier:b[1],q:b[2],a:b[3],wrong:b[4],alts:b[5]||[],pick:!!(b[6]&&b[6].pick)})}return out})();

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
let LOCAL={},RESOLVING=null,SEL=null,BUILT=null,OVKEY=null,HIDE_REVEAL=null,TIMER=null,LAST_FX=null,SEEN=new Set(),LEDGER=null,LEDGER_OK=false;
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
const STRICT_W=w=>/\d/.test(w)||/^(i{1,3}|iv|vi{0,3}|ix|xi{0,3}|xiv|xv)$/.test(w)||(w.length===1&&w!=='a');
function strictOK(n,c){const sn=n.split(' ').filter(STRICT_W),sc=c.split(' ').filter(STRICT_W);return sc.every(w=>sn.includes(w))&&sn.every(w=>sc.includes(w))}
function correct(q,ans){if(!ans||!ans.v)return false;const v=ans.v;if(v===q.a)return true;if(!ans.typed)return false;const n=norm(v);if(!n)return false;
 for(const c of [q.a,...(q.alts||[])].map(norm)){if(n===c)return true;if(q.exact||!strictOK(n,c))continue;const tol=c.length<=4?0:c.length<=8?1:2;if(lev(n,c)<=tol)return true;if(c.length>=6&&n.length>=c.length*.6&&c.includes(n)&&/\s/.test(c))return true}
 return false}

/* ---------- board / gifts generation ---------- */
function rep(x,n){return Array(n).fill(x)}
function mysKinds(mode,board){if(mode==='coop')return shuffle(['wood','wood','calm','gust','gust']);return shuffle(['card','card','double','extra',board==='territory'?pick(['ice','wolf']):'ice'])}
const TRIVIA=['gk','mus','thr','sci','his'];
const isMap=R=>R.board!=='fireside';
const adj=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
function finalTurn(R){return R.endsAt!=null?Math.min(R.maxTurns,R.endsAt):R.maxTurns}
function frostOn(R){if(!R||R.mode!=='versus'||R.phase==='lobby')return false;if(finalTurn(R)-R.turnNo<=4)return true;return R.board==='territory'&&R.slots.filter(t=>!t.owner).length<=4}
function legalTiles(R,p){
 const open=R.slots.filter(t=>!t.owner&&!t.base).map(t=>t.id);
 if(R.board!=='frontier')return {expand:new Set(open),raid:new Set(),boxed:false};
 const mine=R.slots.filter(t=>t.owner===p);const touch=t=>mine.some(m=>adj(m,t));
 const expand=R.slots.filter(t=>!t.owner&&touch(t)).map(t=>t.id);
 const raid=R.slots.filter(t=>t.owner===other(p)&&!t.base&&!t.fort&&touch(t)).map(t=>t.id);
 return {expand:new Set(expand.length?expand:open),raid:new Set(raid),boxed:!expand.length&&open.length>0};
}
const blankAw=()=>({steals:0,fast:1e9,mind:0,hit:0,raids:0,defends:0});
function makeMap(mode){
 const cats=shuffle([...rep('gk',3),...rep('mus',3),...rep('thr',3),...rep('sci',3),...rep('his',3),...rep('word',3),...rep('tune',3),...rep('us',3),pick(TRIVIA)]);
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
// Frontier: 6x6, Bruce's cabin at the left corner (0,5), Meredith's at the right corner (5,0).
// Mirror-symmetric: tile (x,y) and (5-x,5-y) always match, so neither side has an advantage.
function makeFrontier(){
 const N=6,spots=[[.22,.24],[.76,.28],[.26,.78],[.8,.74],[.5,.18],[.18,.52]];
 const lake=pick([[[0,2],[1,2]],[[1,3],[1,4]],[[2,4],[3,5]]]);
 const isLake=(x,y)=>lake.some(([a,b])=>(a===x&&b===y)||(N-1-a===x&&N-1-b===y));
 const tiles=[];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const dB=x+(N-1-y),dM=(N-1-x)+y,d=Math.min(dB,dM);let terrain,tier,h,base=null;
  if(x===0&&y===N-1)base='bruce';else if(x===N-1&&y===0)base='meredith';
  if(base){terrain='meadow';tier=0;h=11}
  else if(x===y&&(x===2||x===3)){terrain='peak';tier=4;h=40}
  else if(x===y){terrain='ridge';tier=3;h=26}
  else if(isLake(x,y)){terrain='lake';tier=d<=2?1:2;h=6}
  else if(d<=2){terrain='meadow';tier=1;h=11}
  else{terrain='pines';tier=2;h=16}
  tiles.push({id:'f'+(y*N+x),x,y,terrain,h,tier,base,owner:base,fort:false,cat:null,mystery:false,mk:null,revealed:false,dbl:false,deco:[],cabin:!!base});
 }
 const at=(x,y)=>tiles[y*N+x];
 const pairs=[];tiles.forEach(t=>{const m=at(N-1-t.x,N-1-t.y);if(!t.base&&t.y*N+t.x<m.y*N+m.x)pairs.push([t,m])});
 const cats=shuffle([...TRIVIA,...TRIVIA,'word','word','tune','tune','us','us',pick(TRIVIA)]);
 pairs.forEach((p,i)=>p.forEach(t=>t.cat=cats[i%cats.length]));
 const kinds=shuffle(['card','double',pick(['extra','ice','wolf'])]);
 shuffle(pairs.filter(([t])=>Math.min(t.x+(N-1-t.y),(N-1-t.x)+t.y)>=2)).slice(0,3).forEach((p,i)=>p.forEach(t=>{t.mystery=true;t.mk=kinds[i]}));
 pairs.forEach(([t,m])=>{const deco=[];
  if(t.terrain==='pines')shuffle(spots).slice(0,2).forEach(p=>deco.push({k:'tree',x:p[0],y:p[1],s:.8+Math.random()*.3}));
  else if(t.terrain==='ridge'||t.terrain==='peak'){const p=pick(spots.slice(0,4));deco.push({k:'rock',x:p[0],y:p[1],s:1})}
  else if(t.terrain==='meadow'&&Math.random()<.35){const p=pick(spots);deco.push({k:'tree',x:p[0],y:p[1],s:.7})}
  t.deco=deco;m.deco=deco.map(o=>({...o,x:1-o.x,y:1-o.y}));});
 return tiles;
}
function giftTier(turnNo,max){const p=turnNo/max;const w=p<.34?[.45,.4,.15,0]:p<.67?[.2,.4,.3,.1]:[.05,.25,.4,.3];let r=Math.random(),acc=0;for(let i=0;i<4;i++){acc+=w[i];if(r<=acc)return i+1}return 4}
function newGift(mode,turnNo,max){const m=Math.random()<.25;return {id:'g'+rid(),cat:pick(Object.keys(CATS)),tier:giftTier(turnNo,max),mystery:m,mk:m?pick(mode==='coop'?['wood','calm','gust']:['card','double','extra','ice']):null,revealed:false,owner:null,dbl:false}}
function newState(code,o){
 const board=o.mode==='coop'&&o.board==='frontier'?'territory':o.board;
 const max=board==='territory'?45:board==='frontier'?36:16;
 const eff=()=>({fuse:false,fog:false,blizzard:false,skip:0});
 return {v:2,code,createdAt:Date.now(),host:ME,board,n:board==='frontier'?6:5,mode:o.mode,season:o.season,stakes:o.stakes||'',
  seats:{bruce:null,meredith:null},phase:'lobby',turn:pick(P),turnNo:0,maxTurns:max,endsAt:null,
  slots:board==='territory'?makeMap(o.mode):board==='frontier'?makeFrontier():Array.from({length:5},()=>newGift(o.mode,0,max)),
  scores:{bruce:0,meredith:0},wood:8,cards:{bruce:[],meredith:[]},dd:{bruce:3,meredith:3},extraPending:null,lastLightning:0,
  effects:{bruce:eff(),meredith:eff()},aw:{bruce:blankAw(),meredith:blankAw()},
  playedCard:false,round:null,last:null,used:[],avoid:(o.avoid||[]).slice(0,900),aiQs:o.aiQs||[],stats:{bruce:{},meredith:{}},result:null,next:null,ledgerDone:false};
}
function territoryScore(R,s){return R.slots.reduce((a,t)=>a+(t.owner===s?t.tier*(t.dbl?2:1):0),0)}
function score(R,s){return isMap(R)?territoryScore(R,s):R.scores[s]}

/* ---------- db helpers ---------- */
const roomRef=()=>DB.doc('rooms/'+CODE);
let writeChain=Promise.resolve();
function setRoom(R){writeChain=writeChain.then(()=>roomRef().set(R)).catch(e=>{toast('Could not save that move. Check your connection.');throw e});return writeChain}
function ansId(r,s){return `${r.id}-${r.stage}-${s}`}
function needSeats(R){const r=R.round;if(!r)return[];if(r.lightning)return[...P];if(R.mode==='coop')return[...P];if(r.q&&r.q.solo)return[r.active];if(r.kind==='turn')return r.stage==='main'?[r.active]:[other(r.active)];return[r.active,other(r.active)]}
function hasAns(R,s){return !!ANS[ansId(R.round,s)]}
function actingSeat(){const R=ROOM;if(!PRACTICE()||!R)return ME;if(R.phase==='round'){const n=needSeats(R).find(s=>!hasAns(R,s));return n||R.round.active}return R.turn}
function roleOf(R,s){const r=R.round;if(!r||!needSeats(R).includes(s))return'watch';if(r.kind==='us')return s===r.active?'predict':'self';return'answer'}
function typedFor(R,s){const r=R.round,q=r.q;if(q.kind==='us'||q.pick)return false;if(r.stage==='main'&&s===r.active&&r.fx&&r.fx.fog)return true;if(r.kind==='race'&&q.kind!=='tune')return true;if(q.kind==='trivia'&&q.tier>=3)return true;return !q.ch}
// Would the active player normally see multiple choice on this question? (Fogged Window only bites then.)
function fogApplies(q,kind){return q.kind!=='us'&&!q.pick&&(kind!=='race'||q.kind==='tune')&&!(q.kind==='trivia'&&q.tier>=3)&&!!q.ch}

/* ---------- question building ---------- */
async function makeQuestion(R,cat,tier,act,opt={}){
 const opp=other(act);const avoid=new Set(R.avoid||[]);
 const customOK=ONLINE&&R.mode==='versus'&&!opt.lightning;
 if(TRIVIA.includes(cat)){
  if(customOK&&Math.random()<.45){try{const qs=await DB.collection('custom').where('used','==',false).get();const c=qs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.cat===cat&&x.author===opp);if(c.length){const x=pick(c);DB.doc('custom/'+x.id).update({used:true}).catch(()=>{});return {kind:'trivia',tier,text:x.q,a:x.a,alts:x.alts||[],ch:x.wrong&&x.wrong.length>=3?shuffle([x.a,...x.wrong.slice(0,3)]):null,src:'custom',by:x.author,noSteal:true}}}catch(e){}}
  const fresh=b=>!R.used.includes(b.id);
  const ai=(R.aiQs||[]).filter(x=>x.cat===cat&&x.tier===tier&&fresh(x));
  let x;
  if(ai.length&&Math.random()<.55)x=pick(ai);
  else{const tiers=opt.lightning?[1,2]:[tier];
   let pool=BANK_OBJS.filter(b=>b.cat===cat&&tiers.includes(b.tier)&&fresh(b)&&!avoid.has(b.id));
   if(!pool.length)pool=ai.length?ai:BANK_OBJS.filter(b=>b.cat===cat&&tiers.includes(b.tier)&&fresh(b));
   if(!pool.length)pool=BANK_OBJS.filter(b=>b.cat===cat&&fresh(b));
   if(!pool.length)pool=BANK_OBJS.filter(b=>b.cat===cat);x=pick(pool)}
  R.used.push(x.id);
  return {kind:'trivia',tier:opt.lightning?(x.tier||tier):tier,text:x.q,a:x.a,alts:x.alts||[],ch:shuffle([x.a,...x.wrong.slice(0,3)]),pick:!!(x.pick||opt.lightning),src:x.id.startsWith('ai')?'ai':'bank'};
 }
 if(cat==='word'){
  if(tier>=3&&Math.random()<.5){const pool=VOWELLESS[tier].filter(p=>!R.used.includes('v'+p[0]));const [p,h]=pick(pool.length?pool:VOWELLESS[tier]);R.used.push('v'+p);return {kind:'vowel',tier,text:'Put the vowels back in. Spaces stay where they are.',shown:p.replace(/[AEIOU]/g,''),a:p,alts:[],hint:h,src:'bank'}}
  const pool=WORDS[tier].filter(w=>!R.used.includes('w'+w[0]));const [w,h]=pick(pool.length?pool:WORDS[tier]);R.used.push('w'+w);
  let s=w;for(let i=0;i<20&&s===w;i++)s=shuffle(w.split('')).join('');
  return {kind:'anagram',tier,text:'Unscramble the word.',shown:s,a:w,alts:[],hint:h,exact:true,src:'bank'};
 }
 if(cat==='tune'){
  if(customOK&&Math.random()<.4){try{const qs=await DB.collection('custom').where('used','==',false).get();const c=qs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.cat==='tune'&&x.audio&&x.author===opp);if(c.length){const x=pick(c);DB.doc('custom/'+x.id).update({used:true}).catch(()=>{});return {kind:'tune',tier,text:x.q||'Name that tune!',audio:x.audio,a:x.a,alts:x.alts||[],ch:tier<=2&&x.wrong&&x.wrong.length>=3?shuffle([x.a,...x.wrong.slice(0,3)]):null,src:'custom',by:x.author,solo:true}}}catch(e){}}
  if(WORKER&&typeof SONGS!=='undefined'){
   const all=SONGS[tier]||[];let pool=all.filter(s=>!R.used.includes('s'+s.t)&&!avoid.has('s'+s.t));if(!pool.length)pool=all.filter(s=>!R.used.includes('s'+s.t));if(!pool.length)pool=all;
   for(const s of shuffle(pool).slice(0,3)){try{const res=await WORKER.tune(s.q||(s.a+' '+s.t),s.a||'',s.t);if(res&&res.found&&res.preview){R.used.push('s'+s.t);
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
let BUSY=false,DD=false;
async function pickSlot(id,dd){
 if(BUSY)return;BUSY=true;renderDock();
 try{
  const R0=clone(ROOM);const slot0=R0.slots.find(s=>s.id===id);if(!slot0)return;
  const act=R0.turn,opp=other(act);
  const L=legalTiles(R0,act);if(!L.expand.has(id)&&!L.raid.has(id)){toast('You can only play tiles that touch your land.');return}
  const raid=R0.board==='frontier'&&slot0.owner===opp;const kind=CATS[slot0.cat].kind;
  const E0=R0.mode==='versus'?R0.effects[act]:null;
  let tier=Math.min(4,slot0.tier+(raid?1:0)),bliz=false;
  if(E0&&E0.blizzard&&kind==='turn'&&tier<4){tier++;bliz=true}
  const q=await makeQuestion(R0,slot0.cat,tier,act);
  // re-read the room after the (possibly slow) question lookup so nothing else is lost
  const R=clone(ROOM);R.used=[...new Set([...(R.used||[]),...R0.used])];
  const E=R.mode==='versus'?R.effects[act]:null;const fx={fuse:false,fog:false,blizzard:false};
  if(E){if(bliz&&E.blizzard){fx.blizzard=true;E.blizzard=false}
   if(E.fuse){fx.fuse=true;E.fuse=false}
   if(E.fog&&fogApplies(q,kind)){fx.fog=true;E.fog=false}
   const hits=(fx.fuse?1:0)+(fx.fog?1:0)+(fx.blizzard?1:0);if(hits)R.aw[act].hit+=hits}
  const useDD=!!dd&&!raid&&R.mode==='versus'&&(R.dd&&R.dd[act]>0);if(useDD)R.dd[act]--;
  R.round={id:'r'+(R.turnNo+1)+rid(),slotId:id,cat:slot0.cat,tier,kind,q,stage:'main',active:act,resolver:act,fx,raid,dd:useDD,frost:frostOn(R),res:null};
  R.phase='round';SEL=null;DD=false;HIDE_REVEAL=null;
  await setRoom(R);
 }finally{BUSY=false;if(ROOM&&ROOM.phase==='pick')renderDock()}
}
function cardPending(R,target,k){const e=R.effects[target];return k==='drift'?(e.skip||0)>0:!!e[k]}
async function playCard(i){
 const R=clone(ROOM);const me=R.turn;const opp=other(me);const k=R.cards[me][i];if(!k||R.playedCard)return;
 if(cardPending(R,opp,k))return toast(`${SAB[k].n} is already waiting on ${NAME[opp]}.`);
 R.cards[me].splice(i,1);if(k==='drift')R.effects[opp].skip=(R.effects[opp].skip||0)+1;else R.effects[opp][k]=true;R.playedCard=true;
 await setRoom(R);sfx('lock');toast(`${SAB[k].n} sent to ${NAME[opp]}.`);
}
async function startTurn(){
 const R=clone(ROOM);R.round=null;R.playedCard=false;HIDE_REVEAL=null;
 if(R.turnNo>0&&R.turnNo%8===0&&R.lastLightning!==R.turnNo&&R.phase!=='over'){
  R.lastLightning=R.turnNo;const cat=pick(TRIVIA);const q=await makeQuestion(R,cat,pick([1,2]),R.turn,{lightning:true});
  R.round={id:'L'+R.turnNo+'a'+rid(),slotId:null,cat,tier:q.tier,kind:'race',q,stage:'main',active:R.turn,resolver:R.turn,fx:{},lightning:{i:1,n:3,score:{bruce:0,meredith:0,team:0},log:[]}};
  R.phase='round';await setRoom(R);sfx('claim');return;
 }
 R.phase='pick';await setRoom(R);sfx('turn');
}
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
 else if(k==='extra'){info.extra=true;info.extraWho=who;m.text=`${nm} gets an extra turn.`}
 else if(k==='ice'){R.effects[who].skip=(+R.effects[who].skip||0)+1;m.text=`${nm} falls through the ice and skips their next turn.`}
 else if(k==='wolf'){const mine=R.slots.filter(t=>t.owner===who&&t.id!==slot.id&&!t.base);if(mine.length){const t=pick(mine);t.owner=null;t.dbl=false;t.fort=false;m.text=`A wolf chases ${nm} off ${TERRAIN_NAME[t.terrain]}. That tile is open again.`;m.lost=t.id}else m.text=`A wolf prowls, but ${nm} has nothing else to lose. Lucky.`}
 else if(k==='wood'){R.wood+=3;m.text='Three extra logs for the fire.'}
 else if(k==='calm'){info.calm=true;m.text='No storm damage this round.'}
 else if(k==='gust'){R.wood-=2;m.text='The gust costs you two logs.'}
 return m;
}

async function resolveRound(){
 const R=clone(ROOM);const r=R.round;if(r.lightning)return resolveLightning(R);
 const q=r.q;const act=r.active,opp=other(act);const A=s=>ANS[ansId(r,s)]||{v:'',ms:1e9};
 if(!R.aw)R.aw={bruce:blankAw(),meredith:blankAw()};
 let claim=null,ddLost=false;const res={};const info={};
 if(R.mode==='versus'){
  if(r.kind==='turn'){
   if(r.stage==='main'){const a=A(act);const ok=correct(q,a);bumpStat(R,act,r.cat,ok);res[act]={v:a.v,ok};
    if(ok)claim=act;
    else if(r.dd){claim=opp;ddLost=true}
    else if(!q.noSteal){r.stage='steal';r.res=res;R.round=r;await setRoom(R);cleanupAns({id:r.id,stage:'main'},[act]);return}}
   else{const a=A(opp);const ok=correct(q,a);bumpStat(R,opp,r.cat,ok);Object.assign(res,r.res||{});res[opp]={v:a.v,ok,steal:true};if(ok)claim=opp}
  }else if(r.kind==='race'){const a1=A(act),a2=A(opp);const o1=correct(q,a1),o2=!q.solo&&correct(q,a2);bumpStat(R,act,r.cat,o1);if(!q.solo)bumpStat(R,opp,r.cat,o2);
   res[act]={v:a1.v,ok:o1,ms:a1.ms};if(!q.solo)res[opp]={v:a2.v,ok:o2,ms:a2.ms};
   if(o1&&o2)claim=a1.ms<=a2.ms?act:opp;else if(o1)claim=act;else if(o2)claim=opp;
   if(claim&&res[claim].ms<R.aw[claim].fast)R.aw[claim].fast=res[claim].ms;
   if(r.dd&&claim!==act){claim=opp;ddLost=true}}
  else{const p=A(act),s=A(opp);const ok=!!p.v&&p.v===s.v;bumpStat(R,act,'us',ok);res[act]={v:p.v,ok,role:'guess'};res[opp]={v:s.v,role:'truth'};if(ok){claim=act;R.aw[act].mind++}else if(r.dd){claim=opp;ddLost=true}}
 }else{
  if(r.kind==='us'){const p=A(act),s=A(opp);const ok=!!p.v&&p.v===s.v;bumpStat(R,act,'us',ok);res[act]={v:p.v,ok,role:'guess'};res[opp]={v:s.v,role:'truth'};if(ok)claim='team'}
  else{let any=false;for(const s of P){const a=A(s);const ok=correct(q,a);bumpStat(R,s,r.cat,ok);res[s]={v:a.v,ok,ms:a.ms};if(ok)any=true}if(any)claim='team'}
 }
 // apply
 const slot=R.slots.find(s=>s.id===r.slotId);const before=clone(slot);let mys=null,flipped=false,fortified=false;
 const mult=R.mode==='versus'&&(r.dd||r.frost)?2:1;
 if(claim){
  if(r.raid){if(claim===act){slot.owner=act;flipped=true;R.aw[act].raids++}else{slot.fort=true;fortified=true;R.aw[opp].defends++}}
  else{
   if(isMap(R)){slot.owner=claim;if(mult>1)slot.dbl=true}
   if(slot.mystery&&!slot.revealed)mys=applyMystery(R,slot,claim==='team'?act:claim,info);
   if(R.board==='fireside'&&R.mode==='versus')R.scores[claim]+=slot.tier*mult;
   if(R.mode==='versus'&&res[claim]&&res[claim].steal)R.aw[claim].steals++;
  }
 }
 let woodDelta=0,storm=0;
 if(R.mode==='coop'){woodDelta=claim?2:-1;R.wood+=woodDelta;if(!info.calm){R.wood-=1;storm=1}}
 const pts=isMap(R)?(r.raid?slot.tier:before.tier*(slot.dbl?2:1)):before.tier*mult+(mys&&mys.kind==='double'?before.tier:0);
 if(R.board==='fireside'){const i=R.slots.findIndex(s=>s.id===r.slotId);R.slots[i]=newGift(R.mode,R.turnNo+1,R.maxTurns)}
 R.turnNo++;
 // who goes next: an extra turn always belongs to whoever won it, even on a steal
 let next=other(act);
 if(info.extra)R.extraPending=info.extraWho;
 if(R.extraPending===act){next=act;R.extraPending=null}
 const skipped=[];
 for(let g=0;g<3;g++){const e=R.effects[next];const n=e?(+e.skip||0):0;if(n>0){e.skip=n-1;skipped.push(next);next=other(next)}else break}
 R.turn=next;
 if(R.board==='frontier'&&R.endsAt==null&&R.slots.every(t=>t.owner))R.endsAt=R.turnNo+4;
 // headline
 let headline;const where=isMap(R)?TERRAIN_NAME[before.terrain]:'the gift';const Where=where[0].toUpperCase()+where.slice(1);
 if(R.mode==='versus'){
  if(r.raid)headline=flipped?`${NAME[act]} raids ${where} from ${NAME[opp]}!`:fortified?`${NAME[opp]} defends ${where} and fortifies it for good!`:`The raid fails. ${Where} stays ${NAME[opp]}'s.`;
  else if(ddLost)headline=`Double Down backfires! ${NAME[opp]} takes ${where}${R.board==='fireside'?`: +${pts}`:''}.`;
  else if(claim){const stole=res[claim]&&res[claim].steal;headline=r.kind==='us'?`${NAME[act]} read ${NAME[opp]} perfectly!${isMap(R)?'':` +${pts}`}`:stole?`${NAME[claim]} steals ${where}!`:r.dd?`${NAME[act]} doubles down and wins ${where}: ${pts} points!`:isMap(R)?`${NAME[claim]} claims ${where}!`:`${NAME[claim]} wins the gift: +${pts}`}
  else headline=r.kind==='us'?`Not quite. ${NAME[opp]} picked something else.`:isMap(R)?`Nobody got it. ${Where} stays open.`:'Nobody got it.';
 }else headline=claim?(r.kind==='us'?'You two are in sync. The fire grows.':'Nice teamwork. The fire grows.'):'Missed it. The storm bites.';
 R.last={rid:r.id,slotId:r.slotId,cat:r.cat,tier:r.tier,pts,kind:r.kind,q:{text:q.text,a:q.a,kind:q.kind,shown:q.shown||null,artist:q.artist||null,show:q.show||null},res,claim,headline,mys,next,skipped,extra:!!info.extra,extraWho:info.extraWho||null,woodDelta,storm,terrain:before.terrain||null,active:act,
  raid:!!r.raid,flipped,fortified,dd:!!r.dd,ddLost,frost:!!r.frost&&mult>1&&!!claim&&!r.raid,fx:r.fx||{}};
 // end check
 let over=false,result=null;
 if(R.mode==='coop'){
  if(R.wood<=0){over=true;result={coop:true,win:false}}
  else if(R.board==='territory'&&R.slots.every(t=>t.owner))over=true,result={coop:true,win:true};
  else if(R.board==='fireside'&&R.turnNo>=R.maxTurns)over=true,result={coop:true,win:true};
  else if(R.board==='territory'&&R.turnNo>=R.maxTurns)over=true,result={coop:true,win:false,timeout:true};
 }else{
  const done=R.board==='territory'?(R.slots.every(t=>t.owner)||R.turnNo>=R.maxTurns):R.turnNo>=finalTurn(R);
  if(done){over=true;const b=score(R,'bruce'),m=score(R,'meredith');result={coop:false,winner:b>m?'bruce':m>b?'meredith':'tie',scores:{bruce:b,meredith:m}}}
 }
 if(R.mode==='coop'&&result)result.wood=Math.max(0,R.wood),result.claimed=R.slots.filter(t=>t.owner).length;
 R.phase=over?'over':'reveal';R.result=result;R.round=null;
 await setRoom(R);cleanupAns(r,null);
 if(over)await writeLedger(R);
}
// Lightning round: three quick multiple-choice races in a row. Fastest right answer scores each one.
async function resolveLightning(R){
 const r=R.round,q=r.q,lt=r.lightning;const A=s=>ANS[ansId(r,s)]||{v:'',ms:1e9};
 const ok={},ms={},v={};P.forEach(s=>{const a=A(s);ok[s]=correct(q,a);ms[s]=a.ms;v[s]=a.v||'';bumpStat(R,s,r.cat,ok[s])});
 let win=null;
 if(R.mode==='coop'){if(ok.bruce||ok.meredith){win='team';lt.score.team++}}
 else{if(ok.bruce&&ok.meredith)win=ms.bruce<=ms.meredith?'bruce':'meredith';else if(ok.bruce)win='bruce';else if(ok.meredith)win='meredith';if(win)lt.score[win]++}
 lt.log.push({text:q.text,a:q.a,cat:r.cat,win,v,ok});
 const old={id:r.id,stage:'main'};
 if(lt.i<lt.n){const cat=pick(TRIVIA);const nq=await makeQuestion(R,cat,pick([1,2]),R.turn,{lightning:true});
  R.round={...r,id:'L'+R.turnNo+'n'+lt.i+rid(),cat,tier:nq.tier,q:nq,stage:'main',lightning:{...lt,i:lt.i+1}};
  await setRoom(R);cleanupAns(old,null);return}
 let prize='',winner=null,headline;
 if(R.mode==='coop'){const add=lt.score.team;R.wood+=add;headline=add?`Lightning round: ${add} of 3. +${add} log${add>1?'s':''} for the fire!`:'Lightning round: 0 of 3. No logs this time.'}
 else{const b=lt.score.bruce,m=lt.score.meredith;winner=b>m?'bruce':m>b?'meredith':null;
  if(winner){headline=`${NAME[winner]} wins the lightning round ${Math.max(b,m)}–${Math.min(b,m)}!`;
   if(R.cards[winner].length<3){const c=pick(Object.keys(SAB));R.cards[winner].push(c);prize=`${NAME[winner]} wins a sabotage card: “${SAB[c].n}”.`}
   else{R.dd[winner]=(R.dd[winner]||0)+1;prize=`${NAME[winner]}'s hand is full, so they get an extra Double Down instead.`}}
  else headline=`Lightning round tied ${b}–${m}. No prize.`}
 R.last={rid:r.id,lightning:{log:lt.log,score:lt.score,winner,prize},headline,cat:r.cat,tier:r.tier,kind:'race',q:{text:'',a:'',kind:'lightning'},res:{},claim:R.mode==='coop'?(lt.score.team?'team':null):winner,next:R.turn,skipped:[],active:R.turn};
 R.phase='reveal';R.round=null;await setRoom(R);cleanupAns(old,null);
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
function blankLedger(){return {wins:{bruce:0,meredith:0},ties:0,games:0,versus:0,coop:{wins:0,games:0,bestWood:0},stats:{bruce:{},meredith:{}},history:[],counted:[]}}
// ok:false means the read failed, so nothing should be written back (that would wipe the real ledger).
async function loadLedger(){try{const s=await DB.doc('meta/ledger').get();LEDGER={...blankLedger(),...(s.exists?s.data():{})};LEDGER_OK=true}catch(e){LEDGER=LEDGER||blankLedger();LEDGER_OK=false}return LEDGER}
async function writeLedger(R){
 if(!R||R.ledgerDone||!R.result)return;const key=R.code+'.'+R.createdAt;if(writeLedger.busy===key)return;writeLedger.busy=key;
 try{
  const L=clone(await loadLedger());if(!LEDGER_OK)return;L.counted=L.counted||[];
  if(!L.counted.includes(key)){
   const res=R.result;L.games++;
   if(res.coop){L.coop.games++;if(res.win)L.coop.wins++;L.coop.bestWood=Math.max(L.coop.bestWood||0,res.wood||0)}
   else{L.versus=(L.versus||0)+1;if(res.winner==='tie')L.ties++;else L.wins[res.winner]++}
   for(const s of P)for(const [c,v] of Object.entries(R.stats[s]||{})){const t=(L.stats[s]=L.stats[s]||{})[c]||[0,0];L.stats[s][c]=[t[0]+v[0],t[1]+v[1]]}
   L.history=[{at:Date.now(),board:R.board,mode:R.mode,result:res,stakes:R.stakes||''},...(L.history||[])].slice(0,25);
   L.counted=[key,...L.counted].slice(0,80);
   await DB.doc('meta/ledger').set(L);LEDGER=L;
   // remember which questions you've seen, so the next games pick fresh ones first
   try{const s=await DB.doc('meta/seen').get();const old=s.exists&&s.data().ids||[];const ids=[...new Set([...(R.used||[]).slice().reverse(),...old])].slice(0,900);await DB.doc('meta/seen').set({ids,at:Date.now()})}catch(e){}
  }
  await roomRef().update({ledgerDone:true});
 }catch(e){}finally{writeLedger.busy=null}
}
async function loadSeen(){try{const s=await DB.doc('meta/seen').get();return s.exists&&s.data().ids||[]}catch(e){return[]}}
/* ---------- AI questions ---------- */
async function generateAI(onCount,signal){
 const spice=shuffle(['film and TV','space missions','famous inventors','world geography','2000s pop','2010s hits','90s alternative','hip-hop','country music','music videos','Broadway revivals','Shakespeare','the human body','ocean life','the Olympics','food origins','ancient Rome','ancient Egypt','the Cold War','explorers','medieval life','US presidents','world leaders','weather','kitchen chemistry','landmarks','dinosaurs','languages','art history','animals','technology','the West End']).slice(0,8).join(', ');
 let n=0;const tick=setInterval(()=>{n=Math.min(56,n+1);onCount(n)},1500);
 let res;try{res=await WORKER.questions(spice,signal)}finally{clearInterval(tick)}
 const txt=String(res&&res.text||'');const a=txt.indexOf('['),b=txt.lastIndexOf(']');
 let out;try{out=JSON.parse(txt.slice(a,b+1))}catch(e){throw{code:'invalid_json'}}
 if(!Array.isArray(out))throw{code:'invalid_json'};onCount(60);
 return out.filter(x=>x&&CATS[x.cat]&&CATS[x.cat].kind==='turn'&&[1,2,3,4].includes(+x.tier)&&x.q&&x.a&&Array.isArray(x.wrong)&&x.wrong.length>=3&&!/^(true|false|yes|no)$/i.test(String(x.a).trim()))
  .map((x,i)=>({id:'ai'+Date.now().toString(36)+i,cat:x.cat,tier:+x.tier,q:String(x.q).slice(0,220),a:String(x.a).slice(0,80),alts:Array.isArray(x.alts)?x.alts.map(String).slice(0,5):[],wrong:x.wrong.map(String).slice(0,3)}));
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
  $('#hGames').innerHTML=live.length?live.map(r=>`<div class="list-item"><div><b>${esc(r.code)}</b> <span class="muted">· ${BOARD_NAME[r.board]||'Game'} · ${r.mode==='coop'?'Co-op':'Versus'}${r.phase==='lobby'?' · waiting to start':` · turn ${r.turnNo+1}`}</span></div><button class="btn small" data-join="${esc(r.code)}">Rejoin</button></div>`).join(''):'<div class="empty">No games running. Start one and send the code.</div>';
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
 <li><b>Boards.</b> <b>Territory</b>: claim any glowing tile on the map. <b>Frontier</b> (versus): you each start at a cabin in opposite corners and can only play tiles that touch your land (sides, not corners). You can also raid your opponent's border tiles with a harder question. <b>Fireside</b>: no map, just gifts on the mantel.</li>
 <li><b>Each tile</b> shows its category and difficulty dots: 1 Easy to 4 Expert. Harder means more points.</li>
 <li><b>Trivia</b> (Knowledge, Music, Theatre, Science, History): you answer first. Miss, and the other player can steal. <b>Tunes and Word Play</b> are races: fastest right answer wins. <b>Guess Each Other</b>: they answer about themselves, you guess what they picked.</li>
 <li><b>Double Down</b> (3 each, versus): double a tile before you play it. Win it for double points; miss and your opponent gets it.</li>
 <li><b>Lightning round</b> every 8 turns: three quick multiple-choice questions for both of you. The winner gets a sabotage card.</li>
 <li><b>Final Frost</b>: in the last 4 turns (or the last 4 open tiles), every claim counts double.</li>
 <li><b>Lanterns</b> and plaid gifts hide a bonus or a trap. Sabotage cards are played at the start of your turn and wait until they can bite: Fogged Window waits for a question with choices, Blizzard for a trivia tile below Expert.</li>
 <li><b>Co-op</b>: you both answer every question. Right answers add logs; misses and the storm burn them.</li>
 <li>Easy and Medium are usually multiple choice; Hard and Expert you type. Small typos are fine.</li></ol></div>`;$('#hx').onclick=closeOverlay;}
/* ---------- setup ---------- */
let SETUP={board:'territory',mode:'versus',season:'winter',ai:true,stakes:''};
async function openSetup(){
 show('setup');const L=LEDGER||await loadLedger();const el=$('#scr-setup');const them=NAME[other(ME)];
 const ch=(k,v,t,d,extra='')=>`<button class="choice" data-k="${k}" data-v="${v}" aria-pressed="${SETUP[k]===v}" ${extra}><b>${t}</b><span>${d}</span></button>`;
 el.innerHTML=`<div class="setup">
  <div><div class="label">New game</div><h1 style="font-size:40px">Set the table</h1></div>
  <div class="panel stack"><h3>Board</h3><div class="choice-grid three">
   ${ch('board','territory','Territory','Claim any tile on a 25-tile 3D map. Most points of land wins. About 45–60 minutes.')}
   ${ch('board','frontier','Frontier','Versus. Start at your cabin and grow into tiles that touch your land. Raid each other\'s borders. 36 turns, about 45 minutes.')}
   ${ch('board','fireside','Fireside','No map. Open a gift from the mantel each turn. 16 rounds on the chalk slate. About 30–40 minutes.')}
  </div></div>
  <div class="panel stack"><h3>How you play</h3><div class="choice-grid">
   ${ch('mode','versus','Versus','Head to head with steals, races and sabotage cards.')}
   ${ch('mode','coop','Co-op · Survive the storm','Answer together. Right answers feed the fire; misses and the storm burn it down. Territory or Fireside.')}
  </div></div>
  <div class="panel stack"><h3>Season</h3><p class="muted" style="margin:0">New seasons unlock as you play more games together (${L.games} played).</p><div class="season-grid">
   ${SEASONS.map(s=>{const lock=L.games<s.need;return `<button class="choice" data-k="season" data-v="${s.id}" aria-pressed="${SETUP.season===s.id}" ${lock?'disabled':''}><div class="swatch" style="background:${s.sw}"></div><b style="font-size:16px">${s.n}</b><span>${lock?`Unlocks at ${s.need} games`:'Unlocked'}</span></button>`}).join('')}
  </div></div>
  <label class="toggle"><input type="checkbox" id="sAI" ${SETUP.ai&&AI_OK?'checked':''} ${AI_OK?'':'disabled'}><span><b>Mix in fresh questions written by Claude</b><br><span class="muted">${AI_OK?'Writes 60 new questions before the game starts (about a minute). Built-in questions fill any gaps.':'Not set up yet (add your Claude API key to the Worker). The built-in set has '+BANK_OBJS.length+' trivia questions.'}</span></span></label>
  <div class="panel stack"><h3>Stakes <span class="muted" style="font-family:var(--body);font-size:14px">(optional)</span></h3>
   <input type="text" id="sStakes" maxlength="80" placeholder="Winner picks the next movie" value="${esc(SETUP.stakes)}">
   <div class="stake-chips">${['Winner picks the next movie','Loser writes a love note','Winner picks dinner','Loser plans the next date','Winner gets a 10-minute back rub'].map(s=>`<button data-stake="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>
  <div id="sGen" class="panel stack" hidden><h3>Writing fresh questions…</h3><div class="progress"><i id="sBar"></i></div><div class="row" style="justify-content:space-between"><span class="muted" id="sCount">Asking Claude…</span><button class="btn ghost small" id="sSkip">Skip and use built-in questions</button></div></div>
  <div class="row" style="justify-content:space-between"><button class="btn ghost" id="sBack">Back</button><button class="btn big" id="sGo">Create game &amp; get a code</button></div>
 </div>`;
 const sync=()=>{if(SETUP.mode==='coop'&&SETUP.board==='frontier')SETUP.board='territory';$$('[data-k]',el).forEach(x=>{x.setAttribute('aria-pressed',SETUP[x.dataset.k]===x.dataset.v);if(x.dataset.v==='frontier')x.disabled=SETUP.mode==='coop'})};
 $$('[data-k]',el).forEach(b=>b.onclick=()=>{if(b.disabled)return;SETUP[b.dataset.k]=b.dataset.v;sync()});sync();
 $$('[data-stake]',el).forEach(b=>b.onclick=()=>{$('#sStakes').value=b.dataset.stake});
 $('#sBack').onclick=()=>{show('home');renderHome()};
 $('#sGo').onclick=async()=>{
  SETUP.stakes=$('#sStakes').value.trim();SETUP.ai=$('#sAI').checked;const go=$('#sGo');go.disabled=true;
  let aiQs=[];
  if(SETUP.ai&&AI_OK){const box=$('#sGen');box.hidden=false;const ctl=new AbortController();$('#sSkip').onclick=()=>ctl.abort();
   try{aiQs=await generateAI(n=>{$('#sBar').style.width=Math.min(100,n/60*100)+'%';$('#sCount').textContent=`${n} of 60 written`},ctl.signal);toast(`${aiQs.length} fresh questions added.`)}
   catch(e){if(e&&e.code!=='cancelled')toast(e&&e.code==='forbidden'?'The Worker rejected your house key. Using the built-in set.':'Could not write fresh questions this time. Using the built-in set.')}
   box.hidden=true}
  try{const code=await newCode();const avoid=await loadSeen();const R=newState(code,{...SETUP,aiQs,avoid});await DB.doc('rooms/'+code).set(R);await joinRoom(code)}catch(e){toast('Could not create the game. Check your connection and try again.')}
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
 if(R.phase==='over'&&!R.ledgerDone&&!PRACTICE()){const c=R.code,k=c+R.createdAt;if(onRoom.lt!==k){onRoom.lt=k;setTimeout(()=>{if(ROOM&&ROOM.code===c&&ROOM.phase==='over'&&!ROOM.ledgerDone)writeLedger(ROOM)},9000)}}
}

/* ---------- game render ---------- */
function render(){if(!ROOM)return;renderHud();renderStage();renderDock();renderOverlay()}
function renderHud(){
 const R=ROOM;const el=$('#hud');const activeSeat=R.phase==='round'&&R.round?R.round.active:R.turn;const live=['pick','round','reveal'].includes(R.phase);
 const plate=(s,right)=>{const tiles=R.slots.filter(t=>t.owner===s&&!t.base).length;const st=Object.values(R.stats[s]||{}).reduce((a,v)=>a+v[0],0);const nc=R.cards[s].length;
  const bits=R.mode==='coop'?[`${st} correct`]:[isMap(R)?`${tiles} tile${tiles===1?'':'s'}`:null,`${nc} card${nc===1?'':'s'}`,].filter(Boolean);const ddb=R.mode==='versus'&&R.dd?`<span class="b-dd"> · ${R.dd[s]} double${R.dd[s]===1?'':'s'}</span>`:'';
  const fx=R.effects[s];const sk=+fx.skip||0;const warn=R.mode==='versus'?[sk&&(sk>1?`snowed in ×${sk}`:'snowed in'),fx.blizzard&&'blizzard',fx.fuse&&'short fuse',fx.fog&&'fogged'].filter(Boolean):[];
  return `<div class="plate ${s} ${right?'right':''} ${live&&activeSeat===s?'active':''}">${dot(s)}<div class="meta"><div class="row" style="gap:8px;${right?'justify-content:flex-end':''}"><span class="name">${NAME[s]}${s===ME&&!PRACTICE()?' (you)':''}</span><span class="turnpill">${live&&activeSeat===s?'Turn':'Waiting'}</span></div><div class="sub">${bits.join(' · ')}${ddb}${warn.length?` · <span style="color:#ffd08a">${warn.join(', ')}</span>`:''}</div></div>${R.mode==='versus'?`<div class="score num">${score(R,s)}</div>`:''}</div>`};
 let center;
 if(R.mode==='coop'){const w=Math.max(0,R.wood);center=`<div class="center-hud"><span class="label">Firewood</span><div class="wood" aria-label="${w} logs">${Array.from({length:Math.max(12,w)},(_,i)=>`<i class="${i<w?'':'out'}"></i>`).join('')}</div><span class="muted" style="font-size:13px">${R.board==='territory'?`${R.slots.filter(t=>t.owner).length}/25 claimed · turn ${R.turnNo+1}/${R.maxTurns}`:`Round ${Math.min(R.turnNo+1,R.maxTurns)} of ${R.maxTurns}`}</span></div>`}
 else{const fr=live&&frostOn(R);const ft=finalTurn(R);const big=R.board==='territory'?`${R.slots.filter(t=>!t.owner).length} tiles open`:R.board==='frontier'?`Turn ${Math.min(R.turnNo+1,ft)} of ${ft}`:`Round ${Math.min(R.turnNo+1,R.maxTurns)} of ${R.maxTurns}`;
  center=`<div class="center-hud${fr?' frost':''}"><span class="label">${fr?'Final Frost · claims count double':`${BOARD_NAME[R.board]} · Versus`}</span><span class="big num">${big}</span><span class="muted" style="font-size:13px">${R.board==='frontier'&&R.endsAt!=null?'Every tile is taken. Last turns!':`Code ${esc(R.code)}`}</span></div>`}
 el.innerHTML=plate('bruce')+center+plate('meredith',true);
}
function canPick(){const R=ROOM;return R.phase==='pick'&&(PRACTICE()||R.turn===ME)}
function renderStage(){
 const R=ROOM;const st=$('#stage');
 if(R.phase==='lobby'){BUILT=null;return renderLobby(st)}
 if(isMap(R)){
  const key=R.code+R.season+R.board;if(BUILT!==key){buildBoard(st);BUILT=key}
  updateBoard();
 }else{BUILT=null;renderFireside(st)}
}
function legendHTML(){return `<div class="legend" aria-label="Legend">${Object.keys(CATS).map(c=>`<span class="lg">${icon(c)}${CATS[c].short}</span>`).join('')}<span class="lg" style="padding-left:9px">${pips(2)} difficulty</span></div>`}
const TREE_SVG=`<svg viewBox="0 0 26 42"><rect x="11.5" y="33" width="3" height="9" fill="var(--trunk)"/><path d="M13 0 25 18H18L24 28H16L22 36H4L10 28H2L8 18H1Z" fill="var(--tree1)"/><path d="M13 0 25 18H18L24 28H16L22 36H13Z" fill="var(--tree2)" opacity=".55"/><path d="M13 0 18 8 15 7 13 9 11 7 8 8Z" fill="var(--snowcap)"/></svg>`;
const ROCK_SVG=`<svg viewBox="0 0 30 20"><path d="M2 20 7 8 13 4 20 7 27 12 29 20Z" fill="#7d8b95"/><path d="M13 4 20 7 27 12 29 20H16Z" fill="#5d6a73"/><path d="M7 8 13 4 20 7 15 9 10 10Z" fill="var(--snowcap)"/></svg>`;
const CABIN_SVG=`<svg viewBox="0 0 56 50"><path d="M4 26 28 8l24 18v24H4z" fill="#7a4f33"/><path d="M4 32h48M4 38h48M4 44h48" stroke="#5a3824" stroke-width="2"/><path d="M0 28 28 6l28 22-4 3L28 12 4 31z" fill="var(--snowcap)" stroke="#e9eef1" stroke-width="1"/><rect x="38" y="6" width="7" height="12" fill="#5d6064"/><rect x="12" y="32" width="10" height="8" fill="#ffc46b"/><rect x="31" y="36" width="9" height="14" fill="#3a2618"/></svg><span class="smoke"></span><span class="smoke b"></span><span class="smoke c"></span>`;
const SHIELD_SVG='<svg viewBox="0 0 20 24"><path d="M10 1 19 5v7c0 5.5-4 9.5-9 11C5 21.5 1 17.5 1 12V5z" fill="#e9eef1" stroke="#14212a" stroke-width="2"/><path d="M10 6v12M5 10h10" stroke="#14212a" stroke-width="2"/></svg>';
function badgeHTML(t){
 if(t.base)return `<div class="bb flag base" style="left:calc(66% - var(--s)*.25);top:calc(46% - var(--s)*.85);--fc:var(--${t.base})"><span class="pole"></span><span class="cloth">${NAME[t.base][0]}</span></div>`;
 if(t.owner)return `<div class="bb flag" style="left:calc(50% - var(--s)*.25);top:calc(50% - var(--s)*.85);--fc:var(--${t.owner})"><span class="pole"></span><span class="cloth">${t.owner==='team'?'★':NAME[t.owner][0]}</span>${t.fort?`<span class="fortmark" title="Fortified">${SHIELD_SVG}</span>`:''}${t.dbl?'<span class="x2">×2</span>':''}</div>`;
 return `<div class="bb badge" style="left:calc(50% - var(--s)*.25);top:calc(50% - var(--s)*.66);--c:${CATS[t.cat].c};--d:${(t.x*3+t.y*7)%10*.3}s"><div class="float"><div class="disc">${ICON[t.cat]}</div>${pips(t.tier)}</div>${t.mystery&&!t.revealed?'<span class="lantern">?</span>':''}</div>`;
}
function buildBoard(st){
 const R=ROOM;const N=R.n||5;const tvar={meadow:'meadow',pines:'pines',lake:'lake',ridge:'ridge',peak:'ridge'};
 st.innerHTML=legendHTML()+`<div class="scene" data-season="${R.season}" data-n="${N}"><div class="board" id="board" style="width:calc(var(--s)*${N});height:calc(var(--s)*${N})">${R.slots.map(t=>{const v=tvar[t.terrain];
  const deco=t.deco.map(({k,x:px,y:py,s:sc})=>k==='tree'?`<div class="bb tree" style="left:calc(${px*100}% - var(--s)*${.13*sc});top:calc(${py*100}% - var(--s)*${.42*sc});width:calc(var(--s)*${.26*sc});height:calc(var(--s)*${.42*sc})">${TREE_SVG}</div>`:`<div class="bb rock" style="left:calc(${px*100}% - var(--s)*.15);top:calc(${py*100}% - var(--s)*.2)">${ROCK_SVG}</div>`).join('');
  const cabin=t.cabin?`<div class="bb cabin-deco" style="left:calc(30% - var(--s)*.27);top:calc(26% - var(--s)*.5)">${CABIN_SVG}</div>`:'';
  const label=t.base?`${NAME[t.base]}'s cabin`:`${CATS[t.cat].name}, ${TIER[t.tier].n}`;
  return `<div class="tile ${t.terrain} enter" data-id="${t.id}" role="button" tabindex="-1" aria-label="${label}" style="left:calc(var(--s)*${t.x});top:calc(var(--s)*${t.y});--h:calc(var(--s)*${(t.h/96).toFixed(3)});--top:var(--${v});--side:var(--${v}-s);--d:${(t.x+t.y)*70}ms"><div class="fe"></div><div class="fs"></div><div class="top"><i class="mark" style="--c:${t.cat?CATS[t.cat].c:'#ffe2b8'}"></i></div>${deco}${cabin}<div class="slotbb" data-owner="">${badgeHTML(t)}</div></div>`}).join('')}</div></div>`;
 $('#board').onclick=e=>{const tile=e.target.closest('.tile');if(!tile||!tile.classList.contains('can'))return;SEL=tile.dataset.id;updateBoard();renderDock()};
 $('#board').onkeydown=e=>{if(e.key!=='Enter'&&e.key!==' ')return;const tile=e.target.closest('.tile');if(!tile||!tile.classList.contains('can'))return;e.preventDefault();SEL=tile.dataset.id;updateBoard();renderDock();$('#dPlay')&&$('#dPlay').focus()};
 setTimeout(()=>$$('.tile.enter').forEach(t=>t.classList.remove('enter')),1800);
}
function updateBoard(){
 const R=ROOM;const can=canPick();const L=can?legalTiles(R,R.turn):null;
 if(SEL&&L&&!L.expand.has(SEL)&&!L.raid.has(SEL))SEL=null;
 for(const t of R.slots){const el=$(`.tile[data-id="${t.id}"]`);if(!el)continue;
  const ex=can&&L.expand.has(t.id),rd=can&&L.raid.has(t.id),ok=ex||rd;
  el.classList.toggle('can',ok);el.classList.toggle('raid',rd);el.classList.toggle('sel',SEL===t.id);el.classList.toggle('base',!!t.base);
  P.concat('team').forEach(s=>el.classList.toggle('own-'+s,t.owner===s));
  el.classList.toggle('dim',R.phase==='pick'&&can&&!ok);
  const holder=el.querySelector('.slotbb');const sig=(t.owner||'')+'|'+(t.revealed?1:0)+'|'+(t.fort?1:0)+'|'+(t.dbl?1:0);
  if(holder.dataset.owner!==sig){const first=holder.dataset.owner==='';const prevOwner=holder.dataset.owner.split('|')[0];holder.dataset.owner=sig;holder.innerHTML=badgeHTML(t);if(!first&&t.owner&&t.owner!==prevOwner){el.classList.add('claimed-now');setTimeout(()=>el.classList.remove('claimed-now'),1000)}}
  el.setAttribute('tabindex',ok?'0':'-1');
 }
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
  <div class="muted">${BOARD_NAME[R.board]||'Game'} · ${R.mode==='coop'?'Co-op':'Versus'} · ${SEASONS.find(s=>s.id===R.season).n}${R.aiQs&&R.aiQs.length?` · ${R.aiQs.length} fresh questions`:''}</div>
  ${R.stakes?`<div class="stakes">Stakes: ${esc(R.stakes)}</div>`:''}
  <button class="btn big" id="lStart" ${both||PRACTICE()?'':'disabled'}>${both||PRACTICE()?'Light the fire &amp; start':`Waiting for ${esc(NAME[R.seats.bruce?'meredith':'bruce'])}…`}</button>
  <p class="muted" style="font-size:14px;max-width:46ch">${NAME[R.turn]} goes first. Either of you can start once you're both here.</p></div>`;
 $('#lCopy').onclick=()=>{navigator.clipboard?.writeText(R.code).then(()=>toast('Code copied.'),()=>toast('Copy failed. The code is '+R.code))};
 $('#lStart').onclick=async()=>{const N=clone(ROOM);N.phase='pick';await setRoom(N);sfx('turn')};
}
function renderDock(){
 const R=ROOM;const el=$('#dock');if(!R)return;
 if(R.phase==='lobby'){el.innerHTML=`<div class="status"><div class="say">Waiting at the door</div><div class="hint">Share the code. The game starts when you both press start.</div></div><div class="dock-actions"><button class="btn ghost small" id="dHome">Leave</button></div>`;$('#dHome').onclick=goHome;return}
 const act=actingSeat();const mine=PRACTICE()||R.turn===ME;let say='',hint='',acts='',ddHTML='';
 if(R.phase==='pick'){
  if(mine){
   const t=SEL&&R.slots.find(s=>s.id===SEL);const opp=other(R.turn);
   if(BUSY){say='Getting the question ready…';hint='One moment.'}
   else if(t){const raid=R.board==='frontier'&&t.owner===opp;const tier=Math.min(4,t.tier+(raid?1:0));const kind=CATS[t.cat].kind;const E=R.effects[R.turn];
    const fr=R.mode==='versus'&&frostOn(R)&&!raid;const canDD=R.mode==='versus'&&!raid&&!fr&&!!(R.dd&&R.dd[R.turn]>0);if(!canDD)DD=false;
    const pts=t.tier*((DD||fr)?2:1);
    say=`${raid?'Raid · ':''}${CATS[t.cat].name} · ${TIER[tier].n}`;
    const notes=[raid?`Win to take it from ${NAME[opp]}. Miss, and ${NAME[opp]} can defend it and fortify it for good`:`${pts} point${pts>1?'s':''}`];
    if(fr)notes.push('Final Frost: double points');
    if(DD)notes.push(`Double Down: miss and ${NAME[opp]} gets it`);
    if(t.mystery&&!t.revealed)notes.push('mystery inside');
    if(R.mode==='versus'&&E.blizzard&&kind==='turn'&&tier<4)notes.push('Blizzard: one step harder');
    hint=notes.join(' · ');
    if(canDD)ddHTML=`<button class="ddchip" id="dDD" aria-pressed="${DD}"><i>×2</i>${DD?'Doubled down':'Double Down'} <span>${R.dd[R.turn]} left</span></button>`;
    acts=`<button class="btn ghost" id="dCancel">Choose another</button><button class="btn big" id="dPlay">${raid?'Raid this tile':isMap(R)?'Play this tile':'Open this gift'}</button>`}
   else{say=`${PRACTICE()?NAME[R.turn]+"'s":'Your'} turn: ${isMap(R)?'pick a glowing tile':'choose a gift'}`;
    hint=R.board==='frontier'?(legalTiles(R,R.turn).boxed?'You\'re boxed in, so any open tile is fair game.':`Glowing tiles touch your land. Red-edged ones belong to ${NAME[opp]}: raid them with a harder question.`):R.board==='territory'?'The icon shows the category. More dots means harder and more points.':'More dots means harder and more points. Plaid paper hides a surprise.';}
  }else{say=`${NAME[R.turn]} is choosing…`;const fx=R.effects[ME];hint=R.mode==='versus'&&fx&&(fx.blizzard||fx.fuse||fx.fog||+fx.skip)?`Heads up: ${[+fx.skip&&'you\'re snowed in next turn',fx.blizzard&&'Blizzard is waiting for you',fx.fuse&&'Short Fuse is waiting for you',fx.fog&&'Fogged Window is waiting for you'].filter(Boolean).join('; ')}.`:isMap(R)?'You can look around the map while you wait.':'Waiting for their pick.'}
 }else if(R.phase==='round'){say=R.round&&R.round.lightning?'Lightning round':'Question in play';hint='Answer in the card.';acts=`<button class="btn ghost small" id="dShow">Show question</button>`}
 else if(R.phase==='reveal'){const L=R.last;say=L?L.headline:'';const nextMine=PRACTICE()||R.turn===ME;const sk=L?(Array.isArray(L.skipped)?L.skipped:L.skipped?[L.skipped]:[]):[];hint=sk.length?`${sk.map(x=>NAME[x]).join(' and ')} ${sk.length>1?'were':'is'} snowed in. ${NAME[R.turn]} is up.`:`Next up: ${NAME[R.turn]}.`;acts=nextMine?`<button class="btn big" id="dNext">${PRACTICE()?`Start ${NAME[R.turn]}'s turn`:'Start my turn'}</button>`:`<span class="muted">Waiting for ${NAME[R.turn]}…</span>`}
 else if(R.phase==='over'){say='Game over';acts=`<button class="btn" id="dOver">See results</button>`}
 const hand=R.mode==='versus'&&R.phase==='pick'&&mine?R.cards[R.turn]:[];
 el.innerHTML=`<div class="status"><div class="say">${esc(say)}</div><div class="hint">${esc(hint)}</div>${ddHTML}
  ${hand.length?`<div class="hand" style="margin-top:8px">${hand.map((k,i)=>{const pend=cardPending(R,other(R.turn),k);return `<div class="scard"><b>${SAB[k].n}</b><span>${esc(SAB[k].d(NAME[other(R.turn)]))}</span><button class="btn small ghost" data-card="${i}" ${R.playedCard||pend||BUSY?'disabled':''}>${R.playedCard?'One card per turn':pend?'Already waiting':`Use on ${NAME[other(R.turn)]}`}</button></div>`}).join('')}</div>`:''}</div>
  <div class="dock-actions">${R.stakes?`<span class="stakes" title="Stakes">${esc(R.stakes)}</span>`:''}${acts}<button class="btn ghost small" id="dHow">Rules</button><button class="btn ghost small" id="dHome">Leave</button></div>`;
 $('#dHome').onclick=goHome;$('#dHow').onclick=showHowTo;
 $('#dCancel')&&($('#dCancel').onclick=()=>{SEL=null;renderStage();renderDock()});
 $('#dDD')&&($('#dDD').onclick=()=>{DD=!DD;renderDock()});
 $('#dPlay')&&($('#dPlay').onclick=async e=>{e.target.disabled=true;await pickSlot(SEL,DD).catch(()=>{e.target.disabled=false})});
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
function qHead(R,q,r){const t=R.slots.find(x=>x.id===r.slotId);const two=R.mode==='versus'&&!r.raid&&(r.dd||r.frost);const pts=t?t.tier*(two?2:1):0;
 const tags=[r.fx&&r.fx.blizzard&&'Blizzard!',r.raid&&'Raid',r.dd&&'Double Down',r.frost&&!r.raid&&R.mode==='versus'&&'Final Frost'].filter(Boolean);
 return `${r.lightning?`<div class="lbanner">${ICON.bolt}<b>Lightning round</b><span>Question ${r.lightning.i} of ${r.lightning.n} · fastest right answer scores</span></div>`:''}<div class="qhead">${icon(r.cat,34)}<div><div class="cat">${CATS[r.cat].name}</div><div class="row" style="gap:8px;font-size:13px">${pips(q.tier)}<span class="muted">${TIER[q.tier].n}${t?` · ${pts} pt${pts>1?'s':''}`:''}${tags.length?' · <b class="tagx">'+tags.join(' · ')+'</b>':''}</span></div></div>${srcChip(q)}<div class="timer" id="tmr" hidden><svg viewBox="0 0 54 54"><circle class="bg" cx="27" cy="27" r="23"/><circle class="fg" cx="27" cy="27" r="23" stroke-dasharray="144.5" stroke-dashoffset="0"/></svg><b>--</b></div></div>`}
function questionCard(R,s,role,doFlip){
 const r=R.round,q=r.q;const them=other(s);const act=r.active;
 if(PRACTICE()&&role!=='watch'&&!LOCAL.handed){return `<div class="qcard flip hand-over" style="--c:${CATS[r.cat].c}">${dot(s)}<h2>${NAME[s]}'s answer</h2><p class="muted">Hand the laptop to ${NAME[s]} so ${NAME[them]} can't peek.</p><button class="btn big" id="qHand">I'm ${NAME[s]}, show me</button></div>`}
 let body='';
 const text=q.kind==='us'?(role==='predict'?`What would ${NAME[them]} pick?`:role==='self'?'Answer about yourself, honestly.':'Guess Each Other'):'';
 if(q.kind==='us'){body+=`<div class="qtext">${esc(q.text.replace(/\{them\}/g,role==='self'?NAME[s]:NAME[r.active===s?them:other(r.active)]))}</div><p class="muted" style="margin-top:-8px">${esc(text)}</p>`}
 else if(q.kind==='anagram'||q.kind==='vowel'){body+=`<div class="qtext">${esc(q.text)}</div><div class="letters">${q.shown.split('').map((c,i)=>c===' '?'<span class="gap"></span>':`<span style="animation-delay:${i*60}ms">${esc(c)}</span>`).join('')}</div><p class="muted" style="margin:-6px 0 14px;text-align:center">Hint: ${esc(q.hint)}</p>`}
 else if(q.kind==='tune'){body+=`<div class="qtext">${esc(q.text)}</div><div class="musicbox"><div class="drum" id="drum"></div><div class="bars" id="bars" style="--c:${CATS.tune.c}"><i></i><i></i><i></i><i></i><i></i></div><button class="btn ghost small" id="qReplay">Play again</button></div>${q.src==='deezer'?'<p class="muted" style="font-size:12px;text-align:center;margin:-10px 0 14px">Preview courtesy of Deezer</p>':''}`}
 else body+=`<div class="qtext">${esc(q.text)}</div>`;
 if(r.stage==='steal'){const miss=r.res&&r.res[act];body=`<div class="mys bad" style="animation:none;margin-bottom:12px"><div><b>${NAME[act]} answered “${esc(miss&&miss.v||'nothing')}”, which is wrong.</b><br><span class="muted">${r.raid?(s===other(act)&&role==='answer'?'Defend your land! Get it right and the tile is fortified for good.':`${NAME[other(act)]} gets one shot to defend it.`):(s===other(act)&&role==='answer'?'Steal it! Get it right and it\'s yours.':`${NAME[other(act)]} gets one shot to steal.`)}</span></div></div>`+body}
 let ans='';
 if(role==='watch'){const who=needSeats(R).filter(x=>!hasAns(R,x));ans=`<div class="waiting" style="--c2:var(--${who[0]||'ember'})"><span class="pulse"></span>${who.length?`${who.map(x=>NAME[x]).join(' and ')} ${who.length>1?'are':'is'} answering…`:'Checking answers…'}</div><div id="qStuck"></div>`;
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
 if(role==='watch'||LOCAL.submitted){if(q.kind==='tune'&&!LOCAL.played&&role==='watch'){LOCAL.played=1;doPlay()}watchStuck(R);return}
 // timer
 let extra=0;if(q.kind==='tune'&&!LOCAL.played){LOCAL.played=1;extra=doPlay()||(q.preview?(q.clip||10):q.audio?20:0)}
 let base=r.lightning?15:r.stage==='steal'?15:TIER[q.tier].time;if(r.fx&&r.fx.fuse&&s===r.active&&r.stage==='main')base=Math.ceil(base/2);
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
 const foot=`<div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost" id="rView">See the ${isMap(R)?'map':'mantel'}</button>${nextMine?`<button class="btn" id="rNext">${PRACTICE()?`Start ${NAME[R.turn]}'s turn`:'Start my turn'}</button>`:`<span class="muted">Next: ${NAME[R.turn]}</span>`}</div>`;
 if(L.lightning){const lt=L.lightning;const co=R.mode==='coop';
  return `<div class="qcard flip" style="--c:#ffd46b"><div class="lbanner">${ICON.bolt}<b>Lightning round</b><span>${co?`${lt.score.team} of 3 together`:`Bruce ${lt.score.bruce} · Meredith ${lt.score.meredith}`}</span></div><div class="result"><div class="headline">${esc(L.headline)}</div>
  <div class="lt-log">${lt.log.map((x,i)=>`<div class="lt-row"><span class="n">${i+1}</span><div style="min-width:0"><div class="muted" style="font-size:14px">${esc(x.text)}</div><b>${esc(x.a)}</b></div><span>${x.win?(x.win==='team'?'<span class="ok">✓</span>':dot(x.win)):'<span class="muted">–</span>'}</span></div>`).join('')}</div>
  ${lt.prize?`<div class="mys"><span class="lamp"></span><div><b>Prize</b><br><span class="muted">${esc(lt.prize)}</span></div></div>`:''}${foot}</div></div>`}
 const coopLine=R.mode==='coop'?`<div class="muted">${L.woodDelta>0?`+${L.woodDelta} logs`:`${L.woodDelta} log`}${L.storm?' · the storm took 1 log':''} · ${Math.max(0,R.wood)} left</div>`:'';
 const sk=Array.isArray(L.skipped)?L.skipped:L.skipped?[L.skipped]:[];const fx=L.fx||{};
 const notes=[L.ddLost&&`Double Down: a miss hands it to ${NAME[other(L.active)]}.`,L.dd&&!L.ddLost&&L.claim===L.active&&'Double Down paid off: double points.',L.frost&&'Final Frost: this claim counts double.',L.fortified&&'Fortified tiles can never be raided.',
  fx.fog&&`Fogged Window took away ${NAME[L.active]}'s choices.`,fx.fuse&&`Short Fuse halved ${NAME[L.active]}'s timer.`,fx.blizzard&&'Blizzard made it one step harder.'].filter(Boolean);
 const turnLine=sk.length?`${sk.map(x=>NAME[x]).join(' and ')} ${sk.length>1?'were':'is'} snowed in. ${NAME[R.turn]} is up.`:L.extra&&L.extraWho?(L.extraWho===L.active?`${NAME[L.extraWho]} takes another turn.`:`${NAME[L.extraWho]} gets two turns in a row.`):'';
 return `<div class="qcard flip" style="--c:${CATS[L.cat].c}"><div class="qhead">${icon(L.cat,34)}<div><div class="cat">${CATS[L.cat].name}</div><div class="row" style="gap:8px;font-size:13px">${pips(L.tier)}<span class="muted">${TIER[L.tier].n}${L.raid?' · Raid':''}</span></div></div></div>
 <div class="result"><div class="headline">${esc(L.headline)}</div>
 ${showAns?`<div class="answer-line"><span class="muted" style="font-size:13px">Answer</span><div style="font-weight:700;font-size:20px">${esc(L.q.a)}</div>${L.q.artist?`<div class="muted" style="font-size:14px">${esc(L.q.artist)}${L.q.show?` · from ${esc(L.q.show)}`:''}</div>`:''}<div class="muted" style="font-size:14px">${esc(L.q.text)}${L.q.shown?` <b>${esc(L.q.shown)}</b>`:''}</div></div>`:''}
 <div class="pl-res">${P.map(s=>resLine(L,s)).join('')}</div>${coopLine}
 ${L.mys?`<div class="mys ${L.mys.good?'':'bad'}"><span class="lamp"></span><div><b>${esc(L.mys.title)}</b><br><span class="muted">${esc(L.mys.text)}</span></div></div>`:''}
 ${notes.length?`<div class="muted" style="font-size:14px">${notes.map(esc).join(' ')}</div>`:''}
 ${turnLine?`<div class="muted">${esc(turnLine)}</div>`:''}
 ${foot}</div></div>`;
}
function wireReveal(R,key){$('#rView').onclick=()=>{HIDE_REVEAL=key;closeOverlay()};const n=$('#rNext');if(n)n.onclick=()=>{n.disabled=true;startTurn()}}
const AWARD_CAT={gk:'Know-It-All',mus:'Music Nerd',thr:'Theatre Kid',sci:'Lab Rat',his:'History Buff',word:'Wordsmith',tune:'Human Jukebox',us:'Mind Reader'};
function awards(R){const out=[];const st=R.stats||{};const pl=n=>n===1?'':'s';
 for(const c of Object.keys(AWARD_CAT)){const b=((st.bruce||{})[c]||[0])[0],m=((st.meredith||{})[c]||[0])[0];if(Math.max(b,m)>=2&&b!==m){const w=b>m?'bruce':'meredith';out.push({t:AWARD_CAT[c],w,d:`${Math.max(b,m)} right in ${CATS[c].short}`})}}
 if(R.mode==='versus'&&R.aw){const A=R.aw;const top=k=>{const b=A.bruce[k]||0,m=A.meredith[k]||0;return Math.max(b,m)>=1&&b!==m?(b>m?'bruce':'meredith'):null};let w;
  if(w=top('steals'))out.push({t:'Cat Burglar',w,d:`${A[w].steals} steal${pl(A[w].steals)}`});
  {const b=A.bruce.fast,m=A.meredith.fast;if(Math.min(b,m)<1e8&&b!==m){w=b<m?'bruce':'meredith';out.push({t:'Speed Demon',w,d:`Fastest race win: ${(A[w].fast/1000).toFixed(1)}s`})}}
  if(w=top('raids'))out.push({t:'Raider',w,d:`${A[w].raids} successful raid${pl(A[w].raids)}`});
  if(w=top('defends'))out.push({t:'Iron Wall',w,d:`${A[w].defends} tile${pl(A[w].defends)} defended`});
  if(w=top('hit'))out.push({t:'Snowed Under',w,d:`Hit by ${A[w].hit} sabotage card${pl(A[w].hit)}`});}
 return out.slice(0,6)}
function overCard(R){
 const res=R.result||{};let head,sub='';
 if(res.coop){head=res.win?'You survived the storm!':res.timeout?'Dawn came before the woods were claimed':'The fire went out';sub=res.win?`${res.wood} logs left${R.board==='territory'?` and all 25 tiles claimed`:''}.`:`You claimed ${res.claimed||0} tiles together. Try again?`}
 else{head=res.winner==='tie'?"It's a tie!":`${NAME[res.winner]} wins!`;if(R.stakes)sub=res.winner==='tie'?`Stakes (“${R.stakes}”) are a wash. Rematch?`:`Stakes: ${R.stakes}. ${NAME[res.winner]} collects.`}
 return `<div class="qcard flip" style="--c:var(--${res.coop?'team':res.winner==='tie'?'ember':res.winner})"><div class="result" style="text-align:center;justify-items:center"><div class="label">Game over</div><div class="headline" style="font-size:40px">${esc(head)}</div>
 ${res.coop?'':`<div class="over-scores">${P.map(s=>`<div class="s">${dot(s)}<b class="num">${res.scores[s]}</b><span class="muted">${NAME[s]}</span></div>`).join('')}</div>`}
 <p class="muted" style="margin:0">${esc(sub)}</p>
 ${(()=>{const aw=awards(R);return aw.length?`<div class="awards">${aw.map(a=>`<div class="award">${dot(a.w)}<div><b>${esc(a.t)}</b><span class="muted">${esc(a.d)}</span></div></div>`).join('')}</div>`:''})()}
 <div class="row" style="justify-content:center">${R.next?`<button class="btn" id="oNext">Join the rematch (${esc(R.next)})</button>`:`<button class="btn" id="oRe">Rematch</button>`}<button class="btn ghost" id="oLedger">Open the ledger</button><button class="btn ghost" id="oHome">Home</button><button class="btn ghost" id="oView">See the board</button></div></div></div>`;
}
function wireOver(R,key){
 if(!wireOver.done)wireOver.done={};if(!wireOver.done[key]){wireOver.done[key]=1;const res=R.result||{};if(res.coop?res.win:(PRACTICE()||res.winner===ME||res.winner==='tie'))confetti()}
 $('#oHome').onclick=goHome;$('#oLedger').onclick=()=>{leaveRoom();openLedger()};$('#oView').onclick=()=>{HIDE_REVEAL=key;closeOverlay()};
 const re=$('#oRe');if(re)re.onclick=async()=>{re.disabled=true;try{const code=await newCode();const N=newState(code,{board:R.board,mode:R.mode,season:R.season,stakes:R.stakes,aiQs:(R.aiQs||[]).filter(x=>!R.used.includes(x.id)),avoid:[...(R.used||[]).slice().reverse(),...(R.avoid||[])]});await DB.doc('rooms/'+code).set(N);await roomRef().update({next:code});joinRoom(code)}catch(e){re.disabled=false;toast('Could not start a rematch.')}};
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
  <div class="choice-grid"><label class="stack" style="gap:6px"><span class="label">Category</span><select id="wCat">${['gk','mus','thr','sci','his','tune'].map(c=>`<option value="${c}">${CATS[c].name}</option>`).join('')}</select></label>
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
 <div class="panel stack" style="margin-top:16px"><h3>Recent games</h3>${L.history&&L.history.length?`<div class="tablewrap"><table class="hist"><thead><tr><th>Date</th><th>Game</th><th>Result</th><th>Stakes</th></tr></thead><tbody>${L.history.map(h=>`<tr><td class="num">${new Date(h.at).toLocaleDateString()}</td><td>${BOARD_NAME[h.board]||'Game'} · ${h.mode==='coop'?'Co-op':'Versus'}</td><td>${h.result.coop?(h.result.win?'Survived':'Fire went out'):h.result.winner==='tie'?`Tie ${h.result.scores.bruce}–${h.result.scores.meredith}`:`${NAME[h.result.winner]} won ${h.result.scores.bruce}–${h.result.scores.meredith}`}</td><td>${esc(h.stakes||'–')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Finished games will show up here.</div>'}</div>`;
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
if(/[?&]cntest\b/.test(location.search))window.__cnTest={room:()=>ROOM,legal:(p)=>{const L=legalTiles(ROOM,p);return {expand:[...L.expand],raid:[...L.raid],boxed:L.boxed}},bank:()=>BANK_OBJS};
boot();
})();
