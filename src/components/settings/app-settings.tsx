'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application } from '@/types';
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
import { MoreHorizontal, PlusCircle, Trash, Edit } from 'lucide-react';
import AddAppDialog from './add-app-dialog';
import EditAppDialog from './edit-app-dialog';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';

export default function AppSettings() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isEditAppDialogOpen, setIsEditAppDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData: Application[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApps(appsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (app: Application) => {
    setSelectedApp(app);
    setIsEditAppDialogOpen(true);
  };

  const openDeleteDialog = (app: Application) => {
    setSelectedApp(app);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'applications', selectedApp.id));
      toast({
        title: "Application supprimée",
        description: `L'application "${selectedApp.name}" a été supprimée.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("Error deleting app:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'application.",
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vos applications</CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez vos applications gérées.
            </CardDescription>
          </div>
          <AddAppDialog open={isAddAppDialogOpen} onOpenChange={setIsAddAppDialogOpen}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une app
            </Button>
          </AddAppDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL / Endpoint</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-32 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{app.type}</Badge>
                  </TableCell>
                  <TableCell>{app.url}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEditClick(app)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onSelect={() => openDeleteDialog(app)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedApp && (
        <EditAppDialog
          app={selectedApp}
          open={isEditAppDialogOpen}
          onOpenChange={setIsEditAppDialogOpen}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'application "{selectedApp?.name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedApp(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApp} disabled={isDeleting}>
              {isDeleting ? <CustomLoader /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
