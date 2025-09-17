import PricingPlans from "@/components/pricing/pricing-plans";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Tarifs</h2>
        <p className="text-muted-foreground">
          Gérez vos plans tarifaires et abonnements.
        </p>
      </div>
      <PricingPlans />
    </div>
  )
}
