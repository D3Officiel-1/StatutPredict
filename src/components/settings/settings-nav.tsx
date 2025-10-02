
'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe, Users } from "lucide-react";

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsNav({ className, activeTab, setActiveTab, ...props }: SettingsNavProps) {
  const navItems = [
    {
      id: 'applications',
      title: 'Applications',
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: <Users className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setActiveTab(item.id)}
        >
          {item.icon}
          {item.title}
        </Button>
      ))}
    </nav>
  );
}
