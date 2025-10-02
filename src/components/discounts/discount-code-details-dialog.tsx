
'use client';

import { DiscountCode } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Calendar, Tag, Percent, FileCheck, FileX, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

interface DiscountCodeDetailsDialogProps {
  discountCode: DiscountCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon, label, value, isBadge = false, badgeVariant = 'secondary' }: { icon: React.ReactNode, label: string, value: string | undefined | null, isBadge?: boolean, badgeVariant?: any }) => (
    <div className="flex items-start gap-4">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {isBadge ? (
                 <Badge variant={badgeVariant} className="capitalize">{value || 'N/A'}</Badge>
            ) : (
                <p className="font-medium">{value || 'N/A'}</p>
            )}
        </div>
    </div>
);


export default function DiscountCodeDetailsDialog({ discountCode, open, onOpenChange }: DiscountCodeDetailsDialogProps) {
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, 'dd/MM/yyyy HH:mm');
        } catch (e) {
            return String(timestamp);
        }
    };

    const getStatusInfo = (code: DiscountCode) => {
        const now = new Date();
        const startDate = code.debutdate?.toDate();
        const endDate = code.findate?.toDate();

        if (startDate && endDate) {
        if (now >= startDate && now <= endDate) {
            return { text: 'Actif', variant: 'default', className: 'bg-green-500/20 text-green-500 border-green-500/30' };
        } else if (now > endDate) {
            return { text: 'Expiré', variant: 'destructive' };
        } else {
            return { text: 'Programmé', variant: 'secondary' };
        }
        }
        return { text: 'Inconnu', variant: 'outline' };
    };

    const status = getStatusInfo(discountCode);
    
    const usage = discountCode.max && discountCode.max > 0
        ? `${discountCode.people?.length || 0} / ${discountCode.max}`
        : `${discountCode.people?.length || 0} / ∞`;


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
            className="bg-card p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Détails du code de réduction</h2>
                <p className="text-sm text-muted-foreground">{discountCode.titre}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={<Tag size={16} />} label="Titre" value={discountCode.titre} />
                <DetailItem icon={<Ticket size={16} />} label="Code" value={discountCode.code} />
                <DetailItem icon={<Percent size={16} />} label="Pourcentage" value={`${discountCode.pourcentage}%`} />
                <DetailItem icon={<Users size={16} />} label="Utilisations" value={usage} />
                <DetailItem 
                    icon={<FileCheck size={16} />} 
                    label="Valide Pour" 
                    value={discountCode.tous ? 'Tous les forfaits' : discountCode.plan}
                    isBadge 
                />
                <DetailItem icon={<Calendar size={16} />} label="Date de début" value={formatDate(discountCode.debutdate)} />
                <DetailItem icon={<Calendar size={16} />} label="Date de fin" value={formatDate(discountCode.findate)} />
                <DetailItem 
                    icon={discountCode.tous ? <FileCheck size={16} /> : <FileX size={16} />} 
                    label="Pour tous les forfaits" 
                    value={discountCode.tous ? 'Oui' : 'Non'} 
                    isBadge
                    badgeVariant={discountCode.tous ? 'default' : 'secondary'}
                />
                 <div className="flex items-start gap-4">
                    <div className="text-muted-foreground mt-1"><Calendar size={16} /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <Badge variant={status.variant as any} className={status.className}>{status.text}</Badge>
                    </div>
                </div>
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
