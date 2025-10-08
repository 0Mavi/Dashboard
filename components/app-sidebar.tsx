"use client";

import {
    
    Bell,
    Box,
    Calendar,
    Files,
    Headset,
    LayoutDashboard,
    MessageCircle,
    NotepadText,
    Settings,
    User,
    Users,
    
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";


const navData = [
    {
        title: "Visão Geral",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: false,
    },
    {
        title: "Calendário",
        url: "/products",
        icon: Box,
        isActive: false,
    },
     {
        title: "Chat",
        url: "/stock",
        icon: Box,
        isActive: false,
    },
     {
        title: "Plano de Estudos",
        url: "/buy",
        icon: Box,
        isActive: false,
    },
    {
        title: "Artigos",
        url: "/Artigos",
        icon: Users,
        isActive: false,
    },
 
];

const systemNav = [
    {
        title: "Configurações",
        url: "/Settings",
        icon: Settings,
    },
    {
        title: "Meu Perfil",
        url: "/Profile",
        icon: User,
    },
];

const suportNav = [
    {
        title: "Notificações",
        url: "/notifications",
        icon: Bell,
    },
    {
        title: "Suporte",
        url: "/Support",
        icon: Headset,
    }
]


export default function AppSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {

    const {open} = useSidebar();
    

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center justify-center h-12 mt-4">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={open ? 150 : 40}
                        height={40}
                        className="object-contain"
                    />
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                
                <NavMain items={navData} />
             

                <span className={cn(!open && "hidden") || "text-sm text-muted-foreground p-2" }>Sistema</span>

                <NavMain items={systemNav} />

            </SidebarContent>
            <SidebarRail />

            
           
            <div className="flex flex-col gap-2 p-1 mb-2">
            
                <NavMain items={suportNav} />

            </div>
            
        </Sidebar>
    );
}