
'use client';

import { User } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Calendar, User as UserIcon, Mail, Phone, Gamepad2, Code, Link, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface UserDetailsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon, label, value, isCode = false }: { icon: React.ReactNode, label: string, value: string | undefined | null, isCode?: boolean }) => (
    <div className="flex items-start gap-4 rounded-lg bg-muted/30 p-4">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className='w-full'>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value ? (
                 <p className={isCode ? 'font-mono text-xs bg-background/50 p-2 rounded-sm break-all' : 'font-medium'}>{value}</p>
            ) : (
                <p className="font-medium text-muted-foreground/70">N/A</p>
            )}
        </div>
    </div>
);


export default function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
    const formatDate = (timestamp: any) => {
        if (!timestamp) return null;
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, 'dd/MM/yyyy HH:mm');
        } catch (e) {
            return String(timestamp);
        }
    };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-card border border-border/50 p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-border/50">
                <div>
                    <h2 className="text-xl font-bold">Profil de l'utilisateur</h2>
                    <p className="text-sm text-muted-foreground">Informations détaillées.</p>
                </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback className="text-3xl">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-bold">{user.username || 'N/A'}</h3>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem icon={<UserIcon size={18} />} label="Prénom" value={user.firstName} />
                    <DetailItem icon={<UserIcon size={18} />} label="Nom" value={user.lastName} />
                    <DetailItem icon={<Calendar size={18} />} label="Créé le" value={formatDate(user.createdAt)} />
                    <DetailItem icon={<Calendar size={18} />} label="Date de naissance" value={formatDate(user.dob)} />
                    <DetailItem icon={<UserIcon size={18} />} label="Genre" value={user.gender} />
                    <DetailItem icon={<Phone size={18} />} label="Téléphone" value={user.phone} />
                    <DetailItem icon={<Gamepad2 size={18} />} label="Jeu favori" value={user.favoriteGame} />
                    <DetailItem icon={<Code size={18} />} label="Code Pronostic" value={user.pronosticCode} />
                    <div className="md:col-span-2">
                        <DetailItem icon={<Link size={18} />} label="Token Telegram" value={user.telegramLinkToken} isCode />
                    </div>
                    <div className="md:col-span-2">
                        <DetailItem icon={<Wifi size={18} />} label="FCM Token" value={user.fcmToken} isCode />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
