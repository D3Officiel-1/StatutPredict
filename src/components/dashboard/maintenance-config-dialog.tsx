
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, addDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, MediaItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Sparkles, Upload, X, GalleryHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { Checkbox } from '../ui/checkbox';
import { generateMaintenanceMessage } from '@/ai/flows/maintenance-message-generator';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MediaLibrary from './media-library';
import { Switch } from '../ui/switch';


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
  mediaUrl: z.string().url().optional().or(z.literal('')),
  targetUsers: z.array(z.string()).optional(),
  status: z.boolean().optional(),
});

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

const userTiers = [
    { id: 'hourly', label: 'Horaire' },
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
];

export default function MaintenanceConfigDialog({ app, children, open, onOpenChange }: MaintenanceConfigDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(app.maintenanceConfig?.mediaUrl || null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenanceMessage: app.maintenanceConfig?.message || `Notre service ${app.name} est actuellement en cours de maintenance. Nous nous excusons pour la gêne occasionnée.`,
      buttonTitle: app.maintenanceConfig?.buttonTitle || '',
      buttonUrl: app.maintenanceConfig?.buttonUrl || '',
      mediaUrl: app.maintenanceConfig?.mediaUrl || '',
      targetUsers: app.maintenanceConfig?.targetUsers || [],
      status: app.maintenanceConfig?.status || false,
    },
  });

  useEffect(() => {
    if (open) {
      const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const mediaData: MediaItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MediaItem));
        setMediaLibrary(mediaData);
      });
      return () => unsubscribe();
    }
  }, [open]);

  useEffect(() => {
    const mediaUrl = app.maintenanceConfig?.mediaUrl || '';
    form.reset({
      maintenanceMessage: app.maintenanceConfig?.message || `Notre service ${app.name} est actuellement en cours de maintenance. Nous nous excusons pour la gêne occasionnée.`,
      buttonTitle: app.maintenanceConfig?.buttonTitle || '',
      buttonUrl: app.maintenanceConfig?.buttonUrl || '',
      mediaUrl: mediaUrl,
      targetUsers: app.maintenanceConfig?.targetUsers || [],
      status: app.maintenanceConfig?.status || false,
    });
    setUploadedMediaUrl(mediaUrl);
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


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const appRef = doc(db, 'applications', app.id);
      await updateDoc(appRef, {
        maintenanceConfig: {
          message: values.maintenanceMessage,
          buttonTitle: values.buttonTitle,
          buttonUrl: values.buttonUrl,
          mediaUrl: uploadedMediaUrl,
          targetUsers: values.targetUsers || [],
          status: values.status,
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
    <>
      <div onClick={() => onOpenChange(true)}>
          {children}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              className="bg-card w-full max-w-2xl h-full flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                    <h2 className="text-xl font-bold font-headline">Maintenance pour {app.name}</h2>
                    <p className="text-sm text-muted-foreground">Configurez la page de maintenance.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                    <div className="p-6 space-y-8 flex-1">
                      <div className="space-y-4">
                          <FormField
                              control={form.control}
                              name="maintenanceMessage"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel className="text-base">Message de maintenance</FormLabel>
                                      <FormControl>
                                          <Textarea rows={4} {...field} className="text-base" />
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
                          <div className="space-y-4 rounded-lg border bg-background/50 p-4 mt-4">
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
                              {isUploading && <div className="flex justify-center py-4"><CustomLoader /></div>}
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

                      <div className="space-y-6 rounded-lg border bg-background/50 p-4">
                            <FormField
                                control={form.control}
                                name="targetUsers"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base font-semibold">Forfaits ciblés (Optionnel)</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                        Cochez les forfaits qui seront affectés par cette maintenance.
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
                                                className="flex flex-row items-center space-x-3 space-y-0 bg-background/50 p-3 rounded-md border"
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
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background/50 p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Activer la maintenance ciblée</FormLabel>
                                        <p className='text-sm text-muted-foreground'>
                                            Met en maintenance uniquement pour les forfaits sélectionnés.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                      </div>

                      <div className="space-y-4 rounded-lg border bg-background/50 p-4">
                          <h4 className="text-base font-semibold">Bouton d'action (Optionnel)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                    </div>
                    
                    <div className="p-6 border-t bg-background/90 sticky bottom-0">
                      <Button type="submit" disabled={isSubmitting || isUploading} className="w-full text-lg py-6">
                        {isSubmitting ? <CustomLoader /> : 'Enregistrer la configuration'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

