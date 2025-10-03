
'use client';

import NotificationForm from '@/components/dashboard/notification-form';
import TelegramMessageForm from '@/components/dashboard/telegram-message-form';
import TelegramStoryForm from '@/components/dashboard/telegram-story-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageSquare, Camera } from 'lucide-react';


export default function NotificationsPage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="app-notification" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
