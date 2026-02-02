// app/page.tsx
import { AIChatProvider } from '@/providers/ai-provider';
import { ChatInterface } from '@/components/features/core/ai/chat-interface';
import { LicenseManager } from '@/components/features/core/ai/license-manager';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <AIChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-10">
        <div className="w-full container mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with License Manager */}
            <div className="lg:col-span-1">
              <div className="sticky top-10 space-y-6">
                <LicenseManager />
                <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                  <h4 className="font-semibold text-lg mb-3">Context Usage</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Data Context</span>
                        <span>65%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                             style={{ width: '65%' }} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Using platform context with your license key
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Interface */}
            <div className="lg:col-span-3">
              <ChatInterface />
            </div>
          </div>
        </div>
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            className: 'bg-gray-900 border border-gray-800 text-white',
          }}
        />
      </div>
    </AIChatProvider>
  );
}