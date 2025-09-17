'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateNotificationSuggestions, type NotificationSuggestionsInput } from '@/ai/flows/intelligent-notification-suggestions';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application } from '@/types';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';
import { Checkbox } from '../ui/checkbox';

const formSchema = z.object({
  currentEvents: z.string().min(10, { message: 'Veuillez décrire les événements actuels (min. 10 caractères).' }),
  appType: z.string().min(1, { message: "Le type d'application est requis." }),
  notificationMessage: z.string().min(5, { message: 'Le message de notification est requis (min. 5 caractères).' }),
  targetApps: z.array(z.string()).min(1, { message: 'Veuillez sélectionner au moins une application.' }),
  targetUsers: z.array(z.string()).optional(),
});

const userTiers = [
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
    { id: 'annual', label: 'Annuel' },
];

export default function NotificationForm() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApplications(appsData);
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentEvents: '',
      appType: 'Application SaaS',
      notificationMessage: '',
      targetApps: [],
      targetUsers: [],
    },
  });

  const currentEventsValue = useWatch({
    control: form.control,
    name: 'currentEvents',
  });

  const handleGenerateSuggestions = async () => {
    const { currentEvents, appType } = form.getValues();
    if (!currentEvents || !appType) {
      toast({
        title: 'Erreur',
        description: "Veuillez remplir les champs 'Événements actuels' et 'Type d\'application'.",
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    setSuggestions([]);

    try {
      const input: NotificationSuggestionsInput = { currentEvents, appType };
      const result = await generateNotificationSuggestions(input);
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        toast({
          title: 'Aucune suggestion',
          description: "L'IA n'a pas pu générer de suggestions pour cet événement.",
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Erreur de génération',
        description: "Une erreur s'est produite lors de la génération des suggestions.",
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    form.setValue('notificationMessage', suggestion, { shouldValidate: true });
    setSuggestions([]);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Notification envoyée!',
      description: `Message envoyé à ${values.targetApps.length} application(s).`,
    });
    form.reset();
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle as="h4" className="font-headline text-base">
              Envoyer une notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="currentEvents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Événements actuels</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Décrivez un événement, ex: 'Mise à jour majeure du serveur prévue ce soir...'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || !currentEventsValue || currentEventsValue.length < 10}
              className="w-full"
            >
              {isGenerating ? (
                <CustomLoader />
              ) : (
                <Sparkles />
              )}
              <span>Générer des suggestions</span>
            </Button>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggestions IA :</p>
                <ScrollArea className="h-32 rounded-md border p-2">
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 rounded-md cursor-pointer bg-accent/50 hover:bg-accent"
                        onClick={() => useSuggestion(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <FormField
              control={form.control}
              name="notificationMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message de notification</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Votre message pour les utilisateurs..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetApps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applications cibles</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? [value] : [])}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une ou plusieurs apps" />
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
              name="targetUsers"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Utilisateurs ciblés</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Envoyez la notification uniquement pour certains forfaits.
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

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <Send />
              Envoyer la notification
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
