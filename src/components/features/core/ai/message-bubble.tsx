// components/ai-chat/message-bubble.tsx
'use client';

import React from 'react';
import { Message } from '@/types/ai';
import { cn } from '@/lib/utils';
import { User, Bot, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      'flex gap-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl p-6 backdrop-blur-sm',
          isUser
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30'
            : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
        )}>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {message.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  {attachment.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="text-sm">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message Text */}
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative">
                      <div className="absolute top-2 right-2 text-xs text-gray-400">
                        {match[1]}
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={cn("px-2 py-1 rounded-md bg-gray-800", className)} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Timestamp */}
          <div className={cn(
            'mt-3 text-xs opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};