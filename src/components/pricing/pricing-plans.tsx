'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const pricingPlans = [
    {
        name: 'Journalier',
        price: '1000 FCFA',
        period: '/ jour',
        features: [
            'Accès complet aux pronostics',
            'Support par email',
            'Mises à jour quotidiennes',
        ],
        isPopular: false,
    },
    {
        name: 'Hebdomadaire',
        price: '5000 FCFA',
        period: '/ semaine',
        features: [
            'Accès complet aux pronostics',
            'Support prioritaire',
            'Analyses exclusives',
            'Historique des pronostics',
        ],
        isPopular: true,
    },
    {
        name: 'Mensuel',
        price: '15000 FCFA',
        period: '/ mois',
        features: [
            'Accès complet aux pronostics',
            'Support prioritaire 24/7',
            'Analyses exclusives',
            'Historique des pronostics',
            'Accès anticipé aux nouvelles fonctionnalités',
        ],
        isPopular: false,
    },
];


export default function PricingPlans() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
                <Card key={plan.name} className={cn("flex flex-col", plan.isPopular && "border-primary shadow-lg")}>
                    {plan.isPopular && (
                        <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
                            Populaire
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>
                            Choisir ce plan
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
