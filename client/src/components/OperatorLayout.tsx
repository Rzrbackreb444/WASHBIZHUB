import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { OperatorSidebar } from "./OperatorSidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Search, User } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface OperatorLayoutProps {
  children: React.ReactNode;
  locationName?: string;
  title?: string;
}

export function OperatorLayout({ children, locationName, title }: OperatorLayoutProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-muted/30">
        <OperatorSidebar locationName={locationName} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-14 border-b bg-background px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {title && (
                <h1 className="font-semibold text-lg text-[#0A1628] dark:text-white hidden sm:block">
                  {title}
                </h1>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">
                  3
                </Badge>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild data-testid="button-profile">
                <Link href="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
