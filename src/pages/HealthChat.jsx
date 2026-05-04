import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse, isCrisis, isPanic } from '../utils/geminiApi';
import { useNavigate } from 'react-router-dom';

const TEAL='#247d79', BG='#0f1923', CARD='#162230', RAISED='#1d2e3f', BORDER='#243548', INK='#e8f1f8', MUTED='#8ba5be', SUBTLE='#4d6a82', AMBER='#f59e0b', RED='#ef4444';

const SUGGESTIONS = [
  "I have a headache for 2 days",
  "I'm feeling very anxious about exams",
  "Can't sleep at night",
  "I feel very lonely lately",
  "What foods help with stress?",
];

export default function HealthChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{
    role:'model', parts:[{ text:"Hey! I'm CareSync AI — your personal health buddy 💙\n\nI'm here to help with anything — health questions, stress, sleep, nutrition, or just listening. What's on your mind today?" }]
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    if (isCrisis(msg) || isPanic(msg)) setShowCrisis(true);
    const updated = [...messages, { role:'user', parts:[{ text:msg }] }];
    setMessages(updated); setInput(''); setLoading(true);
    try {
      const res = await getGeminiResponse(msg, messages);
      setMessages([...updated, { role:'model', parts:[{ text:res }] }]);
    } catch { setMessages([...updated, { role:'model', parts:[{ text:'Connection error. Try again!' }] }]); }
    finally { setLoading(false); inputRef.current?.focus(); }
  };

  return (
    <div style={{ height:'100vh', background:BG, display:'flex', flexDirection:'column', fontFamily:"'DM Sans',system-ui,sans-serif" }}
      className={mounted?'fade-in':''}>
      <style>{`.fade-in{animation:fade-in .3s ease} @keyframes fade-in{from{opacity:0}to{opacity:1}}`}</style>

      {/* Crisis banner */}
      {showCrisis && (
        <div style={{ background:'linear-gradient(135deg,#dc2626,#7c3aed)', padding:'14px 20px', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <p style={{ fontSize:12,fontWeight:800,color:'white',margin:0 }}>🆘 Please reach out to a counselor</p>
            <button onClick={() => setShowCrisis(false)} style={{ background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:26,height:26,borderRadius:'50%',cursor:'pointer',fontWeight:800 }}>✕</button>
          </div>
          {[['iCall TISS','9152987821'],['Vandrevala 24/7','18602662345']].map(([l,n]) => (
            <a key={n} href={`tel:${n}`} style={{ display:'flex',justifyContent:'space-between',background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'8px 12px',marginBottom:4,textDecoration:'none' }}>
              <span style={{ fontSize:12,fontWeight:700,color:'white' }}>{l}</span>
              <span style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.85)' }}>{n} 📞</span>
            </a>
          ))}
        </div>
      )}

      {/* Header */}
      <header style={{ background:`${CARD}e0`, backdropFilter:'blur(16px)', borderBottom:`1px solid ${BORDER}`, padding:'12px 20px', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <button onClick={() => navigate(-1)} style={{ width:36,height:36,borderRadius:12,background:RAISED,border:`1px solid ${BORDER}`,color:MUTED,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16 }}>←</button>
        <div style={{ width:42,height:42,borderRadius:14,background:`${TEAL}20`,border:`1px solid ${TEAL}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>🤖</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800,fontSize:15,color:INK,margin:0 }}>CareSync AI</p>
          <p style={{ fontSize:10,color:'#22c55e',fontWeight:600,margin:0 }}>● Online · Health & Wellness Companion</p>
        </div>
        <div style={{ background:`${TEAL}15`,border:`1px solid ${TEAL}30`,borderRadius:10,padding:'4px 10px' }}>
          <p style={{ fontSize:9,color:TEAL,fontWeight:800,textTransform:'uppercase',margin:0,letterSpacing:0.5 }}>IIT Patna</p>
        </div>
      </header>

      {/* Disclaimer */}
      <div style={{ flexShrink:0,padding:'8px 16px' }}>
        <div style={{ background:`${AMBER}12`,border:`1px solid ${AMBER}25`,borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:14 }}>⚠️</span>
          <p style={{ fontSize:10,color:'#fbbf24',fontWeight:600,margin:0 }}>AI advice is informational only — not a substitute for professional medical care.</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex:1,overflowY:'auto',padding:'8px 16px',display:'flex',flexDirection:'column',gap:12 }} className="no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
            {m.role === 'model' && (
              <div style={{ width:30,height:30,borderRadius:'50%',background:`${TEAL}20`,border:`1px solid ${TEAL}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>🤖</div>
            )}
            <div style={{
              maxWidth:'78%', padding:'12px 16px', fontSize:13, lineHeight:1.7, fontWeight:500, whiteSpace:'pre-wrap',
              borderRadius: m.role==='user'?'20px 20px 4px 20px':'4px 20px 20px 20px',
              background: m.role==='user'?`linear-gradient(135deg,${TEAL},#1c6360)`:RAISED,
              color: INK, border: m.role==='user'?'none':`1px solid ${BORDER}`,
              boxShadow: m.role==='user'?`0 4px 16px rgba(36,125,121,0.25)`:'0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {m.parts[0].text}
            </div>
            {m.role === 'user' && (
              <div style={{ width:30,height:30,borderRadius:'50%',background:`${TEAL}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>😊</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
            <div style={{ width:30,height:30,borderRadius:'50%',background:`${TEAL}20`,border:`1px solid ${TEAL}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>🤖</div>
            <div style={{ background:RAISED,borderRadius:'4px 20px 20px 20px',border:`1px solid ${BORDER}`,padding:'14px 18px',display:'flex',gap:5,alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:7,height:7,borderRadius:'50%',background:TEAL,animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
            </div>
          </div>
        )}

        {/* Suggestions (first load) */}
        {messages.length === 1 && !loading && (
          <div>
            <p style={{ fontSize:10,color:SUBTLE,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,margin:'8px 0 8px',textAlign:'center' }}>Quick Questions</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{ fontSize:11,fontWeight:600,color:MUTED,background:RAISED,border:`1px solid ${BORDER}`,borderRadius:20,padding:'8px 14px',cursor:'pointer' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ flexShrink:0,padding:'12px 16px 28px',background:`${CARD}90`,backdropFilter:'blur(16px)',borderTop:`1px solid ${BORDER}` }}>
        <div style={{ display:'flex',gap:8,background:RAISED,padding:8,borderRadius:50,border:`1.5px solid ${BORDER}`,boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
          <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&send()}
            placeholder="Tell me how you're feeling…" disabled={loading}
            style={{ flex:1,background:'none',border:'none',outline:'none',fontSize:14,fontWeight:500,color:INK,padding:'4px 14px' }} />
          <button onClick={() => send()} disabled={loading||!input.trim()}
            style={{ width:46,height:46,background:loading||!input.trim()?SUBTLE:`linear-gradient(135deg,${TEAL},#1c6360)`,border:'none',borderRadius:'50%',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',boxShadow:!loading&&input.trim()?`0 0 16px rgba(36,125,121,0.4)`:undefined }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <p style={{ textAlign:'center',fontSize:9,color:SUBTLE,marginTop:8,fontWeight:600 }}>Powered by Google Gemini · CareSync AI</p>
      </div>
    </div>
  );
}
