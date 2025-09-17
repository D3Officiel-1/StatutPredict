import UserManagement from "@/components/settings/user-management";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Utilisateurs</h2>
        <p className="text-muted-foreground">
          Invitez et gérez les utilisateurs et leurs permissions.
        </p>
      </div>
      <UserManagement />
    </div>
  )
}
