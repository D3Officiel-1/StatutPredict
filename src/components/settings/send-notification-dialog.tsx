
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, MediaItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, Send, Upload, GalleryHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from '@/components/dashboard/media-library';
import Image from 'next/image';

interface SendNotificationDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères.'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères.'),
  type: z.enum(['referral', 'subscription', 'info'], { required_error: 'Veuillez sélectionner un type.' }),
  link: z.string().url('URL invalide').optional().or(z.literal('')),
  mediaUrl: z.string().url().optional().or(z.literal('')),
});

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

export default function SendNotificationDialog({ user, open, onOpenChange }: SendNotificationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'info',
      link: '',
      mediaUrl: '',
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
      const data = await response.json();
      setUploadedMediaUrl(data.secure_url);
      form.setValue('mediaUrl', data.secure_url, { shouldValidate: true });
      toast({ title: 'Téléversement réussi!' });
    } catch (error) {
      toast({ title: 'Erreur de téléversement', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    setUploadedMediaUrl(media.url);
    form.setValue('mediaUrl', media.url, { shouldValidate: true });
    toast({ title: 'Média sélectionné' });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user.uid) {
        toast({ title: 'Erreur: UID utilisateur manquant', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    try {
      const notificationCollectionRef = collection(db, `users/${user.uid}/notifications`);
      await addDoc(notificationCollectionRef, {
        ...values,
        mediaUrl: uploadedMediaUrl,
        isRead: false,
        timestamp: serverTimestamp(),
      });
      
      toast({
        title: 'Notification envoyée',
        description: `La notification a été envoyée à ${user.username || user.email}.`,
      });
      form.reset();
      setUploadedMediaUrl(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending notification: ", error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la notification.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Envoyer à {user.username || user.email}</h2>
                <p className="text-sm text-muted-foreground">Rédigez et envoyez une notification personnelle.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl><Input placeholder="Commission de parrainage reçue" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Vous avez reçu 1000 FCFA..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type de notification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="referral">Parrainage</SelectItem>
                                <SelectItem value="subscription">Abonnement</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lien (optionnel)</FormLabel>
                        <FormControl><Input placeholder="/referral" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>Téléverser</TabsTrigger>
                    <TabsTrigger value="library"><GalleryHorizontal className="mr-2 h-4 w-4"/>Bibliothèque</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="rounded-md border p-4 mt-2">
                      <FormField
                        control={form.control}
                        name="mediaUrl"
                        render={() => (
                          <FormItem>
                            <FormLabel>Média (optionnel)</FormLabel>
                            <FormControl><Input type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={isUploading} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {isUploading && <CustomLoader />}
                      {uploadedMediaUrl && (
                        <div className="mt-4 relative w-full h-40">
                          {uploadedMediaUrl.includes('video') ? (
                            <video src={uploadedMediaUrl} controls className="w-full h-full object-contain rounded-md" />
                          ) : (
                            <Image src={uploadedMediaUrl} alt="Média" layout="fill" className="rounded-md object-contain" />
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="library">
                    <div className="mt-2">
                      <MediaLibrary mediaItems={mediaLibrary} onSelect={handleMediaSelect} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? <CustomLoader /> : <><Send className="mr-2 h-4 w-4" /> Envoyer</>}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
