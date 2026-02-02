// components/ai-chat/chat-header.tsx
'use client';

import React, { useState } from 'react';
import { useAIChat } from '@/providers/ai-provider';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  MoreVertical, 
  Search, 
  FolderPlus, 
  Download, 
  Share2, 
  Settings,
  Bot,
  Star,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onMenuClick }) => {
  const { currentConversation, conversations } = useAIChat();
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const handleExport = () => {
    // Implement export functionality
    console.log('Export conversation');
    setMoreMenuOpen(false);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share conversation');
    setMoreMenuOpen(false);
  };

  const handleDuplicate = () => {
    // Implement duplicate functionality
    console.log('Duplicate conversation');
    setMoreMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-70" />
              <div className="relative p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-xs text-gray-400">
                {conversations.length} conversations • Powered by your license
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Conversation Info */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <AnimatePresence>
            {currentConversation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="font-medium text-white truncate max-w-[300px]">
                      {currentConversation.title}
                    </h2>
                    <button
                      onClick={() => setIsStarred(!isStarred)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentConversation.messages.length} messages • 
                    Updated {new Date(currentConversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-gray-700 rounded-lg 
                           focus:outline-none focus:border-blue-500 text-sm backdrop-blur-sm"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* New Conversation */}
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 
                     hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 
                     transition-all duration-200 group"
          >
            <FolderPlus className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">New</span>
          </button>

          {/* Team Collaboration */}
          <button
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                     hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 
                     transition-all duration-200 group"
          >
            <Users className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Team</span>
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl 
                           border border-gray-800 rounded-xl shadow-2xl z-50 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-xs font-medium text-gray-400">ACTIONS</p>
                  </div>
                  
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4 text-blue-400" />
                    <span>Export Conversation</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 text-green-400" />
                    <span>Share with Team</span>
                  </button>
                  
                  <button
                    onClick={handleDuplicate}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm"
                  >
                    <FolderPlus className="h-4 w-4 text-purple-400" />
                    <span>Duplicate</span>
                  </button>

                  <div className="px-3 py-2 border-t border-gray-800 mt-2">
                    <p className="text-xs font-medium text-gray-400">SETTINGS</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Open settings
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>Advanced Settings</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div className="ml-2">
            <Avatar className="h-9 w-9 border-2 border-blue-500/30">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=AI-Assistant" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                AI
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile Conversation Info */}
      {currentConversation && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-white">{currentConversation.title}</h2>
              <p className="text-xs text-gray-400">
                {currentConversation.messages.length} messages
              </p>
            </div>
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <Star
                className={cn(
                  'h-5 w-5',
                  isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};