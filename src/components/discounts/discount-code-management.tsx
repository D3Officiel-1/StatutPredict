
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DiscountCode } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash, Edit, Copy, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DiscountCodeFormDialog from './discount-code-form-dialog';
import CustomLoader from '../ui/custom-loader';
import DiscountCodeDetailsDialog from './discount-code-details-dialog';

export default function DiscountCodeManagement() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<DiscountCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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


  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy');
    }
    return 'N/A';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: "Le code a été copié dans le presse-papiers.",
      });
    });
  };

  const getStatus = (code: DiscountCode) => {
    const now = new Date();
    const startDate = code.debutdate?.toDate();
    const endDate = code.findate?.toDate();

    if (startDate && endDate) {
      if (now >= startDate && now <= endDate) {
        return <Badge variant="default" className='bg-green-500/20 text-green-500 border-green-500/30'>Actif</Badge>;
      } else if (now > endDate) {
        return <Badge variant="destructive">Expiré</Badge>;
      } else {
        return <Badge variant="secondary">Programmé</Badge>;
      }
    }
    return <Badge variant="outline">Inconnu</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Codes de réduction</CardTitle>
            <CardDescription>
              Liste de tous les codes de réduction créés.
            </CardDescription>
          </div>
          <Button onClick={handleAddCode}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un code
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="hidden sm:table-cell">Pourcentage</TableHead>
                <TableHead className="hidden md:table-cell">Utilisations</TableHead>
                <TableHead className="hidden md:table-cell">Plan</TableHead>
                <TableHead className="hidden lg:table-cell">Début</TableHead>
                <TableHead className="hidden lg:table-cell">Fin</TableHead>
                <TableHead className="hidden md:table-cell">Statut</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={9}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                      </TableRow>
                  ))
              ) : (
                discountCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.titre}</TableCell>
                    <TableCell>{code.code}</TableCell>
                    <TableCell className="hidden sm:table-cell">{code.pourcentage}%</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {code.max && code.max > 0
                            ? `${code.people?.length || 0} / ${code.max}`
                            : `${code.people?.length || 0}`
                        }
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="capitalize">
                            {code.tous ? 'Tous les forfaits' : code.plan}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(code.debutdate)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(code.findate)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getStatus(code)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleDetailsClick(code)}>
                                  <Info className="mr-2 h-4 w-4" />
                                  Détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => copyToClipboard(code.code)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copier le code
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleEditCode(code)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openDeleteDialog(code)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Supprimer
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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

    
