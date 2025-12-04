"use client";

import {
  BadgeCheck,
  LogOut,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function NavUserPhoto() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.error("Erro ao carregar usuário do localStorage");
      }
    }
  }, []);

  const userName: string = user?.name ?? "Usuário";
  const userImage: string | undefined = user?.image;

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const handleLogout = () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("id_token");
      localStorage.removeItem("user");
      toast("Logout bem-sucedido!", { duration: 2000 });
      router.push("/Login");
    } catch (err: any) {
      console.error(err);
      toast("Erro ao desconectar!", { description: err.message, duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectSetting = () => router.push("/Settings");
  const handleRedirectProfile = () => router.push("/MinhaConta");

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse ml-auto" />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost2" 
              className="flex items-center gap-2 w-full p-2 h-auto justify-between group hover:bg-sidebar-accent"
            >
            
              <span className="text-[16px] font-semibold  group-hover:text-sidebar-accent-foreground leading-tight truncate">
                {userName}
              </span>

              <Avatar className="h-9 w-9 ml-auto flex items-center justify-center bg-muted text-foreground font-semibold border border-sidebar-border">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-[8px] bg-popover text-popover-foreground shadow-md border-border border"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center gap-2 px-4 py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                onClick={handleRedirectProfile}
              >
                <BadgeCheck size={18} />
                <span className="text-sm">Minha conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-4 py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                onClick={handleRedirectSetting}
              >
                <Settings size={18} />
                <span className="text-sm">Configurações</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex items-center gap-2 px-4 py-2 cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={handleLogout}
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