
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { autoPostToTelegram } from '@/ai/flows/auto-telegram-poster';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Bot, Sparkles } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';

const formSchema = z.object({
  topic: z.string().min(5, { message: 'Le sujet doit contenir au moins 5 caractères.' }),
});

export default function AutoPoster() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setGeneratedPost(null);
    try {
      const result = await autoPostToTelegram({
        topic: values.topic,
      });

      if (result.success) {
        toast({
          title: 'Publication réussie !',
          description: `Le message a été généré et publié sur votre canal Telegram.`,
        });
        setGeneratedPost(result.generatedContent);
        form.reset();
      } else {
        throw new Error('La publication sur Telegram a échoué.');
      }
    } catch (error) {
      console.error('Error in auto-poster:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de générer ou de publier le message. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center">
        <div className="w-full max-w-2xl">
            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle as="h2" className="flex items-center gap-2 text-2xl font-bold tracking-tight font-headline">
                            <Bot />
                            Contenu Automatisé
                        </CardTitle>
                        <CardDescription>
                            Entrez un sujet et laissez l'IA créer et publier un message engageant sur votre canal Telegram.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-base font-semibold">Sujet du message</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Ex: Les avantages de l'IA dans le sport, Analyse du match de ce soir, etc."
                                rows={3}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        {generatedPost && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Dernier message généré :</h3>
                                <div className="p-4 border rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
                                    {generatedPost}
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                        {isSubmitting ? <CustomLoader /> : <><Sparkles className="mr-2" /> Générer et Publier</>}
                        </Button>
                    </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    </div>
  );
}
