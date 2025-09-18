'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, addDoc, updateDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MaintenanceEvent, Application } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceEvent: MaintenanceEvent | null;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères.'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères.'),
  date: z.date({ required_error: 'La date de début est requise.' }),
  resolvedAt: z.date().optional(),
  status: z.string().min(2, 'Le statut est requis.'),
  appId: z.string().min(1, "L'application est requise."),
});

const statusOptions = ['En cours', 'Planifié', 'Résolu', 'Investigation'];

export default function MaintenanceFormDialog({ open, onOpenChange, maintenanceEvent, onSuccess }: MaintenanceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const { toast } = useToast();
  const isEditing = !!maintenanceEvent;

  useEffect(() => {
    if (open) {
      const q = query(collection(db, 'applications'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      });
      return () => unsubscribe();
    }
  }, [open]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      resolvedAt: undefined,
      status: 'Planifié',
      appId: '',
    },
  });

  useEffect(() => {
    if (open && maintenanceEvent) {
      form.reset({
        title: maintenanceEvent.title,
        description: maintenanceEvent.description,
        date: maintenanceEvent.date.toDate(),
        resolvedAt: maintenanceEvent.resolvedAt ? maintenanceEvent.resolvedAt.toDate() : undefined,
        status: maintenanceEvent.status,
        appId: maintenanceEvent.appId,
      });
    } else if (open && !maintenanceEvent) {
      form.reset({
        title: '',
        description: '',
        date: new Date(),
        resolvedAt: undefined,
        status: 'Planifié',
        appId: '',
      });
    }
  }, [maintenanceEvent, open, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const selectedApp = applications.find(app => app.id === values.appId);
      const dataToSave = {
        ...values,
        appName: selectedApp?.name || 'N/A',
      };

      if (isEditing && maintenanceEvent) {
        const docRef = doc(db, 'maintenance', maintenanceEvent.id);
        await updateDoc(docRef, dataToSave);
        toast({ title: 'Maintenance modifiée', description: `Le programme "${values.title}" a été mis à jour.` });
      } else {
        await addDoc(collection(db, 'maintenance'), dataToSave);
        toast({ title: 'Maintenance ajoutée', description: `Le programme "${values.title}" a été créé.` });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving maintenance event: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le programme de maintenance.',
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
                <h2 className="text-lg font-semibold">{isEditing ? 'Modifier' : 'Ajouter'} un programme de maintenance</h2>
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl><Input placeholder="Mise à jour des serveurs" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Nous effectuerons une mise à jour..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="appId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Application concernée</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une application" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {applications.map(app => (
                                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statut</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un statut" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {statusOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de l'événement</FormLabel>
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
                        name="resolvedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de résolution (optionnel)</FormLabel>
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
                                        disabled={(date) => date < (form.getValues('date') || new Date())}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
