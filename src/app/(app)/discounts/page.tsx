
import DiscountCodeManagement from "@/components/discounts/discount-code-management";

export default function DiscountsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Générateur de Bonus</h1>
        <p className="text-muted-foreground mt-2">
          Créez, visualisez et gérez vos codes de réduction avec une interface dynamique.
        </p>
      </div>
      <DiscountCodeManagement />
    </div>
  )
}
