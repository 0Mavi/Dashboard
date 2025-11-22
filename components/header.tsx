import { Bell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "./ui/button";
import { NavUserPhoto } from "./nav-user-photo";
import { ThemeSelector } from "./theme-toggle";

export default function Header() {
    const [open, setOpen] = useState(false);

    function HandleOpenModal() {
        setOpen(!open);
    }

    return (
        <div className="flex w-full h-auto shrink-0 justify-between items-center bg-sidebar gap-2 transition-[width,height] ease-linear border-b border-sidebar-border px-5 py-2">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">Sync Study</h1>
            </div>
            <div className="flex items-center gap-x-3">
                <ThemeSelector />
                
                <NavUserPhoto />
            </div>
        </div>
    );
}
