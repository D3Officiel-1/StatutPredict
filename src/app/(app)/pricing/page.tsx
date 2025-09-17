import PricingManagement from "@/components/pricing/pricing-management";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Tarifs des Applications</h2>
        <p className="text-muted-foreground">
          Gérez les plans tarifaires pour chacune de vos applications.
        </p>
      </div>
      <PricingManagement />
    </div>
  )
}
