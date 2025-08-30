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
                            <CollapsibleTrigger asChild>
                                <CollapsibleContent>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        onClick={() => handleItemClick(item.url)}
                                        isActive={activeItem === item.url}
                                        className="hover:bg-foreground hover:text-white"
                                        asChild
                                    >
                                        <a href={item.url}>
                                            {item.icon && (
                                                <item.icon className={activeItem === item.url ? "text-white" : "text-foreground group-hover/collapsible:text-white"} />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </CollapsibleContent>
                            </CollapsibleTrigger>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}