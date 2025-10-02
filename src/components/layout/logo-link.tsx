
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LogoLink() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (token === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isAuthenticated) {
            e.preventDefault();
            router.push('/dashboard');
        }
    };

    return (
        <Link 
            href="/login" 
            onClick={handleClick}
            className="flex items-center gap-2 md:gap-3"
        >
            <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={32} height={32} alt="Statut Predict Logo" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-base md:text-lg font-bold text-foreground">
            Statut Predict
            </span>
        </Link>
    );
}
