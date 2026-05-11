import{useState,useEffect,useRef,useMemo}from"react";

// STUB: Push notifications — needs Firebase Cloud Messaging + backend service worker
// To implement: set up FCM, replace this with POST to /api/schedule-notification
function stubNotification(title,body){console.log("STUB notification:",title,body);}

// STUB: Spotify OAuth — needs Spotify Developer App + backend token exchange
// To implement: Spotify Web Playback SDK + /auth/spotify backend endpoint
function stubPlayMusic(mood){console.log("STUB music:",mood);}

// STUB: Apple Health / Google Fit — needs Capacitor Health plugin (native wrapper)
// To implement: npm install @capacitor-community/health, wrap in Capacitor app
async function stubGetHealthData(){console.log("STUB health");return null;}

// STUB: Open Banking — needs Plaid or TrueLayer + secure backend (never client-side)
// To implement: TrueLayer API, server-side token exchange
async function stubGetBankTransactions(){console.log("STUB bank");return[];}

// STUB: Wearables (Apple Watch / Wear OS) — needs native app wrapper
// To implement: WatchKit (iOS) or Wear OS API via Capacitor/React Native bridge
async function stubGetWearableData(){console.log("STUB wearable");return null;}

// STUB: App blocking — NOT possible in PWA, needs iOS Screen Time or Android Digital Wellbeing
// To implement: native Capacitor plugin, Screen Time API (iOS 12+)
function stubBlockApps(){console.log("STUB block apps — native only");}

const THEMES={
  bloom:{name:"🌸 Bloom",h1:"#FF6B6B",h2:"#FFD93D",h3:"#6BCB77",acc:"#FF6B6B",dark:"#2D2D2D",bg:"#FFF5EA",card:"#FFFFFF"},
  ocean:{name:"🌊 Ocean",h1:"#0077B6",h2:"#00B4D8",h3:"#90E0EF",acc:"#0077B6",dark:"#1A1A2E",bg:"#F0F8FF",card:"#FFFFFF"},
  forest:{name:"🌲 Forest",h1:"#2D6A4F",h2:"#74C69D",h3:"#D8F3DC",acc:"#2D6A4F",dark:"#1B2D27",bg:"#F0FAF4",card:"#FFFFFF"},
  midnight:{name:"🌙 Midnight",h1:"#7B2FBE",h2:"#4361EE",h3:"#4CC9F0",acc:"#7B2FBE",dark:"#0D0D1A",bg:"#0D0D1A",card:"#1A1A2E"},
  ember:{name:"🔥 Ember",h1:"#E85D04",h2:"#F48C06",h3:"#FAA307",acc:"#E85D04",dark:"#2D1B00",bg:"#FFF8F0",card:"#FFFFFF"},
  volt:{name:"⚡ Volt",h1:"#00F5D4",h2:"#00BBF9",h3:"#9B5DE5",acc:"#00F5D4",dark:"#0A0A0A",bg:"#0A0A0A",card:"#141414"},
  minimal:{name:"🤍 Minimal",h1:"#333333",h2:"#666666",h3:"#999999",acc:"#333333",dark:"#111111",bg:"#FAFAFA",card:"#FFFFFF"},
};

const PHASES=[
  {id:"m",l:"Menstrual",ds:[1,2,3,4,5],e:"🌑",c:"#E63946",energy:"Very low",
   adhd:"Oestrogen and progesterone are at their lowest right now — focus, mood and energy are all affected. This is biological, not personal.",
   general:"Energy is naturally lower right now. Smaller, achievable tasks are the smart strategy.",
   tips:["Lean on quick wins only","Use the spinner to start tasks","Extra rest is genuinely necessary","Avoid major decisions"],
   spend:"Comfort spending risk is higher right now. Watch takeaways and online shopping."},
  {id:"f",l:"Follicular",ds:[6,7,8,9,10,11,12,13],e:"🌒",c:"#FFD93D",energy:"Rising",
   adhd:"Rising oestrogen improves dopamine sensitivity — focus becomes more achievable and planning feels easier.",
   general:"Rising energy and improving mood make this a good window to plan ahead and tackle medium-difficulty tasks.",
   tips:["Great time to plan and set goals","Tackle medium-difficulty tasks","Good for learning new things","Use this window strategically"],
   spend:"Mood improving — a good time to review your budget calmly."},
  {id:"o",l:"Ovulation",ds:[14,15,16],e:"🌕",c:"#6BCB77",energy:"High",
   adhd:"Peak oestrogen equals peak dopamine. Many people with ADHD feel most neurotypical at ovulation — sharper, more sociable, more capable.",
   general:"Peak energy and focus. Your best week — take advantage of it for your most challenging tasks.",
   tips:["Your best week — tackle big tasks NOW","Schedule important meetings","Multi-step projects are manageable","Social energy is at its peak"],
   spend:"Confidence can lead to larger purchases. Good week for planned buys."},
  {id:"l",l:"Luteal",ds:[17,18,19,20,21,22,23,24,25,26,27,28],e:"🌖",c:"#9B5DE5",energy:"Declining",
   adhd:"Progesterone rises as oestrogen drops — symptoms return and worsen days 24–28. This is hormonal, not personal.",
   general:"Energy naturally declines in this phase. Front-load your week and be kind to yourself toward the end.",
   tips:["Front-load your week while energy holds","Reduce commitments toward the end","Comfort-seeking is a normal hormonal response","Be exceptionally kind to yourself"],
   spend:"Highest risk phase for impulse spending. Try the 24-hour rule before buying."},
];

const TIPS=[
  {trigger:"high_energy",tip:"⚡ High energy right now!",text:"This is your peak focus window. Tackle your most challenging or avoided task while your concentration is sharp.",source:"Flow State Research, Csikszentmihalyi"},
  {trigger:"low_energy",tip:"💙 Low energy is valid",text:"Your brain expends enormous energy on focus and decision-making. Rest is not laziness — it is recovery. Small wins count.",source:"Cognitive Load Theory"},
  {trigger:"brain_fog",tip:"🌫️ Foggy day",text:"Working alongside someone else — even on a video call — significantly improves focus on foggy days. Try body doubling.",source:"Productivity Research, 2021"},
  {trigger:"anxiety",tip:"😰 Feeling anxious",text:"Anxiety and low focus share neural pathways. When stress is high, breaking tasks into the smallest possible steps helps most.",source:"Cognitive Behavioural Research"},
  {trigger:"general",tip:"🧠 Did you know?",text:"Time-blocking — giving tasks a specific slot — creates structure that makes starting significantly easier.",source:"Time Management Research"},
  {trigger:"general",tip:"🧠 Did you know?",text:"Even 20 minutes of walking increases dopamine and serotonin, directly improving mood and concentration for hours after.",source:"Exercise and Cognition Research, Ratey"},
  {trigger:"general",tip:"💡 Sleep and focus",text:"Sleep quality directly affects next-day focus, decision-making and emotional regulation. Protecting sleep protects everything.",source:"Sleep Research, Walker"},
  {trigger:"headache",tip:"🤕 Headache today",text:"Dehydration and skipped meals are common headache triggers. Even a glass of water and a small snack can make a difference.",source:"Nutrition and Cognition Research"},
  {trigger:"good_day",tip:"🚀 Everything is going well!",text:"On good days, a brain dump — writing every task and idea — frees up mental space and protects your focus for the hours ahead.",source:"GTD Methodology, Allen"},
];

const ADHD_TIPS=[
  {trigger:"high_energy",tip:"⚡ ADHD peak window!",text:"ADHD brains work in peaks and troughs. This is your dopamine peak — tackle your most avoided task NOW while your prefrontal cortex is firing.",source:"Barkley, 2015"},
  {trigger:"low_energy",tip:"💙 ADHD fatigue is real",text:"ADHD brains expend significantly more energy on everyday tasks than neurotypical brains. Rest is neurological necessity, not laziness.",source:"Brown, 2013"},
  {trigger:"brain_fog",tip:"🌫️ ADHD brain fog",text:"Body doubling — working alongside someone, even on a video call — significantly improves focus for ADHD brains on foggy days.",source:"Hallowell and Ratey, 2021"},
  {trigger:"anxiety",tip:"😰 ADHD and anxiety",text:"70% of people with ADHD experience anxiety. They share neural pathways — when dopamine is low, the threat-detection system overactivates.",source:"Kessler et al., 2006"},
  {trigger:"luteal",tip:"🌖 Luteal phase and ADHD",text:"Falling oestrogen directly reduces dopamine availability. This is why symptoms feel worse right now. You are not failing.",source:"Douma et al., 2020"},
  {trigger:"menstrual",tip:"🌑 Menstrual phase and ADHD",text:"ADHD symptoms peak during menstruation. Smaller, achievable tasks protect your sense of competence on these days.",source:"Quinn and Madhoo, 2014"},
  {trigger:"ovulation",tip:"🌕 ADHD peak performance!",text:"Peak oestrogen equals peak dopamine. Many people with ADHD feel most neurotypical at ovulation. Use it!",source:"Douma et al., 2020"},
  {trigger:"general",tip:"🧠 ADHD: Did you know?",text:"ADHD brains have a now vs not-now time perception. Time-blocking creates artificial urgency that works with your brain rather than against it.",source:"Barkley, 2011"},
  {trigger:"general",tip:"🧠 ADHD: Did you know?",text:"Exercise increases dopamine and norepinephrine — the exact same neurotransmitters targeted by ADHD medication. Even 20 minutes helps.",source:"Ratey, 2008"},
  {trigger:"headache",tip:"🤕 ADHD and headaches",text:"The same executive dysfunction that makes tasks hard also makes self-care routines difficult. Dehydration and skipped meals are common triggers.",source:"CHADD, 2022"},
  {trigger:"good_day",tip:"🚀 ADHD good day!",text:"On good days, do a brain dump — write every task, worry and idea. This frees up working memory, which ADHD brains have less of.",source:"Allen, 2001"},
];

const MOODS=[{e:"😴",l:"Exhausted",n:1},{e:"😞",l:"Low",n:2},{e:"😐",l:"Meh",n:3},{e:"🙂",l:"Good",n:4},{e:"😄",l:"Great",n:5},{e:"🤩",l:"Energised",n:6}];
const ENERGIES=[{e:"🪫",l:"Drained",n:1},{e:"😶",l:"Foggy",n:2},{e:"😌",l:"Calm",n:3},{e:"⚡",l:"Charged",n:4},{e:"🚀",l:"Rocket",n:5}];
const SYMPTOMS=["Headache 🤕","Cramps 😣","Nausea 🤢","Fatigue 😓","Anxiety 😰","Brain fog 🌫️","Bloating 🤰","Irritability 😤","Low mood 😔","Insomnia 😵","Restlessness 😬","Sensory overload 🔊"];
const AVS=[{s:0,l:"Fine",e:"😊",c:"#6BCB77"},{s:1,l:"Meh",e:"😐",c:"#FFD93D"},{s:2,l:"Dislike",e:"😕",c:"#FFB347"},{s:3,l:"Dreading",e:"😣",c:"#FF8C69"},{s:4,l:"Hate it",e:"😤",c:"#FF6B6B"}];
const SCATS=[{id:"groceries",l:"Groceries",e:"🛒",c:"#6BCB77"},{id:"takeaway",l:"Takeaway",e:"🍕",c:"#FF6B6B"},{id:"coffee",l:"Coffee",e:"☕",c:"#FFB347"},{id:"transport",l:"Transport",e:"🚗",c:"#4D96FF"},{id:"health",l:"Health",e:"💊",c:"#4ECDC4"},{id:"other",l:"Other",e:"💳",c:"#AAA"}];
const WDAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];
const WDAYS_MON=["Mo","Tu","We","Th","Fr","Sa","Su"];

const DEFAULT_MORNING=[{id:"m1",l:"Brush teeth 🦷",d:false,t:3},{id:"m2",l:"Breakfast 🍳",d:false,t:15},{id:"m3",l:"Medication 💊",d:false,t:1},{id:"m4",l:"Get ready 👗",d:false,t:20}];
const DEFAULT_EVENING=[{id:"e1",l:"Brush teeth 🦷",d:false,t:3},{id:"e2",l:"Medication 💊",d:false,t:1},{id:"e3",l:"Shower 🚿",d:false,t:15},{id:"e4",l:"Wind down 😌",d:false,t:10}];
const DEFAULT_REWARDS=[
  {id:"r1",tr:"7-day morning streak",rw:"☕ Coffee and a nice pastry",ic:"☕",sk:7,ty:"ms"},
  {id:"r2",tr:"7-day evening streak",rw:"🍷 A glass of your favourite drink",ic:"🍷",sk:7,ty:"es"},
  {id:"r3",tr:"Complete 5 tasks",rw:"🎬 Movie night — your pick",ic:"🎬",sk:5,ty:"dt"},
  {id:"r4",tr:"7-day mood streak",rw:"💐 Buy yourself fresh flowers",ic:"💐",sk:7,ty:"ml"},
  {id:"r5",tr:"Finish a dreaded task",rw:"💅 Treat yourself — you earned it",ic:"💅",sk:1,ty:"dr"},
  {id:"r6",tr:"14-day morning streak",rw:"💆 Book yourself a massage",ic:"💆",sk:14,ty:"ms14"},
];

const TOUR=[
  {emoji:"🏠",title:"Welcome to BrainBloom",text:"This is your Home screen — your daily hub. Check in each day to set your mood and energy, then see your calendar, tasks and routines at a glance."},
  {emoji:"📆",title:"Your Calendar",text:"Tap any date to see, plan or log anything. Add events, track your cycle, view financial commitments and log how you felt — all in one place. Tap any item to view, edit or delete it."},
  {emoji:"✅",title:"Your To-Do List",text:"Add tasks once and let the app do the rest. BrainBloom suggests the right task at the right time based on your energy, location and how you feel about it."},
  {emoji:"✦",title:"Your Quick Actions Button",text:"See the glowing button on screen? Tap it anytime to open two options — start a Voice Dump to speak your thoughts and let the app organise them, or launch a Focus Timer with music to power through a session. Drag it anywhere on screen to move it out of the way."},
  {emoji:"⚙️",title:"Settings",text:"Everything about you lives here — your profile, finances, cycle tracking, rewards and app preferences. Use the search bar to find anything instantly."},
];

const SEARCH_INDEX=[
  {terms:["name","profile","occupation","role","who","about","morning","evening","routine","commute","travel","location","wake","sleep"],section:"me"},
  {terms:["budget","finance","income","salary","money","spend","bill","cost","mortgage","bank","cash","expenditure","tax","refund"],section:"finance"},
  {terms:["cycle","period","menstrual","ovulation","luteal","hormone","pms","pmdd","follicular"],section:"cycle"},
  {terms:["reward","treat","incentive","motivation","streak","earn","prize"],section:"rewards"},
  {terms:["theme","colour","color","dark","light","appearance","adhd","suggestion","notification","calendar","week","monday","sunday","spotify"],section:"app"},
];

function useLS(key,init){
  const[v,sv]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch{return init;}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v));}catch{};},[key,v]);
  return[v,sv];
}

const todayISO=()=>new Date().toISOString().split("T")[0];
const addDays=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];};
const toMonthly=(a,f)=>f==="weekly"?+a*52/12:f==="fortnightly"?+a*26/12:f==="annually"?+a/12:+a;
const getCDay=(lps,cl=28)=>{if(!lps)return null;const d=Math.floor((Date.now()-new Date(lps).getTime())/86400000);return(d%cl)+1;};
const getCPhase=(d)=>{if(!d)return null;return PHASES.find(p=>p.ds.includes(Math.min(d,28)))||PHASES[3];};

const getGreeting=()=>{
  const h=new Date().getHours();
  if(h<12)return{text:"Good morning",emoji:"☀️",isEve:false};
  if(h<15)return{text:"Good afternoon",emoji:"🌤️",isEve:false};
  if(h<18)return{text:"Good evening",emoji:"🌅",isEve:true};
  if(h<22)return{text:"Evening",emoji:"🌙",isEve:true};
  return{text:"Winding down",emoji:"🌙",isEve:true};
};

const getTip=(mood,energy,syms,cphId,adhdMode)=>{
  const pool=adhdMode?ADHD_TIPS:TIPS;
  if(cphId==="l")return pool.find(t=>t.trigger==="luteal")||pool.find(t=>t.trigger==="general");
  if(cphId==="m")return pool.find(t=>t.trigger==="menstrual")||pool.find(t=>t.trigger==="general");
  if(cphId==="o")return pool.find(t=>t.trigger==="ovulation")||pool.find(t=>t.trigger==="general");
  if(syms&&syms.some(s=>s.includes("Brain fog")))return pool.find(t=>t.trigger==="brain_fog");
  if(syms&&syms.some(s=>s.includes("Anxiety")))return pool.find(t=>t.trigger==="anxiety");
  if(syms&&syms.some(s=>s.includes("Headache")))return pool.find(t=>t.trigger==="headache");
  if(energy&&energy.n>=4)return pool.find(t=>t.trigger==="high_energy");
  if(energy&&energy.n<=2)return pool.find(t=>t.trigger==="low_energy");
  if(mood&&mood.n>=5&&(!syms||!syms.length))return pool.find(t=>t.trigger==="good_day");
  const g=pool.filter(t=>t.trigger==="general");
  return g[Math.floor(Date.now()/86400000)%g.length];
};

const eventOccursOn=(ev,iso)=>{
  if(!ev||!ev.date)return false;
  if(ev.exceptions&&ev.exceptions.includes(iso))return false;
  if(ev.endDate&&iso>ev.endDate)return false;
  if(!ev.recur||ev.recur==="none")return ev.date===iso;
  const d=new Date(iso+"T12:00:00"),s=new Date(ev.date+"T12:00:00");
  if(d<s)return false;
  if(ev.recur==="daily")return true;
  if(ev.recur==="weekly")return ev.days&&ev.days.includes(WDAYS[d.getDay()]);
  if(ev.recur==="monthly")return d.getDate()===s.getDate();
  return false;
};

const recurDoneThisWeek=(task)=>{
  if(!task.recur||task.recur==="none")return false;
  if(!task.lastDone)return false;
  const ld=new Date(task.lastDone),now=new Date();
  if(task.recur==="daily")return ld.toDateString()===now.toDateString();
  if(task.recur==="weekly"){
    const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));mon.setHours(0,0,0,0);
    return ld>=mon;
  }
  if(task.recur==="fortnightly"){
    const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));mon.setHours(0,0,0,0);
    const fort=new Date(mon);fort.setDate(mon.getDate()-7);
    return ld>=fort;
  }
  if(task.recur==="monthly")return ld.getMonth()===now.getMonth()&&ld.getFullYear()===now.getFullYear();
  return false;
};

const LOC_COLORS=["#FF6B6B","#4D96FF","#C77DFF","#FFB347","#6BCB77","#FF8FAB","#4ECDC4","#06D6A0"];
const LOC_EMOJIS=["🏠","💼","🎓","🚌","🛍️","🏋️","🌿","🏥"];
const getLC=(lo,locs)=>{const i=locs.indexOf(lo);return i>=0?LOC_COLORS[i%LOC_COLORS.length]:"#888";};
const getLE=(lo,locs)=>{const i=locs.indexOf(lo);return i>=0?LOC_EMOJIS[i%LOC_EMOJIS.length]:"📍";};

