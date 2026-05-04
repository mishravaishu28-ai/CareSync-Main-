// Crisis keywords - if any of these appear in the user's message,
// we skip the API call and return the counselor numbers instantly.
// Local detection is faster and more reliable than asking the AI.
const CRISIS_WORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self harm', 'hurt myself', 'cut myself', 'overdose', 'no reason to live',
  "can't go on", 'cant go on', 'give up', 'hopeless', 'worthless',
  'mar jau', 'jina nahi', 'marna chahta', 'marna chahti', 'zindagi nahi chahiye',
];
 
const PANIC_WORDS = [
  'panic attack', "can't breathe", 'cant breathe', 'heart racing',
  'shaking', 'trembling', 'terrified', 'overwhelmed', 'breakdown',
  'ghabra', 'bahut dar', 'bahut tension',
];
 
const PHYSICAL_EMERGENCY_WORDS = [
  'chest pain', 'difficulty breathing', 'unconscious', 'bleeding heavily',
  'severe pain', 'fainted', 'seizure', 'stroke', 'heart attack',
  'swelling throat', 'allergic reaction',
];
 
// These functions are exported so StudentDashboard can use them too
// to decide whether to show the crisis banner
export function isCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_WORDS.some(word => lower.includes(word));
}
 
export function isPanic(text) {
  const lower = text.toLowerCase();
  return PANIC_WORDS.some(word => lower.includes(word));
}
 
function isPhysicalEmergency(text) {
  const lower = text.toLowerCase();
  return PHYSICAL_EMERGENCY_WORDS.some(word => lower.includes(word));
}
 
// Pre-written responses for dangerous situations.
// We return these immediately without calling the API.
const CRISIS_RESPONSE = `I can hear that you're going through something really painful right now, and I'm genuinely glad you reached out. You don't have to face this alone. 💙
 
Please talk to someone right now:
 
🏫 IITP Wellness Centre
📞 0612-302-8000 | Walk in: Medical Centre, Campus
 
💬 iCall — TISS (Free & Confidential)
📞 9152987821 | Monday to Saturday, 8am to 10pm
 
🌙 Vandrevala Foundation (Available 24/7)
📞 1860-2662-345
 
If you are in immediate danger, please go to the Medical Centre or call 112.
 
I'm here with you. Can you tell me more about what you're feeling?`;
 
const PANIC_RESPONSE = `Hey, I'm right here with you. What you're feeling will pass — you are safe. 🌿
 
Try this breathing technique right now:
1. Breathe IN slowly for 4 counts
2. Hold for 4 counts
3. Breathe OUT for 6 counts
4. Repeat 3 to 4 times
 
While you breathe, put both feet flat on the floor and name 5 things you can see around you.
 
If panic attacks happen often, please speak to:
📞 IITP Counselor: 0612-302-8000
📞 iCall: 9152987821
 
Stay with me — tell me what triggered this.`;
 
const EMERGENCY_RESPONSE = `This sounds like a medical emergency. Please act right now:
 
🚨 Call 112 immediately
🏥 IITP Medical Centre: 0612-302-8000
🚑 National Ambulance: 102
 
While you wait for help:
• Stay calm and don't move if you are injured
• Keep someone with you — don't be alone
• Loosen any tight clothing
 
Do you need help finding the nearest hospital?`;
 
// System prompt tells the AI how to behave in every conversation.
// This is sent along with every message so the AI never forgets its role.
const SYSTEM_INSTRUCTIONS = `You are CareSync AI, a warm and caring health companion for students at IIT Patna. Think of yourself as a knowledgeable friend who genuinely cares about each student's wellbeing.
 
Your personality: conversational, empathetic, and non-judgmental. Never robotic or overly clinical.
 
Your main responsibilities:
1. Listen first — always acknowledge feelings before giving advice
2. For physical health questions — give practical home remedies and say clearly when they should see a doctor
3. For mental health concerns — be a supportive friend first, then gently suggest coping strategies
4. For any crisis — always provide counselor contact numbers
 
Campus resources to mention when relevant:
- IITP Medical Centre: 0612-302-8000
- iCall TISS: 9152987821 (Monday to Saturday, 8am to 10pm)
- Vandrevala Foundation 24/7: 1860-2662-345
 
Rules:
- Keep responses under 200 words for general questions
- Never give specific medicine dosages — say "ask a pharmacist or doctor"
- For serious physical symptoms — strongly advise seeing a doctor immediately
- Respond in the same language mix the student uses (English, Hindi, or Hinglish)
- You are a companion, not a replacement for professional medical care`;
 
export async function getGeminiResponse(userMessage, chatHistory = []) {
  // Check for dangerous content locally before hitting the API
  if (isCrisis(userMessage))            return CRISIS_RESPONSE;
  if (isPanic(userMessage))             return PANIC_RESPONSE;
  if (isPhysicalEmergency(userMessage)) return EMERGENCY_RESPONSE;
 
  const API_KEY = 'AIzaSyB5xbg6Tsm0U6kJYdJog3XZAvmUBjqr0QM';
  const apiUrl  = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
 
  // Build the full conversation history to send to the API
  // The AI needs this context so it doesn't forget what was already said
  const previousMessages = chatHistory
    .filter(msg => msg.role && msg.parts)
    .map(msg => ({ role: msg.role, parts: msg.parts }));
 
  // We inject the system instructions as the first exchange
  // Gemini doesn't have a native "system" role, so we fake it as a user/model pair
  const allMessages = [
    { role: 'user',  parts: [{ text: `Instructions: ${SYSTEM_INSTRUCTIONS}\n\nAcknowledge these instructions.` }] },
    { role: 'model', parts: [{ text: "Understood! I'm CareSync AI, your health companion at IIT Patna. I'm here to listen and help. What's on your mind?" }] },
    ...previousMessages,
    { role: 'user',  parts: [{ text: userMessage }] },
  ];
 
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: allMessages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });
 
    const data = await response.json();
 
    if (data.error) throw new Error(data.error.message);
 
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that. Could you rephrase?";
 
  } catch (err) {
    console.error('Gemini API error:', err);
    return `Having trouble connecting right now.\n\nIf this is urgent:\n📞 IITP Medical: 0612-302-8000\n📞 Emergency: 112\n\nPlease try again in a moment.`;
  }
}