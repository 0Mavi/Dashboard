"use client";

import type { LucideIcon } from "lucide-react";

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"; 
import { useEffect, useState } from "react";



export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[];
}) {
    const [activeItem, setActiveItem] = useState<string>("");
    const [pathname, setPathname] = useState<string>("");

   
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPathname(window.location.pathname);
        }
    }, []);

   
    useEffect(() => {
        if (pathname) {
            const activeMainItem = items.find((item) => item.url === pathname);
            if (activeMainItem) {
                setActiveItem(activeMainItem.url);
            }
        }
    }, [pathname, items]);


    const handleItemClick = (url: string) => {
        setActiveItem(url);
    };

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => (
                  
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            tooltip={item.title}
                            onClick={() => handleItemClick(item.url)}
                            isActive={activeItem === item.url}
                          
                            className="hover:bg-foreground hover:text-white"
                            asChild
                        >
                            <a href={item.url}>
                                {item.icon && (
                                    <item.icon 
                                      
                                        className={activeItem === item.url ? "text-white" : "text-foreground group-hover:text-white"}
                                    />
                                )}
                                <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}