"use client";

import type { LucideIcon } from "lucide-react";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible";

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
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={true}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem key={item.title}>
                           
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        onClick={() => handleItemClick(item.url)}
                                        isActive={activeItem === item.url}
                                        asChild
                                        className={`
                                            transition-colors duration-200 
                                            rounded-[5px] px-2 py-1.5 w-full flex items-center gap-2 
                                            ${
                                                activeItem === item.url
                                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground "
                                            }
                                        `}
                                    >
                                        <a href={item.url}>
                                            {item.icon && (
                                                <item.icon
                                                    className={`
                                                        w-5 h-5 transition-colors duration-200
                                                        ${
                                                            activeItem === item.url
                                                                ? "text-sidebar-primary"
                                                                : "text-sidebar-foreground group-hover/collapsible:text-sidebar-accent-foreground"
                                                        }
                                                    `}
                                                />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                               
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
