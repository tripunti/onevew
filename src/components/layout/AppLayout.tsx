import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConnectionForm } from "@/components/connection/ConnectionForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConnectionForm, setShowConnectionForm] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
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
              <Button variant="ghost" size="sm" onClick={() => setShowConnectionForm(true)}>Settings</Button>
              <Button variant="ghost" size="sm">Profile</Button>
            </nav>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <Dialog open={showConnectionForm} onOpenChange={setShowConnectionForm}>
            <DialogContent className="max-w-6xl w-full">
              <ConnectionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  );
};
