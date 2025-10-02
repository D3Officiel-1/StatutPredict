
import AppList from '@/components/dashboard/app-list';

export default function StatusPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Statut des Applications</h3>
        <AppList />
      </div>
    </div>
  );
}
