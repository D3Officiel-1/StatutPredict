
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, PricingItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { addHours, addDays, addWeeks, addMonths, format } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ActivatePlanDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  duration: z.string().min(1, 'Veuillez sélectionner une durée.'),
});

const planDurations = [
    { value: 'hourly', label: 'Horaire' },
    { value: 'daily', label: 'Journalier' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
];

export default function ActivatePlanDialog({ user, open, onOpenChange }: ActivatePlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const currentPlan = user.pricingData?.[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: currentPlan?.idplan_jetpredict || 'monthly',
    },
  });

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    return 'N/A';
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user.uid) {
        toast({
            title: 'Erreur',
            description: 'UID de l\'utilisateur non trouvé.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const planRef = doc(db, 'users', user.uid, 'pricing', 'jetpredict');
      const startDate = new Date();
      let endDate: Date;

      switch (values.duration) {
          case 'hourly':
              endDate = addHours(startDate, 1);
              break;
          case 'daily':
              endDate = addDays(startDate, 1);
              break;
          case 'weekly':
              endDate = addWeeks(startDate, 1);
              break;
          case 'monthly':
              endDate = addMonths(startDate, 1);
              break;
          default:
              endDate = addMonths(startDate, 1);
      }
      
      await setDoc(planRef, {
        idplan_jetpredict: values.duration,
        actif_jetpredict: true,
        startdate: startDate,
        findate: endDate,
      });

      const selectedPlan = planDurations.find(p => p.value === values.duration);

      toast({
        title: 'Forfait activé !',
        description: `Le forfait pour ${user.username || user.email} a été activé en mode ${selectedPlan?.label}.`,
      });
      onOpenChange(false);
      form.reset();

    } catch (error) {
      console.error("Error activating plan: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'activer le forfait. Veuillez réessayer.",
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
                <h2 className="text-lg font-semibold">Gérer le forfait de {user.username || user.email}</h2>
                <p className="text-sm text-muted-foreground">Activez ou modifiez le forfait "JetPredict".</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
              </Button>
            </div>

            {currentPlan && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className='text-base'>Forfait Actuel</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Statut:</span>
                            <Badge variant={currentPlan.actif_jetpredict ? 'default' : 'destructive'} className={currentPlan.actif_jetpredict ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                                {currentPlan.actif_jetpredict ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span className="font-medium capitalize">{currentPlan.idplan_jetpredict}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Début:</span>
                            <span className="font-medium">{formatDate(currentPlan.startdate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fin:</span>
                            <span className="font-medium">{formatDate(currentPlan.findate)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée du forfait</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez une durée" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {planDurations.map(d => (
                                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                   <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <CustomLoader /> : 'Activer le forfait'}
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
