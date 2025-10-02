
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, arrayUnion, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, PricingPlan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, Save } from 'lucide-react';
import { useEffect } from 'react';

interface AddReferralCommissionDialogProps {
  parrain: User;
  filleul: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommissionAdded: (updatedUser: User) => void;
}

const formSchema = z.object({
  planId: z.string().min(1, 'Veuillez sélectionner un forfait.'),
  amount: z.coerce.number().min(0, 'Le montant de la commission ne peut être négatif.'),
});

export default function AddReferralCommissionDialog({ parrain, filleul, open, onOpenChange, onCommissionAdded }: AddReferralCommissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (open) {
      const fetchPlans = async () => {
        if (!filleul.activeAppId) return;
        const plansCollectionRef = collection(db, `applications/${filleul.activeAppId}/plans`);
        const q = query(plansCollectionRef);
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PricingPlan));
        setPricingPlans(plans);
      };
      fetchPlans();
    }
  }, [open, filleul.activeAppId]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!parrain.uid) {
        toast({ title: 'Erreur: UID du parrain manquant', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
        const selectedPlan = pricingPlans.find(p => p.id === values.planId);
        if (!selectedPlan) {
            toast({ title: 'Erreur', description: 'Forfait sélectionné invalide.', variant: 'destructive' });
            setIsSubmitting(false);
            return;
        }

      const parrainRef = doc(db, 'users', parrain.uid);
      const newCommission = {
        fromUser: filleul.username || filleul.email,
        fromUserId: filleul.uid,
        amount: values.amount,
        plan: selectedPlan.name,
        date: new Date(),
      };

      const newBalance = (parrain.solde_referral || 0) + values.amount;

      await updateDoc(parrainRef, {
        referralCommissions: arrayUnion(newCommission),
        solde_referral: newBalance
      });
      
      const updatedParrain = {
          ...parrain,
          solde_referral: newBalance,
          referralCommissions: [...(parrain.referralCommissions || []), newCommission]
      };

      toast({
        title: 'Commission ajoutée',
        description: `Commission de ${values.amount} FCFA ajoutée pour ${parrain.username}.`,
      });
      onCommissionAdded(updatedParrain);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error adding commission: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la commission.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Ajouter une commission</h2>
                <p className="text-sm text-muted-foreground">Pour {parrain.username} de la part de {filleul.username}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Forfait souscrit par le filleul</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un forfait" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {pricingPlans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>{plan.name} - {plan.price} {plan.currency}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant de la commission (FCFA)</FormLabel>
                      <FormControl><Input type="number" placeholder="500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <CustomLoader /> : <><Save className="mr-2 h-4 w-4" /> Ajouter</>}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
