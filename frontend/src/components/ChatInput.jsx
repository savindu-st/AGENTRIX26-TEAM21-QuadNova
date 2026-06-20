import React, { useState } from 'react';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';

export default function ChatInput() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your PrajaNavigator Assistant. Ask me any specific questions about document requirements, fees, or counters.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
      let botText = "I see. For this specific service, we highly recommend following the documents checklist. Would you like to check if there is an alternative counter?";
      
      const textLower = userText.toLowerCase();
      if (textLower.includes('passport') || textLower.includes('nic') || textLower.includes('identity')) {
        botText = "A passport can be used as proof of identity. However, Divisional Secretariat offices in Sri Lanka strongly prefer the National Identity Card (NIC). If you are using a passport, make sure you also bring a recent Grama Niladhari (GN) certificate confirming your address.";
      } else if (textLower.includes('fee') || textLower.includes('pay') || textLower.includes('money') || textLower.includes('lkr')) {
        botText = "Most office counters only accept cash payments. We suggest bringing exact change in Sri Lankan Rupees (LKR) to avoid delays. For tree felling, the inspection fee is LKR 750.";
      } else if (textLower.includes('time') || textLower.includes('hour') || textLower.includes('when')) {
        botText = "It is best to visit between 9:00 AM and 11:30 AM on Tuesdays and Wednesdays, as administrative officers and Grama Niladharis are usually available for signatures during these public days.";
      } else if (textLower.includes('jak') || textLower.includes('tree') || textLower.includes('cut')) {
        botText = "Permits to cut Jak (KOS) trees are regulated under the Felling of Trees Control Act. You must prove the tree is a threat to a building or is mature and needs removal, backed by the Grama Niladhari's inspection report.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col border border-emerald-100 rounded-xl bg-white shadow-sm overflow-hidden h-[380px]">
      {/* Header */}
      <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center space-x-2">
        <Bot className="h-5 w-5 text-emerald-700" />
        <div>
          <h3 className="font-semibold text-sm text-emerald-950">Clarification Assistant</h3>
          <p className="text-xs text-emerald-700">Ask questions about your government visit</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-emerald-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`p-1 rounded-full ${
                msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="h-4.5 w-4.5" />
              ) : (
                <Bot className="h-4.5 w-4.5" />
              )}
            </div>
            <div
              className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-emerald-50/50 text-gray-800 border border-emerald-100/50 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-emerald-600/60 text-xs font-medium pl-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span>AI is writing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-emerald-100 bg-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Can I use passport?)..."
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
