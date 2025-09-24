import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import type { Message, RegulationFile } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  if (message.sender === 'loading') {
    return (
      <div className="flex justify-start">
        <div className="bg-apple-bubble-gray dark:bg-zinc-700 rounded-2xl p-3 max-w-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  const isUser = message.sender === 'user';
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${containerClasses}`}>
      {isUser ? (
        <div className="rounded-2xl p-3 max-w-lg whitespace-pre-wrap bg-brand-accent text-black self-end">
          {message.text}
        </div>
      ) : (
        <div
          className="rounded-2xl p-3 max-w-lg prose prose-sm dark:prose-invert max-w-none prose-p:my-1 bg-apple-bubble-gray dark:bg-zinc-700 self-start whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
      )}
    </div>
  );
};

interface ChatViewProps {
  regulations: RegulationFile[];
  isLoaded: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ regulations, isLoaded }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: '안녕하세요! 저는 여러분의 AI 동료, 생활백서봇이에요. 사내 규정에 대해 궁금한 게 있다면 뭐든지 물어보세요! 😊', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || !isLoaded) return;
    
    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    const loadingMessage: Message = { id: 'loading', text: '', sender: 'loading' };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');

    if (regulations.length === 0) {
      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        text: '현재 조회할 수 있는 규정 파일이 없습니다. 관리자가 규정 파일을 먼저 추가해야 합니다.',
        sender: 'bot'
      };
      setMessages(prev => [...prev.slice(0, -1), botMessage]);
      return;
    }

    const responseText = await getChatbotResponse(input, regulations);
    // Fix: Removed redundant markdown to HTML conversion.
    // The chatbot response is already formatted as HTML per the system prompt.
    const botMessage: Message = { id: Date.now().toString() + '-bot', text: responseText, sender: 'bot' };

    setMessages(prev => [...prev.slice(0, -1), botMessage]);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900">
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 w-full px-4 py-2 text-gray-800 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-zinc-800 dark:text-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 text-black rounded-full bg-brand-accent hover:bg-amber-500 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;