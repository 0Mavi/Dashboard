"use client";

import {
    BadgeCheck,
    LogOut,
    Settings,
} from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
   
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useUser } from "@/context/userContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner"; 
import { Button } from "./ui/button"; 

export function NavUser() {
   
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
        router.push("/Settings")
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="void" className="flex items-center gap-2 w-full p-2 h-auto"> 
                            <Avatar className="h-12 w-12">
                               
                                <Image
                                    src={user?.imagemPerfil || "/assests/marmita.png"}
                                    alt={user?.name ? `${user.name} profile picture` : "User profile picture"}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover" 
                                />
                            </Avatar>
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-[16px] font-semibold text-foreground leading-tight truncate">{user?.name || "Usuário"}</span>
                                <span className="text-[13px] text-foreground truncate">{user?.email || "Email@exemplo.com"}</span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-auto h-4 w-4 text-foreground"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-background text-foreground shadow-md border-secondary border-2"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >

                        <DropdownMenuGroup>
                            <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer" onClick={() => router.push("/MinhaConta")}> {/* Adicionei onClick para Minha Conta */}
                                <BadgeCheck size={18} />
                                <span className="text-sm">Minha conta</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer" onClick={handleRedirectSetting}>
                                <Settings size={18} />
                                <span className="text-sm">Configurações</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-popover" />

                        <DropdownMenuItem
                            className="flex items-center gap-2 px-4 py-2 hover:bg-popover  hover:text-white cursor-pointer"
                            onClick={onSubmit} 
                            disabled={isLoading} 
                        >
                            <LogOut size={18} />
                            <span className="text-sm">{isLoading ? "Saindo..." : "Desconectar"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}