"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotMessageSquare, Send } from "lucide-react";
import Image from 'next/image';

interface Message {
  from: 'user' | 'bot';
  text?: string;
  content?: any;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! 👋 How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(prev => !prev);
  const sendMessage = async () => {
    if (!input.trim()) return;
    const messageText = input;
    setMessages(prev => [...prev, { from: 'user', text: messageText }]);
    setInput("");
    setIsTyping(true);
    // Context Data
    const zone = 'Asia/Karachi';
    const zoneTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
    let ip = '';
    try { const ipRes = await fetch('https://api.ipify.org?format=json'); ip = (await ipRes.json()).ip; } catch { }

    const payload: any = { message: messageText, Zone: zone, zoneTime, ip };
    if (sessionId) payload.session_id = sessionId;
    // console.log("data passed", payload);
    try {
      const res = await fetch('https://demo2.devspandas.com/v1/ecom/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      // console.log("API response", data);
      if (!sessionId && data.session_id) setSessionId(data.session_id);
      if (data.response) setMessages(prev => [...prev, { from: 'bot', text: data.response }]);
      if (Array.isArray(data.content)) setMessages(prev => [...prev, { from: 'bot', content: data.content }]);
      if (data.button_value) setMessages(prev => [...prev, { from: 'bot', content: { buttons: data.button_value } }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    }
    setIsTyping(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMessage(); };
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const renderButtons = (count: number) => {
    const opts1 = ["Product Search", "Diabetes help desk", "Order Status", "Schedule Meeting"];
    const opts2 = ["Diabetes Self Care", "Diabetes Prevention"];
    const labels = count === 1 ? opts1 : opts2;
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {labels.map((label, idx) => (
          <button
            key={idx}
            onClick={() => { setInput(label); setTimeout(() => sendMessage(), 0); }}
            className="px-3 py-1 bg-[#01CCE3] text-white rounded-full text-xs hover:bg-[#197ED0] transition"
          >{label}</button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen font-sans">
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={toggleChat} className="bg-[#01CCE3] hover:bg-[#197ED0] text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110">
          <BotMessageSquare size={28} />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ duration: 0.3 }} className="fixed bottom-24 right-6 w-[360px] h-[630px] rounded-3xl overflow-hidden z-50 shadow-2xl backdrop-blur-md bg-white/80 border border-[#01CCE3]/40 flex flex-col">
            <div className="bg-gradient-to-r from-[#01CCE3] to-[#197ED0] text-white px-5 py-4 flex justify-between items-center font-bold text-base rounded-t-3xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white shadow-sm animate-pulse" />
                <span>HealthViber Assistant</span>
              </div>
              <button onClick={toggleChat} className="text-white text-lg">✖</button>
            </div>
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 text-sm scrollbar-thin scrollbar-thumb-[#01CCE3]/50 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                  {msg.from === 'bot' && !msg.content && (<img src="https://cdn-icons-png.flaticon.com/512/4140/4140051.png" alt="bot" className="w-6 h-6 rounded-full border border-[#01CCE3]" />)}
                  {msg.text && (<div className={`${msg.from === 'user' ? 'bg-[#197ED0] text-white' : 'bg-white text-gray-800 border border-gray-200'} px-4 py-2 rounded-2xl shadow-md max-w-[75%]`}>{msg.text}</div>)}
                  {msg.content && Array.isArray(msg.content) && msg.content.length > 0 && (
                    <div className="w-full overflow-x-auto">
                      <div className="flex space-x-3 pb-2">
                        {msg.content.map((item: any, i: number) => {
                          // 1. safely grab the first image URL
                          const imgSrc = item.data?.images?.[0]?.src;
                          if (!imgSrc) return null; // skip cards with no images

                          return (
                            <div key={i} className="w-40 flex-none">
                              <a
                                href={item.data.permalink}
                                target="_blank"
                                rel="noreferrer"
                                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-2"
                              >
                                <Image
                                  src={imgSrc}
                                  width={150}
                                  height={100}
                                  alt={item.data.name}
                                  className="object-cover rounded"
                                />
                                <div className="text-center p-4">
                                  <h4 className="mt-2 text-xs font-semibold text-gray-700 truncate">
                                    {item.data.name}
                                  </h4>
                                  <p className="p-2 text-sm font-bold text-[#197ED0]">
                                    ₹{item.data.price}
                                  </p>
                                  <span className="inline-block px-3 py-1 bg-[#01CCE3] text-white rounded-full text-xs hover:bg-[#197ED0] transition">
                                    Add to cart
                                  </span>
                                </div>
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* {msg.content && Array.isArray(msg.content) && msg.content.length > 0 && (<div className="w-full overflow-x-auto"><div className="flex space-x-3 pb-2">{msg.content.map((item: any, i: number) => (<a key={i} href={item.data.permalink} target="_blank" rel="noopener noreferrer" className="w-40 flex-none bg-white rounded-lg shadow hover:shadow-lg transition p-2"><Image src={item.data.images[0].src} width={150} height={100} alt={item.data.name} className="object-cover rounded" />
                    <div className="text-center p-4">
                      <h4 className="mt-2 text-xs font-semibold text-gray-700 truncate">{item.data.name}</h4><p className="p-2 text-sm font-bold text-[#197ED0]">₹{item.data.price}</p>
                      <a className="px-3 py-1 bg-[#01CCE3] text-white rounded-full text-xs hover:bg-[#197ED0] transition" href={item.data.permalink} target="_blank">Add to cart
                      </a>
                    </div>
                  </a>))}</div></div>)} */}
                  {msg.content && msg.content.buttons && renderButtons(msg.content.buttons)}
                </div>
              ))}
              {isTyping && (<div className="flex justify-start"><div className="px-4 py-2 text-gray-500 bg-white border border-gray-200 rounded-2xl text-xs animate-pulse">Typing...</div></div>)}
              <div ref={bottomRef} />
            </div>
            <div className="px-3 py-2 bg-white/80 border-t border-gray-200 flex items-center gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type something..." className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01CCE3] bg-white text-sm" />
              <button onClick={sendMessage} className="p-2 rounded-full bg-[#197ED0] hover:scale-105 transition text-white"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}