'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Application } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { Checkbox } from '../ui/checkbox';
import { generateMaintenanceMessage } from '@/ai/flows/maintenance-message-generator';

interface MaintenanceConfigDialogProps {
  app: Application;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  maintenanceMessage: z.string().min(10, 'Le message doit contenir au moins 10 caractères.'),
  buttonTitle: z.string().optional(),
  buttonUrl: z.string().url('Veuillez entrer une URL valide.').optional().or(z.literal('')),
  targetUsers: z.array(z.string()).optional(),
});

const userTiers = [
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
    { id: 'annual', label: 'Annuel' },
];

export default function MaintenanceConfigDialog({ app, children, open, onOpenChange }: MaintenanceConfigDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenanceMessage: app.maintenanceConfig?.message || `Notre service ${app.name} est actuellement en cours de maintenance. Nous nous excusons pour la gêne occasionnée.`,
      buttonTitle: app.maintenanceConfig?.buttonTitle || '',
      buttonUrl: app.maintenanceConfig?.buttonUrl || '',
      targetUsers: app.maintenanceConfig?.targetUsers || [],
    },
  });

  useEffect(() => {
    form.reset({
      maintenanceMessage: app.maintenanceConfig?.message || `Notre service ${app.name} est actuellement en cours de maintenance. Nous nous excusons pour la gêne occasionnée.`,
      buttonTitle: app.maintenanceConfig?.buttonTitle || '',
      buttonUrl: app.maintenanceConfig?.buttonUrl || '',
      targetUsers: app.maintenanceConfig?.targetUsers || [],
    });
  }, [app, form, open]);

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    try {
        const result = await generateMaintenanceMessage({ appName: app.name });
        if (result.message) {
            form.setValue('maintenanceMessage', result.message, { shouldValidate: true });
        } else {
            toast({
                title: 'Erreur',
                description: 'Impossible de générer un message de maintenance.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        console.error('Error generating maintenance message:', error);
        toast({
            title: 'Erreur',
            description: 'Une erreur est survenue lors de la génération du message.',
            variant: 'destructive',
        });
    } finally {
        setIsGenerating(false);
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const appRef = doc(db, 'applications', app.id);
      await updateDoc(appRef, {
        maintenanceConfig: {
          message: values.maintenanceMessage,
          buttonTitle: values.buttonTitle,
          buttonUrl: values.buttonUrl,
          targetUsers: values.targetUsers,
        }
      });
      toast({
        title: 'Configuration enregistrée',
        description: `Les paramètres de maintenance pour ${app.name} ont été mis à jour.`,
      });
      onOpenChange(false);
    } catch(error) {
        console.error("Error updating maintenance config: ", error);
        toast({
            title: 'Erreur',
            description: 'Impossible d\'enregistrer la configuration. Veuillez réessayer.',
            variant: 'destructive',
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Maintenance pour {app.name}</DialogTitle>
          <DialogDescription>
            Configurez le message et les options pour la page de maintenance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <FormField
                    control={form.control}
                    name="maintenanceMessage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message de maintenance</FormLabel>
                            <FormControl>
                                <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateMessage} disabled={isGenerating}>
                    {isGenerating ? <CustomLoader /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Générer avec l'IA
                </Button>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <h4 className="text-sm font-medium">Bouton d'action (Optionnel)</h4>
                 <FormField
                    control={form.control}
                    name="buttonTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre du bouton</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Suivez-nous sur X" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="buttonUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL de redirection</FormLabel>
                            <FormControl>
                                <Input placeholder="https://x.com/username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="targetUsers"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Utilisateurs ciblés</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Affichez la page de maintenance uniquement pour certains forfaits.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {userTiers.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="targetUsers"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <CustomLoader /> : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
