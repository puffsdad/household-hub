import { useState, useEffect, useCallback, useRef } from "react";

// ── Fonts & Themes ────────────────────────────────────────────────────────────
const FONT_PAIRS = [
  { id:"classic",   label:"Classic",   heading:"'Playfair Display',serif",  body:"'Lora',serif",              mono:"'IBM Plex Mono',monospace", google:"Playfair+Display:wght@400;600;700|Lora:wght@400;500|IBM+Plex+Mono:wght@400;500" },
  { id:"modern",    label:"Modern",    heading:"'DM Sans',sans-serif",      body:"'DM Sans',sans-serif",       mono:"'DM Mono',monospace",       google:"DM+Sans:wght@400;500;700|DM+Mono:wght@400;500" },
  { id:"elegant",   label:"Elegant",   heading:"'Cormorant Garamond',serif",body:"'Jost',sans-serif",          mono:"'IBM Plex Mono',monospace", google:"Cormorant+Garamond:wght@400;600;700|Jost:wght@400;500|IBM+Plex+Mono:wght@400;500" },
  { id:"rounded",   label:"Rounded",   heading:"'Nunito',sans-serif",       body:"'Nunito',sans-serif",        mono:"'DM Mono',monospace",       google:"Nunito:wght@400;600;700|DM+Mono:wght@400;500" },
  { id:"minimal",   label:"Minimal",   heading:"'Inter',sans-serif",        body:"'Inter',sans-serif",         mono:"'Fira Code',monospace",      google:"Inter:wght@400;500;700|Fira+Code:wght@400;500" },
  { id:"editorial", label:"Editorial", heading:"'Libre Baskerville',serif", body:"'Source Sans 3',sans-serif", mono:"'Source Code Pro',monospace", google:"Libre+Baskerville:wght@400;700|Source+Sans+3:wght@400;500|Source+Code+Pro:wght@400;500" },
];
const THEMES = [
  { id:"dark",    label:"Dark",       bg:"#0F0C09", surface:"#1C1814", border:"#2E261E", accent:"#C8956C", text:"#E8D5B0", muted:"#6B5E4E" },
  { id:"midnight",label:"Midnight",   bg:"#07080F", surface:"#111320", border:"#1E2035", accent:"#7B9E87", text:"#D0D8F0", muted:"#525A7A" },
  { id:"cream",   label:"Warm Cream", bg:"#F5EFE6", surface:"#FEFAF4", border:"#E0D5C4", accent:"#8B5E3C", text:"#2C1F10", muted:"#9A8878" },
  { id:"slate",   label:"Slate",      bg:"#0E1117", surface:"#161B27", border:"#252D40", accent:"#6B8CAE", text:"#C8D4E8", muted:"#4A5670" },
  { id:"forest",  label:"Forest",     bg:"#0A0F0A", surface:"#111811", border:"#1E2E1E", accent:"#7DAE6B", text:"#D0E8D0", muted:"#4A6A4A" },
];
const FONT_SIZES = [
  { id:"sm", label:"Small",   scale:0.9 },
  { id:"md", label:"Medium",  scale:1.0 },
  { id:"lg", label:"Large",   scale:1.1 },
  { id:"xl", label:"X-Large", scale:1.2 },
];
const SORT_OPTIONS = [
  { id:"manual",     label:"Manual",       desc:"Your custom drag order" },
  { id:"alpha-asc",  label:"A → Z",        desc:"Alphabetical by title" },
  { id:"alpha-desc", label:"Z → A",        desc:"Reverse alphabetical" },
  { id:"date-new",   label:"Newest first", desc:"Most recently added" },
  { id:"date-old",   label:"Oldest first", desc:"Earliest added" },
];
const PROP_ICONS   = ["🏠","🏡","🏢","🏘","🏗","🏰","🌇","🏖","🌳","🔑","🏔","🛖"];
const PROP_COLOURS = ["#C8956C","#7B9E87","#8B7BAB","#C6A84B","#C06B6B","#6B8CAE","#A0826D","#6BAE8C","#AE6B9E","#7DAE6B"];
const PALETTE      = ["#C8956C","#7B9E87","#8B7BAB","#C6A84B","#C06B6B","#6B8CAE","#A0826D","#6BAE8C","#AE6B9E","#7DAE6B","#AE906B","#6B9AAE"];
const EMOJI_LIST   = ["🏠","🔐","🔧","📞","📄","🚨","🌿","🚗","💊","📦","🐾","🔑","💡","🛁","🍳","📡","🧰","📬","💰","🎓","🧹","🛠","🌡","📱"];

const DEFAULT_CATS = [
  { id:"security",  label:"Security",  icon:"🔐", color:"#C8956C" },
  { id:"utilities", label:"Utilities", icon:"🔧", color:"#7B9E87" },
  { id:"contacts",  label:"Contacts",  icon:"📞", color:"#8B7BAB" },
  { id:"documents", label:"Documents", icon:"📄", color:"#C6A84B" },
  { id:"emergency", label:"Emergency", icon:"🚨", color:"#C06B6B" },
  { id:"general",   label:"General",   icon:"🏠", color:"#6B8CAE" },
];

function makeSampleData() {
  const b = Date.now();
  return [
    { id:b+1, category:"security",  title:"Alarm Code",      content:"Entry: 4821\nPanic: hold * for 3s\nReset: 9123",                                         pinned:true,  photos:[], attachments:[], contact:null },
    { id:b+2, category:"utilities", title:"Stopcock",         content:"Under kitchen sink, behind cleaning products. Turn clockwise to shut off.",                pinned:true,  photos:[], attachments:[], contact:null },
    { id:b+3, category:"contacts",  title:"Plumber",          content:"Available weekdays 8am–6pm",                                                              pinned:false, photos:[], attachments:[], contact:{ name:"Dave Marsh", company:"Dave Marsh Plumbing", phone:"07891 234567", email:"dave@dmpplumbing.co.uk" } },
    { id:b+4, category:"emergency", title:"Nearest Hospital", content:"~12 min drive",                                                                           pinned:true,  photos:[], attachments:[], contact:{ name:"City General", company:"NHS", phone:"01234 890000", email:"" } },
    { id:b+5, category:"general",   title:"Bin Collection",   content:"General waste: Monday\nRecycling: Every other Monday\nGarden waste: Thursday (Apr–Oct)",   pinned:false, photos:[], attachments:[], contact:null },
  ];
}
function makeProperty(name, icon, color) {
  return { id:"prop_"+Date.now()+"_"+Math.random().toString(36).slice(2,7), name, icon, color, cats:DEFAULT_CATS, items:makeSampleData(), sort:"manual" };
}

// ── Storage ───────────────────────────────────────────────────────────────────
const K = { props:"hh-properties", pin:"hh-pin", appear:"hh-appear", view:"hh-view" };
const store = {
  get:   (k,fb) => { try{ const s=localStorage.getItem(k); return s!=null?JSON.parse(s):fb; }catch{ return fb; } },
  set:   (k,v)  => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
  str:   (k,fb) => { try{ return localStorage.getItem(k)||fb; }catch{ return fb; } },
  setStr:(k,v)  => { try{ localStorage.setItem(k,v); }catch{} },
};

