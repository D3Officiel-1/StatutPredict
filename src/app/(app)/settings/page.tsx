import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppSettings from "@/components/settings/app-settings";
import UserManagement from "@/components/settings/user-management";
import { Globe, Users } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez les paramètres de vos applications et les comptes utilisateurs.
        </p>
      </div>
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="applications">
            <Globe className="mr-2 h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="mt-6">
          <AppSettings />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
