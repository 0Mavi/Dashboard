"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react"; 
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "purple", label: "Roxo" },
  { value: "green", label: "Verde" },
];

export function ThemeSelector() { 
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="defaultV" 
          size="icon"  
          className="justify-center"
        >
          <Palette className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
       className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-[8px] bg-background text-foreground shadow-md border-secondary border-2"
        align="end">
        <DropdownMenuLabel>Paletas de Cores</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-popover hover:text-white cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <span>{t.label}</span>
              {theme === t.value && <Check className="ml-2 h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