// ── Crypto ────────────────────────────────────────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin+"hh-salt-v1"));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// ── Misc ──────────────────────────────────────────────────────────────────────
function fileToB64(file) { return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function extractDates(text="") {
  const re=[/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}\b/gi,/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi];
  const found=[]; for(const r of re){ let m; while((m=r.exec(text))!==null) found.push(m[0]); }
  return [...new Set(found)];
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS — ordered so each is defined before it's used
// ══════════════════════════════════════════════════════════════════════════════

// ── PIN Pad ───────────────────────────────────────────────────────────────────
function PinPad({ onComplete, T, F }) {
  const [digits,setDigits]=useState([]);
  const MAX=6;
  const press=useCallback(d=>{ setDigits(prev=>{ if(prev.length>=MAX) return prev; const next=[...prev,d]; if(next.length===MAX) setTimeout(()=>onComplete(next.join("")),120); return next; }); },[onComplete]);
  const del=()=>setDigits(p=>p.slice(0,-1));
  useEffect(()=>{ const h=e=>{ if(e.key>="0"&&e.key<="9") press(e.key); if(e.key==="Backspace") del(); }; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[press]);
  const keys=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2rem"}}>
      <div style={{display:"flex",gap:"0.85rem"}}>
        {Array.from({length:MAX}).map((_,i)=>(
          <div key={i} style={{width:"14px",height:"14px",borderRadius:"50%",background:i<digits.length?T.accent:"transparent",border:`2px solid ${i<digits.length?T.accent:T.border}`,transition:"all 0.15s",boxShadow:i<digits.length?`0 0 8px ${T.accent}66`:"none"}}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",width:"220px"}}>
        {keys.map((k,i)=>(
          <button key={i} onClick={()=>k==="⌫"?del():k?press(k):null} disabled={!k}
            style={{height:"62px",borderRadius:"12px",border:`1px solid ${T.border}`,background:k?T.surface:"transparent",color:k==="⌫"?T.muted:T.text,fontSize:k==="⌫"?"1.1rem":"1.4rem",fontFamily:F.heading,cursor:k?"pointer":"default",opacity:k?1:0}}
            onMouseDown={e=>{if(k)e.currentTarget.style.opacity="0.6"}} onMouseUp={e=>{if(k)e.currentTarget.style.opacity="1"}} onMouseLeave={e=>{if(k)e.currentTarget.style.opacity="1"}}
          >{k}</button>
        ))}
      </div>
      <button onClick={()=>setDigits([])} style={{background:"transparent",border:"none",color:T.muted,fontSize:"0.8rem",cursor:"pointer",fontFamily:F.mono,letterSpacing:"0.08em"}}>CLEAR</button>
    </div>
  );
}

// ── Lock Screen ───────────────────────────────────────────────────────────────
function LockScreen({ onUnlock, T, F }) {
  const [error,setError]=useState("");
  const [shake,setShake]=useState(false);
  const triggerShake=msg=>{setError(msg);setShake(true);setTimeout(()=>setShake(false),500);};
  const handlePin=async pin=>{
    const h=await hashPin(pin);
    if(h===store.str(K.pin,"")) onUnlock();
    else triggerShake("Incorrect PIN");
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,backgroundImage:`radial-gradient(ellipse at 50% 0%,${T.surface} 0%,${T.bg} 70%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",fontFamily:F.body,color:T.text}}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={{marginBottom:"2.5rem",textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:"1rem"}}>🏠</div>
        <div style={{fontSize:"0.7rem",letterSpacing:"0.2em",color:T.accent,textTransform:"uppercase",marginBottom:"0.5rem",fontFamily:F.mono}}>HOUSEHOLD HUB</div>
        <h1 style={{fontFamily:F.heading,color:T.text,fontSize:"1.6rem",fontWeight:700,marginBottom:"0.5rem"}}>Welcome Back</h1>
        <p style={{color:T.muted,fontSize:"0.85rem",maxWidth:"260px",lineHeight:1.5,margin:"0 auto"}}>Enter your PIN to unlock</p>
      </div>
      <div style={{animation:shake?"shake 0.4s ease":"none"}}><PinPad onComplete={handlePin} T={T} F={F}/></div>
      {error&&<p style={{marginTop:"1.5rem",color:"#C06B6B",fontSize:"0.85rem",textAlign:"center",fontFamily:F.mono}}>{error}</p>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ onClose, children, wide, T, F }) {
  useEffect(()=>{ const h=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[onClose]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"16px",padding:"2rem",width:"100%",maxWidth:wide?"600px":"500px",boxShadow:"0 32px 64px rgba(0,0,0,0.6)",maxHeight:"92vh",overflowY:"auto",color:T.text,fontFamily:F.body}}>
        {children}
      </div>
    </div>
  );
}

// ── Property Selector ─────────────────────────────────────────────────────────
function PropertySelector({ properties, onSelect, onAdd, T, F }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",fontFamily:F.body,color:T.text}}>
      <div style={{width:"100%",maxWidth:"480px"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div style={{fontSize:"0.7rem",letterSpacing:"0.2em",color:T.accent,textTransform:"uppercase",marginBottom:"0.5rem",fontFamily:F.mono}}>HOUSEHOLD HUB</div>
          <h1 style={{fontFamily:F.heading,fontSize:"1.8rem",fontWeight:700,color:T.text}}>Your Properties</h1>
          <p style={{color:T.muted,fontSize:"0.85rem",marginTop:"0.4rem"}}>Select a property to manage</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.5rem"}}>
          {properties.map(prop=>(
            <button key={prop.id} onClick={()=>onSelect(prop.id)}
              style={{display:"flex",alignItems:"center",gap:"1.2rem",background:T.surface,border:`1px solid ${prop.color}50`,borderRadius:"14px",padding:"1.1rem 1.4rem",cursor:"pointer",textAlign:"left",width:"100%"}}
              onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${prop.color}`;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${prop.color}50`;e.currentTarget.style.transform="none";}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:prop.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",flexShrink:0}}>{prop.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:F.heading,color:T.text,fontSize:"1.05rem",fontWeight:600}}>{prop.name}</div>
                <div style={{color:T.muted,fontSize:"0.78rem",marginTop:"0.2rem"}}>{(prop.items||[]).length} entries · {(prop.cats||[]).length} categories</div>
              </div>
              <span style={{color:prop.color,fontSize:"1.1rem"}}>›</span>
            </button>
          ))}
        </div>
        <button onClick={onAdd}
          style={{width:"100%",background:"transparent",border:`2px dashed ${T.border}`,color:T.muted,borderRadius:"14px",padding:"1rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
          <span style={{fontSize:"1.2rem"}}>＋</span> Add Property
        </button>
      </div>
    </div>
  );
}

// ── Property Form ─────────────────────────────────────────────────────────────
function PropertyForm({ initial, onSave, onCancel, onDelete, T, F }) {
  const [form,setForm]=useState(initial||{name:"",icon:"🏠",color:PROP_COLOURS[0]});
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"1.5rem",fontSize:"1.3rem",fontWeight:700}}>{initial?"Edit Property":"New Property"}</h3>
      <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
        <input placeholder="Property name e.g. Main Home, Holiday Cottage…" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
          style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.65rem 0.9rem",fontFamily:F.body,fontSize:"0.95rem"}}/>
        <div>
          <div style={{fontSize:"0.75rem",color:T.muted,marginBottom:"0.6rem",fontFamily:F.mono,letterSpacing:"0.08em"}}>ICON</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0.5rem"}}>
            {PROP_ICONS.map(e=><button key={e} onClick={()=>setForm({...form,icon:e})} style={{height:"44px",borderRadius:"10px",border:`2px solid ${form.icon===e?T.accent:T.border}`,background:form.icon===e?T.border:"transparent",fontSize:"1.3rem",cursor:"pointer"}}>{e}</button>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:"0.75rem",color:T.muted,marginBottom:"0.6rem",fontFamily:F.mono,letterSpacing:"0.08em"}}>COLOUR</div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {PROP_COLOURS.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{width:"32px",height:"32px",borderRadius:"50%",background:c,border:`3px solid ${form.color===c?T.text:"transparent"}`,cursor:"pointer"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",background:T.bg,borderRadius:"12px",padding:"0.9rem 1.1rem",border:`1px solid ${form.color}50`}}>
          <div style={{width:"40px",height:"40px",borderRadius:"10px",background:form.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>{form.icon}</div>
          <span style={{fontFamily:F.heading,color:T.text,fontSize:"1rem",fontWeight:600}}>{form.name||"Property Name"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>{initial&&onDelete&&<button onClick={onDelete} style={{background:"transparent",border:`1px solid ${T.border}`,color:"#C06B6B",borderRadius:"8px",padding:"0.5rem 1rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.85rem"}}>Delete Property</button>}</div>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button onClick={onCancel} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
            <button onClick={()=>form.name&&onSave(form)} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"8px",padding:"0.5rem 1.4rem",cursor:"pointer",fontWeight:700,fontFamily:F.body}}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Change PIN ────────────────────────────────────────────────────────────────
function ChangePinModal({ onClose, T, F }) {
  const [step,setStep]=useState("current");
  const [newPin,setNewPin]=useState(null);
  const [error,setError]=useState("");
  const labels={current:"Enter your current PIN",new:"Enter a new 6-digit PIN",confirm:"Confirm your new PIN"};
  const handle=async pin=>{
    if(step==="current"){const h=await hashPin(pin);if(h===store.str(K.pin,"")){{setStep("new");setError("");}}else setError("Incorrect PIN");}
    else if(step==="new"){setNewPin(pin);setStep("confirm");setError("Enter it again to confirm");}
    else{if(pin===newPin){const h=await hashPin(pin);store.setStr(K.pin,h);onClose();}else{setNewPin(null);setStep("new");setError("PINs didn't match — try again");}}
  };
  return (
    <div style={{textAlign:"center"}}>
      <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"0.5rem",fontWeight:700}}>Change PIN</h3>
      <p style={{color:T.muted,fontSize:"0.85rem",marginBottom:"1.5rem"}}>{labels[step]}</p>
      <PinPad key={step} onComplete={handle} T={T} F={F}/>
      {error&&<p style={{marginTop:"1rem",color:step==="current"?"#C06B6B":T.accent,fontSize:"0.8rem",fontFamily:F.mono}}>{error}</p>}
      <button onClick={onClose} style={{marginTop:"1.5rem",background:"transparent",border:"none",color:T.muted,fontSize:"0.8rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
    </div>
  );
}

// ── View Toggle ───────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange, T }) {
  return (
    <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:"8px",overflow:"hidden"}}>
      {[["list","☰"],["grid","⊞"]].map(([v,icon])=>(
        <button key={v} onClick={()=>onChange(v)} style={{padding:"0.5rem 0.75rem",border:"none",background:view===v?T.border:"transparent",color:view===v?T.accent:T.muted,cursor:"pointer",fontSize:"1rem"}}>{icon}</button>
      ))}
    </div>
  );
}

// ── Calendar Dates ────────────────────────────────────────────────────────────
function CalendarDates({ content, title }) {
  const dates=extractDates(content||"");
  if(!dates.length) return null;
  const add=d=>{ const now=new Date();const stamp=now.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";const today=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//HouseholdHub//EN","BEGIN:VEVENT",`UID:hh-${Date.now()}@hh`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${today}`,`DTEND;VALUE=DATE:${today}`,`SUMMARY:${((title||"")+" — "+d).trim()}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");const a=document.createElement("a");a.href="data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);a.download="event.ics";a.click(); };
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginTop:"0.6rem"}}>
      {dates.map((d,i)=><button key={i} onClick={e=>{e.stopPropagation();add(d);}} style={{background:"#1E2D1E",border:"1px solid #3A5C3A",color:"#7DAE6B",borderRadius:"6px",padding:"0.25rem 0.6rem",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace"}}>📅 {d}</button>)}
    </div>
  );
}

// ── List Card ─────────────────────────────────────────────────────────────────
function ListCard({ item, cat, onEdit, onDelete, onPin, T, F }) {
  const [open,setOpen]=useState(false);
  const hc=!!(item.contact&&(item.contact.name||item.contact.phone));
  return (
    <div style={{background:T.surface,border:`1px solid ${item.pinned?cat.color+"60":T.border}`,borderRadius:"12px",padding:"1.1rem 1.3rem",position:"relative",transition:"transform 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
      {item.pinned&&<div style={{position:"absolute",top:"0.7rem",right:"0.9rem",fontSize:"0.65rem",color:cat.color,fontWeight:700,letterSpacing:"0.08em"}}>PINNED</div>}
      <div style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <span style={{fontSize:"1.3rem",flexShrink:0}}>{cat.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"0.7rem",color:cat.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem",fontFamily:F.mono}}>{cat.label}</div>
          <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1rem",margin:0,fontWeight:600}}>{item.title}</h3>
          {!open&&<p style={{color:T.muted,fontSize:"0.8rem",margin:"0.3rem 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:F.body}}>{hc&&item.contact.name?item.contact.name:item.content.split("\n")[0]}</p>}
        </div>
        <span style={{color:T.muted,fontSize:"0.8rem",marginTop:"4px",opacity:0.5}}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:`1px solid ${T.border}`}}>
          {hc&&(
            <div style={{background:T.bg,borderRadius:"10px",padding:"0.85rem",marginBottom:"0.85rem",border:`1px solid ${T.border}`}}>
              {item.contact.name&&<div style={{color:T.text,fontWeight:600,marginBottom:"0.35rem",fontFamily:F.body}}>{item.contact.name}</div>}
              {item.contact.company&&<div style={{color:T.muted,fontSize:"0.82rem",marginBottom:"0.3rem",fontFamily:F.body}}>🏢 {item.contact.company}</div>}
              {item.contact.phone&&(
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.3rem"}}>
                  <span style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body}}>📞 {item.contact.phone}</span>
                  <a href={`tel:${item.contact.phone.replace(/\s/g,"")}`} style={{background:"#7B9E87",color:"white",borderRadius:"6px",padding:"0.2rem 0.6rem",fontSize:"0.72rem",textDecoration:"none",fontWeight:700}}>Call</a>
                </div>
              )}
              {item.contact.email&&<div style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body}}>✉️ <a href={`mailto:${item.contact.email}`} style={{color:T.muted}}>{item.contact.email}</a></div>}
            </div>
          )}
          {item.content&&<pre style={{color:T.text,fontSize:"0.88rem",lineHeight:1.7,margin:0,fontFamily:F.mono,whiteSpace:"pre-wrap",wordBreak:"break-word",opacity:0.85}}>{item.content}</pre>}
          <CalendarDates content={item.content} title={item.title}/>
          {(item.photos||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginTop:"0.75rem"}}>{item.photos.map((p,i)=><img key={i} src={p.data} alt="" style={{width:"80px",height:"80px",objectFit:"cover",borderRadius:"8px",border:`1px solid ${T.border}`,cursor:"pointer"}} onClick={e=>{e.stopPropagation();window.open(p.data,"_blank");}}/>)}</div>}
          {(item.attachments||[]).length>0&&<div style={{marginTop:"0.75rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>{item.attachments.map((a,i)=><button key={i} onClick={e=>{e.stopPropagation();window.open(a.data,"_blank");}} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:T.bg,borderRadius:"8px",padding:"0.4rem 0.75rem",border:`1px solid ${T.border}`,cursor:"pointer",textAlign:"left",width:"100%"}}><span>📄</span><span style={{fontSize:"0.8rem",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:F.body,flex:1}}>{a.name}</span><span style={{fontSize:"0.7rem",color:T.muted}}>↗</span></button>)}</div>}
          <div style={{display:"flex",gap:"0.75rem",marginTop:"1rem",flexWrap:"wrap"}}>
            <button onClick={()=>onPin(item.id)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"6px",padding:"0.3rem 0.75rem",cursor:"pointer",fontSize:"0.78rem",fontFamily:F.body}}>{item.pinned?"Unpin":"📌 Pin"}</button>
            <button onClick={()=>onEdit(item)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"6px",padding:"0.3rem 0.75rem",cursor:"pointer",fontSize:"0.78rem",fontFamily:F.body}}>✏️ Edit</button>
            <button onClick={()=>onDelete(item.id)} style={{background:"transparent",border:`1px solid ${T.border}`,color:"#C06B6B",borderRadius:"6px",padding:"0.3rem 0.75rem",cursor:"pointer",fontSize:"0.78rem",fontFamily:F.body}}>🗑 Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grid Tile ─────────────────────────────────────────────────────────────────
function GridTile({ item, cat, onEdit, onDelete, onPin, T, F }) {
  const [flipped,setFlipped]=useState(false);
  const hc=!!(item.contact&&(item.contact.name||item.contact.phone));
  const preview=hc&&item.contact.name?item.contact.name:item.content.split("\n")[0];
  return (
    <div style={{perspective:"800px",cursor:"pointer",minHeight:"170px"}} onClick={()=>setFlipped(!flipped)}>
      <div style={{position:"relative",width:"100%",minHeight:"170px",transformStyle:"preserve-3d",transition:"transform 0.45s",transform:flipped?"rotateY(180deg)":"none"}}>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",background:T.surface,border:`1px solid ${item.pinned?cat.color+"70":T.border}`,borderRadius:"14px",padding:"1.2rem",display:"flex",flexDirection:"column",gap:"0.5rem",overflow:"hidden"}}>
          {item.pinned&&<div style={{position:"absolute",top:"0.6rem",right:"0.7rem",fontSize:"0.6rem",color:cat.color,fontWeight:700}}>PINNED</div>}
          {(item.photos||[]).length>0&&<img src={item.photos[0].data} alt="" style={{width:"100%",height:"55px",objectFit:"cover",borderRadius:"6px"}}/>}
          <div style={{fontSize:"1.5rem"}}>{cat.icon}</div>
          <div style={{fontSize:"0.65rem",color:cat.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:F.mono}}>{cat.label}</div>
          <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"0.95rem",fontWeight:600,lineHeight:1.3,margin:0}}>{item.title}</h3>
          <p style={{color:T.muted,fontSize:"0.75rem",margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",fontFamily:F.body}}>{preview}</p>
          <div style={{marginTop:"auto",fontSize:"0.65rem",color:T.muted,fontFamily:F.mono,opacity:0.4}}>tap →</div>
        </div>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",background:T.bg,border:`1px solid ${cat.color}40`,borderRadius:"14px",padding:"1rem",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{fontSize:"0.65rem",color:cat.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.5rem",fontFamily:F.mono}}>{item.title}</div>
          {hc&&item.contact.name&&<div style={{color:T.text,fontSize:"0.85rem",fontWeight:600,marginBottom:"0.3rem",fontFamily:F.body}}>{item.contact.name}</div>}
          {hc&&item.contact.phone&&<a href={`tel:${(item.contact.phone||"").replace(/\s/g,"")}`} onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",background:"#7B9E87",color:"white",borderRadius:"6px",padding:"0.25rem 0.6rem",fontSize:"0.75rem",textDecoration:"none",fontWeight:700,marginBottom:"0.5rem",alignSelf:"flex-start"}}>📞 Call</a>}
          <pre style={{color:T.text,fontSize:"0.78rem",lineHeight:1.65,margin:0,fontFamily:F.mono,whiteSpace:"pre-wrap",wordBreak:"break-word",flex:1,overflow:"hidden",opacity:0.85}}>{item.content}</pre>
          <div style={{display:"flex",gap:"0.5rem",marginTop:"0.75rem",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>onPin(item.id)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"6px",padding:"0.25rem 0.6rem",cursor:"pointer",fontSize:"0.7rem",fontFamily:F.body}}>{item.pinned?"Unpin":"📌"}</button>
            <button onClick={()=>onEdit(item)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"6px",padding:"0.25rem 0.6rem",cursor:"pointer",fontSize:"0.7rem",fontFamily:F.body}}>✏️</button>
            <button onClick={()=>onDelete(item.id)} style={{background:"transparent",border:`1px solid ${T.border}`,color:"#C06B6B",borderRadius:"6px",padding:"0.25rem 0.6rem",cursor:"pointer",fontSize:"0.7rem",fontFamily:F.body}}>🗑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Draggable List ────────────────────────────────────────────────────────────
function DraggableList({ items, renderItem, onReorder }) {
  const [dragIdx,setDragIdx]=useState(null);
  const [overIdx,setOverIdx]=useState(null);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
      {items.map((item,i)=>(
        <div key={item.id} draggable
          onDragStart={e=>{setDragIdx(i);e.dataTransfer.effectAllowed="move";}}
          onDragOver={e=>{e.preventDefault();setOverIdx(i);}}
          onDrop={()=>{if(dragIdx!==null&&dragIdx!==i){const r=[...items];const [m]=r.splice(dragIdx,1);r.splice(i,0,m);onReorder(r);}setDragIdx(null);setOverIdx(null);}}
          onDragEnd={()=>{setDragIdx(null);setOverIdx(null);}}
          style={{opacity:dragIdx===i?0.4:1,outline:overIdx===i&&dragIdx!==i?"2px dashed #C8956C":"none",borderRadius:"12px",cursor:"grab"}}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// ── Card Form ─────────────────────────────────────────────────────────────────
function CardForm({ initial, cats, onSave, onCancel, T, F }) {
  const isCC=id=>{ const c=cats.find(x=>x.id===id); return c&&(c.id==="contacts"||c.label.toLowerCase().includes("contact")); };
  const [form,setForm]=useState(initial||{category:cats[0]?.id||"general",title:"",content:"",pinned:false,photos:[],attachments:[],contact:null});
  const fRef=useRef(); const pRef=useRef();
  const handleFiles =async e=>{ const n=await Promise.all([...e.target.files].map(async f=>({name:f.name,data:await fileToB64(f),type:f.type}))); setForm(p=>({...p,attachments:[...(p.attachments||[]),...n]})); };
  const handlePhotos=async e=>{ const n=await Promise.all([...e.target.files].map(async f=>({name:f.name,data:await fileToB64(f)}))); setForm(p=>({...p,photos:[...(p.photos||[]),...n]})); };
  const inp=s=>({background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.6rem 0.8rem",fontFamily:F.body,fontSize:"0.95rem",...s});
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"1.5rem",fontSize:"1.3rem",fontWeight:700}}>{initial?"Edit Entry":"New Entry"}</h3>
      <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp({fontSize:"0.9rem"})}>
          {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inp({})}/>
        {isCC(form.category)&&(
          <div style={{background:T.bg,borderRadius:"10px",padding:"1rem",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:"0.7rem",color:"#8B7BAB",fontFamily:F.mono,letterSpacing:"0.1em",marginBottom:"0.75rem"}}>CONTACT DETAILS</div>
            {[["name","Full name","👤"],["company","Company","🏢"],["phone","Phone number","📞"],["email","Email","✉️"]].map(([field,ph,icon])=>(
              <div key={field} style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
                <span>{icon}</span>
                <input value={(form.contact||{})[field]||""} onChange={e=>setForm({...form,contact:{...(form.contact||{}),[field]:e.target.value}})} placeholder={ph}
                  style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.5rem 0.75rem",fontFamily:F.body,fontSize:"0.88rem"}}/>
              </div>
            ))}
          </div>
        )}
        <textarea placeholder="Notes" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={4} style={inp({resize:"vertical",lineHeight:1.6})}/>
        <div>
          <div style={{fontSize:"0.7rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.08em",marginBottom:"0.5rem"}}>PHOTOS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.5rem"}}>
            {(form.photos||[]).map((p,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={p.data} alt="" style={{width:"64px",height:"64px",objectFit:"cover",borderRadius:"8px",border:`1px solid ${T.border}`}}/>
                <button onClick={()=>setForm(f=>({...f,photos:f.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:"-6px",right:"-6px",width:"18px",height:"18px",borderRadius:"50%",background:"#C06B6B",border:"none",color:"white",fontSize:"10px",cursor:"pointer"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>pRef.current.click()} style={{width:"64px",height:"64px",borderRadius:"8px",border:`1px dashed ${T.border}`,background:"transparent",color:T.muted,fontSize:"1.4rem",cursor:"pointer"}}>📷</button>
          </div>
          <input ref={pRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotos}/>
        </div>
        <div>
          <div style={{fontSize:"0.7rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.08em",marginBottom:"0.5rem"}}>DOCUMENTS</div>
          {(form.attachments||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:T.bg,borderRadius:"8px",padding:"0.4rem 0.75rem",marginBottom:"0.4rem",border:`1px solid ${T.border}`}}>
              <span>📄</span><span style={{flex:1,fontSize:"0.8rem",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</span>
              <button onClick={()=>setForm(f=>({...f,attachments:f.attachments.filter((_,j)=>j!==i)}))} style={{background:"transparent",border:"none",color:"#C06B6B",cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>fRef.current.click()} style={{background:"transparent",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.45rem 1rem",cursor:"pointer",fontSize:"0.82rem",fontFamily:F.body}}>+ Attach document</button>
          <input ref={fRef} type="file" multiple style={{display:"none"}} onChange={handleFiles}/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:"0.5rem",color:T.muted,fontSize:"0.9rem",cursor:"pointer"}}>
          <input type="checkbox" checked={form.pinned} onChange={e=>setForm({...form,pinned:e.target.checked})}/> Pin to top
        </label>
        <div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end"}}>
          <button onClick={onCancel} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
          <button onClick={()=>form.title&&onSave(form)} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"8px",padding:"0.5rem 1.4rem",cursor:"pointer",fontWeight:700,fontFamily:F.body}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel, onDelete, T, F }) {
  const [form,setForm]=useState(initial||{label:"",icon:"🏠",color:PALETTE[0]});
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>{initial?"Edit Category":"New Category"}</h3>
      <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
        <input placeholder="Name" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}
          style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.65rem 0.9rem",fontFamily:F.body,fontSize:"0.95rem"}}/>
        <div>
          <div style={{fontSize:"0.75rem",color:T.muted,marginBottom:"0.6rem",fontFamily:F.mono,letterSpacing:"0.08em"}}>ICON</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"0.4rem"}}>
            {EMOJI_LIST.map(e=><button key={e} onClick={()=>setForm({...form,icon:e})} style={{height:"38px",borderRadius:"8px",border:`2px solid ${form.icon===e?T.accent:T.border}`,background:form.icon===e?T.border:"transparent",fontSize:"1.1rem",cursor:"pointer"}}>{e}</button>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:"0.75rem",color:T.muted,marginBottom:"0.6rem",fontFamily:F.mono,letterSpacing:"0.08em"}}>COLOUR</div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {PALETTE.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{width:"30px",height:"30px",borderRadius:"50%",background:c,border:`3px solid ${form.color===c?T.text:"transparent"}`,cursor:"pointer"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",background:T.bg,borderRadius:"10px",padding:"0.75rem 1rem",border:`1px solid ${T.border}`}}>
          <span style={{fontSize:"1.4rem"}}>{form.icon}</span>
          <span style={{fontFamily:F.heading,color:form.color,fontSize:"1rem",fontWeight:600}}>{form.label||"Preview"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>{initial&&onDelete&&<button onClick={onDelete} style={{background:"transparent",border:`1px solid ${T.border}`,color:"#C06B6B",borderRadius:"8px",padding:"0.5rem 1rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.85rem"}}>Delete</button>}</div>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button onClick={onCancel} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
            <button onClick={()=>form.label&&onSave(form)} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"8px",padding:"0.5rem 1.4rem",cursor:"pointer",fontWeight:700,fontFamily:F.body}}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Appearance Panel ──────────────────────────────────────────────────────────
function AppearancePanel({ appear, onChange, T, F }) {
  const Sec=({label,children})=>(<div style={{marginBottom:"1.75rem"}}><div style={{fontSize:"0.7rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.85rem"}}>{label}</div>{children}</div>);
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"1.75rem",fontWeight:700}}>Appearance</h3>
      <Sec label="Font Style">
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"0.6rem"}}>
          {FONT_PAIRS.map(fp=>(
            <button key={fp.id} onClick={()=>onChange({...appear,fontId:fp.id})}
              style={{background:appear.fontId===fp.id?T.border:"transparent",border:`2px solid ${appear.fontId===fp.id?T.accent:T.border}`,borderRadius:"10px",padding:"0.75rem 1rem",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontFamily:fp.heading,color:appear.fontId===fp.id?T.accent:T.text,fontSize:"1rem",fontWeight:700}}>{fp.label}</div>
              <div style={{fontFamily:fp.body,color:T.muted,fontSize:"0.72rem",marginTop:"0.15rem"}}>The quick brown fox</div>
            </button>
          ))}
        </div>
      </Sec>
      <Sec label="Colour Theme">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.6rem"}}>
          {THEMES.map(th=>(
            <button key={th.id} onClick={()=>onChange({...appear,themeId:th.id})}
              style={{background:th.bg,border:`2px solid ${appear.themeId===th.id?th.accent:th.border}`,borderRadius:"10px",padding:"0.75rem",cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",gap:"4px",marginBottom:"0.4rem"}}>{[th.accent,th.text,th.muted].map((c,i)=><div key={i} style={{width:"12px",height:"12px",borderRadius:"50%",background:c}}/>)}</div>
              <div style={{color:th.text,fontSize:"0.8rem",fontFamily:F.body}}>{th.label}</div>
            </button>
          ))}
        </div>
      </Sec>
      <Sec label="Text Size">
        <div style={{display:"flex",gap:"0.6rem"}}>
          {FONT_SIZES.map(sz=>(
            <button key={sz.id} onClick={()=>onChange({...appear,sizeId:sz.id})}
              style={{flex:1,background:appear.sizeId===sz.id?T.border:"transparent",border:`2px solid ${appear.sizeId===sz.id?T.accent:T.border}`,borderRadius:"10px",padding:"0.65rem 0.5rem",cursor:"pointer",color:appear.sizeId===sz.id?T.accent:T.muted,fontSize:"0.82rem",fontFamily:F.body,fontWeight:appear.sizeId===sz.id?700:400}}>
              {sz.label}
            </button>
          ))}
        </div>
      </Sec>
      <div style={{background:T.bg,borderRadius:"12px",padding:"1.1rem 1.3rem",border:`1px solid ${T.border}`}}>
        <div style={{fontSize:"0.65rem",color:T.accent,fontFamily:F.mono,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.3rem"}}>PREVIEW</div>
        <h3 style={{fontFamily:F.heading,color:T.text,fontSize:`${FONT_SIZES.find(s=>s.id===appear.sizeId)?.scale||1}rem`,fontWeight:600,marginBottom:"0.3rem"}}>Example Entry Title</h3>
        <p style={{fontFamily:F.body,color:T.muted,fontSize:`${(FONT_SIZES.find(s=>s.id===appear.sizeId)?.scale||1)*0.85}rem`,lineHeight:1.6}}>This is how your entries will look.</p>
      </div>
    </div>
  );
}

// ── Category Order Panel ──────────────────────────────────────────────────────
function CategoryOrderPanel({ cats, onReorder, T, F }) {
  const [dragIdx,setDragIdx]=useState(null);
  const [overIdx,setOverIdx]=useState(null);
  const move=(from,to)=>{ if(to<0||to>=cats.length) return; const r=[...cats]; const [m]=r.splice(from,1); r.splice(to,0,m); onReorder(r); };
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"0.5rem",fontWeight:700}}>Category Order</h3>
      <p style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body,marginBottom:"1.25rem",lineHeight:1.5}}>Drag or use arrows to reorder category tabs.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {cats.map((cat,i)=>(
          <div key={cat.id} draggable
            onDragStart={e=>{setDragIdx(i);e.dataTransfer.effectAllowed="move";}}
            onDragOver={e=>{e.preventDefault();setOverIdx(i);}}
            onDrop={()=>{if(dragIdx!==null&&dragIdx!==i){const r=[...cats];const [m]=r.splice(dragIdx,1);r.splice(i,0,m);onReorder(r);}setDragIdx(null);setOverIdx(null);}}
            onDragEnd={()=>{setDragIdx(null);setOverIdx(null);}}
            style={{display:"flex",alignItems:"center",gap:"0.75rem",background:overIdx===i&&dragIdx!==i?T.border:T.bg,border:`1px solid ${overIdx===i&&dragIdx!==i?T.accent:T.border}`,borderRadius:"10px",padding:"0.75rem 1rem",opacity:dragIdx===i?0.4:1,cursor:"grab"}}>
            <span style={{color:T.muted,userSelect:"none"}}>⠿</span>
            <span style={{fontSize:"1.2rem"}}>{cat.icon}</span>
            <span style={{flex:1,fontFamily:F.body,color:T.text,fontSize:"0.9rem",fontWeight:500}}>{cat.label}</span>
            <div style={{display:"flex",gap:"0.3rem"}}>
              <button onClick={()=>move(i,i-1)} disabled={i===0} style={{background:"transparent",border:`1px solid ${T.border}`,color:i===0?T.border:T.muted,borderRadius:"6px",width:"28px",height:"28px",cursor:i===0?"default":"pointer",fontSize:"0.8rem"}}>▲</button>
              <button onClick={()=>move(i,i+1)} disabled={i===cats.length-1} style={{background:"transparent",border:`1px solid ${T.border}`,color:i===cats.length-1?T.border:T.muted,borderRadius:"6px",width:"28px",height:"28px",cursor:i===cats.length-1?"default":"pointer",fontSize:"0.8rem"}}>▼</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Entry Sort Panel ──────────────────────────────────────────────────────────
function EntrySortPanel({ sortId, onSortChange, T, F }) {
  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"0.5rem",fontWeight:700}}>Entry Sort Order</h3>
      <p style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body,marginBottom:"1.25rem",lineHeight:1.5}}>Pinned entries always stay at the top.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {SORT_OPTIONS.map(opt=>(
          <button key={opt.id} onClick={()=>onSortChange(opt.id)}
            style={{display:"flex",alignItems:"center",gap:"1rem",background:sortId===opt.id?T.border:T.bg,border:`2px solid ${sortId===opt.id?T.accent:T.border}`,borderRadius:"12px",padding:"0.9rem 1.1rem",cursor:"pointer",textAlign:"left",width:"100%"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.body,color:sortId===opt.id?T.accent:T.text,fontWeight:sortId===opt.id?700:500,fontSize:"0.9rem"}}>{opt.label}</div>
              <div style={{fontFamily:F.body,color:T.muted,fontSize:"0.75rem",marginTop:"0.1rem"}}>{opt.desc}</div>
            </div>
            {sortId===opt.id&&<span style={{color:T.accent}}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Data Panel ────────────────────────────────────────────────────────────────
function DataPanel({ properties, onImport, T, F }) {
  const [status,setStatus]=useState(null);
  const [showExport,setShowExport]=useState(false);
  const exportJson=JSON.stringify({version:"hh-export-v1",exportedAt:new Date().toISOString(),properties},null,2);

  const handleCopy=()=>{
    navigator.clipboard.writeText(exportJson).then(()=>{
      setStatus("copied"); setTimeout(()=>setStatus(null),2500);
    }).catch(()=>{
      const el=document.getElementById("hh-export-text");
      if(el){el.select();document.execCommand("copy");setStatus("copied");setTimeout(()=>setStatus(null),2500);}
    });
  };

  const handlePaste=e=>{
    const val=e.target.value.trim();
    if(!val){setStatus(null);return;}
    try{
      const data=JSON.parse(val);
      if(data.version==="hh-export-v1"&&Array.isArray(data.properties)){onImport(data.properties);setStatus("success");}
      else setStatus("error");
    }catch{setStatus("error");}
  };

  return (
    <div>
      <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"0.5rem",fontWeight:700}}>Data Backup</h3>
      <p style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body,marginBottom:"1.5rem",lineHeight:1.5}}>Export before any app update, then paste back in to restore everything.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {!showExport?(
          <button onClick={()=>setShowExport(true)} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"10px",padding:"0.85rem 1.2rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.9rem",textAlign:"left",display:"flex",alignItems:"center",gap:"0.75rem",width:"100%"}}>
            <span style={{fontSize:"1.2rem"}}>📋</span>
            <div><div style={{fontWeight:700}}>Export Data</div><div style={{fontSize:"0.78rem",opacity:0.8,marginTop:"0.15rem"}}>Copy your data to save as a backup</div></div>
          </button>
        ):(
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"10px",padding:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <div style={{fontSize:"0.75rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.08em"}}>YOUR BACKUP DATA</div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <button onClick={handleCopy} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"6px",padding:"0.3rem 0.9rem",cursor:"pointer",fontSize:"0.8rem",fontFamily:F.body,fontWeight:700}}>
                  {status==="copied"?"✓ Copied!":"Copy All"}
                </button>
                <button onClick={()=>setShowExport(false)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"6px",padding:"0.3rem 0.75rem",cursor:"pointer",fontSize:"0.8rem",fontFamily:F.body}}>Close</button>
              </div>
            </div>
            <textarea id="hh-export-text" readOnly value={exportJson}
              style={{width:"100%",height:"160px",background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.6rem",fontFamily:F.mono,fontSize:"0.7rem",lineHeight:1.5,resize:"none"}}/>
            <p style={{color:T.muted,fontSize:"0.75rem",fontFamily:F.body,marginTop:"0.6rem",lineHeight:1.5}}>Tap <strong style={{color:T.text}}>Copy All</strong> then paste into Notes to save. Next time paste it into Import below.</p>
          </div>
        )}
        <div style={{background:T.border,borderRadius:"10px",padding:"1rem"}}>
          <div style={{fontSize:"0.75rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.08em",marginBottom:"0.6rem"}}>IMPORT FROM BACKUP</div>
          <textarea placeholder="Paste your backup data here…" onChange={handlePaste}
            style={{width:"100%",height:"120px",background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.6rem",fontFamily:F.mono,fontSize:"0.7rem",lineHeight:1.5,resize:"none"}}/>
          {status==="success"&&<div style={{background:"#1E2D1E",border:"1px solid #3A5C3A",borderRadius:"8px",padding:"0.65rem 0.9rem",color:"#7DAE6B",fontSize:"0.82rem",fontFamily:F.body,marginTop:"0.6rem"}}>✅ Imported! All your properties and entries are restored.</div>}
          {status==="error"&&<div style={{background:"#2D1E1E",border:"1px solid #5C3A3A",borderRadius:"8px",padding:"0.65rem 0.9rem",color:"#C06B6B",fontSize:"0.82rem",fontFamily:F.body,marginTop:"0.6rem"}}>❌ Couldn't read that. Make sure you pasted the full backup text.</div>}
        </div>
        <div style={{background:T.bg,borderRadius:"10px",padding:"0.85rem 1.2rem",border:`1px solid ${T.border}`,fontSize:"0.78rem",color:T.muted,fontFamily:F.body,lineHeight:1.6}}>
          💡 <strong style={{color:T.text}}>Tip:</strong> Before any app update, export and save to Notes. Then paste into Import in the new version.
        </div>
      </div>
    </div>
  );
}

// ── Set PIN Modal ─────────────────────────────────────────────────────────────
function SetPinModal({ onSave, onCancel, T, F }) {
  const [step,setStep]=useState("new");
  const [newPin,setNewPin]=useState(null);
  const [error,setError]=useState("");
  const labels={new:"Choose a 6-digit PIN",confirm:"Enter it again to confirm"};
  const handle=async pin=>{
    if(step==="new"){ setNewPin(pin); setStep("confirm"); setError("Now enter it again to confirm"); }
    else { if(pin===newPin){ const h=await hashPin(pin); onSave(h); } else { setNewPin(null); setStep("new"); setError("PINs didn't match — try again"); } }
  };
  return (
    <div style={{textAlign:"center"}}>
      <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"0.5rem",fontWeight:700}}>Set a PIN</h3>
      <p style={{color:T.muted,fontSize:"0.85rem",marginBottom:"1.5rem"}}>{labels[step]}</p>
      <PinPad key={step} onComplete={handle} T={T} F={F}/>
      {error&&<p style={{marginTop:"1rem",color:step==="new"?"#C06B6B":T.accent,fontSize:"0.8rem",fontFamily:F.mono}}>{error}</p>}
      <button onClick={onCancel} style={{marginTop:"1.5rem",background:"transparent",border:"none",color:T.muted,fontSize:"0.8rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ appear, onAppearChange, cats, onCategoryReorder, sortId, onSortChange, onSetPin, onChangePin, onRemovePin, onLock, hasPin, properties, onImport, T, F }) {
  const [section,setSection]=useState("appearance");
  const sections=[{id:"appearance",label:"Appearance",icon:"🎨"},{id:"categories",label:"Categories",icon:"🗂"},{id:"entries",label:"Entries",icon:"📋"},{id:"data",label:"Data",icon:"💾"},{id:"security",label:"Security",icon:"🔐"},{id:"about",label:"About",icon:"ℹ️"}];
  return (
    <div style={{display:"flex",gap:"1.5rem",minHeight:"400px"}}>
      <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",minWidth:"110px",borderRight:`1px solid ${T.border}`,paddingRight:"1rem"}}>
        <div style={{fontSize:"0.65rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.12em",marginBottom:"0.5rem"}}>SETTINGS</div>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            style={{background:section===s.id?T.border:"transparent",border:"none",borderRadius:"8px",padding:"0.55rem 0.75rem",cursor:"pointer",color:section===s.id?T.accent:T.muted,fontFamily:F.body,fontSize:"0.85rem",textAlign:"left",display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <span>{s.icon}</span><span>{s.label}</span>
          </button>
        ))}
      </div>
      <div style={{flex:1,minWidth:0}}>
        {section==="appearance"&&<AppearancePanel appear={appear} onChange={onAppearChange} T={T} F={F}/>}
        {section==="categories"&&<CategoryOrderPanel cats={cats} onReorder={onCategoryReorder} T={T} F={F}/>}
        {section==="entries"&&<EntrySortPanel sortId={sortId} onSortChange={onSortChange} T={T} F={F}/>}
        {section==="data"&&<DataPanel properties={properties} onImport={onImport} T={T} F={F}/>}
        {section==="security"&&(
          <div>
            <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"0.5rem",fontWeight:700}}>Security</h3>
            <p style={{color:T.muted,fontSize:"0.82rem",fontFamily:F.body,marginBottom:"1.25rem",lineHeight:1.5}}>
              {hasPin?"A PIN is currently set. You can change or remove it below.":"No PIN is set — the app opens directly. Add one for extra security."}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              {!hasPin&&(
                <button onClick={onSetPin} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"10px",padding:"0.85rem 1.2rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.9rem",textAlign:"left",display:"flex",alignItems:"center",gap:"0.75rem",width:"100%"}}>
                  <span style={{fontSize:"1.2rem"}}>🔐</span>
                  <div><div style={{fontWeight:700}}>Set a PIN</div><div style={{fontSize:"0.78rem",opacity:0.8,marginTop:"0.15rem"}}>Require a code to open the app</div></div>
                </button>
              )}
              {hasPin&&(
                <>
                  <button onClick={onChangePin} style={{background:T.border,border:`1px solid ${T.border}`,color:T.text,borderRadius:"10px",padding:"0.85rem 1.2rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.9rem",textAlign:"left",display:"flex",alignItems:"center",gap:"0.75rem",width:"100%"}}>
                    <span style={{fontSize:"1.2rem"}}>🔑</span>
                    <div><div style={{fontWeight:600}}>Change PIN</div><div style={{fontSize:"0.78rem",color:T.muted,marginTop:"0.15rem"}}>Update your 6-digit unlock code</div></div>
                  </button>
                  <button onClick={onRemovePin} style={{background:T.bg,border:`1px solid ${T.border}`,color:"#C06B6B",borderRadius:"10px",padding:"0.85rem 1.2rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.9rem",textAlign:"left",display:"flex",alignItems:"center",gap:"0.75rem",width:"100%"}}>
                    <span style={{fontSize:"1.2rem"}}>🗑</span>
                    <div><div style={{fontWeight:600}}>Remove PIN</div><div style={{fontSize:"0.78rem",color:T.muted,marginTop:"0.15rem"}}>Open app without a PIN</div></div>
                  </button>
                </>
              )}
              <div style={{background:T.bg,borderRadius:"10px",padding:"0.85rem 1.2rem",border:`1px solid ${T.border}`,fontSize:"0.78rem",color:T.muted,fontFamily:F.body,lineHeight:1.6}}>
                🛡 PIN is hashed with SHA-256 and never stored in plain text.
              </div>
            </div>
          </div>
        )}
        {section==="about"&&(
          <div>
            <h3 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",marginBottom:"1.5rem",fontWeight:700}}>About</h3>
            {[["App","Household Hub"],["Version","2.0"],["Storage","Browser (local)"],["Data","Stays on your device"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"0.65rem 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.muted,fontSize:"0.85rem",fontFamily:F.body}}>{k}</span>
                <span style={{color:T.text,fontSize:"0.85rem",fontFamily:F.mono}}>{v}</span>
              </div>
            ))}
            <p style={{marginTop:"1.25rem",color:T.muted,fontSize:"0.8rem",fontFamily:F.body,lineHeight:1.6}}>All data is stored locally. Nothing is sent to any server.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pre-Lock Export Modal ─────────────────────────────────────────────────────
function PreLockModal({ properties, onLock, T, F }) {
  const [copied, setCopied] = useState(false);
  const exportJson = JSON.stringify({ version:"hh-export-v1", exportedAt:new Date().toISOString(), properties }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJson).then(() => {
      setCopied(true);
    }).catch(() => {
      const el = document.getElementById("prelock-export-text");
      if (el) { el.select(); document.execCommand("copy"); setCopied(true); }
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:"1rem"}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px",padding:"2rem",width:"100%",maxWidth:"460px",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",fontFamily:F.body,color:T.text}}>

        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <div style={{fontSize:"2.2rem",marginBottom:"0.75rem"}}>🔒</div>
          <h2 style={{fontFamily:F.heading,color:T.text,fontSize:"1.3rem",fontWeight:700,marginBottom:"0.4rem"}}>Before you lock…</h2>
          <p style={{color:T.muted,fontSize:"0.85rem",lineHeight:1.5}}>Copy your backup data and paste it into Notes to keep it safe. You can restore it any time via Settings → Data.</p>
        </div>

        {/* Export text area */}
        <div style={{background:T.bg,borderRadius:"12px",padding:"1rem",marginBottom:"1rem",border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
            <span style={{fontSize:"0.72rem",color:T.muted,fontFamily:F.mono,letterSpacing:"0.08em"}}>YOUR BACKUP DATA</span>
            <button onClick={handleCopy}
              style={{background:copied?T.border:T.accent,border:"none",color:copied?T.accent:T.bg,borderRadius:"6px",padding:"0.3rem 1rem",cursor:"pointer",fontSize:"0.8rem",fontFamily:F.body,fontWeight:700,transition:"all 0.2s",display:"flex",alignItems:"center",gap:"0.4rem"}}>
              {copied ? "✓ Copied!" : "Copy All"}
            </button>
          </div>
          <textarea id="prelock-export-text" readOnly value={exportJson}
            style={{width:"100%",height:"120px",background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"0.6rem",fontFamily:F.mono,fontSize:"0.68rem",lineHeight:1.5,resize:"none"}}/>
        </div>

        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onLock}
            style={{flex:1,background:copied?"#C06B6B":T.border,border:`1px solid ${copied?"#C06B6B":T.border}`,color:copied?"white":T.muted,borderRadius:"12px",padding:"0.85rem",cursor:"pointer",fontFamily:F.body,fontWeight:600,fontSize:"0.9rem",transition:"all 0.2s"}}>
            {copied ? "Lock Now" : "Lock without saving"}
          </button>
          {copied&&(
            <button onClick={onLock}
              style={{flex:1,background:T.accent,border:"none",color:T.bg,borderRadius:"12px",padding:"0.85rem",cursor:"pointer",fontFamily:F.body,fontWeight:700,fontSize:"0.9rem"}}>
              Done — Lock
            </button>
          )}
        </div>

        {!copied&&<p style={{textAlign:"center",color:T.border,fontSize:"0.75rem",fontFamily:F.body,marginTop:"0.75rem"}}>Tap <strong style={{color:T.muted}}>Copy All</strong> first to save your backup</p>}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked,   setUnlocked]   = useState(false);
  const [hasPin,     setHasPin]     = useState(false);
  const [properties, setProperties] = useState([]);
  const [propId,     setPropId]     = useState(null);
  const [view,       setView]       = useState("list");
  const [appear,     setAppear]     = useState({ fontId:"classic", themeId:"dark", sizeId:"md" });
  const [activeCat,  setActiveCat]  = useState("all");
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null);
  const [delId,      setDelId]      = useState(null);
  const [page,       setPage]       = useState("home");
  const [preLock,    setPreLock]    = useState(false); // show export prompt before locking

  const doLock = () => { if(hasPin) setPreLock(true); }; // only lock if PIN is set
  const confirmLock = () => { setPreLock(false); setUnlocked(false); };

  useEffect(() => {
    const pinSet = !!store.str(K.pin,"");
    setHasPin(pinSet);
    // If no PIN is set, skip the lock screen entirely
    if (!pinSet) setUnlocked(true);
    const saved = store.get(K.props, null);
    if (saved && saved.length) { setProperties(saved); }
    else { const first=makeProperty("My Home","🏠",PROP_COLOURS[0]); setProperties([first]); }
    setView(store.str(K.view,"list"));
    const a=store.get(K.appear,null); if(a) setAppear(a);
  }, []);

  useEffect(()=>{ if(properties.length) store.set(K.props,properties); },[properties]);
  useEffect(()=>{ store.setStr(K.view,view); },[view]);
  useEffect(()=>{ store.set(K.appear,appear); },[appear]);

  useEffect(()=>{
    if(!unlocked) return;
    let t=setTimeout(()=>doLock(),5*60*1000);
    const reset=()=>{clearTimeout(t);t=setTimeout(()=>doLock(),5*60*1000);};
    const evts=["mousemove","keydown","touchstart","click"];
    evts.forEach(e=>window.addEventListener(e,reset));
    return()=>{clearTimeout(t);evts.forEach(e=>window.removeEventListener(e,reset));};
  },[unlocked]);

  const F     = FONT_PAIRS.find(f=>f.id===appear.fontId)||FONT_PAIRS[0];
  const T     = THEMES.find(t=>t.id===appear.themeId)||THEMES[0];
  const scale = FONT_SIZES.find(s=>s.id===appear.sizeId)?.scale||1;
  const googleUrl = [...new Set(FONT_PAIRS.map(f=>f.google))].map(g=>`family=${g}`).join("&");
  const baseStyle = `
    @import url('https://fonts.googleapis.com/css2?${googleUrl}&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;} body{background:${T.bg};}
    ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:${T.bg};} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
    input,textarea,select{outline:none;} input::placeholder,textarea::placeholder{color:${T.muted};}
    button{font-family:${F.body};} html{font-size:${scale*16}px;}
  `;

  const prop = properties.find(p=>p.id===propId);
  const updateProp = fn => setProperties(ps=>ps.map(p=>p.id===propId?fn(p):p));
  const setItems = fn => updateProp(p=>({...p,items:typeof fn==="function"?fn(p.items):fn}));
  const setCats  = fn => updateProp(p=>({...p,cats: typeof fn==="function"?fn(p.cats):fn}));
  const setSortId= v  => updateProp(p=>({...p,sort:v}));

  if (!unlocked && hasPin) return (
    <><style>{baseStyle}</style>
      <LockScreen onUnlock={()=>setUnlocked(true)} T={T} F={F}/>
    </>
  );

  if (!propId) return (
    <><style>{baseStyle}</style>
      <PropertySelector properties={properties} onSelect={id=>{setPropId(id);setActiveCat("all");setPage("home");}} onAdd={()=>setModal("newprop")} T={T} F={F}/>
      {modal==="newprop"&&<Modal onClose={()=>setModal(null)} wide T={T} F={F}>
        <PropertyForm onSave={form=>{const p=makeProperty(form.name,form.icon,form.color);setProperties(ps=>[...ps,p]);setModal(null);}} onCancel={()=>setModal(null)} T={T} F={F}/>
      </Modal>}
    </>
  );

  const items  = prop?.items || [];
  const cats   = prop?.cats  || DEFAULT_CATS;
  const sortId = prop?.sort  || "manual";
  const getCat = id => cats.find(c=>c.id===id)||{label:"General",icon:"🏠",color:"#6B8CAE"};

  const sortUnpinned=arr=>{
    const r=[...arr];
    if(sortId==="alpha-asc")  r.sort((a,b)=>a.title.localeCompare(b.title));
    if(sortId==="alpha-desc") r.sort((a,b)=>b.title.localeCompare(a.title));
    if(sortId==="date-new")   r.sort((a,b)=>b.id-a.id);
    if(sortId==="date-old")   r.sort((a,b)=>a.id-b.id);
    return r;
  };
  const baseFiltered=items.filter(item=>{
    const matchCat=activeCat==="all"||item.category===activeCat;
    const q=search.toLowerCase();
    return matchCat&&(!q||item.title.toLowerCase().includes(q)||item.content.toLowerCase().includes(q)||(item.contact?.name||"").toLowerCase().includes(q));
  });
  const pinned   = baseFiltered.filter(i=>i.pinned);
  const unpinned = sortUnpinned(baseFiltered.filter(i=>!i.pinned));
  const filtered = [...pinned,...unpinned];

  const cardProps=item=>({item,cat:getCat(item.category),T,F,onEdit:i=>setModal({item:i}),onDelete:id=>setDelId(id),onPin:id=>setItems(p=>p.map(i=>i.id===id?{...i,pinned:!i.pinned}:i))});

  function saveItem(form){
    if(modal==="new") setItems(p=>[...p,{...form,id:Date.now()}]);
    else setItems(p=>p.map(i=>i.id===modal.item.id?{...form,id:modal.item.id}:i));
    setModal(null);
  }
  function saveCat(form){
    if(modal==="newcat") setCats(p=>[...p,{...form,id:"cat_"+Date.now()}]);
    else setCats(p=>p.map(c=>c.id===modal.cat.id?{...form,id:modal.cat.id}:c));
    setModal(null);
  }
  function deleteCat(id){ setCats(p=>p.filter(c=>c.id!==id)); setItems(p=>p.map(i=>i.category===id?{...i,category:cats[0]?.id||"general"}:i)); if(activeCat===id)setActiveCat("all"); setModal(null); }
  function reorderUnpinned(newOrder){ const pinIds=new Set(items.filter(i=>i.pinned).map(i=>i.id)); const newIds=new Set(newOrder.map(i=>i.id)); setItems([...items.filter(i=>pinIds.has(i.id)&&!newIds.has(i.id)),...newOrder]); }

  const catCounts=Object.fromEntries(cats.map(c=>[c.id,items.filter(i=>i.category===c.id).length]));
  const navBtn=active=>({background:"none",border:"none",borderBottom:`2px solid ${active?T.accent:"transparent"}`,color:active?T.accent:T.muted,padding:"0.75rem 1rem",cursor:"pointer",fontSize:`${scale*0.82}rem`,fontFamily:F.mono,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"});

  return (
    <><style>{baseStyle}</style>
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:F.body,color:T.text}}>

      {/* Header */}
      <div style={{background:`linear-gradient(180deg,${T.surface} 0%,${T.bg} 100%)`,borderBottom:`1px solid ${T.border}`,padding:"1.5rem 1.5rem 0"}}>
        <div style={{maxWidth:"760px",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",paddingBottom:"1rem"}}>
            <div>
              <button onClick={()=>setPropId(null)}
                style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:"8px",padding:"0.3rem 0.75rem",cursor:"pointer",fontFamily:F.mono,fontSize:"0.7rem",letterSpacing:"0.08em",color:T.muted,marginBottom:"0.6rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                <span>{prop?.icon}</span><span>{prop?.name}</span><span style={{opacity:0.5}}>▾</span>
              </button>
              <h1 style={{fontFamily:F.heading,fontSize:"clamp(1.4rem,5vw,1.9rem)",fontWeight:700,color:T.text,lineHeight:1.2}}>Home Intelligence</h1>
            </div>
            <div style={{display:"flex",gap:"0.6rem",alignItems:"center",paddingTop:"0.25rem"}}>
              {page==="home"&&<ViewToggle view={view} onChange={setView} T={T}/>}
              {page==="home"&&<button onClick={()=>setModal("new")} style={{background:T.accent,border:"none",color:T.bg,borderRadius:"10px",padding:"0.6rem 1.1rem",cursor:"pointer",fontWeight:700,fontSize:"0.88rem",fontFamily:F.body}}>+ Add</button>}
            </div>
          </div>
          <div style={{display:"flex",gap:"0",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex"}}>
              <button style={navBtn(page==="home")} onClick={()=>setPage("home")}>🏠 Home</button>
              <button style={navBtn(page==="settings")} onClick={()=>setPage("settings")}>⚙️ Settings</button>
            </div>
            {hasPin&&<button onClick={doLock} title="Lock app"
              style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.35rem 0.8rem",cursor:"pointer",fontSize:"0.8rem",fontFamily:F.mono,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"0.5rem"}}>
              🔒 <span>Lock</span>
            </button>}
          </div>
        </div>
      </div>

      {page==="settings" ? (
        <div style={{maxWidth:"760px",margin:"0 auto",padding:"2rem 1rem 4rem"}}>
          <div style={{background:T.surface,borderRadius:"14px",padding:"1.2rem 1.4rem",marginBottom:"2rem",border:`1px solid ${(prop?.color||T.accent)+"40"}`,display:"flex",alignItems:"center",gap:"1rem"}}>
            <div style={{fontSize:"1.8rem"}}>{prop?.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.heading,color:T.text,fontWeight:600,fontSize:"1rem"}}>{prop?.name}</div>
              <div style={{color:T.muted,fontSize:"0.78rem",fontFamily:F.body}}>{items.length} entries</div>
            </div>
            <button onClick={()=>setModal({editprop:prop})} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.4rem 0.9rem",cursor:"pointer",fontFamily:F.body,fontSize:"0.82rem"}}>Edit Property</button>
          </div>
          <SettingsPanel
            appear={appear} onAppearChange={setAppear}
            cats={cats} onCategoryReorder={r=>setCats(r)}
            sortId={sortId} onSortChange={setSortId}
            hasPin={hasPin}
            onSetPin={()=>setModal("setpin")}
            onChangePin={()=>setModal("changepin")}
            onRemovePin={()=>{ store.setStr(K.pin,""); setHasPin(false); }}
            onLock={doLock}
            properties={properties} onImport={imported=>{setProperties(imported);setPropId(null);}}
            T={T} F={F}
          />
        </div>
      ) : (
        <>
          <div style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
            <div style={{maxWidth:"760px",margin:"0 auto",padding:"0.75rem 1rem 0"}}>
              <div style={{position:"relative",marginBottom:"0.5rem"}}>
                <span style={{position:"absolute",left:"0.9rem",top:"50%",transform:"translateY(-50%)",color:T.muted}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…"
                  style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:"10px",padding:"0.6rem 0.9rem 0.6rem 2.4rem",fontFamily:F.body,fontSize:"0.9rem"}}/>
              </div>
              <div style={{display:"flex",overflowX:"auto"}}>
                {[{id:"all",label:"All",icon:"🏡",color:T.accent},...cats].map(cat=>{
                  const count=cat.id==="all"?items.length:catCounts[cat.id]||0;
                  const active=activeCat===cat.id;
                  return (
                    <button key={cat.id} onClick={()=>setActiveCat(cat.id)} onDoubleClick={()=>cat.id!=="all"&&setModal({cat})}
                      style={{background:"transparent",border:"none",borderBottom:`2px solid ${active?cat.color:"transparent"}`,color:active?cat.color:T.muted,padding:"0.75rem 0.7rem",cursor:"pointer",fontSize:"0.75rem",fontFamily:F.mono,fontWeight:500,letterSpacing:"0.05em",whiteSpace:"nowrap",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                      <span style={{fontSize:"0.95rem"}}>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span style={{fontSize:"0.6rem",color:active?cat.color:T.border}}>{count}</span>
                    </button>
                  );
                })}
                <button onClick={()=>setModal("newcat")}
                  style={{background:"transparent",border:"none",borderBottom:"2px solid transparent",color:T.border,padding:"0.75rem 0.7rem",cursor:"pointer",fontSize:"0.75rem",fontFamily:F.mono,whiteSpace:"nowrap",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.accent} onMouseLeave={e=>e.currentTarget.style.color=T.border}>
                  <span>＋</span><span>New</span><span style={{opacity:0,fontSize:"0.6rem"}}>0</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{maxWidth:"760px",margin:"0 auto",padding:"1.5rem 1rem 4rem"}}>
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"4rem 1rem",color:T.muted}}>
                <div style={{fontSize:"3rem",marginBottom:"1rem"}}>{prop?.icon||"🏠"}</div>
                <p style={{fontFamily:F.heading,fontSize:"1.1rem"}}>No entries yet</p>
                <p style={{fontSize:"0.85rem",marginTop:"0.5rem"}}>Tap + Add to get started</p>
              </div>
            ):view==="list"?(
              <>
                {pinned.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"0.85rem",marginBottom:"0.85rem"}}>{pinned.map(item=><ListCard key={item.id} {...cardProps(item)}/>)}</div>}
                {sortId==="manual"
                  ?<DraggableList items={unpinned} onReorder={reorderUnpinned} renderItem={item=><ListCard {...cardProps(item)}/>}/>
                  :<div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>{unpinned.map(item=><ListCard key={item.id} {...cardProps(item)}/>)}</div>
                }
                {sortId==="manual"&&unpinned.length>1&&<p style={{textAlign:"center",color:T.border,fontSize:"0.7rem",fontFamily:F.mono,marginTop:"1.5rem",letterSpacing:"0.06em"}}>HOLD &amp; DRAG TO REORDER</p>}
              </>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"1rem"}}>
                {filtered.map(item=><GridTile key={item.id} {...cardProps(item)}/>)}
              </div>
            )}
          </div>
        </>
      )}

      {(modal==="new"||modal?.item)&&<Modal onClose={()=>setModal(null)} wide T={T} F={F}><CardForm initial={modal==="new"?null:modal.item} cats={cats} onSave={saveItem} onCancel={()=>setModal(null)} T={T} F={F}/></Modal>}
      {(modal==="newcat"||modal?.cat)&&<Modal onClose={()=>setModal(null)} wide T={T} F={F}><CategoryForm initial={modal==="newcat"?null:modal.cat} onSave={saveCat} onCancel={()=>setModal(null)} onDelete={modal?.cat?()=>deleteCat(modal.cat.id):null} T={T} F={F}/></Modal>}
      {modal==="setpin"&&<Modal onClose={()=>setModal(null)} T={T} F={F}><SetPinModal onSave={h=>{store.setStr(K.pin,h);setHasPin(true);setModal(null);}} onCancel={()=>setModal(null)} T={T} F={F}/></Modal>}
      {modal==="changepin"&&<Modal onClose={()=>setModal(null)} T={T} F={F}><ChangePinModal onClose={()=>setModal(null)} T={T} F={F}/></Modal>}
      {modal==="newprop"&&<Modal onClose={()=>setModal(null)} wide T={T} F={F}><PropertyForm onSave={form=>{const p=makeProperty(form.name,form.icon,form.color);setProperties(ps=>[...ps,p]);setModal(null);}} onCancel={()=>setModal(null)} T={T} F={F}/></Modal>}
      {modal?.editprop&&<Modal onClose={()=>setModal(null)} wide T={T} F={F}>
        <PropertyForm initial={modal.editprop}
          onSave={form=>{setProperties(ps=>ps.map(p=>p.id===modal.editprop.id?{...p,...form}:p));setModal(null);}}
          onCancel={()=>setModal(null)}
          onDelete={properties.length>1?()=>{setProperties(ps=>ps.filter(p=>p.id!==modal.editprop.id));setPropId(null);setModal(null);}:null}
          T={T} F={F}/>
      </Modal>}
      {delId&&(
        <Modal onClose={()=>setDelId(null)} T={T} F={F}>
          <h3 style={{fontFamily:F.heading,color:T.text,marginBottom:"1rem",fontWeight:700}}>Delete this entry?</h3>
          <p style={{color:T.muted,fontSize:"0.9rem",marginBottom:"1.5rem",fontFamily:F.body}}>This cannot be undone.</p>
          <div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end"}}>
            <button onClick={()=>setDelId(null)} style={{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,borderRadius:"8px",padding:"0.5rem 1.2rem",cursor:"pointer",fontFamily:F.body}}>Cancel</button>
            <button onClick={()=>{setItems(p=>p.filter(i=>i.id!==delId));setDelId(null);}} style={{background:"#C06B6B",border:"none",color:"white",borderRadius:"8px",padding:"0.5rem 1.4rem",cursor:"pointer",fontWeight:700,fontFamily:F.body}}>Delete</button>
          </div>
        </Modal>
      )}
      {preLock&&<PreLockModal properties={properties} onLock={confirmLock} T={T} F={F}/>}
    </div>
    </>
  );
}
