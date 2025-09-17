'use client';

import type { MediaItem } from '@/types';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, FileAudio, FileQuestion } from 'lucide-react';

interface MediaLibraryProps {
  mediaItems: MediaItem[];
  onSelect: (media: MediaItem) => void;
}

export default function MediaLibrary({ mediaItems, onSelect }: MediaLibraryProps) {
  if (mediaItems.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>Votre bibliothèque de médias est vide.</p>
        <p className="text-sm">Téléversez un fichier pour commencer.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-72 w-full rounded-md border">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square cursor-pointer group bg-muted rounded-md overflow-hidden"
            onClick={() => onSelect(item)}
          >
            {item.type.startsWith('image/') ? (
              <Image
                src={item.url}
                alt="Média de la bibliothèque"
                layout="fill"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : item.type.startsWith('video/') ? (
                <video
                    src={item.url}
                    muted
                    className="w-full h-full object-cover"
                />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {item.type.startsWith('audio/') ? (
                  <FileAudio className="w-10 h-10 text-muted-foreground" />
                ) : (
                  <FileQuestion className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <p className="text-white text-xs text-center p-1">Sélectionner</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
