
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MaintenanceEvent } from '@/types';
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
import { MoreHorizontal, PlusCircle, Trash, Edit, Calendar, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import MaintenanceFormDialog from './maintenance-form-dialog';
import CustomLoader from '../ui/custom-loader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig = {
    'Résolu': { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    'En cours': { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    'Investigation': { icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    'Planifié': { icon: Calendar, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
};


const MaintenanceEventCard = ({ event, onEdit, onDelete }: { event: MaintenanceEvent; onEdit: () => void; onDelete: () => void; }) => {
    const { icon: Icon, color, bgColor } = statusConfig[event.status as keyof typeof statusConfig] || { icon: AlertTriangle, color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return null;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'dd MMMM yyyy');
    }

    return (
        <Card className="flex flex-col bg-card/70 hover:bg-card/90 transition-colors duration-300">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle as="h3" className="text-base font-bold font-headline leading-tight">
                        {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Server className="h-3 w-3"/>
                        <span>{event.appName}</span>
                    </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" className='h-8 w-8'>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                </p>
                <div className={cn("flex items-center gap-2 rounded-md p-2 text-sm font-medium", bgColor, color)}>
                    <Icon className="h-4 w-4" />
                    <span>{event.status}</span>
                </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-between">
                <div className='flex items-center gap-1.5'>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                </div>
                {event.resolvedAt && (
                     <div className='flex items-center gap-1.5'>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{formatDate(event.resolvedAt)}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};


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


  return (
    <>
      <div className="flex justify-end mb-8">
          <Button onClick={handleAddEvent} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Créer un programme
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : (
          maintenanceEvents.map((event) => (
            <MaintenanceEventCard
              key={event.id}
              event={event}
              onEdit={() => handleEditEvent(event)}
              onDelete={() => openDeleteDialog(event)}
            />
          ))
        )}
      </div>
      
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
