
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';
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
import { X, Save, Users, PlusCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import AddReferralCommissionDialog from './add-referral-commission-dialog';


interface ManageReferralDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (user: User) => void;
}

const balanceSchema = z.object({
    newBalance: z.coerce.number().min(0, 'Le solde ne peut pas être négatif.'),
});


export default function ManageReferralDialog({ user, open, onOpenChange, onUserUpdate }: ManageReferralDialogProps) {
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [selectedFilleul, setSelectedFilleul] = useState<User | null>(null);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const balanceForm = useForm<z.infer<typeof balanceSchema>>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
        newBalance: user.solde_referral || 0,
    },
  });

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) { // Firestore Timestamp
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    if (timestamp instanceof Date) { // JavaScript Date object
        return format(timestamp, 'dd/MM/yyyy HH:mm');
    }
    return 'N/A';
  };

  const copyToClipboard = (text: string | undefined) => {
    if(!text) {
        toast({
            title: "Erreur",
            description: "Aucun code à copier.",
            variant: "destructive",
        });
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: "Le code a été copié dans le presse-papiers.",
      });
    }, (err) => {
      toast({
        title: "Erreur",
        description: "Impossible de copier le code.",
        variant: "destructive",
      });
      console.error('Could not copy text: ', err);
    });
  };

  const handleUpdateBalance = async (values: z.infer<typeof balanceSchema>) => {
    if (!user.uid) return;
    setIsUpdatingBalance(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            solde_referral: values.newBalance,
        });

        const updatedUser = { ...user, solde_referral: values.newBalance };
        onUserUpdate(updatedUser);

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

  const handleFilleulClick = (filleul: User) => {
    setSelectedFilleul(filleul);
    setIsCommissionDialogOpen(true);
  }

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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
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
                                        {isUpdatingBalance ? <CustomLoader /> : <><Save className="mr-2" />Enregistrer le solde</>}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Code de parrainage</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <span className="font-mono text-sm">{user.referralCode || 'N/A'}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(user.referralCode)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Filleuls ({user.referrals?.length ?? 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48">
                                <div className="space-y-2">
                                    {user.referrals && user.referrals.length > 0 ? (
                                        user.referrals.map((filleul) => (
                                            <div key={filleul.id} className="p-2 bg-muted/50 rounded-md text-sm cursor-pointer hover:bg-muted" onClick={() => handleFilleulClick(filleul)}>
                                                <p className="font-medium">{filleul.username || filleul.email}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-10">Aucun filleul pour cet utilisateur.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Historique des commissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[35rem]">
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
                                    <p className="text-sm text-muted-foreground text-center py-10">Aucune commission reçue.</p>
                                )}
                                </div>
                            </ScrollArea>
                        </CardContent>
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
    {selectedFilleul && (
        <AddReferralCommissionDialog
            parrain={user}
            filleul={selectedFilleul}
            open={isCommissionDialogOpen}
            onOpenChange={setIsCommissionDialogOpen}
            onCommissionAdded={(updatedUser) => {
                onUserUpdate(updatedUser);
                balanceForm.setValue('newBalance', updatedUser.solde_referral || 0);
            }}
        />
    )}
    </>
  );
}
