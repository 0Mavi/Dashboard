"use client";

import {
    Bell,
    Box,
    Headset,
    LayoutDashboard,
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

const navData = [
    {
        title: "Visão Geral",
        url: "/Dashboard",
        icon: LayoutDashboard,
        isActive: false,
    },
    {
        title: "Calendário",
        url: "/Calendario",
        icon: Box,
        isActive: false,
    },
     {
        title: "Plano de Estudos",
        url: "/Plans",
        icon: Box,
        isActive: false,
    },
     {
        title: "Chat",
        url: "/Chat",
        icon: Box,
        isActive: false,
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

    const { open } = useSidebar();
    
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center justify-center h-12 mt-2 mb-2">
                   <Image
                        src="/assests/Sync.png" 
                        alt="Logo Sync Study"
                        width={open ? 120 : 40}
                        height={40}
                        className="object-contain block dark:hidden [.purple_&]:hidden [.green_&]:hidden transition-all duration-200"
                    />

                 
                    <Image
                        src="/assests/Sync2.png" 
                        alt="Logo Sync Study Dark"
                        width={open ? 120 : 40}
                        height={40}
                        className="object-contain hidden dark:block [.purple_&]:block [.green_&]:block transition-all duration-200"
                    />
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <NavMain items={navData} />
            </SidebarContent>
            <SidebarRail />
            <div className="flex flex-col gap-2 p-1 mb-2">
                <NavMain items={suportNav} />
            </div>
        </Sidebar>
    );
}