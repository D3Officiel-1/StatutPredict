
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, addDoc, collection, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, ReferralItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, PlusCircle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

interface ManageReferralDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const referralSchema = z.object({
  fromUser: z.string().min(1, 'Le nom de l\'utilisateur est requis.'),
  amount: z.coerce.number().min(1, 'Le montant doit être supérieur à 0.'),
  plan: z.string().min(1, 'Le nom du plan est requis.'),
});

const balanceSchema = z.object({
    newBalance: z.coerce.number().min(0, 'Le solde ne peut pas être négatif.'),
});


export default function ManageReferralDialog({ user, open, onOpenChange }: ManageReferralDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const { toast } = useToast();
  
  const referralForm = useForm<z.infer<typeof referralSchema>>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      fromUser: '',
      amount: 0,
      plan: '',
    },
  });

  const balanceForm = useForm<z.infer<typeof balanceSchema>>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
        newBalance: user.referralBalance || 0,
    },
  });

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    return 'N/A';
  };

  const handleAddReferral = async (values: z.infer<typeof referralSchema>) => {
    if (!user.uid) return;
    setIsSubmitting(true);
    try {
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.uid);
        const referralRef = collection(userRef, 'referral');
        
        const newReferral = {
            fromUser: values.fromUser,
            amount: values.amount,
            plan: values.plan,
            date: new Date(),
        };
        batch.set(doc(referralRef), newReferral);

        const newBalance = (user.referralBalance || 0) + values.amount;
        batch.update(userRef, { referralBalance: newBalance });

        await batch.commit();
        
        toast({
            title: 'Parrainage ajouté',
            description: `Le parrainage de ${values.amount} FCFA a été ajouté pour ${user.username}.`,
        });
        referralForm.reset();
    } catch (error) {
        console.error("Error adding referral: ", error);
        toast({
            title: 'Erreur',
            description: 'Impossible d\'ajouter le parrainage.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleUpdateBalance = async (values: z.infer<typeof balanceSchema>) => {
    if (!user.uid) return;
    setIsUpdatingBalance(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            referralBalance: values.newBalance,
        });
        toast({
            title: 'Solde mis à jour',
            description: `Le solde de parrainage de ${user.username} est maintenant de ${values.newBalance} FCFA.`,
        });
    } catch (error) {
        console.error("Error updating balance: ", error);
        toast({
            title: 'Erreur',
            description: 'Impossible de mettre à jour le solde.',
            variant: 'destructive',
        });
    } finally {
        setIsUpdatingBalance(false);
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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Parrainages de {user.username || user.email}</h2>
                <p className="text-sm text-muted-foreground">Consultez, ajoutez des parrainages et gérez le solde.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Historique des parrainages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <div className="space-y-4">
                            {user.referralData && user.referralData.length > 0 ? (
                                user.referralData.map((referral, index) => (
                                    <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p><span className="font-semibold">De:</span> {referral.fromUser}</p>
                                                <p><span className="font-semibold">Montant:</span> {referral.amount} FCFA</p>
                                            </div>
                                            <div>
                                                <p><span className="font-semibold">Plan:</span> {referral.plan}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(referral.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-10">Aucun parrainage pour cet utilisateur.</p>
                            )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Modifier le solde</CardTitle>
                        </CardHeader>
                        <Form {...balanceForm}>
                            <form onSubmit={balanceForm.handleSubmit(handleUpdateBalance)}>
                                <CardContent>
                                    <FormField
                                    control={balanceForm.control}
                                    name="newBalance"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Nouveau solde (FCFA)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </CardContent>
                                <CardFooter>
                                     <Button type="submit" disabled={isUpdatingBalance} className="w-full">
                                        {isUpdatingBalance ? <CustomLoader /> : <Save />}
                                        Enregistrer le solde
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ajouter un parrainage</CardTitle>
                        </CardHeader>
                         <Form {...referralForm}>
                            <form onSubmit={referralForm.handleSubmit(handleAddReferral)}>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={referralForm.control}
                                        name="fromUser"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>De l'utilisateur</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nom de l'utilisateur parrain" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={referralForm.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Montant (FCFA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={referralForm.control}
                                        name="plan"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Plan souscrit</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Mensuel" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? <CustomLoader /> : <PlusCircle />}
                                        Ajouter le parrainage
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
