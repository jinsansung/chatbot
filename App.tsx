import React, { useState } from 'react';
import ChatView from './components/ChatView';
import AdminModal from './components/AdminModal';
import { useRegulations } from './hooks/useRegulations';
import { ChatBubbleOvalLeftEllipsisIcon } from './components/icons/ChatBubbleOvalLeftEllipsisIcon';
import { XMarkIcon } from './components/icons/XMarkIcon';
import { CogIcon } from './components/icons/CogIcon';

const App: React.FC = () => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { regulations, addRegulations, deleteRegulation, updateRegulation, isLoaded } = useRegulations();

  if (!isChatOpen) {
    return (
      <>
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 w-16 h-16 bg-brand-accent text-black rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
          aria-label="Open chat"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
        </button>
        <style>{`
          .fixed { animation: fadeInScale 0.3s ease-out forwards; }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 w-[calc(100%-40px)] h-[calc(100%-40px)] sm:w-96 sm:h-[600px] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out opacity-0 scale-95 animate-enter">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">생활백서봇</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Open admin panel"
            >
              <CogIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <ChatView regulations={regulations} isLoaded={isLoaded} />
        </main>
      </div>
      
      {isAdminModalOpen && (
        <AdminModal 
          onClose={() => setIsAdminModalOpen(false)}
          regulations={regulations}
          addRegulations={addRegulations}
          deleteRegulation={deleteRegulation}
          updateRegulation={updateRegulation}
        />
      )}
      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-enter {
          animation: enter 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default App;