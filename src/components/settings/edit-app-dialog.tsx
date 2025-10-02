
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application } from '@/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
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

const appSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
    url: z.string().min(4, { message: "L'URL doit contenir au moins 4 caractères." }),
    type: z.enum(['web', 'mobile', 'api'], { required_error: "Veuillez sélectionner un type." }),
});

interface EditAppDialogProps {
    app: Application;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditAppDialog({ app, open, onOpenChange }: EditAppDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof appSchema>>({
        resolver: zodResolver(appSchema),
        defaultValues: {
            name: app.name,
            url: app.url,
            type: app.type,
        },
    });

    useEffect(() => {
        if (app) {
            form.reset({
                name: app.name,
                url: app.url,
                type: app.type,
            });
        }
    }, [app, form]);


    const handleEditApp = async (values: z.infer<typeof appSchema>) => {
        setIsSubmitting(true);
        try {
            const appRef = doc(db, 'applications', app.id);
            await updateDoc(appRef, {
                name: values.name,
                url: values.url,
                type: values.type,
            });
            toast({
                title: "Application modifiée",
                description: `L'application "${values.name}" a été mise à jour.`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                title: "Erreur",
                description: "Impossible de modifier l'application. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'application</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les informations de votre application.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleEditApp)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mon App" className="col-span-3" {...field} />
                                    </FormControl>
                                    <FormMessage className="col-span-4 pl-20" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">URL / Endpoint</FormLabel>
                                    <FormControl>
                                        <Input placeholder="app.example.com" className="col-span-3" {...field} />
                                    </FormControl>
                                    <FormMessage className="col-span-4 pl-20" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Sélectionnez un type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="web">Web</SelectItem>
                                            <SelectItem value="mobile">Mobile</SelectItem>
                                            <SelectItem value="api">API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="col-span-4 pl-20"/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <CustomLoader /> : "Enregistrer les modifications"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
