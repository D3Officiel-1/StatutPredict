
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
    <div className="flex items-start gap-4">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value ? (
                 <p className={isCode ? 'font-mono text-xs bg-muted p-1 rounded-sm' : 'font-medium'}>{value}</p>
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
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL} alt={user.username} />
                  <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold">Détails de {user.username || user.email}</h2>
                    <p className="text-sm text-muted-foreground">Informations complètes de l'utilisateur.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={<UserIcon size={16} />} label="Username" value={user.username} />
                <DetailItem icon={<Mail size={16} />} label="Email" value={user.email} />
                <DetailItem icon={<UserIcon size={16} />} label="Prénom" value={user.firstName} />
                <DetailItem icon={<UserIcon size={16} />} label="Nom" value={user.lastName} />
                <DetailItem icon={<Calendar size={16} />} label="Créé le" value={formatDate(user.createdAt)} />
                <DetailItem icon={<Calendar size={16} />} label="Date de naissance" value={formatDate(user.dob)} />
                <DetailItem icon={<UserIcon size={16} />} label="Genre" value={user.gender} />
                <DetailItem icon={<Phone size={16} />} label="Téléphone" value={user.phone} />
                <DetailItem icon={<Gamepad2 size={16} />} label="Jeu favori" value={user.favoriteGame} />
                <DetailItem icon={<Code size={16} />} label="Code Pronostic" value={user.pronosticCode} />
                <DetailItem icon={<Link size={16} />} label="Token Telegram" value={user.telegramLinkToken} isCode />
                <DetailItem icon={<Wifi size={16} />} label="FCM Token" value={user.fcmToken} isCode />
            </div>

            <div className="flex justify-end gap-2 mt-8">
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
