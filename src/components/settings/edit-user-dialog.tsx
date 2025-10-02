
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, Save } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (user: User) => void;
}

const formSchema = z.object({
  username: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères.'),
  email: z.string().email("L'email n'est pas valide."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  favoriteGame: z.string().optional(),
  pronosticCode: z.string().optional(),
  referralCode: z.string().optional(),
  photoURL: z.string().url('URL invalide').optional().or(z.literal('')),
  telegramLinkToken: z.string().optional(),
});

export default function EditUserDialog({ user, open, onOpenChange, onUserUpdate }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      gender: user.gender || '',
      favoriteGame: user.favoriteGame || '',
      pronosticCode: user.pronosticCode || '',
      referralCode: user.referralCode || '',
      photoURL: user.photoURL || '',
      telegramLinkToken: user.telegramLinkToken || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user.uid) {
        toast({ title: 'Erreur: UID utilisateur manquant', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, values);
      
      const updatedUser = { ...user, ...values };
      onUserUpdate(updatedUser);

      toast({
        title: 'Utilisateur mis à jour',
        description: `Les informations de ${values.username} ont été enregistrées.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'utilisateur.',
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-card w-full max-w-2xl h-full flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold font-headline">Modifier {user.username || user.email}</h2>
                <p className="text-sm text-muted-foreground">Mettez à jour les informations de l'utilisateur.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                  <div className="p-6 space-y-8 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Pseudo</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl><Input type="email" {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Prénom</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Nom</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                       <FormField
                              control={form.control}
                              name="photoURL"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>URL de la photo de profil</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Téléphone</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Genre</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                              control={form.control}
                              name="favoriteGame"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Jeu favori</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="pronosticCode"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Code Pronostic</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                       <FormField
                          control={form.control}
                          name="referralCode"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Code de Parrainage</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="telegramLinkToken"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Token de lien Telegram</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                  </div>

                  <div className="p-6 border-t bg-background/90 sticky bottom-0">
                    <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6">
                      {isSubmitting ? <CustomLoader /> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
