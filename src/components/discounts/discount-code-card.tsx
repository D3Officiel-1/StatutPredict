
'use client';

import type { DiscountCode } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Copy, Edit, ImageIcon, Info, MoreVertical, Percent, Ticket, Trash } from 'lucide-react';
import Image from 'next/image';
import CustomLoader from '../ui/custom-loader';

interface DiscountCodeCardProps {
  code: DiscountCode;
  isGeneratingImage: boolean;
  onDetailsClick: () => void;
  onCopyToClipboard: () => void;
  onGenerateImage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const StatusIndicator = ({ code }: { code: DiscountCode }) => {
  const now = new Date();
  const startDate = code.debutdate?.toDate();
  const endDate = code.findate?.toDate();

  let status: 'active' | 'expired' | 'scheduled' | 'unknown' = 'unknown';
  if (startDate && endDate) {
    if (now >= startDate && now <= endDate) status = 'active';
    else if (now > endDate) status = 'expired';
    else status = 'scheduled';
  }

  const statusConfig = {
    active: { text: 'Actif', color: 'bg-green-500' },
    expired: { text: 'Expiré', color: 'bg-red-500' },
    scheduled: { text: 'Programmé', color: 'bg-yellow-500' },
    unknown: { text: 'Inconnu', color: 'bg-gray-500' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig[status].color)} />
      <span className="text-xs font-medium text-white">{statusConfig[status].text}</span>
    </div>
  );
};

export default function DiscountCodeCard({
  code,
  isGeneratingImage,
  onDetailsClick,
  onCopyToClipboard,
  onGenerateImage,
  onEdit,
  onDelete,
}: DiscountCodeCardProps) {

  const usage = code.max && code.max > 0
    ? `${code.people?.length || 0} / ${code.max}`
    : `${code.people?.length || 0} / ∞`;
    
  return (
    <Card className="group relative overflow-hidden rounded-xl border-2 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
      <div className="absolute inset-0 z-0">
        {code.imageUrl ? (
          <Image
            src={code.imageUrl}
            alt={code.titre}
            layout="fill"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-card to-background" />
        )}
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      <CardContent className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg font-bold font-headline leading-tight">{code.titre}</h3>
                <StatusIndicator code={code} />
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white/70 hover:bg-white/10 hover:text-white" disabled={isGeneratingImage}>
                {isGeneratingImage ? <CustomLoader /> : <MoreVertical className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onDetailsClick}><Info className="mr-2" /> Détails</DropdownMenuItem>
              <DropdownMenuItem onSelect={onCopyToClipboard}><Copy className="mr-2" /> Copier le code</DropdownMenuItem>
              <DropdownMenuItem onSelect={onGenerateImage}><ImageIcon className="mr-2" /> (Re)générer l'image</DropdownMenuItem>
              <DropdownMenuItem onSelect={onEdit}><Edit className="mr-2" /> Modifier</DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive"><Trash className="mr-2" /> Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
            <div 
                className="group/code flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 p-3 text-center transition-colors hover:border-white/50 hover:bg-white/10"
                onClick={onCopyToClipboard}
            >
                <h4 className="text-2xl font-black tracking-widest text-white filter-glow">{code.code}</h4>
                <Copy className="h-4 w-4 text-white/50 transition-opacity group-hover/code:opacity-100 md:opacity-0" />
            </div>

            <div className="flex justify-between rounded-lg bg-black/30 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <div className='text-left'>
                        <span className="text-xs text-muted-foreground">Réduction</span>
                        <p className="font-semibold leading-none">{code.pourcentage}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                    <Ticket className="h-5 w-5 text-primary" />
                    <div className='text-right'>
                        <span className="text-xs text-muted-foreground">Utilisations</span>
                        <p className="font-semibold leading-none">{usage}</p>
                    </div>
                </div>
            </div>
             <Badge variant="secondary" className="w-full justify-center capitalize">
                {code.tous ? 'Tous les forfaits' : code.plan}
            </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
