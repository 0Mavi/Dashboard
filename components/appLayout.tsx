
import AppSidebar from "./app-sidebar";
import Header from "./header";

import { SidebarInset, SidebarProvider } from "./ui/sidebar";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className="flex w-full">
                    <div className="flex flex-col w-full bg-background h-full">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
