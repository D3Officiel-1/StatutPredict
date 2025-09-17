'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus, Trash, Edit, Copy, Award, Gift } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersDataPromises = snapshot.docs.map(async userDoc => {
        const userData = {
          id: userDoc.id,
          ...userDoc.data()
        } as User;

        const referralCol = collection(db, `users/${userDoc.id}/referral`);
        const pricingCol = collection(db, `users/${userDoc.id}/pricing`);

        const referralSnapshot = await getDocs(referralCol);
        const pricingSnapshot = await getDocs(pricingCol);
        
        userData.referralData = referralSnapshot.docs.map(d => d.data());
        userData.pricingData = pricingSnapshot.docs.map(d => d.data());

        return userData;
      });

      Promise.all(usersDataPromises).then(usersData => {
          setUsers(usersData);
          setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    if (typeof timestamp === 'string' || timestamp instanceof Date) {
        try {
            return format(new Date(timestamp), 'dd/MM/yyyy');
        } catch (e) {
            return String(timestamp); 
        }
    }
    return 'N/A';
  };

  const copyToClipboard = (text: string) => {
    if(!text) {
        toast({
            title: "Erreur",
            description: "Aucun UID à copier.",
            variant: "destructive",
        });
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: "L'UID a été copié dans le presse-papiers.",
      });
    }, (err) => {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'UID.",
        variant: "destructive",
      });
      console.error('Could not copy text: ', err);
    });
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Invitez et gérez les utilisateurs.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inviter un utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                        Entrez l'email de l'utilisateur pour lui envoyer une invitation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" placeholder="utilisateur@example.com" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => setIsDialogOpen(false)}>Envoyer l'invitation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Jeu favori</TableHead>
              <TableHead>Code Pronostic</TableHead>
              <TableHead>Solde parrainage</TableHead>
              <TableHead>Code parrainage</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={13}>
                           <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.isOnline ? 'default' : 'outline'} className={user.isOnline ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                        {user.isOnline ? 'En ligne' : 'Hors ligne'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.firstName || 'N/A'}</TableCell>
                    <TableCell>{user.lastName || 'N/A'}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.dob)}</TableCell>
                    <TableCell>{user.gender || 'N/A'}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.favoriteGame || 'N/A'}</TableCell>
                    <TableCell>{user.pronosticCode || 'N/A'}</TableCell>
                    <TableCell>{user.referralBalance ?? 0}</TableCell>
                    <TableCell>{user.referralCode || 'N/A'}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => user.uid && copyToClipboard(user.uid)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copier l'UID
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Award className="mr-2 h-4 w-4" />
                            Activer le forfait
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                            <Gift className="mr-2 h-4 w-4" />
                            Gérer le parrainage
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
  );
}