function makeCSS(t){return `
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${t.bg};font-family:'Nunito',sans-serif;}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:${t.bg};padding-bottom:85px;}
.hdr{background:linear-gradient(135deg,${t.h1},${t.h2} 50%,${t.h3});padding:14px 15px 11px;position:relative;overflow:hidden;}
.hdr::before{content:'';position:absolute;inset:0;opacity:.06;background:radial-gradient(circle at 20% 50%,white 1px,transparent 1px) 0 0/28px 28px;}
.ht{font-family:'Fredoka One',cursive;font-size:21px;color:white;position:relative;}
.hs{font-size:10px;color:rgba(255,255,255,.85);font-weight:600;position:relative;}
.hrow{display:flex;justify-content:space-between;align-items:center;}
.dbg{background:rgba(255,255,255,.25);border-radius:16px;padding:2px 8px;font-size:10px;font-weight:700;color:white;}
.pills{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;}
.pill{background:rgba(255,255,255,.25);border-radius:16px;padding:2px 8px;font-size:10px;font-weight:700;color:white;}
.tabs{display:flex;gap:2px;padding:7px 9px;background:${t.card};box-shadow:0 2px 8px rgba(0,0,0,.07);position:sticky;top:0;z-index:20;}
.tab{flex:1;padding:6px 3px;border-radius:10px;border:2px solid transparent;font-family:'Nunito',sans-serif;font-weight:700;font-size:10px;cursor:pointer;transition:all .2s;background:#F5F5F5;color:#777;text-align:center;line-height:1.3;}
.tab.on{background:${t.acc};color:white;border-color:${t.acc};}
.pg{padding:11px;}
.card{background:${t.card};border-radius:13px;padding:13px;margin-bottom:9px;box-shadow:0 2px 10px rgba(0,0,0,.06);border:2px solid transparent;}
.ct{font-family:'Fredoka One',cursive;font-size:15px;color:${t.dark};margin-bottom:7px;display:flex;align-items:center;gap:5px;}
.q{font-size:13px;font-weight:700;color:${t.dark};margin-bottom:11px;line-height:1.4;}
.erow{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:11px;}
.eb{display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 6px;border-radius:10px;border:2px solid #EEE;background:${t.card};cursor:pointer;transition:all .2s;font-size:18px;min-width:44px;}
.eb span{font-size:9px;font-weight:700;color:#888;}
.eb.on{border-color:${t.acc};background:${t.acc}18;transform:scale(1.07);}
.nb{width:100%;padding:11px;background:linear-gradient(135deg,${t.h1},${t.h2});color:white;border:none;border-radius:11px;font-family:'Fredoka One',cursive;font-size:15px;cursor:pointer;margin-top:7px;transition:transform .15s;}
.nb:disabled{opacity:.4;cursor:not-allowed;}
.sg{display:flex;gap:4px;flex-wrap:wrap;}
.sc{padding:5px 9px;border-radius:14px;border:2px solid #EEE;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;background:${t.card};color:${t.dark};}
.sc.on{background:#FFD93D;border-color:#FFD93D;color:#2D2D2D;}
.ci{display:flex;align-items:center;gap:7px;padding:7px 0;border-bottom:1px solid #F5F5F5;}
.cc{width:20px;height:20px;border-radius:50%;border:2.5px solid #DDD;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
.cc.on{background:#6BCB77;border-color:#6BCB77;}
.cl{font-weight:600;font-size:12px;color:${t.dark};flex:1;}
.cl.dn{text-decoration:line-through;color:#AAA;}
.mb2{background:#F5F5F5;border-radius:5px;padding:1px 5px;font-size:9px;font-weight:700;color:#888;}
.pw{background:#EBEBEB;border-radius:6px;height:6px;overflow:hidden;margin:4px 0;}
.pb{height:100%;border-radius:6px;background:linear-gradient(90deg,${t.h1},${t.h2},${t.h3});transition:width .4s;}
.sl{font-size:9px;font-weight:800;color:#BBB;letter-spacing:1px;text-transform:uppercase;margin:9px 0 4px;}
.tc{display:flex;align-items:flex-start;gap:7px;padding:9px;background:${t.card};border-radius:10px;margin-bottom:5px;box-shadow:0 2px 6px rgba(0,0,0,.05);border-left:4px solid #EEE;}
.tt{font-weight:700;font-size:12px;color:${t.dark};}
.tt.dn{text-decoration:line-through;color:#AAA;}
.tm{display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;}
.tg{padding:1px 5px;border-radius:13px;font-size:9px;font-weight:700;}
.tglc{color:white;}
.tgt{background:#F5F5F5;color:#888;}
.ck{width:20px;height:20px;border-radius:50%;border:2.5px solid #DDD;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;margin-top:1px;}
.ck.on{background:#6BCB77;border-color:#6BCB77;}
.av{display:flex;gap:3px;margin-top:3px;flex-wrap:wrap;}
.avb{padding:2px 5px;border-radius:7px;border:1.5px solid #EEE;font-size:9px;font-weight:700;cursor:pointer;transition:all .15s;background:${t.card};display:flex;align-items:center;gap:2px;}
.ai{flex:1;padding:7px 9px;border:2px solid #EEE;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:600;font-size:12px;outline:none;background:${t.card};color:${t.dark};}
.ai:focus{border-color:${t.acc};}
.fr{display:flex;gap:3px;overflow-x:auto;padding-bottom:3px;scrollbar-width:none;margin-bottom:5px;}
.fr::-webkit-scrollbar{display:none;}
.fc{flex-shrink:0;padding:4px 8px;border-radius:13px;border:2px solid #EEE;font-size:10px;font-weight:700;cursor:pointer;transition:all .15s;background:${t.card};color:${t.dark};}
.fc.on{background:${t.acc};color:white;border-color:${t.acc};}
.btn{padding:7px 14px;border-radius:9px;border:none;font-family:'Nunito',sans-serif;font-weight:800;font-size:11px;cursor:pointer;transition:all .15s;}
.bp{background:linear-gradient(135deg,${t.h1},${t.h2});color:white;}
.bs{background:#F5F5F5;color:#666;}
.bm{background:#6BCB77;color:white;}
.bpu{background:#C77DFF;color:white;}
.bsm{padding:5px 10px;font-size:10px;}
.btn:hover{transform:scale(1.03);}
.db{width:24px;height:24px;border-radius:50%;background:#FFE5E5;border:none;color:#FF6B6B;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.db:hover{background:#FF6B6B;color:white;}
.tog-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5F5F5;}
.tog-lbl{font-weight:700;font-size:12px;color:${t.dark};}
.tog-sub{font-size:10px;color:#888;font-weight:600;}
.tog{width:40px;height:22px;border-radius:11px;background:#DDD;border:none;cursor:pointer;position:relative;transition:all .3s;flex-shrink:0;}
.tog.on{background:#6BCB77;}
.tog::after{content:'';width:16px;height:16px;border-radius:50%;background:white;position:absolute;top:3px;left:3px;transition:left .3s;}
.tog.on::after{left:21px;}
.pi{width:100%;padding:7px 9px;border:2px solid #EEE;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:600;font-size:12px;outline:none;background:${t.card};color:${t.dark};}
.pi:focus{border-color:${t.acc};}
.pf{margin-bottom:7px;}
.pf label{display:block;font-size:9px;font-weight:800;color:#BBB;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.ptg{padding:3px 7px;border-radius:12px;font-size:10px;font-weight:700;background:${t.acc}18;color:${t.acc};display:inline-flex;align-items:center;gap:2px;margin:2px;}
.tip-card{background:linear-gradient(135deg,${t.h1}12,${t.h2}12);border:1.5px solid ${t.acc}35;border-radius:13px;padding:11px;margin-bottom:9px;}
.tip-t{font-family:'Fredoka One',cursive;font-size:13px;color:${t.acc};margin-bottom:3px;}
.tip-x{font-size:11px;font-weight:600;color:#444;line-height:1.5;}
.tip-s{font-size:9px;color:#AAA;font-weight:600;margin-top:3px;font-style:italic;}
.rn{background:linear-gradient(135deg,#FFF4CC,#FFE5E5);border:1.5px solid #FFD93D;border-radius:13px;padding:11px;margin-bottom:9px;cursor:pointer;}
.sbar{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap;}
.sd{width:13px;height:13px;border-radius:50%;border:2px solid #EEE;background:#F5F5F5;}
.sd.on{background:#FFD93D;border-color:#FFD93D;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.cal-hd{text-align:center;font-size:8px;font-weight:800;color:#BBB;text-transform:uppercase;padding:2px 0;}
.cal-d{aspect-ratio:1;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;position:relative;transition:all .15s;border:2px solid transparent;}
.cal-d:hover{transform:scale(1.08);}
.cal-d.tod{border-color:${t.acc};}
.cal-d.sel{border-color:${t.dark};transform:scale(1.1);}
.cal-dots{display:flex;gap:1px;position:absolute;bottom:2px;left:50%;transform:translateX(-50%);}
.cal-dot{width:3px;height:3px;border-radius:50%;}
.day-ev{display:flex;gap:7px;padding:7px 9px;border-radius:9px;margin-bottom:5px;border-left:4px solid;}
.ww{display:flex;justify-content:center;align-items:center;flex-direction:column;padding:10px 0;}
.wc{position:relative;width:200px;height:200px;}
.wp{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:18px solid ${t.acc};z-index:10;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));}
.sb{margin-top:12px;padding:10px 28px;background:linear-gradient(135deg,${t.h1},${t.h2});color:white;border:none;border-radius:13px;font-family:'Fredoka One',cursive;font-size:16px;cursor:pointer;}
.sb:disabled{opacity:.5;cursor:not-allowed;}
.sr{text-align:center;margin-top:10px;padding:11px;background:${t.h1}12;border-radius:11px;border:2px solid ${t.acc};}
.rc{background:${t.card};border-radius:12px;padding:11px;margin-bottom:7px;display:flex;align-items:center;gap:9px;box-shadow:0 2px 8px rgba(0,0,0,.05);}
.ri{font-size:26px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:#FFF5EA;border-radius:10px;flex-shrink:0;}
.re{background:#6BCB77;color:white;padding:1px 5px;border-radius:5px;font-size:9px;font-weight:700;margin-top:2px;display:inline-block;}
.tg2{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:7px 0;}
.tc2{padding:7px 4px;border-radius:9px;border:2px solid #EEE;font-weight:700;font-size:10px;cursor:pointer;transition:all .15s;background:${t.card};text-align:center;color:${t.dark};}
.tc2.on{background:${t.acc};border-color:${t.acc};color:white;}
.tmr{width:130px;height:130px;margin:0 auto 10px;position:relative;}
.tmr svg{transform:rotate(-90deg);}
.tmrt{fill:none;stroke:#EBEBEB;stroke-width:8;}
.tmrf{fill:none;stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset 1s linear;}
.tmin{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.tmcl{font-family:'Fredoka One',cursive;font-size:40px;color:${t.dark};line-height:1;letter-spacing:-2px;}
.brow{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;}
.cycle-strip{display:flex;gap:2px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;margin:7px 0;}
.cycle-strip::-webkit-scrollbar{display:none;}
.cdd{width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;flex-shrink:0;color:white;}
.fin-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F5F5F5;}
.tooltip{background:${t.acc}10;border:1.5px solid ${t.acc}35;border-radius:8px;padding:6px 8px;margin-bottom:6px;font-size:10px;font-weight:600;color:#444;display:flex;align-items:flex-start;gap:5px;}
.empty{text-align:center;padding:20px 11px;color:#CCC;}
.empty-i{font-size:34px;margin-bottom:4px;}
.empty p{font-weight:600;font-size:11px;}
.sect{background:${t.card};border-radius:13px;margin-bottom:8px;box-shadow:0 2px 10px rgba(0,0,0,.06);overflow:hidden;}
.sect-hdr{display:flex;align-items:center;justify-content:space-between;padding:13px;cursor:pointer;}
.sect-hdr:hover{background:${t.bg}55;}
.sect-title{font-family:'Fredoka One',cursive;font-size:14px;color:${t.dark};display:flex;align-items:center;gap:7px;}
.sect-body{padding:0 13px 13px;}
.fab{position:fixed;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,${t.h1},${t.h2});border:none;cursor:grab;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 5px 18px ${t.h1}55;z-index:200;touch-action:none;user-select:none;-webkit-user-select:none;}
.fab:active{cursor:grabbing;}
.fab-menu{position:fixed;display:flex;flex-direction:column;gap:8px;z-index:201;}
.fab-opt{display:flex;align-items:center;gap:9px;padding:11px 16px;border-radius:22px;border:none;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18);white-space:nowrap;}
.voverlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:201;}
.vsheet{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${t.card};border-radius:20px 20px 0 0;padding:17px;z-index:202;max-height:88vh;overflow-y:auto;}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:150;display:flex;align-items:flex-end;justify-content:center;}
.modal{background:${t.card};border-radius:20px 20px 0 0;padding:18px;width:100%;max-width:430px;max-height:88vh;overflow-y:auto;}
.ob{min-height:100vh;background:linear-gradient(135deg,${t.h1} 0%,${t.h2} 50%,${t.h3} 100%);display:flex;align-items:center;justify-content:center;padding:20px;}
.ob-card{background:white;border-radius:20px;padding:22px 18px;width:100%;max-width:390px;box-shadow:0 20px 60px rgba(0,0,0,.15);max-height:90vh;overflow-y:auto;}
.ob-t{font-family:'Fredoka One',cursive;font-size:20px;color:#2D2D2D;margin-bottom:4px;}
.ob-s{font-size:11px;font-weight:600;color:#888;margin-bottom:12px;line-height:1.5;}
.ob-prog{display:flex;gap:4px;margin-bottom:13px;}
.ob-dot{flex:1;height:4px;border-radius:2px;background:#EEE;}
.ob-dot.on{background:linear-gradient(90deg,${t.h1},${t.h2});}
.ob-in{width:100%;padding:10px 12px;border:2px solid #EEE;border-radius:10px;font-family:'Nunito',sans-serif;font-weight:700;font-size:13px;outline:none;margin-bottom:8px;background:white;color:#2D2D2D;}
.ob-in:focus{border-color:${t.acc};}
.ob-nx{width:100%;padding:12px;background:linear-gradient(135deg,${t.h1},${t.h2});color:white;border:none;border-radius:12px;font-family:'Fredoka One',cursive;font-size:15px;cursor:pointer;margin-top:8px;}
.ob-nx:disabled{opacity:.4;cursor:not-allowed;}
.ob-sk{width:100%;padding:7px;background:none;border:none;font-family:'Nunito',sans-serif;font-weight:700;font-size:11px;color:#BBB;cursor:pointer;margin-top:3px;}
.ob-chip{padding:6px 12px;border-radius:16px;border:2px solid #EEE;font-family:'Nunito',sans-serif;font-weight:700;font-size:11px;cursor:pointer;transition:all .15s;background:white;margin:2px;display:inline-block;color:#2D2D2D;}
.ob-chip.on{background:${t.acc};color:white;border-color:${t.acc};}
.ob-feat{display:flex;align-items:center;gap:9px;padding:9px;background:#F9F9F9;border-radius:10px;margin-bottom:5px;}
.th-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;}
.th-btn{padding:10px;border-radius:10px;border:3px solid transparent;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;font-size:11px;transition:all .15s;text-align:center;}
.th-btn.on{border-color:#2D2D2D;transform:scale(1.02);}
.tour-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:flex;align-items:flex-end;justify-content:center;}
.tour-card{background:white;border-radius:20px 20px 0 0;padding:24px 20px;width:100%;max-width:430px;}
.search-wrap{position:relative;margin-bottom:10px;}
.search-in{width:100%;padding:9px 13px 9px 36px;border:2px solid #EEE;border-radius:22px;font-family:'Nunito',sans-serif;font-weight:600;font-size:13px;outline:none;background:${t.card};color:${t.dark};}
.search-in:focus{border-color:${t.acc};}
.na{width:100%;padding:7px 9px;border:2px solid #EEE;border-radius:8px;font-family:'Nunito',sans-serif;font-size:11px;font-weight:600;resize:none;outline:none;min-height:55px;background:${t.card};color:${t.dark};}
.na:focus{border-color:#C77DFF;}
.mbar{width:3px;border-radius:2px;background:white;animation:bbc .8s ease-in-out infinite;}
.mbars{display:flex;gap:2px;align-items:flex-end;height:13px;}
@keyframes sli{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes bbc{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
`;}


/* ================================================================
   PWA INTRO SCREEN
================================================================ */
function PWAIntro({onDone}){
  const isPWA=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches;
  const isIOS=typeof navigator!=="undefined"&&/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid=typeof navigator!=="undefined"&&/android/i.test(navigator.userAgent);
  useEffect(()=>{if(isPWA)onDone();},[]);
  if(isPWA)return null;
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FF6B6B 0%,#FFD93D 50%,#6BCB77 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:"28px 22px",width:"100%",maxWidth:390,boxShadow:"0 20px 60px rgba(0,0,0,.18)",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🧠</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:"#2D2D2D",marginBottom:6}}>BrainBloom</div>
        <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:20,lineHeight:1.5}}>Your personal planner that works with you.</div>
        <div style={{background:"linear-gradient(135deg,#FFF4CC,#FFE5E5)",borderRadius:14,padding:"14px 16px",marginBottom:18,textAlign:"left"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:"#FF6B6B",marginBottom:8}}>📱 Save to your home screen first</div>
          <p style={{fontSize:11,fontWeight:600,color:"#444",lineHeight:1.6,marginBottom:12}}>This keeps all your data safe between sessions. If you set up first and save later, you may need to start again.</p>
          <div style={{background:"white",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800,color:"#0077B6",marginBottom:4}}>🍎 iPhone / iPad — Safari</div>
            <div style={{fontSize:11,fontWeight:600,color:"#444",lineHeight:1.8}}>
              1. Tap the <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>Share ⬆️</span> button at the bottom<br/>
              2. Scroll and tap <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>Add to Home Screen</span><br/>
              3. Tap <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>Add</span> in the top right
            </div>
          </div>
          <div style={{background:"white",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#2D6A4F",marginBottom:4}}>🤖 Android — Chrome</div>
            <div style={{fontSize:11,fontWeight:600,color:"#444",lineHeight:1.8}}>
              1. Tap the <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>⋮</span> menu in the top right<br/>
              2. Tap <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>Add to Home screen</span><br/>
              3. Tap <span style={{background:"#EEF2FF",borderRadius:4,padding:"1px 6px",fontWeight:800}}>Add</span>
            </div>
          </div>
        </div>
        <button onClick={onDone} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#FF6B6B,#FFD93D)",color:"white",border:"none",borderRadius:13,fontFamily:"'Fredoka One',cursive",fontSize:16,cursor:"pointer",marginBottom:8,boxShadow:"0 4px 14px rgba(255,107,107,.4)"}}>
          ✓ I have saved it — let's go!
        </button>
        <button onClick={onDone} style={{width:"100%",padding:9,background:"none",border:"none",fontFamily:"Nunito",fontWeight:700,fontSize:12,color:"#BBB",cursor:"pointer"}}>
          Skip and continue in browser
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   EVENT / TASK DETAIL MODAL
================================================================ */
function DetailModal({item,type,onClose,onDelete,onEdit,locs,lc,le,theme}){
  const t=THEMES[theme]||THEMES.bloom;
  const[editing,setEditing]=useState(false);
  const[title,setTitle]=useState(item.title||item.tl||"");
  const[evDate,setEvDate]=useState(item.date||item.deadline||"");
  const[startTime,setStartTime]=useState(item.startTime||"");
  const[endTime,setEndTime]=useState(item.endTime||"");
  const[allDay,setAllDay]=useState(item.allDay||false);
  const[evLoc,setEvLoc]=useState(item.loc||item.lo||locs[0]||"Home");
  const[cost,setCost]=useState(item.cost?item.cost.amount:"");
  const[hasCost,setHasCost]=useState(!!item.cost);
  const[nPri,setNPri]=useState(item.pr||"medium");
  const[nMin,setNMin]=useState(item.mn||15);

  const accentColor=type==="task"?"#6BCB77":type==="financial"?"#FFD93D":lc(item.loc||item.lo||"");
  const icon=type==="task"?"✅":type==="financial"?"💰":"📅";

  const saveEdit=()=>{
    if(type==="event"||type==="financial"){
      const updated={...item,title:title.trim(),date:evDate,startTime:allDay?"":startTime,endTime:allDay?"":endTime,allDay,loc:evLoc};
      if(hasCost&&cost)updated.cost={amount:+cost,label:title.trim()};
      else updated.cost=null;
      onEdit(updated);
    } else if(type==="task"){
      onEdit({...item,tl:title.trim(),lo:evLoc,pr:nPri,mn:nMin,deadline:evDate||null});
    }
    setEditing(false);
    onClose();
  };

  return(
    <div className="modal-ov" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:34,height:34,borderRadius:9,background:accentColor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>
            <div style={{fontFamily:"Fredoka One",fontSize:15,color:t.dark}}>{editing?"Edit":"Details"}</div>
          </div>
          <button className="db" onClick={onClose}>×</button>
        </div>

        {!editing&&<>
          <div style={{background:t.bg,borderRadius:11,padding:"11px 13px",marginBottom:11}}>
            <div style={{fontFamily:"Fredoka One",fontSize:17,color:t.dark,marginBottom:5}}>{item.title||item.tl}</div>
            {(item.date||item.deadline)&&<div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:3}}>📅 {new Date((item.date||item.deadline)+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>}
            {!item.allDay&&item.startTime&&<div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:3}}>🕐 {item.startTime}{item.endTime?" – "+item.endTime:""}</div>}
            {item.allDay&&<div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:3}}>📅 All day</div>}
            {(item.loc||item.lo)&&<div style={{fontSize:11,fontWeight:600,color:lc(item.loc||item.lo),marginBottom:3}}>{le(item.loc||item.lo)}{item.loc||item.lo}</div>}
            {item.recur&&item.recur!=="none"&&<div style={{fontSize:11,fontWeight:600,color:"#4D96FF",marginBottom:3}}>🔁 Repeats {item.recur}</div>}
            {item.cost&&<div style={{fontSize:11,fontWeight:700,color:"#F08C00",marginBottom:3}}>💰 €{item.cost.amount}</div>}
            {item.pr&&<div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:3}}>Priority: {item.pr==="high"?"🔴 High":item.pr==="medium"?"🟡 Medium":"🟢 Low"}</div>}
            {item.mn&&<div style={{fontSize:11,fontWeight:600,color:"#888"}}>⏱ {item.mn} min</div>}
          </div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn bp" style={{flex:1}} onClick={()=>setEditing(true)}>✏️ Edit</button>
            <button className="btn bs" style={{flex:1,color:"#FF6B6B"}} onClick={()=>{onDelete();onClose();}}>🗑️ Delete</button>
          </div>
        </>}

        {editing&&<>
          <div className="pf"><label>Title</label><input className="pi" value={title} onChange={e=>setTitle(e.target.value)}/></div>
          {(type==="event"||type==="financial")&&<>
            <div className="pf"><label>Date</label><input className="pi" type="date" value={evDate} onChange={e=>setEvDate(e.target.value)}/></div>
            <div className="tog-row" style={{marginBottom:7}}><div><div className="tog-lbl">All day</div></div><button className={"tog"+(allDay?" on":"")} onClick={()=>setAllDay(s=>!s)}/></div>
            {!allDay&&<div style={{display:"flex",gap:7,marginBottom:7}}>
              <div style={{flex:1}}><label style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:2}}>Start</label><input className="pi" type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}/></div>
              <div style={{flex:1}}><label style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:2}}>End</label><input className="pi" type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}/></div>
            </div>}
            <div className="tog-row" style={{marginBottom:hasCost?6:7}}><div><div className="tog-lbl">💰 Has a cost</div></div><button className={"tog"+(hasCost?" on":"")} onClick={()=>setHasCost(s=>!s)}/></div>
            {hasCost&&<div className="pf"><label>Amount (€)</label><input className="pi" type="number" value={cost} onChange={e=>setCost(e.target.value)}/></div>}
          </>}
          {type==="task"&&<>
            <div className="pf"><label>Deadline (optional)</label><input className="pi" type="date" value={evDate} onChange={e=>setEvDate(e.target.value)}/></div>
            <div className="pf"><label>Priority</label><div style={{display:"flex",gap:4}}>{[["high","🔴 High"],["medium","🟡 Medium"],["low","🟢 Low"]].map(([v,l])=><button key={v} style={{flex:1,padding:"6px 4px",borderRadius:9,border:"2px solid "+(nPri===v?t.acc:"#EEE"),background:nPri===v?t.acc:"white",color:nPri===v?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:10,cursor:"pointer"}} onClick={()=>setNPri(v)}>{l}</button>)}</div></div>
            <div className="pf"><label>Estimated time</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[5,10,15,30,45,60].map(m=><button key={m} style={{padding:"5px 8px",borderRadius:9,border:"2px solid "+(nMin===m?t.acc:"#EEE"),background:nMin===m?t.acc:"white",color:nMin===m?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:11,cursor:"pointer"}} onClick={()=>setNMin(m)}>{m+"m"}</button>)}</div></div>
          </>}
          <div className="pf"><label>Location</label><div className="fr">{locs.map(l=><button key={l} style={{flexShrink:0,padding:"4px 8px",borderRadius:13,border:"2px solid "+(evLoc===l?t.acc:"#EEE"),background:evLoc===l?t.acc:"white",color:evLoc===l?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:10,cursor:"pointer"}} onClick={()=>setEvLoc(l)}>{le(l)}{l}</button>)}</div></div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn bp" style={{flex:2}} onClick={saveEdit}>Save changes</button>
            <button className="btn bs" style={{flex:1}} onClick={()=>setEditing(false)}>Cancel</button>
          </div>
        </>}
      </div>
    </div>
  );
}

