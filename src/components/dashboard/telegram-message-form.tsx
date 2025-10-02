
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendTelegramMessage } from '@/ai/flows/send-telegram-message';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';

const formSchema = z.object({
  message: z.string().min(1, { message: 'Le message ne peut pas être vide.' }),
});

export default function TelegramMessageForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await sendTelegramMessage({ message: values.message });

      if (result.success) {
        toast({
          title: 'Message envoyé !',
          description: `Votre message a été publié sur le canal Telegram.`,
        });
        form.reset();
      } else {
        throw new Error('La réponse du flux indique un échec.');
      }
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message sur Telegram. Vérifiez la configuration de votre bot et du canal.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle as="h2" className="text-2xl font-bold tracking-tight font-headline">
              Publier sur Telegram
            </CardTitle>
            <CardDescription>
                Rédigez un message à envoyer sur votre canal Telegram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Annonce importante, nouvelle fonctionnalité, ou simple bonjour..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? <CustomLoader /> : <><MessageSquare className="mr-2" /> Publier le message</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
