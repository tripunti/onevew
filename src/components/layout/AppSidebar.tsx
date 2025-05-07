
import React from "react";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Folder, Home, List, Search, Settings } from "lucide-react";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";

export const AppSidebar = () => {
  const { isConnected, selectedProject, disconnect } = useAzureDevOps();

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center px-4 border-b">
        <h2 className="text-lg font-semibold">DevOps Flow</h2>
        <div className="flex-1" />
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        {isConnected ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/">
                        <Home className="w-4 h-4 mr-2" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/projects">
                        <Folder className="w-4 h-4 mr-2" />
                        <span>Projects</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/work-items">
                        <List className="w-4 h-4 mr-2" />
                        <span>Work Items</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/search">
                        <Search className="w-4 h-4 mr-2" />
                        <span>Search</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {selectedProject && (
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center">
                  <span className="flex-1">{selectedProject.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/board">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Board</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            
            <div className="mt-auto pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/">
                      <Home className="w-4 h-4 mr-2" />
                      <span>Connect</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
