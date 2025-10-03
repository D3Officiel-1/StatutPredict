
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendTelegramStory } from '@/ai/flows/send-telegram-story';
import { collection, onSnapshot, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MediaItem } from '@/types';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '@/components/ui/custom-loader';
import { Camera, Upload, GalleryHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from '@/components/dashboard/media-library';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

const formSchema = z.object({
  caption: z.string().min(1, { message: 'La légende ne peut pas être vide.' }),
  photoUrl: z.string().url({ message: 'Veuillez sélectionner ou téléverser une image.' }),
});

export default function TelegramStoryForm() {
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
      caption: '',
      photoUrl: '',
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
        form.setValue('photoUrl', data.secure_url, { shouldValidate: true });
        
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
    if (!media.type.startsWith('image/')) {
        toast({
            title: 'Média invalide',
            description: 'Veuillez sélectionner une image pour la story.',
            variant: 'destructive',
        });
        return;
    }
    setUploadedMediaUrl(media.url);
    form.setValue('photoUrl', media.url, { shouldValidate: true });
    toast({
        title: 'Image sélectionnée',
        description: "L'image est prête pour votre story.",
    })
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await sendTelegramStory({ 
        caption: values.caption,
        photoUrl: values.photoUrl
      });

      if (result.success) {
        toast({
          title: 'Story envoyée !',
          description: `Votre story a été publiée sur le canal Telegram.`,
        });
        form.reset();
        setUploadedMediaUrl(null);
      } else {
        throw new Error('La réponse du flux indique un échec.');
      }
    } catch (error) {
      console.error('Error sending Telegram story:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer la story sur Telegram. Vérifiez la configuration de votre bot et du canal.",
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
              Publier une Story sur Telegram
            </CardTitle>
            <CardDescription>
                Créez une publication avec une image et une légende pour votre canal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Légende</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre image, annoncez une nouveauté..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-base font-semibold">Image</FormLabel>
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
                              name="photoUrl"
                              render={() => (
                                  <FormItem>
                                      <FormControl>
                                          <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
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
                      <Image src={uploadedMediaUrl} alt="Image sélectionnée" layout="fill" className="object-contain" />
                  </div>
              )}
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <CustomLoader /> : <><Camera className="mr-2" /> Publier la Story</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
