
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CustomLoader from '@/components/ui/custom-loader';
import { X, Save } from 'lucide-react';

const appSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
    url: z.string().min(4, { message: "L'URL doit contenir au moins 4 caractères." }),
    type: z.enum(['web', 'mobile', 'api'], { required_error: "Veuillez sélectionner un type." }),
});

interface AddAppDialogProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddAppDialog({ children, open, onOpenChange }: AddAppDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof appSchema>>({
        resolver: zodResolver(appSchema),
        defaultValues: {
            name: '',
            url: '',
            type: undefined,
        },
    });

    const handleAddApp = async (values: z.infer<typeof appSchema>) => {
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'applications'), {
                name: values.name,
                url: values.url,
                type: values.type,
                status: false, // false = operational
            });
            toast({
                title: "Application ajoutée",
                description: `${values.name} a été ajouté avec succès.`,
            });
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter l'application. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenChange(true);
    }

    return (
        <>
            <div onClick={handleOpen}>
                {children}
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                    >
                        <motion.div
                            className="bg-card w-full max-w-lg h-full flex flex-col"
                            initial={{ x: "100%" }}
                            animate={{ x: "0%" }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b">
                                <div>
                                    <h2 className="text-xl font-bold font-headline">Ajouter une application</h2>
                                    <p className="text-sm text-muted-foreground">Remplissez les détails pour enregistrer une nouvelle application.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAddApp)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base">Nom de l'application</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Portail Client" {...field} className="text-base py-6" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base">URL / Endpoint</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: app.domaine.com" {...field} className="text-base py-6" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base">Type d'application</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="text-base py-6">
                                                                <SelectValue placeholder="Sélectionnez un type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="web">Web</SelectItem>
                                                            <SelectItem value="mobile">Mobile</SelectItem>
                                                            <SelectItem value="api">API</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </div>

                            <div className="p-6 border-t bg-background/90 sticky bottom-0">
                                <Button type="submit" onClick={form.handleSubmit(handleAddApp)} disabled={isSubmitting} className="w-full text-lg py-6">
                                    {isSubmitting ? <CustomLoader /> : <><Save className="mr-2" /> Ajouter l'application</>}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
