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
  mediaUrl: z.string().url().optional().or(z.literal('')),
});

const userTiers = [
    { id: 'daily', label: 'Journalier' },
    { id: 'weekly', label: 'Hebdomadaire' },
    { id: 'monthly', label: 'Mensuel' },
    { id: 'annual', label: 'Annuel' },
];

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

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
      targetUsers: app.maintenanceConfig?.targetUsers || [],
      mediaUrl: app.maintenanceConfig?.mediaUrl || '',
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
      targetUsers: app.maintenanceConfig?.targetUsers || [],
      mediaUrl: mediaUrl,
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
          targetUsers: values.targetUsers,
          mediaUrl: uploadedMediaUrl,
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
              <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Maintenance pour {app.name}</h2>
                    <p className="text-sm text-muted-foreground">Configurez le message et les options pour la page de maintenance.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                </Button>
              </div>

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
                      <div className="space-y-4 rounded-md border p-4 mt-4">
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
                              <div className="mt-2 relative w-full h-48">
                                  {uploadedMediaUrl.includes('video') ? (
                                      <video src={uploadedMediaUrl} controls className="w-full h-full object-contain rounded-md" />
                                  ) : uploadedMediaUrl.includes('audio') ? (
                                      <audio src={uploadedMediaUrl} controls className="w-full" />
                                  ) : (
                                      <Image src={uploadedMediaUrl} alt="Média téléversé" layout="fill" className="rounded-md object-contain" />
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

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || isUploading}>
                      {isSubmitting ? <CustomLoader /> : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

    