function IncomeForm({onAdd,theme}){
  const t=THEMES[theme]||THEMES.bloom;
  const[label,setLabel]=useState("");
  const[amount,setAmount]=useState("");
  const[freq,setFreq]=useState("monthly");
  const[dayOfMonth,setDayOfMonth]=useState("");
  const[dayOfWeek,setDayOfWeek]=useState("Monday");
  const add=()=>{
    if(!label.trim()||!amount)return;
    onAdd({id:"i"+Date.now(),label,amount:+amount,freq,dayOfMonth:["monthly","annually"].includes(freq)?dayOfMonth:"",dayOfWeek:["weekly","fortnightly"].includes(freq)?dayOfWeek:""});
    setLabel("");setAmount("");setFreq("monthly");setDayOfMonth("");setDayOfWeek("Monday");
  };
  return(
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",gap:3,marginBottom:3,flexWrap:"wrap"}}>
        <input className="pi" style={{flex:2,minWidth:70,fontSize:11}} placeholder="Label (e.g. Salary)" value={label} onChange={e=>setLabel(e.target.value)}/>
        <input className="pi" style={{width:60,fontSize:11}} type="number" placeholder="€" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <select className="pi" style={{width:105,fontSize:11}} value={freq} onChange={e=>setFreq(e.target.value)}>
          {["weekly","fortnightly","monthly","annually"].map(f=><option key={f}>{f}</option>)}
        </select>
      </div>
      {["monthly","annually"].includes(freq)&&<div style={{display:"flex",gap:3,marginBottom:3,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"#AAA",flexShrink:0}}>Day of month:</span>
        <input className="pi" style={{width:55,fontSize:11}} type="number" min="1" max="31" placeholder="e.g. 25" value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)}/>
        <span style={{fontSize:10,color:"#AAA"}}>→ calendar reminder</span>
      </div>}
      {["weekly","fortnightly"].includes(freq)&&<div style={{display:"flex",gap:3,marginBottom:3,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"#AAA",flexShrink:0}}>Day:</span>
        <select className="pi" style={{flex:1,fontSize:11}} value={dayOfWeek} onChange={e=>setDayOfWeek(e.target.value)}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=><option key={d}>{d}</option>)}
        </select>
        <span style={{fontSize:10,color:"#AAA"}}>→ calendar reminder</span>
      </div>}
      <button className="btn bp bsm" onClick={add}>+ Add</button>
    </div>
  );
}

function CostForm({onAdd,theme}){
  const t=THEMES[theme]||THEMES.bloom;
  const[label,setLabel]=useState("");
  const[amount,setAmount]=useState("");
  const[freq,setFreq]=useState("monthly");
  const[dayOfMonth,setDayOfMonth]=useState("");
  const[dayOfWeek,setDayOfWeek]=useState("Monday");
  const add=()=>{
    if(!label.trim()||!amount)return;
    onAdd({id:"c"+Date.now(),label,amount:+amount,freq,dayOfMonth:["monthly","annually"].includes(freq)?dayOfMonth:"",dayOfWeek:["weekly","fortnightly"].includes(freq)?dayOfWeek:""});
    setLabel("");setAmount("");setFreq("monthly");setDayOfMonth("");setDayOfWeek("Monday");
  };
  return(
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",gap:3,marginBottom:3,flexWrap:"wrap"}}>
        <input className="pi" style={{flex:2,minWidth:70,fontSize:11}} placeholder="Label (e.g. Mortgage)" value={label} onChange={e=>setLabel(e.target.value)}/>
        <input className="pi" style={{width:60,fontSize:11}} type="number" placeholder="€" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <select className="pi" style={{width:105,fontSize:11}} value={freq} onChange={e=>setFreq(e.target.value)}>
          {["weekly","fortnightly","monthly","annually"].map(f=><option key={f}>{f}</option>)}
        </select>
      </div>
      {["monthly","annually"].includes(freq)&&<div style={{display:"flex",gap:3,marginBottom:3,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"#AAA",flexShrink:0}}>Due day:</span>
        <input className="pi" style={{width:55,fontSize:11}} type="number" min="1" max="31" placeholder="e.g. 1" value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)}/>
        <span style={{fontSize:10,color:"#AAA"}}>→ calendar reminder</span>
      </div>}
      {["weekly","fortnightly"].includes(freq)&&<div style={{display:"flex",gap:3,marginBottom:3,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:"#AAA",flexShrink:0}}>Day:</span>
        <select className="pi" style={{flex:1,fontSize:11}} value={dayOfWeek} onChange={e=>setDayOfWeek(e.target.value)}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=><option key={d}>{d}</option>)}
        </select>
        <span style={{fontSize:10,color:"#AAA"}}>→ calendar reminder</span>
      </div>}
      <button className="btn bp bsm" onClick={add}>+ Add</button>
    </div>
  );
}

function OOIForm({onAdd}){
  const[label,setLabel]=useState("");
  const[amount,setAmount]=useState("");
  const[date,setDate]=useState("");
  const add=()=>{
    if(!label.trim()||!amount)return;
    onAdd({id:"oo"+Date.now(),label,amount:+amount,date});
    setLabel("");setAmount("");setDate("");
  };
  return(
    <div style={{display:"flex",gap:3,marginBottom:4,flexWrap:"wrap"}}>
      <input className="pi" style={{flex:2,minWidth:70,fontSize:11}} placeholder="Label (e.g. Tax refund)" value={label} onChange={e=>setLabel(e.target.value)}/>
      <input className="pi" style={{width:60,fontSize:11}} type="number" placeholder="€" value={amount} onChange={e=>setAmount(e.target.value)}/>
      <input className="pi" style={{width:115,fontSize:11}} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <button className="btn bp bsm" onClick={add}>+ Add</button>
    </div>
  );
}

function Onboarding({onComplete,theme}){
  const[step,setStep]=useState(0);
  const[name,setName]=useState("");
  const[role,setRole]=useState("");
  const[locs,setLocs]=useState(["Home","Work"]);
  const[newLoc,setNewLoc]=useState("");
  const[selTheme,setSelTheme]=useState(theme||"bloom");
  const[taskFrom,setTaskFrom]=useState("09:00");
  const[taskTo,setTaskTo]=useState("18:00");
  const[hasCommute,setHasCommute]=useState(false);
  const[commuteMins,setCommuteMins]=useState(30);
  const[commuteEveMins,setCommuteEveMins]=useState(30);
  const[mList,setMList]=useState(DEFAULT_MORNING.map(x=>({...x})));
  const[eList,setEList]=useState(DEFAULT_EVENING.map(x=>({...x})));
  const[wantCycle,setWantCycle]=useState(false);
  const[wantSpend,setWantSpend]=useState(true);
  const[wantADHD,setWantADHD]=useState(true);
  const[cycleDate,setCycleDate]=useState("");
  const[cycleLen,setCycleLen]=useState("");
  const th=THEMES[selTheme]||THEMES.bloom;
  const TOTAL=5;

  const steps=[
    <div key="w">
      <div style={{fontSize:44,textAlign:"center",marginBottom:10}}>🧠</div>
      <div className="ob-t" style={{textAlign:"center"}}>Welcome to BrainBloom</div>
      <div className="ob-s" style={{textAlign:"center"}}>Your personal planner that actually works with you. About 2 minutes to set up.</div>
      {[{i:"📆",t:"Smart calendar",d:"Schedule, tasks and finances all in one place"},{i:"✅",t:"Intelligent to-do",d:"Suggests the right task at the right time"},{i:"🎯",t:"Daily check-in",d:"Track mood and energy to plan your day better"},{i:"💙",t:"Built around you",d:"Personalised, gentle, zero shame"}].map((f,i)=>(
        <div key={i} className="ob-feat"><div style={{fontSize:22,flexShrink:0}}>{f.i}</div><div><div style={{fontWeight:800,fontSize:12,color:"#2D2D2D"}}>{f.t}</div><div style={{fontSize:11,color:"#888",fontWeight:600}}>{f.d}</div></div></div>
      ))}
      <button className="ob-nx" onClick={()=>setStep(1)}>Let's go!</button>
    </div>,

    <div key="who">
      <div style={{fontSize:36,textAlign:"center",marginBottom:9}}>👋</div>
      <div className="ob-t">About you</div>
      <div className="ob-s">Helps BrainBloom personalise your experience. You can always change this later.</div>
      <div className="pf"><label>Your name</label><input className="ob-in" style={{marginBottom:0}} placeholder="First name" value={name} onChange={e=>setName(e.target.value)}/></div>
      <div className="pf" style={{marginTop:7}}><label>What do you do?</label><input className="ob-in" style={{marginBottom:0}} placeholder="e.g. Teacher, Student, Parent, Designer..." value={role} onChange={e=>setRole(e.target.value)}/></div>
      <div style={{marginTop:10}}>
        <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Choose your theme</div>
        <div className="th-grid">{Object.entries(THEMES).map(([key,th2])=>(
          <button key={key} className={"th-btn"+(selTheme===key?" on":"")} style={{background:"linear-gradient(135deg,"+th2.h1+","+th2.h2+")",color:"white"}} onClick={()=>setSelTheme(key)}>{th2.name}</button>
        ))}</div>
      </div>
      <button className="ob-nx" onClick={()=>setStep(2)}>Next</button>
      <button className="ob-sk" onClick={()=>setStep(2)}>Skip</button>
    </div>,

    <div key="loc">
      <div style={{fontSize:36,textAlign:"center",marginBottom:9}}>📍</div>
      <div className="ob-t">Locations and your day</div>
      <div className="ob-s">BrainBloom will only suggest household tasks when you're at home, work tasks when you're at work — it's smarter that way!</div>
      <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Where do you spend time?</div>
      <div style={{display:"flex",flexWrap:"wrap",marginBottom:9}}>
        {["Home","Work","School/College","Commute","Errands","Gym","Garden"].map(l=>(
          <button key={l} className={"ob-chip"+(locs.includes(l)?" on":"")} onClick={()=>setLocs(p=>p.includes(l)?p.filter(x=>x!==l):[...p,l])}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,marginBottom:11}}>
        <input className="ob-in" style={{marginBottom:0}} placeholder="Add your own location..." value={newLoc} onChange={e=>setNewLoc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newLoc.trim()){setLocs(l=>[...l,newLoc.trim()]);setNewLoc("");}}}/>
        <button className="btn bp bsm" onClick={()=>{if(newLoc.trim()){setLocs(l=>[...l,newLoc.trim()]);setNewLoc("");}}}>+</button>
      </div>
      <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Task suggestion window</div>
      <div style={{display:"flex",gap:8,marginBottom:9}}>
        <div style={{flex:1}}><label style={{fontSize:9,fontWeight:700,color:"#AAA",display:"block",marginBottom:2}}>From</label><input className="ob-in" style={{marginBottom:0}} type="time" value={taskFrom} onChange={e=>setTaskFrom(e.target.value)}/></div>
        <div style={{flex:1}}><label style={{fontSize:9,fontWeight:700,color:"#AAA",display:"block",marginBottom:2}}>Until</label><input className="ob-in" style={{marginBottom:0}} type="time" value={taskTo} onChange={e=>setTaskTo(e.target.value)}/></div>
      </div>
      <div className="tog-row" style={{marginBottom:7}}>
        <div><div className="tog-lbl">🚗 I commute</div><div className="tog-sub">Blocks travel time from task suggestions</div></div>
        <button className={"tog"+(hasCommute?" on":"")} onClick={()=>setHasCommute(s=>!s)}/>
      </div>
      {hasCommute&&<div style={{display:"flex",gap:8,marginBottom:7}}>
        <div style={{flex:1}}><label style={{fontSize:9,fontWeight:700,color:"#AAA",display:"block",marginBottom:2}}>Morning (mins)</label><input className="ob-in" style={{marginBottom:0}} type="number" min="5" max="180" value={commuteMins} onChange={e=>setCommuteMins(+e.target.value)}/></div>
        <div style={{flex:1}}><label style={{fontSize:9,fontWeight:700,color:"#AAA",display:"block",marginBottom:2}}>Evening (mins)</label><input className="ob-in" style={{marginBottom:0}} type="number" min="5" max="180" value={commuteEveMins} onChange={e=>setCommuteEveMins(+e.target.value)}/></div>
      </div>}
      <button className="ob-nx" disabled={locs.length===0} onClick={()=>setStep(3)}>Next</button>
    </div>,

    <div key="rf">
      <div style={{fontSize:36,textAlign:"center",marginBottom:9}}>⚙️</div>
      <div className="ob-t">Routines and features</div>
      <div className="ob-s">Pre-filled with sensible defaults — edit anything that doesn't fit. You can change all of this anytime in Settings.</div>
      <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Morning routine</div>
      {mList.map((item,i)=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
          <input className="ob-in" style={{marginBottom:0,flex:1,fontSize:12}} value={item.l} onChange={e=>setMList(l=>l.map((x,j)=>j===i?{...x,l:e.target.value}:x))}/>
          <input className="ob-in" style={{marginBottom:0,width:44,fontSize:11}} type="number" min="1" value={item.t} onChange={e=>setMList(l=>l.map((x,j)=>j===i?{...x,t:+e.target.value}:x))}/>
          <span style={{fontSize:9,color:"#AAA",fontWeight:600,flexShrink:0}}>min</span>
          <button className="db" onClick={()=>setMList(l=>l.filter((_,j)=>j!==i))}>×</button>
        </div>
      ))}
      <button className="btn bs bsm" style={{marginBottom:9,fontSize:10}} onClick={()=>setMList(l=>[...l,{id:"m"+Date.now(),l:"",d:false,t:5}])}>+ Add step</button>
      <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Evening routine</div>
      {eList.map((item,i)=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
          <input className="ob-in" style={{marginBottom:0,flex:1,fontSize:12}} value={item.l} onChange={e=>setEList(l=>l.map((x,j)=>j===i?{...x,l:e.target.value}:x))}/>
          <input className="ob-in" style={{marginBottom:0,width:44,fontSize:11}} type="number" min="1" value={item.t} onChange={e=>setEList(l=>l.map((x,j)=>j===i?{...x,t:+e.target.value}:x))}/>
          <span style={{fontSize:9,color:"#AAA",fontWeight:600,flexShrink:0}}>min</span>
          <button className="db" onClick={()=>setEList(l=>l.filter((_,j)=>j!==i))}>×</button>
        </div>
      ))}
      <button className="btn bs bsm" style={{marginBottom:9,fontSize:10}} onClick={()=>setEList(l=>[...l,{id:"e"+Date.now(),l:"",d:false,t:5}])}>+ Add step</button>
      <div className="tog-row"><div><div className="tog-lbl">💰 Spending tracker</div><div className="tog-sub">Track income, bills and what's left to spend</div></div><button className={"tog"+(wantSpend?" on":"")} onClick={()=>setWantSpend(s=>!s)}/></div>
      <div className="tog-row" style={{marginBottom:wantCycle?6:0}}><div><div className="tog-lbl">🌙 Cycle tracking</div><div className="tog-sub">Connect your cycle to mood, energy and planning</div></div><button className={"tog"+(wantCycle?" on":"")} onClick={()=>setWantCycle(s=>!s)}/></div>
      {wantCycle&&<div style={{background:"#F9F5FF",borderRadius:9,padding:"9px 11px",marginBottom:7,border:"1.5px solid #C77DFF33"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#9B5DE5",marginBottom:6}}>Cycle details — optional, add later in Settings if you prefer</div>
        <div className="pf"><label>First day of last period</label><input className="ob-in" style={{marginBottom:0}} type="date" value={cycleDate} onChange={e=>setCycleDate(e.target.value)}/></div>
        <div className="pf" style={{marginBottom:0}}><label>Cycle length (days)</label><input className="ob-in" style={{marginBottom:0}} type="number" min="21" max="45" placeholder="Not sure — we will use 28 days" value={cycleLen} onChange={e=>setCycleLen(e.target.value)}/></div>
      </div>}
      <div className="tog-row"><div><div className="tog-lbl">🧠 ADHD-specific features</div><div className="tog-sub">Aversion ratings, ADHD research tips, dreaded task nudges</div></div><button className={"tog"+(wantADHD?" on":"")} onClick={()=>setWantADHD(s=>!s)}/></div>
      <button className="ob-nx" onClick={()=>setStep(4)}>Next</button>
    </div>,

    <div key="done" style={{textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:9}}>🎉</div>
      <div className="ob-t" style={{fontSize:21}}>{"You're all set"+(name?", "+name:"")+"!"}</div>
      <div className="ob-s">Everything can be adjusted anytime in Settings.</div>
      <div style={{background:"linear-gradient(135deg,#FFF4CC,#FFE5E5)",borderRadius:11,padding:12,marginBottom:13,textAlign:"left"}}>
        <div style={{fontFamily:"Fredoka One",fontSize:12,color:"#FF6B6B",marginBottom:4}}>Your BrainBloom includes:</div>
        {["📍 "+locs.slice(0,3).join(", ")+(locs.length>3?" +":""),"☀️ "+mList.filter(x=>x.l).length+"-step morning routine","🌙 "+eList.filter(x=>x.l).length+"-step evening routine",wantSpend?"💰 Spending and budget tracker":"",wantCycle?"🌙 Cycle tracking":"",wantADHD?"🧠 ADHD-specific features":"🧠 General productivity mode","🎨 "+(THEMES[selTheme]?THEMES[selTheme].name:"Bloom")+" theme"].filter(Boolean).map((f,i)=>(
          <div key={i} style={{fontSize:11,fontWeight:600,color:"#444",marginBottom:2}}>{"✓ "+f}</div>
        ))}
      </div>
      <button className="ob-nx" onClick={()=>onComplete({name,role,locs,mList:mList.filter(x=>x.l),eList:eList.filter(x=>x.l),wantCycle,wantSpend,wantADHD,theme:selTheme,taskFrom,taskTo,hasCommute,commuteMins,commuteEveMins,cycleDate,cycleLen:cycleLen?+cycleLen:28})}>
        Start using BrainBloom 🧠
      </button>
    </div>,
  ];

  return(
    <div className="ob">
      <style>{makeCSS(THEMES[selTheme]||THEMES.bloom)}</style>
      <div className="ob-card">
        {step>0&&<div className="ob-prog">{Array.from({length:TOTAL}).map((_,i)=><div key={i} className={"ob-dot"+(i<step?" on":"")}/>)}</div>}
        {steps[step]}
      </div>
    </div>
  );
}

