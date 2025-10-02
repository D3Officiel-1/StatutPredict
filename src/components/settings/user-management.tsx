
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, getDocs, doc, where, deleteDoc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db, app as firebaseApp } from '@/lib/firebase';
import type { User } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Edit, Copy, Award, Gift, Send, Info, Mail, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import ActivatePlanDialog from './activate-plan-dialog';
import ManageReferralDialog from './manage-referral-dialog';
import SendNotificationDialog from './send-notification-dialog';
import UserDetailsDialog from './user-details-dialog';
import EditUserDialog from './edit-user-dialog';
import CustomLoader from '../ui/custom-loader';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivatePlanDialogOpen, setIsActivatePlanDialogOpen] = useState(false);
  const [isManageReferralDialogOpen, setIsManageReferralDialogOpen] = useState(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
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

  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  };

  const handleSendPasswordReset = async () => {
    if (selectedUserIds.size === 0) {
        toast({
            title: 'Aucun utilisateur sélectionné',
            description: 'Veuillez sélectionner au moins un utilisateur.',
            variant: 'destructive',
        });
        return;
    }

    setIsSubmitting(true);
    const auth = getAuth(firebaseApp);
    const selectedUsers = users.filter(user => selectedUserIds.has(user.id));
    
    const promises = selectedUsers.map(user => 
        sendPasswordResetEmail(auth, user.email)
            .then(() => ({ email: user.email, success: true }))
            .catch((error) => ({ email: user.email, success: false, error: error.message }))
    );

    const results = await Promise.all(promises);
    
    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;

    if (successfulEmails > 0) {
        toast({
            title: 'E-mails de réinitialisation envoyés',
            description: `${successfulEmails} e-mail(s) de réinitialisation de mot de passe ont été envoyés.`,
        });
    }

    if (failedEmails > 0) {
        toast({
            title: 'Échec de l\'envoi',
            description: `Impossible d'envoyer des e-mails à ${failedEmails} utilisateur(s). Vérifiez la console pour plus de détails.`,
            variant: 'destructive',
        });
        results.filter(r => !r.success).forEach(r => console.error(`Failed to send to ${r.email}:`, r.error));
    }

    setSelectedUserIds(new Set());
    setIsSubmitting(false);
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
            Gérez les utilisateurs, leurs forfaits et leurs parrainages.
          </CardDescription>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSendPasswordReset} disabled={selectedUserIds.size === 0 || isSubmitting}>
                {isSubmitting ? <CustomLoader /> : <KeyRound className="mr-2 h-4 w-4" />}
                Réinitialiser MDP
            </Button>
        </div>
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
                    <Card key={user.id} className={cn(
                        "flex flex-col justify-between p-4 transition-all hover:shadow-lg hover:scale-[1.02] border-2",
                        selectedUserIds.has(user.id) ? 'border-primary' : 'border-transparent'
                    )}>
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
                        <div className="absolute top-2 left-2">
                            <Checkbox
                                checked={selectedUserIds.has(user.id)}
                                onCheckedChange={() => handleUserSelection(user.id)}
                                id={`select-${user.id}`}
                                aria-label={`Select ${user.username}`}
                            />
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

    


