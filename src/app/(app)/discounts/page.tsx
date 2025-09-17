import DiscountCodeManagement from "@/components/discounts/discount-code-management";

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Codes de Réduction</h2>
        <p className="text-muted-foreground">
          Créez et gérez vos codes de réduction pour les abonnements.
        </p>
      </div>
      <DiscountCodeManagement />
    </div>
  )
}
