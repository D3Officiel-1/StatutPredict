
'use client';

import NotificationForm from '@/components/dashboard/notification-form';
import TelegramMessageForm from '@/components/dashboard/telegram-message-form';
import TelegramStoryForm from '@/components/dashboard/telegram-story-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageSquare, Camera, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';


export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("app-notification");

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Tabs for larger screens */}
          <TabsList className="hidden sm:grid w-full grid-cols-3">
            <TabsTrigger value="app-notification">
              <Send className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="telegram-message">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Telegram
            </TabsTrigger>
            <TabsTrigger value="telegram-story">
              <Camera className="mr-2 h-4 w-4" />
              Story Telegram
            </TabsTrigger>
          </TabsList>

           {/* Select for smaller screens */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app-notification">
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </div>
                </SelectItem>
                <SelectItem value="telegram-message">
                   <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message Telegram</span>
                  </div>
                </SelectItem>
                <SelectItem value="telegram-story">
                   <div className="flex items-center">
                    <Camera className="mr-2 h-4 w-4" />
                    <span>Story Telegram</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="app-notification" className="mt-6">
            <NotificationForm />
          </TabsContent>
          <TabsContent value="telegram-message" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <TelegramMessageForm />
              </div>
            </div>
          </TabsContent>
           <TabsContent value="telegram-story" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <TelegramStoryForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
