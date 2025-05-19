import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  children,
  className
}: { 
  defaultValue: string; 
  children: ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex border-b border-gray-700", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  value, 
  children,
  className
}: { 
  value: string; 
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }
  
  const { activeTab, setActiveTab } = context;
  
  return (
    <button
      className={cn(
        "px-4 py-2 font-medium border-b-2 transition-colors",
        activeTab === value 
          ? "border-blue-500 text-blue-500" 
          : "border-transparent text-gray-400 hover:text-gray-300",
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  value, 
  children,
  className
}: { 
  value: string; 
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div className={cn("pt-4", className)}>
      {children}
    </div>
  );
}