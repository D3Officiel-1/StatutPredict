
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, PricingPlan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

interface PricingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
  pricingPlan: PricingPlan | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, 'Le nom du plan doit contenir au moins 3 caractères.'),
  price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif.'),
  promoPrice: z.coerce.number().optional(),
  currency: z.string().min(2, 'La devise est requise.').default('FCFA'),
  period: z.enum(['daily', 'weekly', 'monthly', 'annual']),
  features: z.string().min(10, 'Listez au moins une fonctionnalité.'),
  missingFeatures: z.string().optional(),
  popular: z.boolean().default(false),
});

const periodOptions = [
    { value: 'daily', label: 'Journalier' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'annual', label: 'Annuel' },
];

export default function PricingFormDialog({ open, onOpenChange, app, pricingPlan, onSuccess }: PricingFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!pricingPlan;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      promoPrice: undefined,
      currency: 'FCFA',
      period: 'monthly',
      features: '',
      missingFeatures: '',
      popular: false,
    },
  });

  useEffect(() => {
    if (open && pricingPlan) {
      form.reset({
        name: pricingPlan.name,
        price: pricingPlan.price,
        promoPrice: pricingPlan.promoPrice || undefined,
        currency: pricingPlan.currency,
        period: pricingPlan.period,
        features: pricingPlan.features.join('\n'),
        missingFeatures: pricingPlan.missingFeatures?.join('\n') || '',
        popular: pricingPlan.popular || false,
      });
    } else if (open && !pricingPlan) {
      form.reset({
        name: '',
        price: 0,
        promoPrice: undefined,
        currency: 'FCFA',
        period: 'monthly',
        features: '',
        missingFeatures: '',
        popular: false,
      });
    }
  }, [pricingPlan, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...values,
        promoPrice: values.promoPrice || null,
        features: values.features.split('\n').filter(f => f.trim() !== ''),
        missingFeatures: values.missingFeatures?.split('\n').filter(f => f.trim() !== '') || [],
        appId: app.id,
      };
      
      const collectionRef = collection(db, `applications/${app.id}/plans`);

      if (isEditing && pricingPlan) {
        const docRef = doc(collectionRef, pricingPlan.id);
        await updateDoc(docRef, dataToSave);
        toast({ title: 'Forfait modifié', description: `Le forfait "${values.name}" a été mis à jour.` });
      } else {
        await addDoc(collectionRef, dataToSave);
        toast({ title: 'Forfait ajouté', description: `Le forfait "${values.name}" a été créé avec succès.` });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving pricing plan: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le forfait.',
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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">{isEditing ? 'Modifier le forfait' : 'Ajouter un forfait'} pour {app.name}</h2>
                <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du forfait</FormLabel>
                      <FormControl><Input placeholder="Premium" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prix</FormLabel>
                        <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="promoPrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prix promotionnel (optionnel)</FormLabel>
                        <FormControl><Input type="number" placeholder="4000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Période de facturation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une période" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {periodOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fonctionnalités incluses</FormLabel>
                        <FormControl><Textarea placeholder="Fonctionnalité 1\nFonctionnalité 2\nFonctionnalité 3" rows={5} {...field} /></FormControl>
                        <FormDescription>Entrez chaque fonctionnalité sur une nouvelle ligne.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="missingFeatures"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fonctionnalités manquantes (optionnel)</FormLabel>
                        <FormControl><Textarea placeholder="Fonctionnalité A\nFonctionnalité B" rows={3} {...field} /></FormControl>
                        <FormDescription>Listez les fonctionnalités non incluses dans ce plan.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="popular"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Marquer comme populaire</FormLabel>
                            <FormDescription>
                                Met en évidence ce forfait sur la page de tarification.
                            </FormDescription>
                        </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 mt-8">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <CustomLoader /> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
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
