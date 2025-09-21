
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, PricingPlan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash, PlusCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CustomLoader from '../ui/custom-loader';

interface PricingPlansListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
  onAddPlan: () => void;
  onEditPlan: (plan: PricingPlan) => void;
}

const periodLabels: { [key: string]: string } = {
    hourly: 'Horaire',
    daily: 'Journalier',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
};

export default function PricingPlansListDialog({ open, onOpenChange, app, onAddPlan, onEditPlan }: PricingPlansListDialogProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const q = query(collection(db, `applications/${app.id}/plans`), orderBy('price'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const plansData: PricingPlan[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PricingPlan));
        setPlans(plansData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching pricing plans:", error);
        toast({ title: "Erreur", description: "Impossible de charger les forfaits.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [app.id, open, toast]);

  const openDeleteDialog = (plan: PricingPlan) => {
    setPlanToDelete(plan);
  };
  
  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
        await deleteDoc(doc(db, `applications/${app.id}/plans`, planToDelete.id));
        toast({
            title: "Forfait supprimé",
            description: `Le forfait "${planToDelete.name}" a été supprimé.`,
        });
        setPlanToDelete(null);
    } catch (error) {
        console.error("Error deleting plan: ", error);
        toast({ title: 'Erreur', description: "Impossible de supprimer le forfait.", variant: 'destructive'});
    } finally {
        setIsDeleting(false);
    }
  };


  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Forfaits pour {app.name}</h2>
                <p className="text-sm text-muted-foreground">Liste des plans tarifaires de l'application.</p>
              </div>
              <div className='flex items-center gap-2'>
                <Button onClick={onAddPlan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un forfait
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Populaire</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : plans.length > 0 ? (
                            plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>
                                    {plan.promoPrice && <span className="line-through text-muted-foreground mr-2">{plan.price.toLocaleString()}</span>}
                                    {(plan.promoPrice ?? plan.price).toLocaleString()} {plan.currency}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{periodLabels[plan.period]}</Badge>
                                </TableCell>
                                <TableCell>
                                    {plan.popular && <Star className="h-5 w-5 text-yellow-500" />}
                                </TableCell>
                                <TableCell className="text-right">
                                     <Button variant="ghost" size="icon" onClick={() => onEditPlan(plan)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(plan)}>
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Aucun forfait trouvé pour cette application.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <AlertDialog open={!!planToDelete} onOpenChange={(isOpen) => !isOpen && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le forfait "{planToDelete?.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting ? <CustomLoader /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
