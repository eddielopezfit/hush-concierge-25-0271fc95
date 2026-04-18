import { motion } from "framer-motion";
import { Sparkles, Search, Users, ClipboardList, MessageSquare } from "lucide-react";

export type LunaTabId = "find" | "explore" | "artists" | "plan" | "chat";

const tabs: { id: LunaTabId; label: string; icon: typeof Sparkles }[] = [
  { id: "find", label: "Your Look", icon: Sparkles },
  { id: "explore", label: "Explore", icon: Search },
  { id: "artists", label: "Artists", icon: Users },
  { id: "plan", label: "My Plan", icon: ClipboardList },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

interface LunaTabNavProps {
  activeTab: LunaTabId;
  onTabChange: (tab: LunaTabId) => void;
}

export const LunaTabNav = ({ activeTab, onTabChange }: LunaTabNavProps) => {
  return (
    <div className="flex border-b border-border bg-background/50">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-body transition-colors relative ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="leading-none">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="luna-tab-indicator"
                className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
