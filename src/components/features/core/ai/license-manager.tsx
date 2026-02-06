// components/ai-chat/license-manager.tsx
'use client';

import React, { useState } from 'react';
import { useAIChat } from '@/providers/ai-provider';
import { cn } from '@/lib/utils';
import { Key, Shield, CreditCard, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const LicenseManager: React.FC = () => {
  const { licenseKey, updateLicenseKey, aiProvider, setAIProvider, config, updateConfig } = useAIChat();
  const [showKey, setShowKey] = useState(false);

  const providers = [
    { id: 'openai', name: 'OpenAI', icon: '⚡', color: 'text-green-400' },
    { id: 'anthropic', name: 'Claude', icon: '🤖', color: 'text-orange-400' },
    { id: 'azure', name: 'Azure AI', icon: '☁️', color: 'text-blue-400' },
    { id: 'custom', name: 'Custom', icon: '⚙️', color: 'text-purple-400' },
  ];

  return (
    <div className="h-full space-y-6 p-6 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-gray-800/50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-400" />
            License Configuration
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage your AI license keys and provider settings
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">Secure</span>
        </div>
      </div>

      {/* License Key Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">API License Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={licenseKey || ''}
            onChange={(e) => updateLicenseKey(e.target.value)}
            placeholder="sk-..."
            className="w-full pl-4 pr-12 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                     backdrop-blur-sm text-white"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* AI Provider Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">AI Provider</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setAIProvider(provider.id as any)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200",
                aiProvider === provider.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-800/50"
              )}
            >
              <div className="text-2xl mb-2">{provider.icon}</div>
              <div className={cn("text-sm font-medium", provider.color)}>
                {provider.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Max Tokens: {config.maxTokens}
            </label>
            <input
              type="range"
              min="100"
              max="16000"
              step="100"
              value={config.maxTokens}
              onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">Streaming Responses</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.streaming}
                onChange={(e) => updateConfig({ streaming: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                           peer-checked:after:translate-x-full peer-checked:after:border-white 
                           after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                           after:bg-white after:border-gray-300 after:border after:rounded-full 
                           after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500">
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span className="text-sm">Use Platform Billing</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.usePlatformCost}
                onChange={(e) => updateConfig({ usePlatformCost: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                           peer-checked:after:translate-x-full peer-checked:after:border-white 
                           after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                           after:bg-white after:border-gray-300 after:border after:rounded-full 
                           after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500">
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};