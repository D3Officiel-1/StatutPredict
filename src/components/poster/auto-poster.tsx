
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { autoPostToTelegram } from '@/ai/flows/auto-telegram-poster';
import { pinTelegramMessage } from '@/ai/flows/pin-telegram-message';
import { unpinTelegramMessage } from '@/ai/flows/unpin-telegram-message';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Bot, Sparkles, Pin, PinOff } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';

const postFormSchema = z.object({
  topic: z.string().min(5, { message: 'Le sujet doit contenir au moins 5 caractères.' }),
});

const pinFormSchema = z.object({
  messageId: z.coerce.number().min(1, { message: "L'ID du message est requis." }),
});

export default function AutoPoster() {
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{ content: string; messageId?: number } | null>(null);
  const { toast } = useToast();

  const postForm = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  const pinForm = useForm<z.infer<typeof pinFormSchema>>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: {
      messageId: undefined,
    },
  });

  async function onPostSubmit(values: z.infer<typeof postFormSchema>) {
    setIsSubmittingPost(true);
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
        setGeneratedPost({ content: result.generatedContent, messageId: result.messageId });
        postForm.reset();
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
      setIsSubmittingPost(false);
    }
  }

  async function handlePinAction(action: 'pin' | 'unpin') {
    const values = pinForm.getValues();
    if (!values.messageId) {
        pinForm.setError('messageId', { type: 'manual', message: "L'ID du message est requis." });
        return;
    }
    
    setIsSubmittingPin(true);
    try {
        const result = action === 'pin' 
            ? await pinTelegramMessage({ messageId: values.messageId })
            : await unpinTelegramMessage({ messageId: values.messageId });

        if (result.success) {
            toast({
                title: `Action réussie !`,
                description: `Le message ${values.messageId} a été ${action === 'pin' ? 'épinglé' : 'désépinglé'}.`,
            });
            pinForm.reset();
        } else {
            throw new Error(`L'action d'${action === 'pin' ? 'épinglage' : 'désépinglage'} a échoué.`);
        }
    } catch (error) {
        console.error(`Error ${action}ning message:`, error);
        toast({
            title: 'Erreur',
            description: `Impossible d'${action === 'pin' ? 'épingler' : 'désépingler'} le message.`,
            variant: 'destructive',
        });
    } finally {
        setIsSubmittingPin(false);
    }
  }

  return (
    <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-8">
            <Card>
                <Form {...postForm}>
                    <form onSubmit={postForm.handleSubmit(onPostSubmit)}>
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
                            control={postForm.control}
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
                                    <h3 className="font-semibold">Dernier message généré (ID: {generatedPost.messageId || 'N/A'}) :</h3>
                                    <div className="p-4 border rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
                                        {generatedPost.content}
                                    </div>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmittingPost}>
                            {isSubmittingPost ? <CustomLoader /> : <><Sparkles className="mr-2" /> Générer et Publier</>}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <Form {...pinForm}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <CardHeader>
                            <CardTitle as="h2" className="text-2xl font-bold tracking-tight font-headline">Gérer les Messages Épinglés</CardTitle>
                            <CardDescription>
                                Épinglez ou désépinglez un message important dans votre canal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={pinForm.control}
                                name="messageId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-base font-semibold">ID du Message</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Entrez l'ID du message Telegram" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-2">
                             <Button type="button" onClick={() => handlePinAction('pin')} className="w-full" variant="outline" disabled={isSubmittingPin}>
                                {isSubmittingPin ? <CustomLoader /> : <><Pin className="mr-2" /> Épingler</>}
                             </Button>
                             <Button type="button" onClick={() => handlePinAction('unpin')} className="w-full" variant="destructive" disabled={isSubmittingPin}>
                                {isSubmittingPin ? <CustomLoader /> : <><PinOff className="mr-2" /> Désépingler</>}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    </div>
  );
}
