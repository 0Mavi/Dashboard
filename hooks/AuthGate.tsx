
"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 

const publicRoutes = ["/Login", "/"]; 

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { status } = useSession(); 
    const pathname = usePathname();
    const router = useRouter();

    const [hasCheckedAuth, setHasCheckedAuth] = useState(false); 

    const isPublic = publicRoutes.includes(pathname);
    const isAuthChecking = status === 'loading';
    const isUnauthenticated = status === 'unauthenticated';
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        if (status !== 'loading' && !hasCheckedAuth) {
            setHasCheckedAuth(true);
        }

        if (isAuthChecking) return; 
        
        if (!isPublic && isUnauthenticated) {
            router.push("/Login");
            return; 
        } 
        
        if (pathname === "/Login" && isAuthenticated) {
            router.push("/Dashboard"); 
            return; 
        }
    }, [status, hasCheckedAuth, isAuthenticated, isUnauthenticated, pathname, router, isPublic, isAuthChecking]);

    
    if (isAuthChecking && !isPublic && !hasCheckedAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen text-lg">
                Carregando sincronização...
            </div>
        ); 
    }

    if (isUnauthenticated && !isPublic) {
        return (
            <div className="flex justify-center items-center min-h-screen text-lg">
                Redirecionando...
            </div>
        );
    }

    return <>{children}</>;
}