import MaintenanceManagement from "@/components/maintenance/maintenance-management";

export default function MaintenanceProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Programmes de Maintenance</h2>
        <p className="text-muted-foreground">
          Créez et gérez les programmes de maintenance pour vos applications.
        </p>
      </div>
      <MaintenanceManagement />
    </div>
  )
}
