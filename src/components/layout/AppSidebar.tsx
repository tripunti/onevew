
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, ListTodo, FolderKanban, LogOut } from "lucide-react";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

export const AppSidebar = () => {
  const location = useLocation();
  const { isConnected, disconnect, selectedProjects } = useAzureDevOps();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <span className="font-bold text-xl">OneVew</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                variant={isActive("/") ? "default" : "outline"}
                isActive={isActive("/")}
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Connection</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isConnected && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    variant={isActive("/projects") ? "default" : "outline"} 
                    isActive={isActive("/projects")}
                    asChild
                  >
                    <Link to="/projects">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      <span>Projects</span>
                      {selectedProjects.length > 0 && (
                        <span className="ml-auto bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                          {selectedProjects.length}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    variant={isActive("/work-items") ? "default" : "outline"} 
                    isActive={isActive("/work-items")}
                    asChild
                  >
                    <Link to="/work-items">
                      <ListTodo className="mr-2 h-4 w-4" />
                      <span>Work Items</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      {isConnected && (
        <SidebarFooter>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={disconnect}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
