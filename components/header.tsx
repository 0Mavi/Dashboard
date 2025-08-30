import { Bell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


import { Button } from "./ui/button";
import { NavUserPhoto } from "./nav-user-photo";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
    const [open, setOpen] = useState(false);

    function HandleOpenModal() {
        setOpen(!open);
    }

    return (
        <div className="flex w-full h-auto shrink-0 justify-between items-center bg-sidebar gap-2 transition-[width,height] ease-linear border-b border-sidebar-border px-5 py-2">
            <div className="flex items-center gap-2">
                <Image
                    src="/assests/header.jpg"
                    width={140}
                    height={140}
                    alt="Picture of the author"
                />
            </div>
            <div className="flex items-center gap-x-5">
                <ThemeToggle />
                <Button variant="transparent" size="void">
                    <Bell color="hsl(var(--primary))" />
                </Button>
                <NavUserPhoto />
            </div>
        </div>
    );
}
