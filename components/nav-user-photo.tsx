"use client";

import {
    BadgeCheck,
    LogOut,
    Settings,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { useUser } from "@/context/userContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function NavUserPhoto() {
    const { user, setUser } = useUser();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("user");

            if (setUser) {
                setUser(null);
            }

            toast("Logout bem-sucedido!", {
                description: "Estamos te direcionando para a página de login.",
                duration: 2000,
                className: "bg-background text-foreground border border-foreground",
            });

            return true;
        } catch (err: any) {
            console.error("Erro ao fazer logout:", err);

            toast("Erro ao desconectar!", {
                description: err.message || "Ocorreu um erro ao tentar fazer logout.",
                duration: 3000,
                className: "bg-background text-foreground border border-foreground",
            });

            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async () => {
        const logoutSuccessful = await handleLogout();
        if (logoutSuccessful) {
            router.push("/Login");
        }
    };

    const handleRedirectSetting = () => {
        router.push("/Settings");
    };

    const handleRedirectProfile = () => {
        router.push("/MinhaConta");
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="void"
                            className="flex items-center gap-2 w-full p-2 h-auto justify-between"
                        >
                            <span className="text-[16px] font-semibold text-sidebar-foreground leading-tight truncate">
                                {user?.name || "Usuário"}
                            </span>

                            <Avatar className="h-12 w-12 ml-auto">
                                <Image
                                    src={user?.imagemPerfil || "/assests/foto.jpg"}
                                    alt={
                                        user?.name
                                            ? `${user.name} profile picture`
                                            : "User profile picture"
                                    }
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-[8px]  bg-background text-foreground shadow-md border-secondary border-2"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer"
                                onClick={handleRedirectProfile}
                            >
                                <BadgeCheck size={18} />
                                <span className="text-sm">Minha conta</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer"
                                onClick={handleRedirectSetting}
                            >
                                <Settings size={18} />
                                <span className="text-sm">Configurações</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-popover" />
                        <DropdownMenuItem
                            className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer"
                            onClick={onSubmit}
                            disabled={isLoading}
                        >
                            <LogOut size={18} />
                            <span className="text-sm">
                                {isLoading ? "Saindo..." : "Desconectar"}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}