'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MaintenanceEvent } from '@/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import MaintenanceFormDialog from './maintenance-form-dialog';
import CustomLoader from '../ui/custom-loader';

export default function MaintenanceManagement() {
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<MaintenanceEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "maintenance"), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData: MaintenanceEvent[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MaintenanceEvent));
        setMaintenanceEvents(eventsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching maintenance events:", error);
        toast({ title: "Erreur", description: "Impossible de charger les programmes de maintenance.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: MaintenanceEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };
  
  const openDeleteDialog = (event: MaintenanceEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
        await deleteDoc(doc(db, "maintenance", eventToDelete.id));
        toast({
            title: "Programme supprimé",
            description: `Le programme "${eventToDelete.title}" a été supprimé.`,
        });
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
    } catch (error) {
        console.error("Error deleting event: ", error);
        toast({ title: 'Erreur', description: "Impossible de supprimer le programme.", variant: 'destructive'});
    } finally {
        setIsDeleting(false);
    }
  };


  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    return 'N/A';
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Programmes de maintenance</CardTitle>
            <CardDescription>
              Liste de toutes les maintenances planifiées et passées.
            </CardDescription>
          </div>
          <Button onClick={handleAddEvent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un programme
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Application</TableHead>
                <TableHead className="hidden lg:table-cell">Résolu le</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={6}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                      </TableRow>
                  ))
              ) : (
                maintenanceEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                        <Badge variant={event.status === 'Résolu' ? 'default' : 'secondary'} className={event.status === 'Résolu' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                            {event.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(event.date)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{event.appName || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{event.resolvedAt ? formatDate(event.resolvedAt) : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEditEvent(event)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openDeleteDialog(event)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
      
      <MaintenanceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        maintenanceEvent={selectedEvent}
        onSuccess={() => setIsFormOpen(false)}
      />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le programme "{eventToDelete?.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} disabled={isDeleting}>
              {isDeleting ? <CustomLoader /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