function VoiceSheet({onClose,onResult,locs,profName,role,theme}){
  const[state,setState]=useState("idle");
  const[trans,setTrans]=useState("");
  const[result,setResult]=useState(null);
  const recRef=useRef(null);
  const t=THEMES[theme]||THEMES.bloom;
  const start=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice recognition works best on Chrome for Android or desktop.");return;}
    const r=new SR();r.continuous=true;r.interimResults=true;r.lang="en";
    let ft="";
    r.onresult=e=>{let it="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)ft+=e.results[i][0].transcript+" ";else it+=e.results[i][0].transcript;}setTrans(ft+it);};
    r.onerror=()=>setState("idle");
    recRef.current=r;r.start();setState("rec");setTrans("");setResult(null);
  };
  const stop=()=>{if(recRef.current){recRef.current.stop();recRef.current=null;}setState("proc");setTimeout(()=>proc(trans),700);};
  const proc=async(text)=>{
    if(!text.trim()){setState("idle");return;}
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:900,
        system:"Personal planner. User: "+(profName||"someone")+", "+(role||"professional")+". Locations: "+locs.join(", ")+". Return ONLY valid JSON no markdown: {\"tasks\":[{\"tl\":\"title\",\"lo\":\""+( locs[0]||"Home")+"\",\"pr\":\"medium\",\"mn\":15,\"av\":0,\"recur\":\"none\"}],\"events\":[{\"title\":\"title\",\"date\":\"YYYY-MM-DD\",\"startTime\":\"09:00\",\"allDay\":false}],\"spends\":[{\"am\":0,\"ca\":\"other\",\"lb\":\"label\"}],\"symptoms\":[],\"habits\":[]}",
        messages:[{role:"user",content:"Voice dump: \""+text+"\""}]
      })});
      const data=await res.json();
      const raw=data.content&&data.content.find(b=>b.type==="text")?data.content.find(b=>b.type==="text").text:"{}";
      setResult(JSON.parse(raw.trim()));
    }catch{setResult({tasks:[],notes:text,habits:[]});}
    setState("done");
  };
  return(
    <>
      <div className="voverlay" onClick={onClose}/>
      <div className="vsheet">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div style={{fontFamily:"Fredoka One",fontSize:16,color:t.dark}}>🎙️ Voice Dump</div>
          <button className="db" onClick={onClose}>×</button>
        </div>
        {state==="idle"&&<>
          <p style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:11,lineHeight:1.5}}>Dump everything — tasks, events, symptoms, spends. I will sort it all out.</p>
          <button style={{width:"100%",padding:13,background:"linear-gradient(135deg,"+t.h1+","+t.h2+")",color:"white",border:"none",borderRadius:11,fontFamily:"Fredoka One",fontSize:15,cursor:"pointer"}} onClick={start}>🎙️ Tap to start</button>
        </>}
        {state==="rec"&&<>
          <div style={{textAlign:"center",padding:"7px 0"}}>
            <div style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#FF0000,#FF6B6B)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 8px"}}>⏹️</div>
            <div style={{fontFamily:"Fredoka One",fontSize:14,color:t.dark}}>Listening — tap to stop</div>
          </div>
          {trans&&<div style={{background:"#F9F5FF",border:"2px solid #C77DFF",borderRadius:10,padding:10,fontSize:11,fontWeight:600,fontStyle:"italic",marginTop:8}}>"{trans}"</div>}
          <button style={{width:"100%",padding:11,background:"#F5F5F5",color:"#666",border:"none",borderRadius:10,fontFamily:"Fredoka One",fontSize:14,cursor:"pointer",marginTop:10}} onClick={stop}>Stop and organise</button>
        </>}
        {state==="proc"&&<div style={{textAlign:"center",padding:16}}><div style={{fontFamily:"Fredoka One",fontSize:14,color:t.dark}}>Organising your thoughts...</div></div>}
        {state==="done"&&result&&<>
          <div style={{fontFamily:"Fredoka One",fontSize:14,color:t.dark,marginBottom:8}}>Here is what I found:</div>
          {result.symptoms&&result.symptoms.length>0&&<div style={{background:"#FFF0F0",borderRadius:8,padding:"6px 9px",marginBottom:5,fontSize:11,fontWeight:600}}>🩺 {result.symptoms.join(", ")}</div>}
          {result.habits&&result.habits.length>0&&<div style={{background:"#E8F8EC",borderRadius:8,padding:"6px 9px",marginBottom:5,fontSize:11,fontWeight:600}}>🌿 {result.habits.join(", ")}</div>}
          {result.spends&&result.spends.map((s,i)=><div key={i} style={{background:"#FFF0E0",borderRadius:8,padding:"6px 9px",marginBottom:5,fontSize:11,fontWeight:600}}>💰 {s.lb}: €{s.am}</div>)}
          {result.events&&result.events.map((ev,i)=><div key={i} style={{background:"#E8F0FF",borderRadius:8,padding:"6px 9px",marginBottom:5,fontSize:11,fontWeight:600}}>📅 {ev.title} — {ev.date}</div>)}
          {result.tasks&&result.tasks.length>0&&<><div className="sl">Tasks found</div>{result.tasks.map((tk,i)=><div key={i} style={{background:"#F5F5F5",borderRadius:8,padding:"7px 9px",marginBottom:4,borderLeft:"3px solid "+t.acc,fontSize:11,fontWeight:600}}>📋 {tk.tl} — {tk.lo} · {tk.mn}m</div>)}</>}
          <div style={{display:"flex",gap:6,marginTop:8}}>
            <button className="btn bp" style={{flex:1}} onClick={()=>{onResult(result);onClose();}}>Add to app</button>
            <button className="btn bs" onClick={onClose}>Discard</button>
          </div>
        </>}
      </div>
    </>
  );
}

function FocusSheet({onClose,energy,tasks,spotifyUrl,theme}){
  const[tSec,setTSec]=useState(0);
  const[tTot,setTTot]=useState(0);
  const[tRun,setTRun]=useState(false);
  const[tPk,setTPk]=useState(null);
  const[musOn,setMusOn]=useState(false);
  const[fSug,setFSug]=useState([]);
  const tiRef=useRef(null);
  const t=THEMES[theme]||THEMES.bloom;
  const el=energy?energy.n:3;
  const vibes={1:{l:"Deep Focus",c:"#4D96FF",e:"🎹"},2:{l:"Lo-Fi Chill",c:"#C77DFF",e:"🎵"},3:{l:"Steady Flow",c:"#6BCB77",e:"🌿"},4:{l:"Feel Good",c:"#FFD93D",e:"✨"},5:{l:"Power Mode",c:"#FF6B6B",e:"🚀"}};
  const vibe=vibes[Math.min(el,5)]||vibes[3];
  const circ=2*Math.PI*57;
  useEffect(()=>{
    if(tRun&&tSec>0)tiRef.current=setTimeout(()=>setTSec(s=>s-1),1000);
    else if(tSec===0&&tRun){setTRun(false);setMusOn(false);}
    return()=>clearTimeout(tiRef.current);
  },[tRun,tSec]);
  const start=(mins)=>{
    const s=mins*60;setTTot(s);setTSec(s);setTPk(mins);
    const fit=tasks.filter(t2=>!t2.dn&&t2.mn<=mins);
    const so=el>=4?[...fit].sort((a,b)=>(a.pr==="high"?0:1)-(b.pr==="high"?0:1)):[...fit].sort((a,b)=>a.mn-b.mn);
    setFSug(so.slice(0,3));setTRun(true);
  };
  return(
    <>
      <div className="voverlay" onClick={onClose}/>
      <div className="vsheet">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div style={{fontFamily:"Fredoka One",fontSize:16,color:t.dark}}>⏱️ Focus Timer</div>
          <button className="db" onClick={onClose}>×</button>
        </div>
        <div style={{background:"linear-gradient(135deg,"+vibe.c+","+vibe.c+"BB)",borderRadius:10,padding:"10px 11px",marginBottom:9,display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:18}}>{vibe.e}</span>
          <div style={{fontFamily:"Fredoka One",fontSize:13,color:"white",flex:1}}>{vibe.l}</div>
          {!musOn?<button style={{padding:"4px 8px",background:"rgba(255,255,255,.25)",border:"none",color:"white",borderRadius:7,cursor:"pointer",fontFamily:"Nunito",fontWeight:700,fontSize:10}} onClick={()=>{window.open(spotifyUrl||"https://open.spotify.com/search/"+encodeURIComponent(vibe.l+" focus"),"_blank");setMusOn(true);}}>🎵 Spotify</button>
          :<div style={{display:"flex",alignItems:"center",gap:5}}><div className="mbars">{[1,2,3,4,5].map(i=><div key={i} className="mbar" style={{height:[5,11,8,14,7][i-1]+"px",animationDelay:((i-1)*.15)+"s"}}/>)}</div><button onClick={()=>setMusOn(false)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",borderRadius:5,padding:"2px 6px",cursor:"pointer",fontSize:9,fontWeight:700}}>Stop</button></div>}
        </div>
        {!tRun&&tSec===0&&<div className="tg2">{[5,10,15,20,25,30,45,60,90].map(m=><button key={m} className={"tc2"+(tPk===m?" on":"")} onClick={()=>start(m)}>{m>=60?m/60+"h":m+"m"}</button>)}</div>}
        {(tRun||tSec>0)&&<>
          <div className="tmr">
            <svg width="130" height="130" viewBox="0 0 130 130"><circle className="tmrt" cx="65" cy="65" r="57"/><circle className="tmrf" cx="65" cy="65" r="57" stroke={vibe.c} strokeDasharray={circ} strokeDashoffset={circ*(1-(tTot>0?tSec/tTot:0))}/></svg>
            <div className="tmin"><div className="tmcl">{String(Math.floor(tSec/60)).padStart(2,"0")+":"+String(tSec%60).padStart(2,"0")}</div><div style={{fontSize:10,fontWeight:700,color:"#AAA"}}>{tPk+"min"}</div></div>
          </div>
          <div className="brow">
            <button className="btn bp" onClick={()=>setTRun(r=>!r)}>{tRun?"⏸ Pause":"▶️ Resume"}</button>
            <button className="btn bs" onClick={()=>{setTSec(0);setTTot(0);setTRun(false);setTPk(null);setFSug([]);setMusOn(false);}}>Reset</button>
          </div>
          {fSug.length>0&&<><div className="sl">Fits this session</div>{fSug.map(t2=><div key={t2.id} style={{padding:"7px 9px",background:"#F9F9F9",borderRadius:8,marginBottom:4,borderLeft:"3px solid "+t.acc,fontSize:11,fontWeight:700,color:t.dark}}>{t2.tl} · {t2.mn}m</div>)}</>}
        </>}
      </div>
    </>
  );
}

function AddEventModal({onClose,onSave,locs,initialDate,lc,le,theme}){
  const[title,setTitle]=useState("");
  const[evDate,setEvDate]=useState(initialDate||todayISO());
  const[allDay,setAllDay]=useState(false);
  const[startTime,setStartTime]=useState("09:00");
  const[endTime,setEndTime]=useState("10:00");
  const[evLoc,setEvLoc]=useState(locs[0]||"Home");
  const[recur,setRecur]=useState("none");
  const[recurDays,setRecurDays]=useState([]);
  const[hasCost,setHasCost]=useState(false);
  const[cost,setCost]=useState("");
  const t=THEMES[theme]||THEMES.bloom;
  const toggleDay=(d)=>setRecurDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d]);
  const save=()=>{
    if(!title.trim())return;
    const ev={id:"ev"+Date.now(),title:title.trim(),date:evDate,allDay,startTime:allDay?"":startTime,endTime:allDay?"":endTime,loc:evLoc,recur,days:recur==="weekly"?recurDays:[],exceptions:[],endDate:null};
    if(hasCost&&cost)ev.cost={amount:+cost,label:title.trim()};
    onSave(ev);onClose();
  };
  return(
    <div className="modal-ov" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"Fredoka One",fontSize:16,color:t.dark}}>{"Add to "+new Date(evDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
          <button className="db" onClick={onClose}>×</button>
        </div>
        <div className="pf"><label>Title</label><input className="pi" placeholder="e.g. Dentist, Team meeting, Gym..." value={title} onChange={e=>setTitle(e.target.value)}/></div>
        <div className="pf"><label>Date</label><input className="pi" type="date" value={evDate} onChange={e=>setEvDate(e.target.value)}/></div>
        <div className="tog-row" style={{marginBottom:7}}>
          <div><div className="tog-lbl">📅 All day</div></div>
          <button className={"tog"+(allDay?" on":"")} onClick={()=>setAllDay(s=>!s)}/>
        </div>
        {!allDay&&<div style={{display:"flex",gap:7,marginBottom:7}}>
          <div style={{flex:1}}><label style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:2}}>Start</label><input className="pi" type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}/></div>
          <div style={{flex:1}}><label style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:2}}>End</label><input className="pi" type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}/></div>
        </div>}
        <div className="tog-row" style={{marginBottom:hasCost?6:7}}>
          <div><div className="tog-lbl">💰 Add a cost</div><div className="tog-sub">e.g. nail appointment, car service</div></div>
          <button className={"tog"+(hasCost?" on":"")} onClick={()=>setHasCost(s=>!s)}/>
        </div>
        {hasCost&&<div className="pf"><label>Amount (€)</label><input className="pi" type="number" placeholder="0.00" value={cost} onChange={e=>setCost(e.target.value)}/></div>}
        <div className="pf"><label>Location</label>
          <div className="fr">{locs.map(l=><button key={l} style={{flexShrink:0,padding:"4px 8px",borderRadius:13,border:"2px solid "+(evLoc===l?t.acc:"#EEE"),background:evLoc===l?t.acc:"white",color:evLoc===l?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:10,cursor:"pointer"}} onClick={()=>setEvLoc(l)}>{le(l)}{l}</button>)}</div>
        </div>
        <div className="pf"><label>Repeats</label>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {[["none","Once"],["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"]].map(([v,l])=>(
              <button key={v} style={{padding:"4px 8px",borderRadius:13,border:"2px solid "+(recur===v?t.acc:"#EEE"),background:recur===v?t.acc:"white",color:recur===v?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:10,cursor:"pointer"}} onClick={()=>setRecur(v)}>{l}</button>
            ))}
          </div>
        </div>
        {recur==="weekly"&&<div className="pf"><label>On these days</label>
          <div style={{display:"flex",gap:3}}>
            {WDAYS.map(d=><button key={d} style={{minWidth:28,padding:"3px 2px",borderRadius:13,border:"2px solid "+(recurDays.includes(d)?t.acc:"#EEE"),background:recurDays.includes(d)?t.acc:"white",color:recurDays.includes(d)?"white":"#888",fontFamily:"Nunito",fontWeight:700,fontSize:9,cursor:"pointer",textAlign:"center"}} onClick={()=>toggleDay(d)}>{d}</button>)}
          </div>
        </div>}
        <button style={{width:"100%",padding:11,background:"linear-gradient(135deg,"+t.h1+","+t.h2+")",color:"white",border:"none",borderRadius:9,fontFamily:"Fredoka One",fontSize:14,cursor:"pointer",marginTop:4}} onClick={save}>Save</button>
      </div>
    </div>
  );
}

function DeleteRecurModal({ev,date,onClose,onDelete,theme}){
  const t=THEMES[theme]||THEMES.bloom;
  return(
    <div className="modal-ov" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal" style={{padding:20}}>
        <div style={{fontFamily:"Fredoka One",fontSize:15,color:t.dark,marginBottom:4}}>Delete repeating event</div>
        <div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:12}}>"{ev.title}" repeats. What would you like to remove?</div>
        {[["this","Just this one","Remove only "+new Date(date+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})],["future","This and future","Remove from this date onwards"],["all","All events","Remove the entire series"]].map(([type,label,sub])=>(
          <button key={type} onClick={()=>onDelete(type)} style={{width:"100%",padding:"10px 12px",marginBottom:6,background:t.bg,border:"2px solid #EEE",borderRadius:9,fontFamily:"Nunito",fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"left",color:t.dark,display:"block"}}>
            {label}<div style={{fontSize:9,color:"#AAA",fontWeight:600,marginTop:1}}>{sub}</div>
          </button>
        ))}
        <button style={{width:"100%",padding:9,background:"#F5F5F5",border:"none",borderRadius:9,fontFamily:"Nunito",fontWeight:700,fontSize:12,cursor:"pointer",color:"#666",marginTop:2}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function TourOverlay({onDone,onSkip,theme}){
  const[step,setStep]=useState(0);
  const t=THEMES[theme]||THEMES.bloom;
  const cur=TOUR[step];
  return(
    <div className="tour-ov">
      <div className="tour-card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",gap:5}}>{TOUR.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i===step?t.acc:"#DDD",transition:"all .3s"}}/>)}</div>
          <button className="db" onClick={onSkip}>×</button>
        </div>
        <div style={{fontSize:32,marginBottom:8}}>{cur.emoji}</div>
        <div style={{fontFamily:"Fredoka One",fontSize:18,color:"#2D2D2D",marginBottom:6}}>{cur.title}</div>
        <p style={{fontSize:13,fontWeight:600,color:"#555",lineHeight:1.5,marginBottom:16}}>{cur.text}</p>
        <div style={{display:"flex",gap:8}}>
          {step>0&&<button className="btn bs" style={{flex:1}} onClick={()=>setStep(s=>s-1)}>← Back</button>}
          {step<TOUR.length-1
            ?<button className="btn bp" style={{flex:2}} onClick={()=>setStep(s=>s+1)}>Next →</button>
            :<button className="btn bp" style={{flex:2}} onClick={onDone}>Let's go! 🎉</button>}
        </div>
        {step===0&&<button style={{width:"100%",padding:8,background:"none",border:"none",fontFamily:"Nunito",fontWeight:700,fontSize:11,color:"#BBB",cursor:"pointer",marginTop:5}} onClick={onSkip}>Skip tour</button>}
      </div>
    </div>
  );
}


