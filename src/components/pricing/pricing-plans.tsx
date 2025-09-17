
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Edit, Trash } from 'lucide-react';

const pricingPlans = [
    {
        name: 'Journalier',
        price: '1000 FCFA',
        period: 'par jour',
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
        period: 'par semaine',
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
        period: 'par mois',
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des forfaits</CardTitle>
          <CardDescription>
            Créez, modifiez et gérez vos plans tarifaires.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un forfait
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du plan</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="hidden sm:table-cell">Période</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingPlans.map((plan) => (
              <TableRow key={plan.name}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell className="hidden sm:table-cell">{plan.period}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
