'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-vinyl-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-3 font-medium transition-colors',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-accent-purple text-accent-purple'
                : 'border-transparent text-vinyl-400 hover:text-vinyl-200'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeContent}</div>
    </div>
  );
}