function SettingsPage({theme,setTheme,profName,setProfName,role,setRole,locs,setLocs,
  wantCycle,setWantCycle,wantSpend,setWantSpend,wantADHD,setWantADHD,
  morningList,setMorningList,eveningList,setEveningList,
  incomes,setIncomes,fixedCosts,setFixedCosts,oneOffIncome,setOneOffIncome,
  spends,setSpends,finSetup,setFinSetup,lps,setLps,cLen,setCLen,cDay,cPhase,
  rewards,setRewards,mStreak,eStreak,mdStreak,tasks,
  hasCommute,setHasCommute,commuteMins,setCommuteMins,commuteEveMins,setCommuteEveMins,
  taskFrom,setTaskFrom,taskTo,setTaskTo,spotifyUrl,setSpotifyUrl,
  calStartMon,setCalStartMon,tourDone,tourSkipped,setShowTour,setOnboarded,
  newLoc2,setNewLoc2,getRP,lc,le}){
  const[settingsSearch,setSettingsSearch]=useState("");
  const[openSects,setOpenSects]=useState({me:false,finance:false,cycle:false,rewards:false,app:false});
  const[nSAm,setNSAm]=useState("");
  const[nSLb,setNSLb]=useState("");
  const[nSCa,setNSCa]=useState("other");
  const[nRew,setNRew]=useState("");
  const[nRewT,setNRewT]=useState("");
  const[nRewI,setNRewI]=useState("🎁");
  const t=THEMES[theme]||THEMES.bloom;
  const totalIncome=incomes.reduce((a,i)=>a+toMonthly(i.amount,i.freq),0)+oneOffIncome.reduce((a,i)=>a+(+i.amount||0),0)/12;
  const totalFixed=fixedCosts.reduce((a,c)=>a+toMonthly(c.amount,c.freq),0);
  const discretionary=Math.max(0,totalIncome-totalFixed);
  const dailyBudget=discretionary/30;
  const msSpends=spends.filter(s=>{const d=new Date(s.dt),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();});
  const monthSpent=msSpends.reduce((a,s)=>a+s.am,0);
  const upcomingComm=0;
  const available=Math.max(0,discretionary-monthSpent-upcomingComm);

  const searchQ=settingsSearch.toLowerCase().trim();
  const matches=(section)=>{
    if(!searchQ)return true;
    const entry=SEARCH_INDEX.find(e=>e.section===section);
    return entry&&entry.terms.some(term=>term.includes(searchQ)||searchQ.includes(term.substring(0,3)));
  };
  const Sect=({id,icon,title,children})=>{
    if(!matches(id))return null;
    const isOpen=openSects[id];
    return(
      <div className="sect" style={searchQ&&matches(id)?{border:"2px solid "+t.acc+"44"}:{}}>
        <div className="sect-hdr" onClick={()=>setOpenSects(p=>({...p,[id]:!p[id]}))}>
          <div className="sect-title">{icon+" "+title}</div>
          <span style={{fontSize:16,color:"#BBB",display:"inline-block",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>
        </div>
        {isOpen&&<div className="sect-body">{children}</div>}
      </div>
    );
  };

  return(
    <>
      <div className="search-wrap">
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#BBB",pointerEvents:"none"}}>🔍</span>
        <input className="search-in" placeholder="Search settings... e.g. budget, theme, cycle" value={settingsSearch} onChange={e=>{
          const q=e.target.value;setSettingsSearch(q);
          if(q.trim()){
            const qL=q.toLowerCase();
            const found=SEARCH_INDEX.find(entry=>entry.terms.some(term=>term.includes(qL)||qL.includes(term.substring(0,3))));
            if(found)setOpenSects(p=>({...p,[found.section]:true}));
          }
        }}/>
      </div>

      {(tourDone||tourSkipped)&&<div style={{background:t.bg,borderRadius:9,padding:"8px 12px",marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between",border:"1.5px solid #EEE"}}>
        <div style={{fontSize:11,fontWeight:700,color:t.dark}}>👋 App tour</div>
        <button className="btn bp bsm" onClick={()=>setShowTour(true)}>Watch tour</button>
      </div>}

      <Sect id="me" icon="👤" title="Me">
        <div className="pf" style={{marginTop:4}}><label>Name</label><input className="pi" value={profName} onChange={e=>setProfName(e.target.value)}/></div>
        <div className="pf"><label>What you do</label><input className="pi" value={role} onChange={e=>setRole(e.target.value)}/></div>
        <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",margin:"9px 0 5px"}}>Locations</div>
        <div style={{display:"flex",flexWrap:"wrap",marginBottom:7}}>{locs.map((l,i)=><span key={i} className="ptg">{le(l)}{l}<span style={{cursor:"pointer",marginLeft:2,color:"#CCC"}} onClick={()=>setLocs(locs.filter((_,j)=>j!==i))}>×</span></span>)}</div>
        <div style={{display:"flex",gap:4,marginBottom:9}}><input className="pi" placeholder="Add location..." value={newLoc2} onChange={e=>setNewLoc2(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newLoc2.trim()){setLocs([...locs,newLoc2.trim()]);setNewLoc2("");}}}/><button className="btn bpu bsm" onClick={()=>{if(newLoc2.trim()){setLocs([...locs,newLoc2.trim()]);setNewLoc2("");}}}>+</button></div>
        <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",margin:"0 0 5px"}}>Morning Routine</div>
        {morningList.map(i=><div key={i.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #F5F5F5"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:11,color:t.dark}}>{i.l}</div><div style={{fontSize:9,color:"#AAA"}}>{i.t+" min"}</div></div><button className="db" onClick={()=>setMorningList(l=>l.filter(x=>x.id!==i.id))}>×</button></div>)}
        <div style={{display:"flex",gap:4,margin:"4px 0 9px"}}><input id="nm" className="pi" style={{fontSize:11}} placeholder="Add morning step..."/><button className="btn bp bsm" onClick={()=>{const el=document.getElementById("nm");if(!el||!el.value.trim())return;setMorningList(l=>[...l,{id:"m"+Date.now(),l:el.value.trim(),d:false,t:5}]);el.value="";}}>+</button></div>
        <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",margin:"0 0 5px"}}>Evening Routine</div>
        {eveningList.map(i=><div key={i.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #F5F5F5"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:11,color:t.dark}}>{i.l}</div><div style={{fontSize:9,color:"#AAA"}}>{i.t+" min"}</div></div><button className="db" onClick={()=>setEveningList(l=>l.filter(x=>x.id!==i.id))}>×</button></div>)}
        <div style={{display:"flex",gap:4,margin:"4px 0 0"}}><input id="ne" className="pi" style={{fontSize:11}} placeholder="Add evening step..."/><button className="btn bp bsm" onClick={()=>{const el=document.getElementById("ne");if(!el||!el.value.trim())return;setEveningList(l=>[...l,{id:"e"+Date.now(),l:el.value.trim(),d:false,t:5}]);el.value="";}}>+</button></div>
        <div className="tog-row" style={{marginTop:7}}><div><div className="tog-lbl">🚗 I commute</div><div className="tog-sub">Blocks travel time from suggestions</div></div><button className={"tog"+(hasCommute?" on":"")} onClick={()=>setHasCommute(s=>!s)}/></div>
        {hasCommute&&<div style={{display:"flex",gap:7,marginTop:7}}>
          <div style={{flex:1}}><div className="pf"><label>Morning (mins)</label><input className="pi" type="number" min="5" max="180" value={commuteMins} onChange={e=>setCommuteMins(+e.target.value)}/></div></div>
          <div style={{flex:1}}><div className="pf"><label>Evening (mins)</label><input className="pi" type="number" min="5" max="180" value={commuteEveMins} onChange={e=>setCommuteEveMins(+e.target.value)}/></div></div>
        </div>}
      </Sect>

      <Sect id="finance" icon="💰" title="Finance">
        <div className="tog-row" style={{marginTop:4}}><div><div className="tog-lbl">Enable spending tracker</div></div><button className={"tog"+(wantSpend?" on":"")} onClick={()=>setWantSpend(s=>!s)}/></div>
        {wantSpend&&<>
          {finSetup&&<div style={{background:"linear-gradient(135deg,"+t.h1+","+t.h2+")",borderRadius:11,padding:12,marginTop:9,marginBottom:9,color:"white"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div><div style={{fontSize:9,fontWeight:700,opacity:.8}}>Monthly income</div><div style={{fontFamily:"Fredoka One",fontSize:18}}>{"€"+totalIncome.toFixed(0)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:9,fontWeight:700,opacity:.8}}>Fixed costs</div><div style={{fontFamily:"Fredoka One",fontSize:18}}>{"€"+totalFixed.toFixed(0)}</div></div>
            </div>
            <div style={{background:"rgba(255,255,255,.2)",borderRadius:7,padding:"8px 10px"}}>
              <div style={{fontSize:9,fontWeight:800,opacity:.8,marginBottom:1}}>DISCRETIONARY</div>
              <div style={{fontFamily:"Fredoka One",fontSize:22}}>{"€"+discretionary.toFixed(0)}<span style={{fontSize:10,marginLeft:3}}>/month</span></div>
              <div style={{fontSize:9,fontWeight:600,opacity:.9}}>{"€"+dailyBudget.toFixed(0)+"/day · Spent: €"+monthSpent.toFixed(0)+" · Committed: €"+upcomingComm.toFixed(0)}</div>
              <div style={{background:"rgba(255,255,255,.2)",borderRadius:5,height:5,overflow:"hidden",marginTop:5}}><div style={{height:"100%",borderRadius:5,background:"white",width:Math.min((monthSpent+upcomingComm)/Math.max(discretionary,1),1)*100+"%"}}/></div>
              <div style={{fontSize:10,fontWeight:700,marginTop:4}}>{"Available: €"+available.toFixed(0)}</div>
            </div>
          </div>}
          {!finSetup&&<div style={{marginTop:9}}><button className="nb" style={{marginTop:0}} onClick={()=>setFinSetup(true)}>Set up my budget →</button></div>}
          {finSetup&&<>
            <div className="sl">Regular income</div>
            {incomes.map(i=><div key={i.id} className="fin-row"><div><div style={{fontSize:11,fontWeight:700,color:t.dark}}>{i.label}</div><div style={{fontSize:9,color:"#AAA"}}>{"€"+i.amount+" · "+i.freq+(i.dayOfMonth?" · paid day "+i.dayOfMonth:"")}</div></div><button className="db" onClick={()=>setIncomes(p=>p.filter(x=>x.id!==i.id))}>×</button></div>)}
            <IncomeForm key="income-form" onAdd={i=>setIncomes(p=>[...p,i])} theme={theme}/>
            <div className="sl">One-off income <span style={{fontSize:9,color:"#AAA"}}>(tax refund, bonus, etc)</span></div>
            {oneOffIncome.map(i=><div key={i.id} className="fin-row"><div><div style={{fontSize:11,fontWeight:700,color:t.dark}}>{i.label}</div><div style={{fontSize:9,color:"#AAA"}}>{"€"+i.amount+(i.date?" · "+i.date:"")}</div></div><button className="db" onClick={()=>setOneOffIncome(p=>p.filter(x=>x.id!==i.id))}>×</button></div>)}
            <OOIForm key="ooi-form" onAdd={i=>setOneOffIncome(p=>[...p,i])}/>
            <div className="sl">Fixed costs</div>
            {fixedCosts.map(c=><div key={c.id} className="fin-row"><div><div style={{fontSize:11,fontWeight:700,color:t.dark}}>{c.label}</div><div style={{fontSize:9,color:"#AAA"}}>{"€"+c.amount+" · "+c.freq+(c.dayOfMonth?" · due day "+c.dayOfMonth:"")}</div></div><button className="db" onClick={()=>setFixedCosts(p=>p.filter(x=>x.id!==c.id))}>×</button></div>)}
            <CostForm key="cost-form" onAdd={c=>setFixedCosts(p=>[...p,c])} theme={theme}/>
            <div className="sl">Log a spend</div>
            <div style={{display:"flex",gap:5,marginBottom:5}}>
              <input className="ai" type="number" placeholder="€" value={nSAm} onChange={e=>setNSAm(e.target.value)} style={{width:65,flex:"none"}}/>
              <input className="ai" placeholder="What was it?" value={nSLb} onChange={e=>setNSLb(e.target.value)}/>
            </div>
            <div className="fr">{SCATS.map(c=><button key={c.id} className={"fc"+(nSCa===c.id?" on":"")} style={nSCa===c.id?{background:c.c,borderColor:c.c}:{}} onClick={()=>setNSCa(c.id)}>{c.e+" "+c.l}</button>)}</div>
            <button className="btn bp bsm" onClick={()=>{if(!nSAm||isNaN(nSAm))return;setSpends(ss=>[{id:"s"+Date.now(),am:+nSAm,ca:nSCa,lb:nSLb||(SCATS.find(c=>c.id===nSCa)||SCATS[SCATS.length-1]).l,dt:new Date().toISOString()},...ss]);setNSAm("");setNSLb("");}}>Log 💳</button>
            {spends.length>0&&<><div className="sl">Recent spends</div>{spends.slice(0,5).map(s=>{const cat=SCATS.find(c=>c.id===s.ca)||SCATS[SCATS.length-1];return<div key={s.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid #F5F5F5"}}><div style={{fontSize:15,width:22}}>{cat.e}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:10}}>{s.lb}</div><div style={{fontSize:9,color:"#AAA"}}>{new Date(s.dt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div></div><div style={{fontFamily:"Fredoka One",fontSize:12,color:cat.c}}>{"€"+s.am.toFixed(2)}</div></div>;})}
            </>}
          </>}
        </>}
      </Sect>

      <Sect id="cycle" icon="🌙" title="Cycle Tracking">
        <div className="tog-row" style={{marginTop:4}}><div><div className="tog-lbl">Enable cycle tracking</div></div><button className={"tog"+(wantCycle?" on":"")} onClick={()=>setWantCycle(s=>!s)}/></div>
        {wantCycle&&<>
          <div className="pf" style={{marginTop:9}}><label>Last period start</label><input className="pi" type="date" value={lps||""} onChange={e=>setLps(e.target.value)}/></div>
          <div className="pf"><label>Cycle length (days)</label><input className="pi" type="number" min="21" max="45" value={cLen} onChange={e=>setCLen(+e.target.value)}/></div>
          {cDay&&cPhase&&<div style={{background:cPhase.c+"18",borderRadius:9,padding:"8px 10px",marginTop:5,display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:18}}>{cPhase.e}</span>
            <div><div style={{fontSize:11,fontWeight:800,color:cPhase.c}}>{cPhase.l+" Phase — Day "+cDay}</div><div style={{fontSize:9,fontWeight:600,color:"#666"}}>{cPhase.energy+" energy"}</div></div>
          </div>}
        </>}
      </Sect>

      <Sect id="rewards" icon="🏆" title="Rewards">
        <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:9,marginTop:4}}>
          {[["☀️",mStreak,"Morning"],["🌙",eStreak,"Evening"],["✅",tasks.filter(t2=>t2.dn).length,"Tasks"],["😊",mdStreak,"Mood"]].map(([l,v,label])=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"Fredoka One",fontSize:18,color:t.acc}}>{v}</div><div style={{fontSize:9,fontWeight:700,color:"#AAA"}}>{l+" "+label}</div></div>
          ))}
        </div>
        {rewards.map(r=>{
          const{cur,max}=getRP(r);const earned=max>0?cur>=max:false;
          return(
            <div key={r.id} className="rc" style={{border:earned?"2px solid #FFD93D":"none"}}>
              <div className="ri">{r.ic}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:11,color:t.dark}}>{r.rw}</div><div style={{fontSize:9,color:"#AAA",marginTop:1}}>{"🎯 "+r.tr}</div>
                {earned&&<div className="re">🎉 Earned!</div>}
                {max>0&&!earned&&<div className="sbar">{Array.from({length:Math.min(max,10)}).map((_,i)=><div key={i} className={"sd"+(i<cur?" on":"")}/>)}</div>}
              </div>
              <button className="db" onClick={()=>setRewards(p=>p.filter(x=>x.id!==r.id))}>×</button>
            </div>
          );
        })}
        <div className="sl">Add reward</div>
        <div style={{display:"flex",gap:4,marginBottom:4}}><input className="pi" style={{width:42,textAlign:"center",fontSize:16}} placeholder="🎁" value={nRewI} onChange={e=>setNRewI(e.target.value)} maxLength={2}/><input className="pi" placeholder="Your reward..." value={nRew} onChange={e=>setNRew(e.target.value)}/></div>
        <input className="pi" style={{marginBottom:5}} placeholder="When do you earn it?" value={nRewT} onChange={e=>setNRewT(e.target.value)}/>
        <button className="btn bp bsm" onClick={()=>{if(!nRew.trim()||!nRewT.trim())return;setRewards(r=>[...r,{id:"rc"+Date.now(),tr:nRewT,rw:nRew,ic:nRewI,sk:0,ty:"custom"}]);setNRew("");setNRewT("");setNRewI("🎁");}}>Add 🏆</button>
      </Sect>

      <Sect id="app" icon="🎨" title="App Settings">
        <div style={{fontSize:9,fontWeight:800,color:"#BBB",letterSpacing:1,textTransform:"uppercase",margin:"4px 0 6px"}}>Theme</div>
        <div className="th-grid">{Object.entries(THEMES).map(([key,th2])=><button key={key} className={"th-btn"+(theme===key?" on":"")} style={{background:"linear-gradient(135deg,"+th2.h1+","+th2.h2+")",color:"white"}} onClick={()=>setTheme(key)}>{th2.name}</button>)}</div>
        <div className="tog-row"><div><div className="tog-lbl">🧠 ADHD features</div><div className="tog-sub">Aversion ratings, ADHD-specific tips, dreaded task nudges</div></div><button className={"tog"+(wantADHD?" on":"")} onClick={()=>setWantADHD(s=>!s)}/></div>
        <div className="tog-row"><div><div className="tog-lbl">📅 Start week on Monday</div></div><button className={"tog"+(calStartMon?" on":"")} onClick={()=>setCalStartMon(s=>!s)}/></div>
        <div style={{marginTop:9,display:"flex",gap:7}}>
          <div style={{flex:1}}><div className="pf"><label>Suggest tasks from</label><input className="pi" type="time" value={taskFrom} onChange={e=>setTaskFrom(e.target.value)}/></div></div>
          <div style={{flex:1}}><div className="pf"><label>Suggest tasks until</label><input className="pi" type="time" value={taskTo} onChange={e=>setTaskTo(e.target.value)}/></div></div>
        </div>
        <div className="pf"><label>Spotify playlist URL</label><input className="pi" placeholder="https://open.spotify.com/playlist/..." value={spotifyUrl} onChange={e=>setSpotifyUrl(e.target.value)}/></div>
        <div style={{marginTop:9}}><button className="btn bs" style={{width:"100%",fontSize:11}} onClick={()=>{if(window.confirm("Redo setup wizard? Your data will be kept."))setOnboarded(false);}}>Redo Setup Wizard</button></div>
      </Sect>

      <div className="card" style={{textAlign:"center",background:"linear-gradient(135deg,"+t.h1+"12,"+t.h2+"12)",marginTop:4}}>
        <div style={{fontSize:30,marginBottom:4}}>🧠</div>
        <div style={{fontFamily:"Fredoka One",fontSize:15,color:t.dark}}>BrainBloom</div>
        <p style={{fontSize:9,color:"#AAA",fontWeight:600,marginTop:2}}>Your personal planner. Built with 💙</p>
      </div>
    </>
  );

}

export default function App(){
  // ── Persisted ──
  const[pwaIntroDone,setPwaIntroDone]=useLS("bb_pwaintro",false);
  const[onboarded,setOnboarded]=useLS("bb_onboarded",false);
  const[theme,setTheme]=useLS("bb_theme","bloom");
  const[profName,setProfName]=useLS("bb_name","");
  const[role,setRole]=useLS("bb_role","");
  const[locs,setLocs]=useLS("bb_locs",["Home","Work"]);
  const[wantCycle,setWantCycle]=useLS("bb_cycle",false);
  const[wantSpend,setWantSpend]=useLS("bb_spend",true);
  const[wantADHD,setWantADHD]=useLS("bb_adhd",true);
  const[morningList,setMorningList]=useLS("bb_morning",DEFAULT_MORNING);
  const[eveningList,setEveningList]=useLS("bb_evening",DEFAULT_EVENING);
  const[tasks,setTasks]=useLS("bb_tasks",[]);
  const[calEvents,setCalEvents]=useLS("bb_calevents",[]);
  const[logs,setLogs]=useLS("bb_logs",[]);
  const[habitLog,setHabitLog]=useLS("bb_habits",[]);
  const[rewards,setRewards]=useLS("bb_rewards",DEFAULT_REWARDS);
  const[mStreak,setMStreak]=useLS("bb_mstreak",0);
  const[eStreak,setEStreak]=useLS("bb_estreak",0);
  const[mdStreak,setMdStreak]=useLS("bb_mdstreak",0);
  const[lps,setLps]=useLS("bb_lps",null);
  const[cLen,setCLen]=useLS("bb_clen",28);
  const[incomes,setIncomes]=useLS("bb_incomes",[]);
  const[fixedCosts,setFixedCosts]=useLS("bb_fixedcosts",[]);
  const[oneOffIncome,setOneOffIncome]=useLS("bb_ooi",[]);
  const[spends,setSpends]=useLS("bb_spends",[]);
  const[finSetup,setFinSetup]=useLS("bb_finsetup",false);
  const[fabPos,setFabPos]=useLS("bb_fabpos",{x:300,y:580});
  const[taskFrom,setTaskFrom]=useLS("bb_taskfrom","09:00");
  const[taskTo,setTaskTo]=useLS("bb_taskto","18:00");
  const[hasCommute,setHasCommute]=useLS("bb_commute",false);
  const[commuteMins,setCommuteMins]=useLS("bb_commute_am",30);
  const[commuteEveMins,setCommuteEveMins]=useLS("bb_commute_pm",30);
  const[spotifyUrl,setSpotifyUrl]=useLS("bb_spotify","");
  const[calStartMon,setCalStartMon]=useLS("bb_calmon",true);
  const[tourDone,setTourDone]=useLS("bb_tourdone",false);
  const[tourSkipped,setTourSkipped]=useLS("bb_tourskipped",false);
  const[tourCardDismissed,setTourCardDismissed]=useLS("bb_tourcardout",false);
  const[tooltipsSeen,setTooltipsSeen]=useLS("bb_tips",[]);
  const[notifAsked,setNotifAsked]=useLS("bb_notifasked",false);
  const[checkinDays,setCheckinDays]=useLS("bb_checkindays",0);
  const[finNudgeDismissed,setFinNudgeDismissed]=useLS("bb_finnudge",false);

  // ── Session ──
  const[tab,setTab]=useState("🏠");
  const[csStep,setCsStep]=useState(0);
  const[savedCheckin,setSavedCheckin]=useLS("bb_checkin_today",null);
  const csDone=savedCheckin&&savedCheckin.date===todayISO();
  const setCsDone=(v)=>{if(v)setSavedCheckin(p=>({...p,date:todayISO()}));};
  const mood=savedCheckin&&savedCheckin.date===todayISO()?savedCheckin.mood:null;
  const setMood=(m)=>setSavedCheckin(p=>({...(p||{}),date:todayISO(),mood:m}));
  const energy=savedCheckin&&savedCheckin.date===todayISO()?savedCheckin.energy:null;
  const setEnergy=(e)=>setSavedCheckin(p=>({...(p||{}),date:todayISO(),energy:e}));
  const syms=savedCheckin&&savedCheckin.date===todayISO()?(savedCheckin.syms||[]):[];
  const setSyms=(fn)=>setSavedCheckin(p=>{const prev=(p&&p.date===todayISO()?p:{date:todayISO()});const cur=prev.syms||[];const next=typeof fn==="function"?fn(cur):fn;return{...prev,syms:next};});
  const[evDone,setEvDone]=useLS("bb_evdone_today",{date:"",done:false});
  const isEvDone=evDone.date===todayISO()&&evDone.done;
  const[evMood,setEvMood]=useState(null);
  const[notes,setNotes]=useState("");
  const[selDay,setSelDay]=useState(todayISO());
  const[calMonth,setCalMonth]=useState(new Date());
  const[showAddEv,setShowAddEv]=useState(false);
  const[detailItem,setDetailItem]=useState(null);
  const[editingEv,setEditingEv]=useState(null);
  const[deleteModal,setDeleteModal]=useState(null);
  const[showVoice,setShowVoice]=useState(false);
  const[showFocus,setShowFocus]=useState(false);
  const[fabOpen,setFabOpen]=useState(false);
  const[showTour,setShowTour]=useState(false);
  const[newT,setNewT]=useState("");
  const[nLoc,setNLoc]=useState("");
  const[nPri,setNPri]=useState("medium");
  const[nMin,setNMin]=useState(15);
  const[nAv,setNAv]=useState(0);
  const[nRecur,setNRecur]=useState("none");
  const[nDeadline,setNDeadline]=useState("");
  const[nHasDead,setNHasDead]=useState(false);
  const[fLoc,setFLoc]=useState("All");
  const[spRes,setSpRes]=useState(null);
  const[spinning,setSpinning]=useState(false);
  const[spAng,setSpAng]=useState(0);
  const[newInc,setNewInc]=useState({label:"",amount:"",freq:"monthly",dayOfMonth:""});
  const[newCost,setNewCost]=useState({label:"",amount:"",freq:"monthly",dayOfMonth:""});
  const[newOOI,setNewOOI]=useState({label:"",amount:"",date:""});
  const[newLoc2,setNewLoc2]=useState("");
  const[ndDis,setNdDis]=useState(false);

  const fabRef=useRef(null);
  const cvRef=useRef(null);
  const dragRef=useRef({active:false,sx:0,sy:0,px:0,py:0,moved:false});

  const t=THEMES[theme]||THEMES.bloom;
  const greeting=useMemo(()=>getGreeting(),[]);
  const todayStr=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  const cDay=useMemo(()=>getCDay(lps,cLen),[lps,cLen]);
  const cPhase=useMemo(()=>getCPhase(cDay),[cDay]);
  const dtp=useMemo(()=>cDay?cLen-cDay+1:null,[cDay,cLen]);
  const tip=useMemo(()=>getTip(mood,energy,syms,cPhase?cPhase.id:null,wantADHD),[mood,energy,syms,cPhase,wantADHD]);
  const mPct=morningList.filter(i=>i.d).length/Math.max(morningList.length,1);
  const el=energy?energy.n:3;
  const lc=(lo)=>getLC(lo,locs);
  const le=(lo)=>getLE(lo,locs);

  // Finance
  const totalIncome=useMemo(()=>incomes.reduce((a,i)=>a+toMonthly(i.amount,i.freq),0)+oneOffIncome.reduce((a,i)=>a+(+i.amount||0),0)/12,[incomes,oneOffIncome]);
  const totalFixed=useMemo(()=>fixedCosts.reduce((a,c)=>a+toMonthly(c.amount,c.freq),0),[fixedCosts]);
  const discretionary=Math.max(0,totalIncome-totalFixed);
  const dailyBudget=discretionary/30;
  const msSpends=useMemo(()=>spends.filter(s=>{const d=new Date(s.dt),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}),[spends]);
  const monthSpent=msSpends.reduce((a,s)=>a+s.am,0);
  const todaySpends=spends.filter(s=>new Date(s.dt).toDateString()===new Date().toDateString());
  const todaySpent=todaySpends.reduce((a,s)=>a+s.am,0);
  const upcomingCosts=calEvents.filter(ev=>ev.cost&&ev.date>=todayISO()&&ev.date<=addDays(todayISO(),30));
  const upcomingComm=upcomingCosts.reduce((a,ev)=>a+(ev.cost?ev.cost.amount:0),0);
  const available=Math.max(0,discretionary-monthSpent-upcomingComm);

  // Rewards
  const getRP=(r)=>{
    if(r.ty==="ms"||r.ty==="ms14")return{cur:mStreak,max:r.sk};
    if(r.ty==="es")return{cur:eStreak,max:r.sk};
    if(r.ty==="ml")return{cur:mdStreak,max:r.sk};
    if(r.ty==="dt")return{cur:tasks.filter(t2=>t2.dn).length,max:r.sk};
    if(r.ty==="dr")return{cur:tasks.filter(t2=>t2.dn&&(t2.av||0)>=3).length,max:1};
    return{cur:0,max:r.sk};
  };
  const nearestReward=useMemo(()=>{
    let cl=null,bg=Infinity;
    rewards.filter(r=>r.sk>0).forEach(r=>{const{cur,max}=getRP(r);const gap=max-cur;if(gap>0&&gap<bg){bg=gap;cl={...r,gap,cur,max};}});
    return cl;
  },[rewards,mStreak,eStreak,mdStreak,tasks]);

  const pending=tasks.filter(t2=>!t2.dn&&!(t2.recur&&t2.recur!=="none"&&recurDoneThisWeek(t2)));
  const dNudge=csDone&&!ndDis&&el>=4&&wantADHD?tasks.filter(t2=>!t2.dn&&(t2.av||0)>=3)[0]:null;

  // Calendar helpers
  const getEventsForDay=(iso)=>calEvents.filter(ev=>eventOccursOn(ev,iso));
  const getFinEventsForDay=(iso)=>{
    const evs=[];
    const d=new Date(iso+"T12:00:00");
    const dayNum=d.getDate();
    const dayName=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
    incomes.forEach(i=>{
      if(i.dayOfMonth&&["monthly","annually"].includes(i.freq)&&dayNum===+i.dayOfMonth)
        evs.push({id:"inc_"+i.id+"_"+iso,title:"💵 "+i.label,date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:null,finType:"income",amount:+i.amount});
      if(i.dayOfWeek&&i.freq==="weekly"&&dayName===i.dayOfWeek)
        evs.push({id:"inc_"+i.id+"_"+iso,title:"💵 "+i.label,date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:null,finType:"income",amount:+i.amount});
      if(i.dayOfWeek&&i.freq==="fortnightly"&&dayName===i.dayOfWeek){
        const weeksSinceEpoch=Math.floor(d.getTime()/(7*86400000));
        if(weeksSinceEpoch%2===0)evs.push({id:"inc_"+i.id+"_"+iso,title:"💵 "+i.label+" (fortnight)",date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:null,finType:"income",amount:+i.amount});
      }
    });
    fixedCosts.forEach(c=>{
      if(c.dayOfMonth&&["monthly","annually"].includes(c.freq)&&dayNum===+c.dayOfMonth)
        evs.push({id:"cost_"+c.id+"_"+iso,title:"💸 "+c.label+" due",date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:{amount:+c.amount,label:c.label},finType:"cost",amount:+c.amount});
      if(c.dayOfWeek&&c.freq==="weekly"&&dayName===c.dayOfWeek)
        evs.push({id:"cost_"+c.id+"_"+iso,title:"💸 "+c.label+" due",date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:{amount:+c.amount,label:c.label},finType:"cost",amount:+c.amount});
      if(c.dayOfWeek&&c.freq==="fortnightly"&&dayName===c.dayOfWeek){
        const weeksSinceEpoch=Math.floor(d.getTime()/(7*86400000));
        if(weeksSinceEpoch%2===0)evs.push({id:"cost_"+c.id+"_"+iso,title:"💸 "+c.label+" due (fortnight)",date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:{amount:+c.amount,label:c.label},finType:"cost",amount:+c.amount});
      }
    });
    oneOffIncome.forEach(o=>{if(o.date===iso)evs.push({id:"ooi_"+o.id,title:"💵 "+o.label+" (one-off)",date:iso,allDay:true,loc:locs[0]||"Home",recur:"none",days:[],exceptions:[],endDate:null,cost:null,finType:"income_once",amount:+o.amount});});
    return evs;
  };
  const getAllDayEvents=(iso)=>[...getEventsForDay(iso).filter(ev=>ev.allDay),...getFinEventsForDay(iso)];
  const getTasksForDay=(iso)=>tasks.filter(t2=>t2.deadline===iso&&!t2.dn);
  const getLogForDay=(iso)=>logs.find(l=>l.dt===iso);
  const getHabitsForDay=(iso)=>habitLog.find(h=>h.dt===iso);
  const getCPhaseForDay=(iso)=>{
    if(!lps||!cDay)return null;
    const diff=Math.floor((new Date(iso+"T12:00:00")-new Date())/86400000);
    return getCPhase(((cDay+diff-1+cLen*4)%cLen)+1);
  };
  const getMoodColor=(moodE)=>{const m=MOODS.find(x=>x.e===moodE);if(!m)return"#EEE";return m.n>=5?"#6BCB77":m.n>=3?"#FFD93D":"#FF6B6B";};

  const handleDeleteEv=(ev,iso)=>{
    if(ev.finType)return;
    if(!ev.recur||ev.recur==="none"){setCalEvents(p=>p.filter(x=>x.id!==ev.id));return;}
    setDeleteModal({ev,date:iso});
  };
  const confirmDelete=(type)=>{
    if(!deleteModal)return;
    const{ev,date}=deleteModal;
    if(type==="all")setCalEvents(p=>p.filter(x=>x.id!==ev.id));
    if(type==="this")setCalEvents(p=>p.map(x=>x.id===ev.id?{...x,exceptions:[...(x.exceptions||[]),date]}:x));
    if(type==="future")setCalEvents(p=>p.map(x=>x.id===ev.id?{...x,endDate:addDays(date,-1)}:x));
    setDeleteModal(null);
  };

  const togT=(id)=>setTasks(ts=>ts.map(t2=>t2.id===id?{...t2,dn:!t2.dn,lastDone:!t2.dn?new Date().toISOString():t2.lastDone}:t2));
  const setAv=(id,s)=>setTasks(ts=>ts.map(t2=>t2.id===id?{...t2,av:s}:t2));
  const addTask=()=>{
    if(!newT.trim())return;
    setTasks(ts=>[...ts,{id:"t"+Date.now(),tl:newT.trim(),lo:nLoc||locs[0]||"Home",pr:nPri,mn:nMin,dn:false,ov:false,av:nAv,recur:nRecur,deadline:nHasDead?nDeadline:null,lastDone:null}]);
    setNewT("");setNAv(0);setNDeadline("");setNHasDead(false);setNRecur("none");
  };
  const getSorted=(lf)=>{
    let f=tasks.filter(t2=>{
      if(t2.dn)return false;
      if(t2.recur&&t2.recur!=="none"&&recurDoneThisWeek(t2))return false;
      if(lf&&lf!=="All"&&t2.lo!==lf)return false;
      return true;
    });
    return f.sort((a,b)=>{
      const ap=a.pr==="high"?0:a.pr==="medium"?1:2,bp=b.pr==="high"?0:b.pr==="medium"?1:2;
      const ad=a.deadline?Math.max(0,Math.floor((new Date(a.deadline)-new Date())/86400000)):999;
      const bd=b.deadline?Math.max(0,Math.floor((new Date(b.deadline)-new Date())/86400000)):999;
      return ap!==bp?ap-bp:ad-bd;
    });
  };

  // Notification prompt
  useEffect(()=>{
    if(!notifAsked&&onboarded&&"Notification"in window){
      setTimeout(()=>{
        if(window.confirm("Enable reminders to help you stay on track?")){
          Notification.requestPermission().then(p=>{
            // STUB: when permission granted, register with FCM backend
            stubNotification("BrainBloom","Morning check-in time!");
          });
        }
        setNotifAsked(true);
      },3000);
    }
  },[onboarded,notifAsked]);

  // Init location
  useEffect(()=>{if(locs.length>0&&!nLoc)setNLoc(locs[0]);},[locs]);

  // Draggable FAB
  const fabPosRef=useRef(fabPos);
  useEffect(()=>{fabPosRef.current=fabPos;},[fabPos]);
  useEffect(()=>{
    const fab=fabRef.current;if(!fab)return;
    let startX=0,startY=0,startPX=0,startPY=0,dragging=false,moved=false;
    const onTouchStart=(e)=>{
      const p=e.touches[0];
      startX=p.clientX;startY=p.clientY;
      startPX=fabPosRef.current.x;startPY=fabPosRef.current.y;
      dragging=true;moved=false;
    };
    const onTouchMove=(e)=>{
      if(!dragging)return;
      const p=e.touches[0];
      const dx=p.clientX-startX,dy=p.clientY-startY;
      if(Math.abs(dx)>8||Math.abs(dy)>8){
        moved=true;
        setFabPos({x:Math.max(10,Math.min(window.innerWidth-62,startPX+dx)),y:Math.max(10,Math.min(window.innerHeight-62,startPY+dy))});
        e.preventDefault();
      }
    };
    const onTouchEnd=()=>{dragging=false;};
    fab.addEventListener("touchstart",onTouchStart,{passive:true});
    window.addEventListener("touchmove",onTouchMove,{passive:false});
    window.addEventListener("touchend",onTouchEnd);
    return()=>{
      fab.removeEventListener("touchstart",onTouchStart);
      window.removeEventListener("touchmove",onTouchMove);
      window.removeEventListener("touchend",onTouchEnd);
    };
  },[]);

  // Spin wheel
  useEffect(()=>{drawWheel();},[pending.length,spAng,theme]);
  const drawWheel=()=>{
    const c=cvRef.current;if(!c||!pending.length)return;
    const ctx=c.getContext("2d"),W=c.width,cx=W/2,cy=W/2,r=W/2-5;
    ctx.clearRect(0,0,W,W);
    const sl=(2*Math.PI)/pending.length;
    const pal=["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#C77DFF","#FFB347","#FF8FAB","#4ECDC4"];
    pending.forEach((tk,i)=>{
      const s=spAng+i*sl,e=s+sl;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.closePath();
      ctx.fillStyle=pal[i%pal.length];ctx.fill();
      ctx.strokeStyle="white";ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(s+sl/2);ctx.textAlign="right";ctx.fillStyle="white";ctx.font="bold 8px Nunito,sans-serif";
      ctx.fillText(tk.tl.length>10?tk.tl.slice(0,9)+"...":tk.tl,r-8,3);ctx.restore();
    });
    ctx.beginPath();ctx.arc(cx,cy,18,0,2*Math.PI);ctx.fillStyle="white";ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,12,0,2*Math.PI);ctx.fillStyle=t.acc;ctx.fill();
  };
  const doSpin=()=>{
    if(spinning||!pending.length)return;
    setSpinning(true);setSpRes(null);
    const extra=(5+Math.random()*8)*2*Math.PI;const sa=spAng;let start=null;
    const anim=(ts)=>{
      if(!start)start=ts;
      const p=Math.min((ts-start)/4000,1),ease=1-Math.pow(1-p,4),cur=sa+extra*ease;
      setSpAng(cur);
      if(p<1)requestAnimationFrame(anim);
      else{
        const fa=cur%(2*Math.PI),sl2=(2*Math.PI)/pending.length;
        const pa=((-Math.PI/2)-fa+4*Math.PI)%(2*Math.PI);
        setSpRes(pending[Math.floor(pa/sl2)%pending.length]);setSpinning(false);
      }
    };
    requestAnimationFrame(anim);
  };

  const saveEvLog=()=>{
    const iso=todayISO();
    setLogs(prev=>[{dt:iso,dtDisplay:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"}),mood:evMood,energy,notes,syms,cph:cPhase?cPhase.id:null,cDay,tasksCompleted:tasks.filter(t2=>t2.dn).length,spent:todaySpent},...prev]);
    if(notes.trim()){
      const kw=["gym","walk","run","swim","yoga","exercise","lunch","breakfast","dinner","water","sleep","meditat","outside","read","bath","shower"];
      const found=kw.filter(k=>notes.toLowerCase().includes(k));
      if(found.length>0)setHabitLog(prev=>[{dt:iso,habits:found,mood:evMood?evMood.e:null,energy:energy?energy.e:null},...prev.filter(h=>h.dt!==iso)]);
    }
    setEvDone({date:todayISO(),done:true});setMStreak(s=>s<14?s+1:s);setEStreak(s=>s<14?s+1:s);setMdStreak(s=>s<7?s+1:s);
    setCheckinDays(d=>d+1);
  };

  const handleVoiceResult=(r)=>{
    if(r.tasks&&r.tasks.length>0)setTasks(ts=>[...ts,...r.tasks.map((t2,i)=>({...t2,id:"ai"+Date.now()+i,dn:false,ov:false,lastDone:null,recur:t2.recur||"none"}))]);
    if(r.spends&&r.spends.length>0)setSpends(ss=>[...r.spends.map((s,i)=>({...s,id:"vs"+Date.now()+i,dt:new Date().toISOString()})),...ss]);
    if(r.events&&r.events.length>0)setCalEvents(evs=>[...evs,...r.events.map((ev,i)=>({...ev,id:"vev"+Date.now()+i,allDay:ev.allDay||false,recur:"none",days:[],exceptions:[],endDate:null}))]);
    if(r.symptoms&&r.symptoms.length>0){const iso=todayISO();setLogs(prev=>prev.map(l=>l.dt===iso?{...l,syms:[...new Set([...(l.syms||[]),...r.symptoms])]}:l));}
    if(r.habits&&r.habits.length>0){const iso=todayISO();setHabitLog(prev=>[{dt:iso,habits:r.habits},...prev.filter(h=>h.dt!==iso)]);}
  };

  // Tooltip helper
  const Tip=({id,text})=>{
    if(tooltipsSeen.includes(id))return null;
    return(<div className="tooltip"><span style={{fontSize:13,flexShrink:0}}>💡</span><span style={{flex:1,lineHeight:1.4}}>{text}</span><button onClick={()=>setTooltipsSeen(p=>[...p,id])} style={{background:"none",border:"none",color:"#BBB",cursor:"pointer",fontSize:13,padding:0}}>×</button></div>);
  };

  // Task card
  const TC=({t2})=>{
    const av=AVS[t2.av||0];
    const du=t2.deadline?Math.ceil((new Date(t2.deadline+"T12:00:00")-new Date())/86400000):null;
    const rdone=t2.recur&&t2.recur!=="none"&&recurDoneThisWeek(t2);
    return(
      <div className="tc" style={{borderLeftColor:lc(t2.lo),opacity:rdone?.55:1}}>
        <div className={"ck"+(t2.dn||rdone?" on":"")} onClick={()=>!rdone&&togT(t2.id)}>{(t2.dn||rdone)&&<span style={{color:"white",fontSize:8}}>✓</span>}</div>
        <div style={{flex:1}}>
          <div className={"tt"+(t2.dn||rdone?" dn":"")}>{t2.tl}</div>
          <div className="tm">
            <span className="tg tglc" style={{background:lc(t2.lo)}}>{le(t2.lo)}{t2.lo}</span>
            <span className="tg tgt">⏱ {t2.mn}m</span>
            {t2.recur&&t2.recur!=="none"&&<span className="tg" style={{background:"#E8F0FF",color:"#4D96FF"}}>🔁 {t2.recur}</span>}
            {t2.ov&&!t2.dn&&<span className="tg" style={{background:"#FFE5E5",color:"#FF6B6B"}}>⚠️ Overdue</span>}
            {du!==null&&du<=3&&!t2.dn&&!rdone&&<span className="tg" style={{background:"#FFE5E5",color:"#FF6B6B"}}>{du===0?"Due today":du<0?"Overdue":"Due in "+du+"d"}</span>}
            {wantADHD&&(t2.av||0)>=3&&!rdone&&<span className="tg" style={{background:av.c+"22",color:av.c}}>{av.e}</span>}
            {rdone&&<span className="tg" style={{background:"#E8F8EC",color:"#6BCB77"}}>✓ Done this {t2.recur==="daily"?"day":t2.recur==="monthly"?"month":"week"}</span>}
          </div>
          {!t2.dn&&!rdone&&wantADHD&&<div className="av">{AVS.map(a=><button key={a.s} className="avb" style={(t2.av||0)===a.s?{background:a.c,borderColor:a.c,color:"white"}:{}} onClick={()=>setAv(t2.id,a.s)}>{a.e}<span style={{fontSize:8}}>{a.l}</span></button>)}</div>}
        </div>
      </div>
    );
  };

  // Day panel
  const DayPanel=({iso,compact})=>{
    const allDay=getAllDayEvents(iso);
    const timed=getEventsForDay(iso).filter(ev=>!ev.allDay).sort((a,b)=>(a.startTime||"").localeCompare(b.startTime||""));
    const dayTasks=getTasksForDay(iso);
    const dayLog=getLogForDay(iso);
    const dayHabits=getHabitsForDay(iso);
    const ph=getCPhaseForDay(iso);
    const isPast=iso<todayISO();
    const isFuture=iso>todayISO();
    const isToday=iso===todayISO();
    const slice=compact?3:99;
    return(
      <div style={{animation:"sli .25s ease"}}>
        {wantCycle&&ph&&<div style={{background:ph.c+"18",borderRadius:8,padding:"5px 8px",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:14}}>{ph.e}</span>
          <div><div style={{fontSize:10,fontWeight:800,color:ph.c}}>{ph.l} Phase</div><div style={{fontSize:9,fontWeight:600,color:"#666"}}>{ph.energy} energy · {ph.tips[0]}</div></div>
          {isToday&&dtp&&dtp<=7&&dtp>0&&<div style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:ph.c}}>{"🌑 "+dtp+"d"}</div>}
        </div>}
        {allDay.map(ev=>(
          <div key={ev.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 7px",borderRadius:7,background:(ev.finType?"#FFF4CC":lc(ev.loc)+"22"),borderLeft:"3px solid "+(ev.finType?"#FFD93D":lc(ev.loc)),marginBottom:3,cursor:ev.finType?"default":"pointer"}} onClick={()=>!ev.finType&&setDetailItem({item:ev,type:ev.cost?"financial":"event",iso})}>
            <span style={{fontSize:10,fontWeight:700,color:ev.finType?"#F08C00":lc(ev.loc),flex:1}}>{ev.title+(ev.cost?" · €"+ev.cost.amount:"")}</span>
            {!ev.finType&&<span style={{fontSize:9,color:"#BBB",fontWeight:600}}>›</span>}
          </div>
        ))}
        {timed.slice(0,slice).map(ev=>(
          <div key={ev.id} className="day-ev" style={{background:lc(ev.loc)+"12",borderLeftColor:lc(ev.loc),cursor:"pointer"}} onClick={()=>setDetailItem({item:ev,type:ev.cost?"financial":"event",iso})}>
            <div style={{fontSize:9,fontWeight:700,color:"#AAA",width:36,flexShrink:0,lineHeight:1.3}}>{ev.startTime}{ev.endTime?<><br/>{ev.endTime}</>:null}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Fredoka One",fontSize:11,color:lc(ev.loc)}}>{ev.title}</div>
              <div style={{fontSize:9,color:"#AAA",fontWeight:600}}>{le(ev.loc)}{ev.loc}{ev.recur&&ev.recur!=="none"?" · 🔁 "+ev.recur:""}{ev.cost?" · 💰 €"+ev.cost.amount:""}</div>
            </div>
          </div>
        ))}
        {compact&&timed.length>3&&<div style={{fontSize:9,color:"#AAA",fontWeight:600}}>{"+"+(timed.length-3)+" more"}</div>}
        {dayTasks.length>0&&<><div className="sl">Tasks due</div>{dayTasks.map(t2=><div key={t2.id} style={{cursor:"pointer"}} onClick={()=>setDetailItem({item:t2,type:"task",iso})}><TC t2={t2}/></div>)}</>}
        {isPast&&dayLog&&<><div className="sl">Log</div>
          <div style={{padding:"6px 8px",background:"#F9F9F9",borderRadius:8}}>
            {dayLog.mood&&<div style={{fontSize:10,fontWeight:600,marginBottom:2}}>{dayLog.mood.e} {dayLog.mood.l}{dayLog.energy?" · "+dayLog.energy.e+" "+dayLog.energy.l:""}</div>}
            {dayLog.syms&&dayLog.syms.length>0&&<div style={{fontSize:9,color:"#AAA",fontWeight:600,marginBottom:2}}>🩺 {dayLog.syms.join(", ")}</div>}
            {dayHabits&&dayHabits.habits&&dayHabits.habits.length>0&&<div style={{fontSize:9,fontWeight:600,color:"#6BCB77"}}>🌿 {dayHabits.habits.join(", ")}</div>}
          </div>
        </>}
        {allDay.length===0&&timed.length===0&&dayTasks.length===0&&!dayLog&&(
          <div style={{fontSize:10,color:"#CCC",fontWeight:600,padding:"4px 0",textAlign:"center"}}>{isFuture?"Nothing planned — tap + Add":isToday?"Nothing scheduled — tap + Add":"Nothing logged"}</div>
        )}
      </div>
    );
  };

  // ══ ONBOARDING ══
  if(!pwaIntroDone){
    return<PWAIntro onDone={()=>setPwaIntroDone(true)}/>;
  }

  if(!onboarded){
    return<Onboarding theme={theme} onComplete={(data)=>{
      setProfName(data.name);setRole(data.role);setLocs(data.locs);
      setMorningList(data.mList.length>0?data.mList:DEFAULT_MORNING);
      setEveningList(data.eList.length>0?data.eList:DEFAULT_EVENING);
      setWantCycle(data.wantCycle);setWantSpend(data.wantSpend);setWantADHD(data.wantADHD);
      setTheme(data.theme);setNLoc(data.locs[0]||"Home");
      setTaskFrom(data.taskFrom||"09:00");setTaskTo(data.taskTo||"18:00");
      setHasCommute(data.hasCommute||false);
      setCommuteMins(data.commuteMins||30);setCommuteEveMins(data.commuteEveMins||30);
      if(data.cycleDate)setLps(data.cycleDate);
      if(data.cycleLen)setCLen(data.cycleLen);
      setOnboarded(true);setShowTour(true);
    }}/>;
  }

  // ══ HOME ══
  const rHome=()=>{
    const isVeteran=checkinDays>=7;
    if(!csDone){
      if(isVeteran){
        return(
          <div className="card" style={{border:"2px solid "+(greeting.isEve?"#9B5DE5":t.acc)}}>
            <div className="ct">{greeting.emoji+" "+(greeting.isEve?"Evening":"Morning")+" check-in"}</div>
            <div className="sl">How are you feeling?</div>
            <div className="erow">{MOODS.map(m=><button key={m.e} className={"eb"+(mood&&mood.e===m.e?" on":"")} onClick={()=>setMood(m)}>{m.e}<span>{m.l}</span></button>)}</div>
            <div className="sl">Energy?</div>
            <div className="erow">{ENERGIES.map(e=><button key={e.e} className={"eb"+(energy&&energy.e===e.e?" on":"")} onClick={()=>setEnergy(e)}>{e.e}<span>{e.l}</span></button>)}</div>
            <div className="sl">Anything to note? <span style={{fontSize:9,color:"#CCC"}}>(optional)</span></div>
            <div className="sg" style={{marginBottom:9}}>{SYMPTOMS.slice(0,6).map(s=><button key={s} className={"sc"+(syms.includes(s)?" on":"")} onClick={()=>setSyms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}>{s}</button>)}</div>
            <button className="nb" disabled={!mood||!energy} onClick={()=>setCsDone(true)}>Start my {greeting.isEve?"evening":"day"} →</button>
          </div>
        );
      }
      const steps=[
        <div key="m">
          <div className="q">{greeting.emoji+" "+greeting.text+(profName?", "+profName:"")+"! How are you feeling?"}</div>
          {wantCycle&&cPhase&&<div style={{background:cPhase.c+"18",border:"1.5px solid "+cPhase.c,borderRadius:7,padding:"4px 8px",fontSize:9,fontWeight:700,marginBottom:7,color:cPhase.c}}>{cPhase.e+" Cycle day "+cDay+" — "+cPhase.l}</div>}
          <div className="erow">{MOODS.map(m=><button key={m.e} className={"eb"+(mood&&mood.e===m.e?" on":"")} onClick={()=>setMood(m)}>{m.e}<span>{m.l}</span></button>)}</div>
          <button className="nb" disabled={!mood} onClick={()=>setCsStep(1)}>Next</button>
        </div>,
        <div key="e">
          <div className="q">Energy level? ⚡</div>
          <div className="erow">{ENERGIES.map(e=><button key={e.e} className={"eb"+(energy&&energy.e===e.e?" on":"")} onClick={()=>setEnergy(e)}>{e.e}<span>{e.l}</span></button>)}</div>
          <button className="nb" disabled={!energy} onClick={()=>setCsStep(2)}>Next</button>
        </div>,
        <div key="b">
          <div className="q">How busy is today? 📅</div>
          <div style={{display:"flex",gap:5,marginBottom:9}}>
            {[["quiet","🌿 Quiet","#6BCB77"],["average","😊 Average","#FFD93D"],["busy","🔥 Busy","#FF6B6B"]].map(([v,l,c])=>(
              <button key={v} className="btn" style={{flex:1,fontFamily:"Nunito",fontSize:11,border:"2px solid "+(syms.includes("busy_"+v)?c:"#EEE"),background:syms.includes("busy_"+v)?c:t.card,color:syms.includes("busy_"+v)?"white":t.dark}} onClick={()=>setSyms(p=>[...p.filter(s=>!s.startsWith("busy_")),syms.includes("busy_"+v)?"":"busy_"+v].filter(Boolean))}>{l}</button>
            ))}
          </div>
          <button className="nb" onClick={()=>setCsStep(3)}>Next</button>
        </div>,
        <div key="sy">
          <div className="q">Anything to log? 🩺 <span style={{fontSize:11,color:"#AAA",fontWeight:600}}>(optional)</span></div>
          <div className="sg">{SYMPTOMS.map(s=><button key={s} className={"sc"+(syms.includes(s)?" on":"")} onClick={()=>setSyms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}>{s}</button>)}</div>
          <button className="nb" onClick={()=>setCsStep(4)}>Next</button>
          <button className="ob-sk" onClick={()=>setCsStep(4)}>Skip</button>
        </div>,
        <div key="mr">
          <div className="q">Morning routine ✨</div>
          <div className="pw"><div className="pb" style={{width:(mPct*100)+"%"}}/></div>
          <p style={{fontSize:9,color:"#AAA",fontWeight:700,marginBottom:7}}>{morningList.filter(i=>i.d).length+"/"+morningList.length+" done"}</p>
          {morningList.map(i=>(
            <div key={i.id} className="ci">
              <div className={"cc"+(i.d?" on":"")} onClick={()=>setMorningList(l=>l.map(x=>x.id===i.id?{...x,d:!x.d}:x))}>{i.d&&<span style={{color:"white",fontSize:10}}>✓</span>}</div>
              <span className={"cl"+(i.d?" dn":"")}>{i.l}</span>
              <span className="mb2">{i.t}m</span>
            </div>
          ))}
          <button className="nb" style={{marginTop:10}} onClick={()=>setCsDone(true)}>{mPct===1?"🎉 Let's go!":"Start my day"}</button>
        </div>,
      ];
      return(
        <div className="card" style={{border:"2px solid "+(greeting.isEve?"#9B5DE5":t.acc)}}>
          <div className="ct">{(greeting.isEve?"🌙":"☀️")+" Check-in "}<span style={{marginLeft:"auto",fontSize:9,color:"#AAA"}}>{"Step "+(csStep+1)+"/5"}</span></div>
          <div className="pw" style={{marginBottom:10}}><div className="pb" style={{width:((csStep/4)*100)+"%"}}/></div>
          {steps[csStep]}
        </div>
      );
    }

    return(
      <>
        {/* Mood/energy pills */}
        <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
          {mood&&<div style={{background:t.card,borderRadius:10,padding:"7px 10px",boxShadow:"0 2px 8px rgba(0,0,0,.06)",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:18}}>{mood.e}</span><div><div style={{fontSize:8,fontWeight:800,color:"#BBB",textTransform:"uppercase",letterSpacing:.5}}>Mood</div><div style={{fontSize:10,fontWeight:700,color:t.dark}}>{mood.l}</div></div></div>}
          {energy&&<div style={{background:t.card,borderRadius:10,padding:"7px 10px",boxShadow:"0 2px 8px rgba(0,0,0,.06)",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:18}}>{energy.e}</span><div><div style={{fontSize:8,fontWeight:800,color:"#BBB",textTransform:"uppercase",letterSpacing:.5}}>Energy</div><div style={{fontSize:10,fontWeight:700,color:t.dark}}>{energy.l}</div></div></div>}
          {wantCycle&&cPhase&&<div style={{background:cPhase.c+"18",borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={()=>setTab("📆")}><span style={{fontSize:14}}>{cPhase.e}</span><div><div style={{fontSize:8,fontWeight:800,color:cPhase.c,textTransform:"uppercase",letterSpacing:.5}}>{"Day "+cDay}</div><div style={{fontSize:10,fontWeight:700,color:cPhase.c}}>{cPhase.l}</div></div></div>}
        </div>

        {/* Tip */}
        {tip&&<div className="tip-card"><div className="tip-t">{tip.tip}</div><div className="tip-x">{tip.text}</div><div className="tip-s">{"— "+tip.source}</div></div>}

        {/* Reward nudge */}
        {nearestReward&&<div className="rn" onClick={()=>setTab("⚙️")}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}><div style={{fontFamily:"Fredoka One",fontSize:13,color:"#FF6B6B"}}>🏆 Almost there!</div><span style={{fontSize:9,color:"#FF6B6B",fontWeight:700}}>See all →</span></div>
          <div style={{fontSize:10,fontWeight:600,color:"#444",marginBottom:5}}>{nearestReward.gap===1?"1 more to earn: "+nearestReward.rw+" 🎉":nearestReward.gap+" more: "+nearestReward.rw}</div>
          <div className="sbar">{Array.from({length:Math.min(nearestReward.max,10)}).map((_,i)=><div key={i} className={"sd"+(i<nearestReward.cur?" on":"")}/>)}</div>
        </div>}

        {/* ADHD dreaded task nudge */}
        {dNudge&&<div style={{background:"linear-gradient(135deg,#FFF0F0,#FFF4CC)",border:"2px solid "+t.acc,borderRadius:13,padding:11,marginBottom:9}}>
          <div style={{fontFamily:"Fredoka One",fontSize:13,color:t.acc,marginBottom:2}}>😤 High energy — tackle something you've been avoiding!</div>
          <div style={{background:t.card,borderRadius:8,padding:"7px 9px",borderLeft:"3px solid "+t.acc,marginBottom:7}}>
            <div style={{fontWeight:700,fontSize:11}}>{dNudge.tl}</div>
            <div className="tm" style={{marginTop:2}}><span className="tg tglc" style={{background:lc(dNudge.lo)}}>{le(dNudge.lo)+dNudge.lo}</span><span className="tg tgt">{"⏱ "+dNudge.mn+"m"}</span></div>
          </div>
          <div className="brow"><button className="btn bp bsm" onClick={()=>{togT(dNudge.id);setNdDis(true);}}>Done! 🎉</button><button className="btn bs bsm" onClick={()=>setNdDis(true)}>Not today</button></div>
        </div>}

        {/* TODAY CALENDAR */}
        <div className="card" style={{border:"2px solid "+t.acc+"44"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div className="ct" style={{marginBottom:0}}>📆 Today</div>
            <div style={{display:"flex",gap:5}}>
              <button className="btn bp bsm" onClick={()=>{setSelDay(todayISO());setShowAddEv(true);}}>+ Add</button>
              <button className="btn bs bsm" onClick={()=>setTab("📆")}>More →</button>
            </div>
          </div>
          <DayPanel iso={todayISO()} compact={true}/>
        </div>

        {/* Spinner */}
        {pending.length>0&&<div className="card">
          <div className="ct">🎡 Can't decide? Spin!</div>
          <div className="ww">
            <div className="wc"><div className="wp"/><canvas ref={cvRef} width="200" height="200" style={{borderRadius:"50%",boxShadow:"0 5px 20px rgba(0,0,0,.12)"}}/></div>
            <button className="sb" onClick={doSpin} disabled={spinning}>{spinning?"Spinning...":"SPIN! 🎡"}</button>
          </div>
          {spRes&&<div className="sr">
            <div style={{fontSize:22,marginBottom:4}}>🎯</div>
            <div style={{fontFamily:"Fredoka One",fontSize:15,color:t.acc,marginBottom:2}}>Your task!</div>
            <div style={{fontWeight:700,fontSize:12}}>{spRes.tl}</div>
            <div className="tm" style={{justifyContent:"center",marginTop:4}}><span className="tg tglc" style={{background:lc(spRes.lo)}}>{le(spRes.lo)+spRes.lo}</span><span className="tg tgt">{"⏱ "+spRes.mn+"m"}</span></div>
            <button className="btn bm" style={{marginTop:7}} onClick={()=>togT(spRes.id)}>Done ✓</button>
          </div>}
        </div>}

        {/* Morning routine */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <div className="ct" style={{marginBottom:0}}>☀️ Morning Routine</div>
            <span style={{fontSize:9,color:t.acc,fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("⚙️");setOpenSects(p=>({...p,me:true}));}}>{morningList.filter(i=>i.d).length+"/"+morningList.length+" · Edit →"}</span>
          </div>
          <div className="pw"><div className="pb" style={{width:(mPct*100)+"%"}}/></div>
          {morningList.map(i=>(
            <div key={i.id} className="ci">
              <div className={"cc"+(i.d?" on":"")} onClick={()=>setMorningList(l=>l.map(x=>x.id===i.id?{...x,d:!x.d}:x))}>{i.d&&<span style={{color:"white",fontSize:10}}>✓</span>}</div>
              <span className={"cl"+(i.d?" dn":"")}>{i.l}</span>
              <span className="mb2">{i.t}m</span>
            </div>
          ))}
        </div>

        {/* Spending snapshot */}
        {wantSpend&&finSetup&&<div className="card" style={{cursor:"pointer"}} onClick={()=>{setTab("⚙️");setOpenSects(p=>({...p,finance:true}));}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div className="ct" style={{marginBottom:0}}>💰 Today</div>
            <span style={{fontSize:9,color:t.acc,fontWeight:700}}>Budget →</span>
          </div>
          {todaySpends.length>0?<>
            <div style={{fontFamily:"Fredoka One",fontSize:24,color:t.acc}}>{"€"+todaySpent.toFixed(2)}</div>
            <div style={{fontSize:9,color:"#AAA",fontWeight:600}}>{"€"+dailyBudget.toFixed(0)+" daily budget"}</div>
            <div className="pw" style={{marginTop:4}}><div className="pb" style={{width:(Math.min(todaySpent/Math.max(dailyBudget,1),1)*100)+"%"}}/></div>
          </>:<div style={{fontSize:10,color:"#AAA",fontWeight:600,padding:"3px 0"}}>Nothing logged yet today</div>}
        </div>}

        {/* Finance nudge */}
        {wantSpend&&!finSetup&&!finNudgeDismissed&&checkinDays>=3&&<div style={{background:"linear-gradient(135deg,#FFF4CC,#FFE5E5)",borderRadius:12,padding:11,marginBottom:9,border:"1.5px solid #FFD93D"}}>
          <div style={{fontFamily:"Fredoka One",fontSize:13,color:"#FF6B6B",marginBottom:3}}>💰 Set up your budget</div>
          <p style={{fontSize:11,fontWeight:600,color:"#444",marginBottom:7}}>Add your income and bills — takes 2 minutes and shows exactly what you have left to spend.</p>
          <div className="brow">
            <button className="btn bp bsm" onClick={()=>{setTab("⚙️");setOpenSects(p=>({...p,finance:true}));}}>Set up now</button>
            <button className="btn bs bsm" onClick={()=>setFinNudgeDismissed(true)}>Maybe later</button>
          </div>
        </div>}

        {/* Tour card */}
        {tourSkipped&&!tourCardDismissed&&<div style={{background:"linear-gradient(135deg,"+t.h1+"18,"+t.h2+"18)",borderRadius:12,padding:11,marginBottom:9,border:"1.5px solid "+t.acc+"44"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <div style={{fontFamily:"Fredoka One",fontSize:13,color:t.acc}}>👋 Quick tour available</div>
            <button className="db" onClick={()=>setTourCardDismissed(true)}>×</button>
          </div>
          <p style={{fontSize:11,fontWeight:600,color:"#444",marginBottom:7}}>Take a 2-minute tour to see everything BrainBloom can do.</p>
          <button className="btn bp bsm" onClick={()=>setShowTour(true)}>Start tour</button>
        </div>}

        {/* Evening check-in */}
        {greeting.isEve&&!isEvDone&&<div className="card" style={{border:"2px solid #9B5DE5"}}>
          <div className="ct">🌙 Evening Check-in</div>
          <div className="sl">How are you feeling?</div>
          <div className="erow">{MOODS.map(m=><button key={m.e} className={"eb"+(evMood&&evMood.e===m.e?" on":"")} onClick={()=>setEvMood(m)}>{m.e}<span>{m.l}</span></button>)}</div>
          <div className="sl">Evening routine</div>
          {eveningList.map(i=>(
            <div key={i.id} className="ci">
              <div className={"cc"+(i.d?" on":"")} onClick={()=>setEveningList(l=>l.map(x=>x.id===i.id?{...x,d:!x.d}:x))}>{i.d&&<span style={{color:"white",fontSize:10}}>✓</span>}</div>
              <span className={"cl"+(i.d?" dn":"")}>{i.l}</span>
              <span className="mb2">{i.t}m</span>
            </div>
          ))}
          <div className="sl">Day notes</div>
          <textarea className="na" placeholder="e.g. Went to the gym, had lunch, feeling tired..." value={notes} onChange={e=>setNotes(e.target.value)}/>
          <button className="nb" style={{marginTop:7,background:"linear-gradient(135deg,#9B5DE5,#4361EE)"}} onClick={saveEvLog}>Save and wind down 🌙</button>
        </div>}
        {isEvDone&&<div className="card" style={{textAlign:"center",background:"linear-gradient(135deg,#F9F5FF,#FFF0F0)"}}><div style={{fontSize:34}}>🌙</div><div style={{fontFamily:"Fredoka One",fontSize:15,marginTop:4}}>Evening done!</div><p style={{fontSize:10,color:"#AAA",marginTop:1}}>Rest well 💙</p></div>}

        {/* Evening routine always shown */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <div className="ct" style={{marginBottom:0}}>🌙 Evening Routine</div>
            <span style={{fontSize:9,color:t.acc,fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("⚙️");setOpenSects(p=>({...p,me:true}));}}>{eveningList.filter(i=>i.d).length+"/"+eveningList.length+" · Edit →"}</span>
          </div>
          <div className="pw"><div className="pb" style={{width:(eveningList.filter(i=>i.d).length/Math.max(eveningList.length,1)*100)+"%"}}/></div>
          {eveningList.map(i=>(
            <div key={i.id} className="ci">
              <div className={"cc"+(i.d?" on":"")} onClick={()=>setEveningList(l=>l.map(x=>x.id===i.id?{...x,d:!x.d}:x))}>{i.d&&<span style={{color:"white",fontSize:10}}>✓</span>}</div>
              <span className={"cl"+(i.d?" dn":"")}>{i.l}</span>
              <span className="mb2">{i.t}m</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ══ CALENDAR ══
  const rCalendar=()=>{
    const year=calMonth.getFullYear(),month=calMonth.getMonth();
    const firstDayRaw=new Date(year,month,1).getDay();
    const firstDay=calStartMon?(firstDayRaw===0?6:firstDayRaw-1):firstDayRaw;
    const daysInMonth=new Date(year,month+1,0).getDate();
    const hdrs=calStartMon?WDAYS_MON:WDAYS;
    return(
      <>
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <button className="btn bs bsm" onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>←</button>
            <div style={{fontFamily:"Fredoka One",fontSize:15,color:t.dark}}>{calMonth.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</div>
            <button className="btn bs bsm" onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>→</button>
          </div>
          <div className="cal-grid" style={{marginBottom:3}}>{hdrs.map(d=><div key={d} className="cal-hd">{d}</div>)}</div>
          <div className="cal-grid">
            {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day=i+1;
              const iso=year+"-"+String(month+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
              const log=getLogForDay(iso);
              const evs=getEventsForDay(iso);
              const finEvs=getFinEventsForDay(iso);
              const tks=getTasksForDay(iso);
              const ph=getCPhaseForDay(iso);
              const isT=iso===todayISO(),isSel=iso===selDay;
              const bg=log?getMoodColor(log.mood?log.mood.e:null):(ph&&wantCycle?ph.c+"22":"#F0F0F0");
              const tc=log?"white":(ph&&wantCycle?ph.c:"#777");
              const dots=[];
              if(evs.length>0)dots.push(t.acc);
              if(tks.length>0)dots.push("#6BCB77");
              if(evs.some(e=>e.cost)||finEvs.length>0)dots.push("#FFD93D");
              return(
                <div key={day} className={"cal-d"+(isT?" tod":"")+(isSel?" sel":"")} style={{background:bg,color:tc,fontSize:10}} onClick={()=>setSelDay(iso)}>
                  {day}
                  {dots.length>0&&<div className="cal-dots">{dots.slice(0,3).map((c,j)=><div key={j} className="cal-dot" style={{background:c}}/>)}</div>}
                </div>
              );
            })}
          </div>
          {wantCycle&&lps&&<div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:7}}>
            {PHASES.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,fontWeight:700,color:"#AAA"}}><div style={{width:7,height:7,borderRadius:2,background:p.c+"55"}}/>{p.l}</div>)}
          </div>}
        </div>

        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
            <div style={{fontFamily:"Fredoka One",fontSize:14,color:t.dark}}>{selDay===todayISO()?"Today":new Date(selDay+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
            <button className="btn bp bsm" onClick={()=>setShowAddEv(true)}>+ Add</button>
          </div>
          <DayPanel iso={selDay} compact={false}/>
        </div>

        {wantCycle&&lps&&cPhase&&(()=>{
          const ph=cPhase,allD=Array.from({length:cLen},(_,i)=>i+1);
          return(
            <div className="card">
              <div style={{background:"linear-gradient(135deg,"+ph.c+","+ph.c+"99)",borderRadius:10,padding:12,textAlign:"center",marginBottom:10,color:"white"}}>
                <div style={{fontSize:24}}>{ph.e}</div>
                <div style={{fontFamily:"Fredoka One",fontSize:20}}>{"Day "+cDay}</div>
                <div style={{fontSize:12,fontWeight:700,opacity:.9}}>{ph.l+" Phase · "+ph.energy}</div>
                {dtp&&dtp<=7&&dtp>0&&<div style={{fontSize:10,fontWeight:700,marginTop:2}}>{"🌑 Period in ~"+dtp+" days"}</div>}
              </div>
              <div className="cycle-strip">{allD.map(d=>{const p2=getCPhase(d);const it=d===cDay;return<div key={d} className="cdd" style={{background:it?"white":p2.c+"99",border:it?"2.5px solid "+p2.c:"none",color:it?p2.c:"white",fontWeight:it?900:700,transform:it?"scale(1.25)":"none"}}>{d}</div>;})}</div>
              <p style={{fontSize:10,fontWeight:600,color:"#444",lineHeight:1.4,marginBottom:7}}>{wantADHD?ph.adhd:ph.general}</p>
              {ph.tips.map((tip2,i)=><div key={i} style={{display:"flex",gap:4,marginBottom:2,fontSize:10,fontWeight:600,color:"#444"}}><span>💜</span><span>{tip2}</span></div>)}
            </div>
          );
        })()}

        {showAddEv&&<AddEventModal onClose={()=>setShowAddEv(false)} onSave={ev=>setCalEvents(p=>[...p,ev])} locs={locs} initialDate={selDay} lc={lc} le={le} theme={theme}/>}
        {deleteModal&&<DeleteRecurModal ev={deleteModal.ev} date={deleteModal.date} onClose={()=>setDeleteModal(null)} onDelete={confirmDelete} theme={theme}/>}
      </>
    );
  };

  // ══ TO-DO ══
  const rTodo=()=>{
    const done=tasks.filter(t2=>t2.dn);
    const ov=tasks.filter(t2=>t2.ov&&!t2.dn);
    return(
      <>
        {tasks.length===0&&<div className="card" style={{textAlign:"center",padding:"20px 13px"}}>
          <div style={{fontSize:38,marginBottom:6}}>✅</div>
          <div style={{fontFamily:"Fredoka One",fontSize:16,color:t.dark,marginBottom:4}}>Your to-do list is empty</div>
          <p style={{fontSize:11,fontWeight:600,color:"#AAA",marginBottom:0}}>Add tasks below — the app will suggest them at the right time based on your energy, location and how you feel about them.</p>
        </div>}

        <div className="card">
          <div className="ct">➕ Add To-Do</div>
          <Tip id="loc" text="📍 Tag where you will do this — the app only suggests it when you are in that location."/>
          <input className="ai" placeholder="What needs doing?" value={newT} onChange={e=>setNewT(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} style={{marginBottom:6,display:"block",width:"100%"}}/>
          <div className="fr">{locs.map(l=><button key={l} className={"fc"+(nLoc===l?" on":"")} onClick={()=>setNLoc(l)}>{le(l)+l}</button>)}</div>
          <div style={{display:"flex",gap:4,marginBottom:5}}>
            {[["high","🔴 High"],["medium","🟡 Medium"],["low","🟢 Low"]].map(([v,l])=><button key={v} className={"fc"+(nPri===v?" on":"")} onClick={()=>setNPri(v)}>{l}</button>)}
          </div>
          <div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>
            {[5,10,15,30,45,60].map(m=><button key={m} className={"tc2"+(nMin===m?" on":"")} onClick={()=>setNMin(m)}>{m+"m"}</button>)}
          </div>
          {wantADHD&&<>
            <Tip id="av" text="😤 Be honest — if you dread a task the app picks the right energy moment to suggest it."/>
            <div className="sl">How do you feel about this task?</div>
            <div className="av" style={{marginBottom:7}}>{AVS.map(a=><button key={a.s} className="avb" style={nAv===a.s?{background:a.c,borderColor:a.c,color:"white"}:{}} onClick={()=>setNAv(a.s)}>{a.e}<span style={{fontSize:8}}>{a.l}</span></button>)}</div>
          </>}
          <div className="sl">Does this repeat?</div>
          <div className="fr" style={{marginBottom:7}}>
            {[["none","One-off"],["daily","Daily"],["weekly","Weekly"],["fortnightly","Fortnightly"],["monthly","Monthly"]].map(([v,l])=>(
              <button key={v} className={"fc"+(nRecur===v?" on":"")} onClick={()=>setNRecur(v)}>{l}</button>
            ))}
          </div>
          {nRecur!=="none"&&<div style={{background:"#F0F7FF",borderRadius:8,padding:"7px 9px",marginBottom:7,fontSize:10,fontWeight:600,color:"#4D96FF"}}>
            🔁 Suggested once per {nRecur==="fortnightly"?"fortnight":nRecur} when your location and energy are right. Resets automatically each cycle.
          </div>}
          {nRecur==="none"&&<div className="tog-row" style={{marginBottom:7}}>
            <div><div className="tog-lbl">📅 Link to a deadline</div><div className="tog-sub">Appears in Calendar on that date</div></div>
            <button className={"tog"+(nHasDead?" on":"")} onClick={()=>setNHasDead(s=>!s)}/>
          </div>}
          {nHasDead&&nRecur==="none"&&<div className="pf"><label>Deadline</label><input className="pi" type="date" value={nDeadline} onChange={e=>setNDeadline(e.target.value)} min={todayISO()}/></div>}
          <button className="btn bp" onClick={addTask}>Add Task</button>
        </div>

        <div className="fr">{["All",...locs].map(l=><button key={l} className={"fc"+(fLoc===l?" on":"")} onClick={()=>setFLoc(l)}>{l==="All"?"🗂️ All":le(l)+l}</button>)}</div>

        {ov.filter(t2=>fLoc==="All"||t2.lo===fLoc).length>0&&<>
          <div className="sl">⚠️ Overdue</div>
          {ov.filter(t2=>fLoc==="All"||t2.lo===fLoc).map(t2=><TC key={t2.id} t2={t2}/>)}
        </>}

        <div className="sl">📋 Active</div>
        {getSorted(fLoc).filter(t2=>!t2.ov).length===0&&!ov.length
          ?<div className="empty"><div className="empty-i">🎉</div><p>Nothing here — add a task above or try the voice button!</p></div>
          :getSorted(fLoc).filter(t2=>!t2.ov).map(t2=><TC key={t2.id} t2={t2}/>)}

        {done.length>0&&<>
          <div className="sl">{"✅ Done ("+done.length+")"}</div>
          {done.map(t2=><div key={t2.id} className="tc" style={{borderLeftColor:"#6BCB77",opacity:.55}}>
            <div className="ck on" onClick={()=>togT(t2.id)}><span style={{color:"white",fontSize:8}}>✓</span></div>
            <div style={{flex:1}}><div className="tt dn">{t2.tl}</div></div>
          </div>)}
        </>}
      </>
    );
  };

  // ══ SETTINGS ══
  // ══ RENDER ══
  const TAB_LABELS={"🏠":"Home","📆":"Calendar","✅":"To-Do","⚙️":"Settings"};

  const renderTab=()=>{
    if(tab==="🏠")return rHome();
    if(tab==="📆")return rCalendar();
    if(tab==="✅")return rTodo();
    if(tab==="⚙️")return<SettingsPage
      theme={theme} setTheme={setTheme}
      profName={profName} setProfName={setProfName}
      role={role} setRole={setRole}
      locs={locs} setLocs={setLocs}
      wantCycle={wantCycle} setWantCycle={setWantCycle}
      wantSpend={wantSpend} setWantSpend={setWantSpend}
      wantADHD={wantADHD} setWantADHD={setWantADHD}
      morningList={morningList} setMorningList={setMorningList}
      eveningList={eveningList} setEveningList={setEveningList}
      incomes={incomes} setIncomes={setIncomes}
      fixedCosts={fixedCosts} setFixedCosts={setFixedCosts}
      oneOffIncome={oneOffIncome} setOneOffIncome={setOneOffIncome}
      spends={spends} setSpends={setSpends}
      finSetup={finSetup} setFinSetup={setFinSetup}
      lps={lps} setLps={setLps}
      cLen={cLen} setCLen={setCLen}
      cDay={cDay} cPhase={cPhase}
      rewards={rewards} setRewards={setRewards}
      mStreak={mStreak} eStreak={eStreak} mdStreak={mdStreak}
      tasks={tasks}
      hasCommute={hasCommute} setHasCommute={setHasCommute}
      commuteMins={commuteMins} setCommuteMins={setCommuteMins}
      commuteEveMins={commuteEveMins} setCommuteEveMins={setCommuteEveMins}
      taskFrom={taskFrom} setTaskFrom={setTaskFrom}
      taskTo={taskTo} setTaskTo={setTaskTo}
      spotifyUrl={spotifyUrl} setSpotifyUrl={setSpotifyUrl}
      calStartMon={calStartMon} setCalStartMon={setCalStartMon}
      tourDone={tourDone} tourSkipped={tourSkipped}
      setShowTour={setShowTour} setOnboarded={setOnboarded}
      newLoc2={newLoc2} setNewLoc2={setNewLoc2}
      getRP={getRP} lc={lc} le={le}
    />;
    return null;
  };

  return(
    <>
      <style>{makeCSS(t)}</style>
      <div className="app">
        <div className="hdr">
          <div className="hrow">
            <div><div className="ht">BrainBloom 🧠</div><div className="hs">{greeting.text+" "+greeting.emoji}</div></div>
            <div className="dbg">{todayStr}</div>
          </div>
          {csDone&&mood&&<div className="pills">
            <span className="pill">{mood.e+" "+mood.l}</span>
            {energy&&<span className="pill">{energy.e+" "+energy.l}</span>}
            {wantCycle&&cPhase&&<span className="pill">{cPhase.e+" Day "+cDay}</span>}
          </div>}
        </div>
        <div className="tabs">
          {["🏠","📆","✅","⚙️"].map(tb=>(
            <button key={tb} className={"tab"+(tab===tb?" on":"")} onClick={()=>setTab(tb)}>
              {tb}<div style={{fontSize:8,marginTop:1}}>{TAB_L
