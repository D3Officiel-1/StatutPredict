
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, getDocs, doc, getDoc, where, addDoc, deleteDoc } from 'firebase/firestore';
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
import { MoreHorizontal, UserPlus, Trash, Edit, Copy, Award, Gift, Send, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import ActivatePlanDialog from './activate-plan-dialog';
import ManageReferralDialog from './manage-referral-dialog';
import SendNotificationDialog from './send-notification-dialog';
import UserDetailsDialog from './user-details-dialog';
import EditUserDialog from './edit-user-dialog';
import CustomLoader from '../ui/custom-loader';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isActivatePlanDialogOpen, setIsActivatePlanDialogOpen] = useState(false);
  const [isManageReferralDialogOpen, setIsManageReferralDialogOpen] = useState(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const allUsersData: User[] = snapshot.docs.map(doc => ({
            id: doc.id,
            uid: doc.id,
            ...doc.data()
        } as User));

        const usersWithDetailsPromises = allUsersData.map(async (user) => {
            const referralCol = collection(db, `users/${user.id}/referral`);
            const pricingCol = collection(db, `users/${user.id}/pricing`);
            
            const referralSnapshot = await getDocs(referralCol);
            const pricingSnapshot = await getDocs(pricingCol);

            user.referralData = referralSnapshot.docs.map(d => ({...d.data(), id: d.id}));
            user.pricingData = pricingSnapshot.docs.map(d => ({...d.data(), id: d.id}));

            if (user.referralCode) {
                const referralsQuery = query(collection(db, 'users'), where('referralCode', '==', user.referralCode));
                const referralsSnapshot = await getDocs(referralsQuery);
                user.referrals = referralsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            } else {
                user.referrals = [];
            }
            
            return user;
        });
        
        const usersWithDetails = await Promise.all(usersWithDetailsPromises);
        setUsers(usersWithDetails);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleInviteUser = async () => {
    if (!inviteEmail) {
        toast({ title: "L'email est requis", variant: 'destructive'});
        return;
    }
    setIsSubmitting(true);
    try {
        const referralCode = 'user' + Date.now().toString().slice(-6);
        const password = 'Predict0000';

        await addDoc(collection(db, "users"), {
            email: inviteEmail,
            username: inviteEmail.split('@')[0],
            createdAt: new Date(),
            isOnline: false,
            referralCode,
            password, // Storing password directly might not be secure depending on your app's architecture
        });
        toast({
            title: "Utilisateur invité",
            description: `${inviteEmail} a été ajouté avec succès.`,
        });
        setInviteEmail('');
        setIsInviteDialogOpen(false);
    } catch (error) {
        console.error("Error inviting user:", error);
        toast({ title: 'Erreur', description: "Impossible d'inviter l'utilisateur", variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(db, "users", userToDelete.id));
        toast({
            title: "Utilisateur supprimé",
            description: `${userToDelete.username || userToDelete.email} a été supprimé.`,
        });
        setUserToDelete(null);
        setIsDeleteDialogOpen(false);
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: 'Erreur', description: "Impossible de supprimer l'utilisateur.", variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDetailsClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  };

  const handleActivatePlanClick = (user: User) => {
    setSelectedUser(user);
    setIsActivatePlanDialogOpen(true);
  };

  const handleManageReferralClick = (user: User) => {
    setSelectedUser(user);
    setIsManageReferralDialogOpen(true);
  };

  const handleSendNotificationClick = (user: User) => {
    setSelectedUser(user);
    setIsSendNotificationDialogOpen(true);
  };

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser);
    }
  };


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Invitez et gérez les utilisateurs.
          </CardDescription>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inviter un utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/90 border-border/50 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-xl">Inviter un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                        Entrez l'email pour créer un nouveau profil utilisateur.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                        <Input id="email" type="email" placeholder="utilisateur@example.com" className="col-span-3" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleInviteUser} disabled={isSubmitting}>
                        {isSubmitting ? <CustomLoader /> : "Envoyer l'invitation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="space-y-4 p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-full" />
                    </Card>
                ))
            ) : (
                users.map((user) => (
                    <Card key={user.id} className="flex flex-col justify-between p-4 transition-all hover:shadow-lg hover:scale-[1.02]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-transparent">
                                        <AvatarImage src={user.photoURL} alt={user.username} />
                                        <AvatarFallback>{user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                     <span className={cn(
                                        "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background",
                                        user.isOnline ? "bg-green-500" : "bg-gray-400"
                                    )} />
                                </div>
                                <div>
                                    <p className="font-bold text-base truncate">{user.username || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleDetailsClick(user)}>
                                        <Info className="mr-2 h-4 w-4" />
                                        Détails
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => handleEditUserClick(user)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => user.uid && copyToClipboard(user.uid)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copier l'UID
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openDeleteDialog(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleActivatePlanClick(user)}>
                                <Award className="mr-2 h-4 w-4" />
                                Forfait
                            </Button>
                             <Button size="sm" variant="outline" onClick={() => handleManageReferralClick(user)}>
                                <Gift className="mr-2 h-4 w-4" />
                                Parrainage
                            </Button>
                             <Button size="sm" variant="outline" onClick={() => handleSendNotificationClick(user)}>
                                <Send className="mr-2 h-4 w-4" />
                                Notifier
                            </Button>
                        </div>
                    </Card>
                ))
            )}
        </div>
      </CardContent>
    </Card>
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur "{userToDelete?.username || userToDelete?.email}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isSubmitting}>
              {isSubmitting ? <CustomLoader /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={isUserDetailsDialogOpen}
          onOpenChange={setIsUserDetailsDialogOpen}
        />
    )}
    {selectedUser && (
      <ActivatePlanDialog
        user={selectedUser}
        open={isActivatePlanDialogOpen}
        onOpenChange={setIsActivatePlanDialogOpen}
      />
    )}
    {selectedUser && (
      <ManageReferralDialog
        user={selectedUser}
        open={isManageReferralDialogOpen}
        onOpenChange={(isOpen) => {
            setIsManageReferralDialogOpen(isOpen);
            if (!isOpen) {
                // Optionnel: rafraîchir les données de l'utilisateur à la fermeture
            }
        }}
        onUserUpdate={handleUserUpdate}
      />
    )}
    {selectedUser && (
      <SendNotificationDialog
        user={selectedUser}
        open={isSendNotificationDialogOpen}
        onOpenChange={setIsSendNotificationDialogOpen}
      />
    )}
    {selectedUser && (
        <EditUserDialog
            user={selectedUser}
            open={isEditUserDialogOpen}
            onOpenChange={setIsEditUserDialogOpen}
            onUserUpdate={handleUserUpdate}
        />
    )}
    </>
  );
}

    
