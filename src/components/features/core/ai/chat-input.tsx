// components/ai-chat/chat-input.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useAIChat } from '@/providers/ai-provider';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Mic, Image, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isProcessing } = useAIChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    await sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleAttachment = (files: FileList) => {
    const newFiles = Array.from(files);
    if (attachments.length + newFiles.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <Paperclip className="h-4 w-4 text-blue-400" />
              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="relative">
        <div className="absolute left-4 top-4">
          <Sparkles className="h-5 w-5 text-yellow-400/60" />
        </div>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything... Use @ to mention context or upload files"
          className="w-full pl-12 pr-36 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl 
                   focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                   backdrop-blur-sm resize-none min-h-[60px] max-h-[200px] text-white
                   placeholder-gray-500"
          rows={3}
          disabled={isProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {/* Action Buttons */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleAttachment(e.target.files)}
            className="hidden"
            multiple
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Attach files"
          >
            <Paperclip className="h-5 w-5 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRecording 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "hover:bg-white/10 text-gray-400"
            )}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            <Mic className="h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={isProcessing || (!input.trim() && attachments.length === 0)}
            className={cn(
              "px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all",
              isProcessing || (!input.trim() && attachments.length === 0)
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
            )}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hover:text-blue-400 transition-colors"
            onClick={() => setInput(prev => prev + ' @context ')}
          >
            @context
          </button>
          <button
            type="button"
            className="hover:text-blue-400 transition-colors"
            onClick={() => setInput(prev => prev + ' #analyze ')}
          >
            #analyze
          </button>
          <button
            type="button"
            className="hover:text-blue-400 transition-colors"
            onClick={() => setInput(prev => prev + ' /summarize ')}
          >
            /summarize
          </button>
        </div>
        <div className="text-xs">
          {input.length}/4000 characters
        </div>
      </div>
    </form>
  );
};