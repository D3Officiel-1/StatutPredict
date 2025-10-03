
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateNotificationSuggestions, type NotificationSuggestionsInput } from '@/ai/flows/intelligent-notification-suggestions';
import { collection, onSnapshot, addDoc, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, MediaItem } from '@/types';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send, Upload, GalleryHorizontal } from 'lucide-react';
import CustomLoader from '@/components/ui/custom-loader';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaLibrary } from '@components/dashboard/media-library';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const formSchema = z.object({
  currentEvents: z.string().min(10, { message: 'Veuillez décrire les événements actuels (min. 10 caractères).' }),
  appType: z.string().min(1, { message: "Le type d'application est requis." }),
  notificationMessage: z.string().min(5, { message: 'Le message de notification est requis (min. 5 caractères).' }),
  targetApps: z.array(z.string()).min(1, { message: 'Veuillez sélectionner au moins une application.' }),
  targetUsers: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional().or(z.literal('')),
});

const userTiers = [
    { id: 'hourly', label: 'Horaire' },
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
];

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

export default function NotificationForm() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApplications(appsData);
    });

    const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
    const unsubscribeMedia = onSnapshot(q, (snapshot) => {
        const mediaData: MediaItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MediaItem));
        setMediaLibrary(mediaData);
    });

    return () => {
        unsubscribeApps();
        unsubscribeMedia();
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentEvents: '',
      appType: 'Application SaaS',
      notificationMessage: '',
      targetApps: [],
      targetUsers: [],
      mediaUrl: '',
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
        description: "Veuillez remplir les champs 'Événements actuels' et 'Type d\\'application'.",
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
        description: 'Le média a été sélectionné depuis la bibliothèque.',
    })
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const notificationData = {
        message: values.notificationMessage,
        targetUsers: values.targetUsers,
        currentEvents: values.currentEvents,
        mediaUrl: uploadedMediaUrl,
        createdAt: new Date(),
      };

      values.targetApps.forEach(appId => {
        const appRef = doc(db, 'applications', appId);
        const notificationCollectionRef = collection(appRef, 'notifications');
        const newNotificationRef = doc(notificationCollectionRef);
        batch.set(newNotificationRef, notificationData);
      });
      
      await batch.commit();

      toast({
        title: 'Notification envoyée !',
        description: `Message envoyé et sauvegardé pour ${values.targetApps.length} application(s).`,
      });
      form.reset();
      setSuggestions([]);
      setUploadedMediaUrl(null);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d envoyer ou de sauvegarder la notification.',
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
              Créateur de Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="p-6 border rounded-lg bg-background/50">
                <FormField
                control={form.control}
                name="currentEvents"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-base font-semibold">
                      <span className="sm:hidden">Événements</span>
                      <span className="hidden sm:inline">Événements actuels</span>
                    </FormLabel>
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
                className="w-full mt-4"
                >
                {isGenerating ? <CustomLoader /> : <><Sparkles className="mr-2" />Générer des suggestions</>}
                </Button>
                
                {suggestions.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Suggestions IA :</p>
                    <ScrollArea className="h-32 rounded-md border p-2 bg-background">
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
            </div>

            <div className="p-6 border rounded-lg bg-background/50 space-y-6">
                <FormField
                control={form.control}
                name="notificationMessage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-base font-semibold">Message de notification</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Votre message pour les utilisateurs..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">
                            <Upload className="mr-2 h-4 w-4"/>
                            Téléverser un média
                        </TabsTrigger>
                        <TabsTrigger value="library">
                            <GalleryHorizontal className="mr-2 h-4 w-4"/>
                            Bibliothèque
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                        <div className="space-y-4 rounded-md border p-4 mt-4 bg-background">
                            <h4 className="text-sm font-medium">Média (image, vidéo, audio)</h4>
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
                            {isUploading && <CustomLoader />}
                            {uploadedMediaUrl && !isUploading && (
                                <div className="mt-2 relative w-full h-48 bg-muted rounded-md overflow-hidden">
                                    {uploadedMediaUrl.includes('video') ? (
                                        <video src={uploadedMediaUrl} controls className="w-full h-full object-contain" />
                                    ) : uploadedMediaUrl.includes('audio') ? (
                                        <div className="flex items-center justify-center h-full"><audio src={uploadedMediaUrl} controls className="w-full" /></div>
                                    ) : (
                                        <Image src={uploadedMediaUrl} alt="Média téléversé" layout="fill" className="object-contain" />
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="library">
                        <div className="mt-4">
                            <MediaLibrary mediaItems={mediaLibrary} onSelect={handleMediaSelect} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-background/50">
                <FormField
                control={form.control}
                name="targetApps"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-base font-semibold">Applications cibles</FormLabel>
                        <Select onValueChange={(value) => {
                        if (value === 'all') {
                            field.onChange(applications.map(app => app.id));
                        } else {
                            field.onChange(value ? value.split(',') : []);
                        }
                        }}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une ou plusieurs apps" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {applications.length > 0 && (
                                    <SelectItem value="all">Toutes les applications</SelectItem>
                                )}
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
                    <div className="mb-2">
                        <FormLabel className="text-base font-semibold">Utilisateurs ciblés</FormLabel>
                        <p className="text-xs text-muted-foreground">
                        Ciblez certains forfaits.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <CustomLoader /> : <><Send className="mr-2" />Envoyer la notification</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
