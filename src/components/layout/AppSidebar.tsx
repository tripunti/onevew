
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, ListTodo, FolderKanban, LogOut } from "lucide-react";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar";

export const AppSidebar = () => {
  const location = useLocation();
  const { isConnected, disconnect, selectedProjects } = useAzureDevOps();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarSection>
        <SidebarItem>
          <Link to="/" className="flex items-center gap-2 px-2 py-1">
            <span className="font-bold text-xl">DevOps Explorer</span>
          </Link>
        </SidebarItem>
      </SidebarSection>
      
      <SidebarSection>
        <SidebarItem>
          <Link to="/">
            <Button 
              variant={isActive("/") ? "secondary" : "ghost"} 
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Connection
            </Button>
          </Link>
        </SidebarItem>
        
        {isConnected && (
          <>
            <SidebarItem>
              <Link to="/projects">
                <Button 
                  variant={isActive("/projects") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Projects
                  {selectedProjects.length > 0 && (
                    <span className="ml-auto bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                      {selectedProjects.length}
                    </span>
                  )}
                </Button>
              </Link>
            </SidebarItem>
            
            <SidebarItem>
              <Link to="/work-items">
                <Button 
                  variant={isActive("/work-items") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <ListTodo className="mr-2 h-4 w-4" />
                  Work Items
                </Button>
              </Link>
            </SidebarItem>
          </>
        )}
      </SidebarSection>
      
      {isConnected && (
        <SidebarSection className="mt-auto">
          <SidebarItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={disconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </SidebarItem>
        </SidebarSection>
      )}
    </Sidebar>
  );
};
