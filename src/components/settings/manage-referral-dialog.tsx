
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, addDoc, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, ReferralItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '../ui/custom-loader';
import { X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';

interface ManageReferralDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageReferralDialog({ user, open, onOpenChange }: ManageReferralDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    }
    return 'N/A';
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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Parrainages de {user.username || user.email}</h2>
                <p className="text-sm text-muted-foreground">Consultez les parrainages reçus.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
              </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Historique des parrainages</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <div className="space-y-4">
                        {user.referralData && user.referralData.length > 0 ? (
                            user.referralData.map((referral, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p><span className="font-semibold">De:</span> {referral.fromUser}</p>
                                            <p><span className="font-semibold">Montant:</span> {referral.amount}€</p>
                                        </div>
                                         <div>
                                            <p><span className="font-semibold">Plan:</span> {referral.plan}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(referral.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-10">Aucun parrainage pour cet utilisateur.</p>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
