
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LogoLink() {
    return (
        <Link 
            href="/login" 
            className="flex items-center gap-2 md:gap-3"
        >
            <Image src="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" width={32} height={32} alt="Statut Predict Logo" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-base md:text-lg font-bold text-foreground">
            Statut Predict
            </span>
        </Link>
    );
}
