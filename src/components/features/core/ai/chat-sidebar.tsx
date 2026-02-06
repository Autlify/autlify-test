// components/ai-chat/chat-sidebar.tsx
'use client';

import React, { useState } from 'react';
import { useAIChat } from '@/providers/ai-provider';
import { cn } from '@/lib/utils';
import { 
  X, 
  Search, 
  MessageSquare, 
  Clock, 
  Star, 
  Trash2, 
  Folder,
  FolderOpen,
  ChevronRight,
  Plus,
  Filter,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConversationFilter = 'all' | 'starred' | 'recent' | 'archived';

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const { conversations, currentConversation, switchConversation, createNewConversation } = useAIChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['default']));

  const folders = [
    { id: 'default', name: 'All Chats', icon: FolderOpen, count: conversations.length },
    { id: 'starred', name: 'Starred', icon: Star, count: conversations.filter(c => c.metadata?.starred).length },
    { id: 'work', name: 'Work', icon: Folder, count: 3 },
    { id: 'personal', name: 'Personal', icon: Folder, count: 2 },
    { id: 'archived', name: 'Archived', icon: Archive, count: 1 },
  ];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm) {
      return conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             conversation.context?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    switch (activeFilter) {
      case 'starred':
        return conversation.metadata?.starred;
      case 'recent':
        return new Date(conversation.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      case 'archived':
        return conversation.metadata?.archived;
      default:
        return true;
    }
  });

  const sortedConversations = [...filteredConversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-full lg:w-80 flex flex-col',
          'bg-gradient-to-b from-gray-900/95 via-black/95 to-gray-900/95',
          'border-r border-white/10 backdrop-blur-xl',
          'lg:translate-x-0 lg:opacity-100'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Conversations
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                       focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                       backdrop-blur-sm text-white placeholder-gray-400"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createNewConversation()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                       bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30
                       border border-blue-500/30 transition-all duration-200 group"
            >
              <Plus className="h-4 w-4 text-blue-400 group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
            <button
              className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 
                       transition-colors"
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex gap-1">
            {(['all', 'starred', 'recent', 'archived'] as ConversationFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                  activeFilter === filter
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Folders */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
            Folders
          </p>
          <div className="space-y-1">
            {folders.map((folder) => (
              <div key={folder.id}>
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg',
                    'hover:bg-white/5 transition-colors group'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <folder.icon className={cn(
                      'h-4 w-4',
                      folder.id === 'default' ? 'text-blue-400' :
                      folder.id === 'starred' ? 'text-yellow-400' : 'text-gray-400'
                    )} />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {folder.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {folder.count}
                      </span>
                    )}
                    <ChevronRight className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      expandedFolders.has(folder.id) && 'rotate-90'
                    )} />
                  </div>
                </button>
                
                {/* Conversation List for this folder */}
                {expandedFolders.has(folder.id) && folder.id !== 'archived' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-7 pl-3 border-l border-gray-800/50"
                  >
                    {sortedConversations.slice(0, 5).map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => {
                          switchConversation(conversation.id);
                          onClose();
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg my-1',
                          'hover:bg-white/5 transition-colors',
                          currentConversation?.id === conversation.id && 'bg-blue-500/10 border border-blue-500/20'
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="text-sm truncate">{conversation.title}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {conversation.messages.length} messages • 
                            {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recent Conversations
              </p>
              <span className="text-xs text-gray-400">
                {sortedConversations.length} total
              </span>
            </div>

            <div className="space-y-1">
              {sortedConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No conversations found</p>
                  <button
                    onClick={() => createNewConversation()}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                sortedConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'group relative rounded-xl p-4 mb-2 transition-all duration-200',
                      'hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5',
                      currentConversation?.id === conversation.id && 
                      'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                    )}
                  >
                    <button
                      onClick={() => {
                        switchConversation(conversation.id);
                        onClose();
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          currentConversation?.id === conversation.id
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                        )}>
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm truncate">
                              {conversation.title}
                            </h3>
                            {conversation.metadata?.starred && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {conversation.messages[conversation.messages.length - 1]?.content || 'New conversation'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {conversation.messages.length} messages
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Actions on hover */}
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle star
                            console.log('Toggle star for:', conversation.id);
                          }}
                          className="p-1.5 rounded hover:bg-white/10"
                          title={conversation.metadata?.starred ? 'Unstar' : 'Star'}
                        >
                          <Star className={cn(
                            'h-3.5 w-3.5',
                            conversation.metadata?.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Archive/delete
                            console.log('Archive:', conversation.id);
                          }}
                          className="p-1.5 rounded hover:bg-white/10"
                          title="Archive"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              <p className="font-medium">Storage</p>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: '45%' }}
                />
              </div>
              <p className="text-xs mt-1">2.3GB of 5GB used</p>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 
                       border border-gray-700/50 text-xs transition-colors"
              onClick={() => {
                // Open storage settings
                console.log('Open storage settings');
              }}
            >
              Upgrade
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};