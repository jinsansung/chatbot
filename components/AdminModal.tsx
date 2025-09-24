import React, { useState, useRef } from 'react';
import type { RegulationFile } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PencilIcon } from './icons/PencilIcon';

interface AdminModalProps {
  onClose: () => void;
  regulations: RegulationFile[];
  addRegulations: (files: { name: string; content: string }[]) => void;
  deleteRegulation: (id: string) => void;
  updateRegulation: (id: string, updates: { content: string; link: string }) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ 
  onClose,
  regulations,
  addRegulations,
  deleteRegulation,
  updateRegulation
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingRegulation, setEditingRegulation] = useState<RegulationFile | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedLink, setEditedLink] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this should be a secure check.
    if (password === 'arenaadmin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Fix: Explicitly type the 'file' parameter as File to resolve type inference issues.
    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<{ name: string; content: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve({ name: file.name, content: e.target?.result as string });
        reader.onerror = error => reject(error);
        reader.readAsText(file, 'UTF-8');
      });
    });

    try {
      const newFiles = await Promise.all(filePromises);
      if (newFiles.length > 0) {
        addRegulations(newFiles);
      }
    } catch (err) {
      console.error("Error reading files:", err);
      // You could add a user-facing error message here.
    }
    
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = (regulation: RegulationFile) => {
    setEditingRegulation(regulation);
    setEditedContent(regulation.content);
    setEditedLink(regulation.link || '');
  };
  
  const handleSaveEdit = () => {
    if (editingRegulation) {
      updateRegulation(editingRegulation.id, { content: editedContent, link: editedLink });
      setEditingRegulation(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRegulation(null);
    setEditedContent('');
    setEditedLink('');
  };

  const renderFileManager = () => (
    <>
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-semibold text-gray-800 dark:text-gray-100">규정 파일 관리</h3>
         <button
            onClick={triggerFileInput}
            className="flex items-center px-3 py-1 text-sm font-medium text-black rounded-md bg-brand-accent hover:bg-amber-500"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            파일 추가
          </button>
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md"
          multiple
        />
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {regulations.length === 0 ? (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">추가된 규정 파일이 없습니다.</p>
        ) : (
          regulations.map(reg => (
            <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-zinc-700">
              <div className="flex items-center min-w-0">
                <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate" title={reg.name}>{reg.name}</span>
              </div>
              <div className="flex items-center flex-shrink-0 ml-4 space-x-3">
                <button onClick={() => handleEditClick(reg)} className="text-gray-500 hover:text-brand-accent dark:text-gray-400 dark:hover:text-white">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => deleteRegulation(reg.id)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
  
  const renderFileEditor = () => (
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">
        '{editingRegulation?.name}' 수정
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-48 p-2 text-sm border rounded-md dark:bg-zinc-700 dark:text-gray-100 dark:border-zinc-600 focus:ring-brand-accent focus:border-brand-accent"
            aria-label="Regulation content editor"
          />
        </div>
        <div>
           <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            외부 링크 (선택 사항)
          </label>
          <input
            type="url"
            id="link"
            value={editedLink}
            onChange={(e) => setEditedLink(e.target.value)}
            placeholder="https://example.com/regulation.pdf"
            className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-zinc-700 dark:text-gray-100 dark:border-zinc-600"
            aria-label="Regulation link editor"
          />
        </div>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-500">
          취소
        </button>
        <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-black rounded-md bg-brand-accent hover:bg-amber-500">
          저장
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">관리자 패널</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-gray-800 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-zinc-700 dark:text-gray-100 dark:border-zinc-600"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-black rounded-md bg-brand-accent hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              로그인
            </button>
          </form>
        ) : (
          <div className="p-6">
            {editingRegulation ? renderFileEditor() : renderFileManager()}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminModal;