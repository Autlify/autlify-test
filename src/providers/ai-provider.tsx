// components/providers/ai-chat-provider.tsx
'use client';

import React, { createContext,useContext, useState, useCallback, useEffect } from 'react'; 
import {  Message,Conversation, AIProvider, LicenseConfig } from '@/types/ai';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface AIChatProviderProps {
  children: React.ReactNode;
  defaultProvider?: AIProvider;
  initialLicenseKey?: string;
} 

interface AIChatContextProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isProcessing: boolean;
  licenseKey: string | null;
  aiProvider: AIProvider;
  config: LicenseConfig;
  
  // Methods
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  createNewConversation: (context?: string) => void;
  switchConversation: (id: string) => void;
  updateLicenseKey: (key: string) => void;
  setAIProvider: (provider: AIProvider) => void;
  updateConfig: (config: Partial<LicenseConfig>) => void;
}

const AIChatContext = createContext<AIChatContextProps | undefined>(undefined);

const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within AIChatProvider');
  }
  return context;
};

const AIChatProvider: React.FC<AIChatProviderProps> = ({
  children,
  defaultProvider = 'openai',
  initialLicenseKey,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(initialLicenseKey || null);
  const [aiProvider, setAIProvider] = useState<AIProvider>(defaultProvider);
  
  const [config, setConfig] = useState<LicenseConfig>({
    maxTokens: 4000,
    temperature: 0.7,
    streaming: true,
    usePlatformCost: false,
    contextWindow: 128000,
    model: 'gpt-4-turbo',
  });

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!currentConversation || !licenseKey) {
      toast.error('Please set your license key first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Implementation for sending message to AI API
      // This would use the user's license key and chosen provider
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [currentConversation, licenseKey]);

  const value = {
    conversations,
    currentConversation,
    isProcessing,
    licenseKey,
    aiProvider,
    config,
    sendMessage,
    createNewConversation: useCallback((context?: string) => {
      const newConversation: Conversation = {
        id: uuidv4(),
        title: `New Conversation ${conversations.length + 1}`,
        messages: [],
        context,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversation(newConversation);
    }, [conversations.length]),
    switchConversation: useCallback((id: string) => {
      const conversation = conversations.find(c => c.id === id);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    }, [conversations]),
    updateLicenseKey: useCallback((key: string) => {
      setLicenseKey(key);
      localStorage.setItem('ai_license_key', key);
    }, []),
    setAIProvider: useCallback((provider: AIProvider) => {
      setAIProvider(provider);
    }, []),
    updateConfig: useCallback((newConfig: Partial<LicenseConfig>) => {
      setConfig(prev => ({ ...prev, ...newConfig }));
    }, []),
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
};

export {
  useAIChat,
  AIChatProvider,
  type AIChatProviderProps,
  type AIChatContextProps
};