
import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultIsOpen={true}>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-background">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-4 md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">Help</Button>
              <Button variant="ghost" size="sm">Settings</Button>
              <Button variant="ghost" size="sm">Profile</Button>
            </nav>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
