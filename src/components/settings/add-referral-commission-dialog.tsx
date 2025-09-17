
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';
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
import { X, PlusCircle } from 'lucide-react';

interface AddReferralCommissionDialogProps {
  parrain: User;
  filleul: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommissionAdded: (updatedUser: User) => void;
}

const commissionSchema = z.object({
  plan: z.string().min(1, 'Le nom du plan est requis.'),
  amount: z.coerce.number().min(1, 'Le montant doit être supérieur à 0.'),
});

const planDurations = [
    { value: 'daily', label: 'Journalier' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'annual', label: 'Annuel' },
];

export default function AddReferralCommissionDialog({ parrain, filleul, open, onOpenChange, onCommissionAdded }: AddReferralCommissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof commissionSchema>>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      plan: '',
      amount: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof commissionSchema>) => {
    if (!parrain.uid) return;
    setIsSubmitting(true);
    try {
      const commissionAmount = values.amount * 0.20;
      
      const batch = writeBatch(db);
      const parrainRef = doc(db, 'users', parrain.uid);
      
      // 1. Create new commission entry in referral subcollection
      const newReferralRef = doc(collection(db, `users/${parrain.uid}/referral`));
      batch.set(newReferralRef, {
        fromUser: filleul.username || filleul.email,
        amount: values.amount,
        plan: values.plan,
        date: new Date(),
      });

      // 2. Update parrain's referral balance
      const newBalance = (parrain.solde_referral || 0) + commissionAmount;
      batch.update(parrainRef, { solde_referral: newBalance });

      await batch.commit();

      const updatedParrain = {
        ...parrain,
        solde_referral: newBalance,
        referralData: [
            ...(parrain.referralData || []),
            { 
                id: newReferralRef.id,
                fromUser: filleul.username || filleul.email,
                amount: values.amount,
                plan: values.plan,
                date: new Date(),
            }
        ]
      };
      onCommissionAdded(updatedParrain);
      
      toast({
        title: 'Commission ajoutée !',
        description: `${commissionAmount} FCFA ont été ajoutés au solde de ${parrain.username}.`,
      });
      form.reset();
      onOpenChange(false);
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Ajouter une commission</h2>
                <p className="text-sm text-muted-foreground">Pour le filleul : {filleul.username || filleul.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan souscrit par le filleul</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un forfait" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {planDurations.map(d => (
                                    <SelectItem key={d.value} value={d.label}>{d.label}</SelectItem>
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
                      <FormLabel>Montant payé par le filleul (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                   <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                   <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <CustomLoader /> : <><PlusCircle className="mr-2" />Ajouter la commission (20%)</>}
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
