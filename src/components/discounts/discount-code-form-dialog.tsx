'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DiscountCode } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

interface DiscountCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountCode: DiscountCode | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères.'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères.'),
  pourcentage: z.coerce.number().min(1, 'Le pourcentage doit être au moins 1.').max(100, 'Le pourcentage ne peut pas dépasser 100.'),
  debutdate: z.date({ required_error: 'La date de début est requise.' }),
  findate: z.date({ required_error: 'La date de fin est requise.' }),
  tous: z.boolean(),
  plan: z.string().optional(),
}).refine(data => data.findate >= data.debutdate, {
  message: "La date de fin ne peut pas être antérieure à la date de début.",
  path: ["findate"],
}).refine(data => data.tous || (!!data.plan && data.plan.length > 0), {
    message: "Veuillez sélectionner un plan si le code n'est pas pour tous les forfaits.",
    path: ["plan"],
});

const planOptions = [
    { value: 'hourly', label: 'Horaire' },
    { value: 'daily', label: 'Journalier' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
];

export default function DiscountCodeFormDialog({ open, onOpenChange, discountCode, onSuccess }: DiscountCodeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!discountCode;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: '',
      code: '',
      pourcentage: 0,
      debutdate: undefined,
      findate: undefined,
      tous: false,
      plan: '',
    },
  });

  useEffect(() => {
    if (open && discountCode) {
      form.reset({
        titre: discountCode.titre,
        code: discountCode.code,
        pourcentage: Number(discountCode.pourcentage),
        debutdate: discountCode.debutdate.toDate(),
        findate: discountCode.findate.toDate(),
        tous: discountCode.tous,
        plan: discountCode.plan,
      });
    } else if (open && !discountCode) {
      form.reset({
        titre: '',
        code: '',
        pourcentage: 0,
        debutdate: new Date(),
        findate: new Date(),
        tous: false,
        plan: '',
      });
    }
  }, [discountCode, open, form]);
  
  const isTous = form.watch('tous');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...values,
        pourcentage: String(values.pourcentage),
        plan: values.tous ? 'tous' : values.plan,
      };

      if (isEditing && discountCode) {
        const docRef = doc(db, 'promo', discountCode.id);
        await updateDoc(docRef, dataToSave);
        toast({ title: 'Code de réduction modifié', description: `Le code "${values.titre}" a été mis à jour.` });
      } else {
        await addDoc(collection(db, 'promo'), dataToSave);
        toast({ title: 'Code de réduction ajouté', description: `Le code "${values.titre}" a été créé avec succès.` });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving discount code: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le code de réduction.',
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
                <h2 className="text-lg font-semibold">{isEditing ? 'Modifier' : 'Ajouter'} un code de réduction</h2>
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
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl><Input placeholder="Promotion de Noël" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl><Input placeholder="NOEL2025" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="pourcentage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pourcentage de réduction (%)</FormLabel>
                        <FormControl><Input type="number" placeholder="50" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="debutdate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de début</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? (format(field.value, "PPP", { locale: fr })) : (<span>Choisir une date</span>)}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="findate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de fin</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? (format(field.value, "PPP", { locale: fr })) : (<span>Choisir une date</span>)}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < (form.getValues('debutdate') || new Date())}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                     <FormField
                        control={form.control}
                        name="tous"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Pour tous les forfaits</FormLabel>
                                <FormDescription>
                                    Si coché, ce code sera valable pour tous les types d'abonnement.
                                </FormDescription>
                            </div>
                            </FormItem>
                        )}
                    />
                </div>

                {!isTous && (
                    <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Forfait spécifique</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un forfait" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {planOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

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
