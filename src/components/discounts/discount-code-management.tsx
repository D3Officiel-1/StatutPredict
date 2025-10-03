
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DiscountCode } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DiscountCodeFormDialog from './discount-code-form-dialog';
import CustomLoader from '../ui/custom-loader';
import DiscountCodeDetailsDialog from './discount-code-details-dialog';
import { generateDiscountImage } from '@/ai/flows/generate-discount-image';
import { sendTelegramStory } from '@/ai/flows/send-telegram-story';
import DiscountCodeCard from './discount-code-card';

const CLOUDINARY_CLOUD_NAME = 'dlxomrluy';
const CLOUDINARY_UPLOAD_PRESET = 'predict_uploads';

export default function DiscountCodeManagement() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<DiscountCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "promo"), orderBy('debutdate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const codesData: DiscountCode[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as DiscountCode));
        setDiscountCodes(codesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching discount codes:", error);
        toast({ title: "Erreur", description: "Impossible de charger les codes de réduction.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddCode = () => {
    setSelectedCode(null);
    setIsFormOpen(true);
  };

  const handleEditCode = (code: DiscountCode) => {
    setSelectedCode(code);
    setIsFormOpen(true);
  };

  const handleDetailsClick = (code: DiscountCode) => {
    setSelectedCode(code);
    setIsDetailsOpen(true);
  };
  
  const openDeleteDialog = (code: DiscountCode) => {
    setCodeToDelete(code);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCode = async () => {
    if (!codeToDelete) return;
    setIsDeleting(true);
    try {
        await deleteDoc(doc(db, "promo", codeToDelete.id));
        toast({
            title: "Code supprimé",
            description: `Le code "${codeToDelete.titre}" a été supprimé avec succès.`,
        });
        setIsDeleteDialogOpen(false);
        setCodeToDelete(null);
    } catch (error) {
        console.error("Error deleting code: ", error);
        toast({ title: 'Erreur', description: "Impossible de supprimer le code.", variant: 'destructive'});
    } finally {
        setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: "Le code a été copié dans le presse-papiers.",
      });
    });
  };

  const handleGenerateImage = async (code: DiscountCode) => {
    setIsGeneratingImage(code.id);
    toast({
        title: "Génération d'image en cours...",
        description: `Création de l'image pour le code "${code.titre}".`,
    });

    try {
        const formatDate = (timestamp: any) => {
            if (timestamp && timestamp.toDate) {
                return timestamp.toDate().toLocaleDateString('fr-FR');
            }
            return 'N/A';
        };

        const result = await generateDiscountImage({
            code: code.code,
            percentage: code.pourcentage,
            title: code.titre,
            expiryDate: formatDate(code.findate),
            max: code.max,
            people: code.people,
            plan: code.plan,
            tous: code.tous,
        });

        if (!result.imageUrl) {
            throw new Error("L'IA n'a pas pu générer l'image SVG.");
        }

        const pngDataUri = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 630;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Impossible d'obtenir le contexte du canvas."));
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (err) => reject(new Error("Impossible de charger le SVG pour la conversion."));
            img.src = result.imageUrl;
        });

        const formData = new FormData();
        formData.append('file', pngDataUri);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Le téléversement sur Cloudinary a échoué');
        
        const data = await response.json();
        const imageUrl = data.secure_url;

        await addDoc(collection(db, 'media_library'), { url: imageUrl, type: 'image/png', createdAt: new Date() });
        
        const codeRef = doc(db, 'promo', code.id);
        await updateDoc(codeRef, { imageUrl: imageUrl });

        toast({
            title: 'Image générée et enregistrée !',
            description: 'L\'image a été liée au bon de réduction.',
        });
        return imageUrl;

    } catch (error) {
        console.error("Error generating/uploading image:", error);
        toast({ title: "Erreur de génération d'image", description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.", variant: "destructive" });
        return null;
    } finally {
        setIsGeneratingImage(null);
    }
  };

  const handleShare = async (code: DiscountCode) => {
    setIsSharing(code.id);
    let imageUrl = code.imageUrl;

    if (!imageUrl) {
        toast({ title: 'Image manquante', description: "Génération d'une nouvelle image avant le partage." });
        imageUrl = await handleGenerateImage(code);
    }

    if (!imageUrl) {
        toast({ title: "Échec du partage", description: "Impossible de générer ou de trouver l'image pour le partage.", variant: "destructive" });
        setIsSharing(null);
        return;
    }

    try {
        const caption = `✨ Copiez votre code bonus et activez-le maintenant ! ✨\n\n|| ${code.code} ||`;
        const result = await sendTelegramStory({
            caption: caption,
            photoUrl: imageUrl,
            buttonTitle: code.buttonTitle,
            buttonUrl: code.buttonUrl,
        });

        if (result.success) {
            toast({
                title: 'Code partagé !',
                description: `Le code de réduction a été publié sur Telegram.`,
            });
        } else {
            throw new Error('La réponse du flux de partage a indiqué un échec.');
        }
    } catch (error) {
        console.error("Error sharing to Telegram:", error);
        toast({ title: "Erreur de partage", description: "Impossible de publier sur Telegram.", variant: "destructive" });
    } finally {
        setIsSharing(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-8">
          <Button onClick={handleAddCode} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Créer un nouveau code
          </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)
        ) : (
          discountCodes.map((code) => (
            <DiscountCodeCard
              key={code.id}
              code={code}
              isGeneratingImage={isGeneratingImage === code.id}
              isSharing={isSharing === code.id}
              onDetailsClick={() => handleDetailsClick(code)}
              onCopyToClipboard={() => copyToClipboard(code.code)}
              onGenerateImage={() => handleGenerateImage(code)}
              onShare={() => handleShare(code)}
              onEdit={() => handleEditCode(code)}
              onDelete={() => openDeleteDialog(code)}
            />
          ))
        )}
      </div>
      
      <DiscountCodeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        discountCode={selectedCode}
        onSuccess={() => setIsFormOpen(false)}
      />

      {selectedCode && (
        <DiscountCodeDetailsDialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            discountCode={selectedCode}
        />
      )}

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le code "{codeToDelete?.titre}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCodeToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCode} disabled={isDeleting}>
              {isDeleting ? <CustomLoader /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
