
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { WorkItemList } from "@/components/work-items/WorkItemList";
import { WorkItemDetail } from "@/components/work-items/WorkItemDetail";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const WorkItems = () => {
  const { isConnected, selectedProject, workItems } = useAzureDevOps();
  const [selectedWorkItem, setSelectedWorkItem] = useState<number | null>(null);
  
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Not Connected</h1>
          <p className="mb-4">Please connect to Azure DevOps first.</p>
          <a href="/" className="text-brand-500 hover:underline">
            Go to connection page
          </a>
        </div>
      </div>
    );
  }
  
  if (!selectedProject) {
    return (
      <AppLayout>
        <div className="container py-10 text-center">
          <h1 className="text-2xl font-bold mb-2">No Project Selected</h1>
          <p className="mb-4">Please select a project to view work items.</p>
          <a href="/projects" className="text-brand-500 hover:underline">
            Go to projects
          </a>
        </div>
      </AppLayout>
    );
  }
  
  const currentWorkItem = selectedWorkItem 
    ? workItems.find(item => item.id === selectedWorkItem) 
    : null;
  
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="border-b p-4 bg-background">
          <div className="container max-w-6xl">
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            <p className="text-muted-foreground">Work Items</p>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Work Item List */}
          <div className={`w-full ${currentWorkItem ? 'md:w-1/2 lg:w-2/5' : ''} h-full overflow-hidden flex flex-col border-r`}>
            <div className="p-2 border-b bg-background">
              <h2 className="text-sm font-medium">Work Item Hierarchy</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <WorkItemList />
            </div>
          </div>
          
          {/* Work Item Detail */}
          {currentWorkItem && (
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 h-full flex-col">
              <div className="p-2 border-b bg-background flex items-center">
                <h2 className="text-sm font-medium flex-1">Work Item Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorkItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <WorkItemDetail workItem={currentWorkItem} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkItems;
