import { useState, useEffect, useCallback } from 'react';
import type { RegulationFile } from '../types';

const STORAGE_KEY = 'arena-regulations';

export const useRegulations = () => {
  const [regulations, setRegulations] = useState<RegulationFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedRegulations = localStorage.getItem(STORAGE_KEY);
      if (storedRegulations) {
        setRegulations(JSON.parse(storedRegulations));
      }
    } catch (error) {
      console.error("Failed to load regulations from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const addRegulations = useCallback((files: { name: string; content: string }[]) => {
    setRegulations(prevRegulations => {
      const newRegulations = files
        .map(file => ({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`,
          name: file.name,
          content: file.content,
        }))
        // Filter out files that already exist by name
        .filter(newReg => !prevRegulations.some(existingReg => existingReg.name === newReg.name));

      if (newRegulations.length === 0) {
        return prevRegulations;
      }
      
      const updatedRegulations = [...prevRegulations, ...newRegulations];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRegulations));
      } catch (error) {
        console.error("Failed to save regulations to localStorage", error);
      }
      return updatedRegulations;
    });
  }, []);
  
  const deleteRegulation = useCallback((id: string) => {
    setRegulations(prevRegulations => {
      const updatedRegulations = prevRegulations.filter((reg) => reg.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRegulations));
      } catch (error) {
        console.error("Failed to save regulations to localStorage", error);
      }
      return updatedRegulations;
    });
  }, []);
  
  const updateRegulation = useCallback((id: string, updates: { content: string; link: string }) => {
    setRegulations(prevRegulations => {
      const updatedRegulations = prevRegulations.map(reg => 
        reg.id === id ? { ...reg, ...updates } : reg
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRegulations));
      } catch (error) {
        console.error("Failed to save regulations to localStorage", error);
      }
      return updatedRegulations;
    });
  }, []);

  return { regulations, addRegulations, deleteRegulation, updateRegulation, isLoaded };
};
