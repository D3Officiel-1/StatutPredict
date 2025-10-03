
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendTelegramMessage } from '@/ai/flows/send-telegram-message';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Upload, GalleryHorizontal } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';
import { collection, onSnapshot, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MediaItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from './media-library';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

const userTiers = [
    { id: 'hourly', label: 'Horaire' },
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
];

const formSchema = z.object({
  message: z.string().min(1, { message: 'Le message ne peut pas être vide.' }),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  targetUsers: z.array(z.string()).optional(),
});

export default function TelegramMessageForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
    const unsubscribeMedia = onSnapshot(q, (snapshot) => {
        const mediaData: MediaItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MediaItem));
        setMediaLibrary(mediaData);
    });
    return () => unsubscribeMedia();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      mediaUrl: '',
      targetUsers: [],
    },
  });
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedMediaUrl(data.secure_url);
        form.setValue('mediaUrl', data.secure_url, { shouldValidate: true });
        
        await addDoc(collection(db, 'media_library'), {
          url: data.secure_url,
          type: file.type,
          createdAt: new Date(),
        });
        
        toast({
          title: 'Téléversement réussi',
          description: 'Votre média a été téléversé et ajouté à la bibliothèque.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Erreur de téléversement',
        description: 'Impossible de téléverser le fichier. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    setUploadedMediaUrl(media.url);
    form.setValue('mediaUrl', media.url, { shouldValidate: true });
    toast({
        title: 'Média sélectionné',
    })
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Note: The actual targeting logic would happen server-side in the flow.
      // Here we are just passing the data.
      const result = await sendTelegramMessage({
        message: values.message,
        // photoUrl: uploadedMediaUrl || undefined,
        // targetUsers: values.targetUsers
      });

      if (result.success) {
        toast({
          title: 'Message envoyé !',
          description: `Votre message a été publié sur le canal Telegram.`,
        });
        form.reset();
        setUploadedMediaUrl(null);
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
                Rédigez un message de diffusion pour votre canal Telegram.
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
            
            <div>
              <FormLabel className="text-base font-semibold">Média (Optionnel)</FormLabel>
              <Tabs defaultValue="upload" className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">
                          <Upload className="mr-2 h-4 w-4"/>
                          Téléverser
                      </TabsTrigger>
                      <TabsTrigger value="library">
                          <GalleryHorizontal className="mr-2 h-4 w-4"/>
                          Bibliothèque
                      </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                      <div className="space-y-4 rounded-md border p-4 mt-4 bg-background">
                          <FormField
                              control={form.control}
                              name="mediaUrl"
                              render={() => (
                                  <FormItem>
                                      <FormControl>
                                          <Input type="file" accept="image/*,video/*,audio/*" onChange={handleFileUpload} disabled={isUploading} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                  </TabsContent>
                  <TabsContent value="library">
                      <div className="mt-4">
                          <MediaLibrary mediaItems={mediaLibrary} onSelect={handleMediaSelect} />
                      </div>
                  </TabsContent>
              </Tabs>

              {isUploading && <div className="mt-4"><CustomLoader /></div>}
              {uploadedMediaUrl && !isUploading && (
                  <div className="mt-4 relative w-full h-64 bg-muted rounded-md overflow-hidden border">
                      {uploadedMediaUrl.includes('video') ? (
                          <video src={uploadedMediaUrl} controls className="w-full h-full object-contain" />
                      ) : uploadedMediaUrl.includes('audio') ? (
                          <div className="flex items-center justify-center h-full"><audio src={uploadedMediaUrl} controls className="w-full" /></div>
                      ) : (
                          <Image src={uploadedMediaUrl} alt="Média sélectionné" layout="fill" className="object-contain" />
                      )}
                  </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="targetUsers"
              render={() => (
                  <FormItem className="rounded-lg border p-4">
                  <div className="mb-4">
                      <FormLabel className="text-base font-semibold">Ciblage de l'audience (Optionnel)</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Cochez les forfaits à cibler. Si aucun n'est coché, la diffusion est pour tous.
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                              <FormLabel className="font-normal text-sm">
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
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <CustomLoader /> : <><MessageSquare className="mr-2" /> Diffuser le message</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    