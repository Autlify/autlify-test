// components/ai-chat/chat-interface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/providers/ai-provider';
import { MessageBubble } from './message-bubble';
import { ChatSidebar } from './chat-sidebar';
import { ChatInput } from './chat-input';
import { ChatHeader } from './chat-header';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Shield } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const { currentConversation, isProcessing } = useAIChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  return (
    <div className="flex flex-1 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Premium Status Bar */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Premium AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-sm">Streaming Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                <span className="text-sm">Context-Aware</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Secure Connection</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {currentConversation?.messages.length === 0 ? (
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                    <Brain className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Start a Conversation
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Ask questions, upload documents, or explore your data with our premium AI assistant.
                  </p>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {currentConversation?.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isProcessing && (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse delay-150" />
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse delay-300" />
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto p-6">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
};