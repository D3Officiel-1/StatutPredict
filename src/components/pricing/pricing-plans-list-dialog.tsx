
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, PricingPlan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash, PlusCircle, Star, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
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
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

interface PricingPlansListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
  onAddPlan: () => void;
  onEditPlan: (plan: PricingPlan) => void;
}

const periodLabels: { [key: string]: string } = {
    hourly: 'heure',
    daily: 'jour',
    weekly: 'semaine',
    monthly: 'mois',
};

const PlanCard = ({ plan, onEdit, onDelete }: { plan: PricingPlan, onEdit: () => void, onDelete: () => void }) => {
    return (
        <div className={cn(
            "relative border rounded-lg p-6 flex flex-col transition-all bg-card/80",
            plan.popular && "border-primary/50 ring-2 ring-primary/30"
        )}>
            {plan.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" /> Populaire
                </div>
            )}
            <div className="flex-grow">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-2 my-4">
                     {plan.promoPrice != null && <span className="text-2xl font-bold line-through text-muted-foreground/50">{plan.price.toLocaleString()}</span>}
                    <span className="text-4xl font-extrabold text-foreground">{(plan.promoPrice ?? plan.price).toLocaleString()}</span>
                    <div className="flex flex-col">
                        <span className="font-semibold">{plan.currency}</span>
                        <span className="text-sm text-muted-foreground">/ {periodLabels[plan.period]}</span>
                    </div>
                </div>
                <Separator className="my-6" />
                <ul className="space-y-3 text-sm flex-grow">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                    {plan.missingFeatures?.map((feature, i) => (
                         <li key={`missing-${i}`} className="flex items-center gap-3 text-muted-foreground/70">
                            <XCircle className="h-5 w-5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-8 flex gap-2">
                <Button variant="outline" className="w-full" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                </Button>
                <Button variant="destructive" size="icon" onClick={onDelete}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

const PlanSkeleton = () => (
    <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
        <Separator />
        <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10" />
        </div>
    </div>
)


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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-card/90 border border-border/50 p-6 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold">Forfaits pour {app.name}</h2>
                <p className="text-sm text-muted-foreground">Gérez les plans tarifaires de l'application.</p>
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

            <div className="flex-grow overflow-y-auto pr-2">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)}
                    </div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                           <PlanCard 
                                key={plan.id}
                                plan={plan}
                                onEdit={() => onEditPlan(plan)}
                                onDelete={() => openDeleteDialog(plan)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-semibold">Aucun forfait trouvé</h3>
                        <p className="text-muted-foreground mt-1">Commencez par ajouter un nouveau plan tarifaire pour cette application.</p>
                    </div>
                )}
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
