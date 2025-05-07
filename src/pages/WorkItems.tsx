
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { WorkItemList } from "@/components/work-items/WorkItemList";
import { WorkItemDetail } from "@/components/work-items/WorkItemDetail";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const WorkItems = () => {
  const { 
    isConnected, 
    selectedProjects, 
    workItems, 
    workItemHierarchy,
    loading,
    fetchWorkItems 
  } = useAzureDevOps();
  
  const [selectedWorkItem, setSelectedWorkItem] = useState<number | null>(null);
  
  // Fetch work items when the component mounts
  useEffect(() => {
    if (selectedProjects.length > 0) {
      console.log("WorkItems page: Fetching work items for selected projects");
      fetchWorkItems(selectedProjects.map(p => p.id));
    }
  }, [selectedProjects]);
  
  console.log("WorkItems page: Current hierarchy:", workItemHierarchy);
  console.log("WorkItems page: Selected projects:", selectedProjects);
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  if (selectedProjects.length === 0) {
    return <Navigate to="/projects" replace />;
  }
  
  const currentWorkItem = selectedWorkItem 
    ? workItems.find(item => item.id === selectedWorkItem) 
    : null;
  
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="border-b p-4 bg-background">
          <div className="container max-w-6xl">
            <h1 className="text-2xl font-bold">
              {selectedProjects.length === 1 
                ? selectedProjects[0].name 
                : `${selectedProjects.length} Projects Selected`}
            </h1>
            <p className="text-muted-foreground flex flex-wrap gap-1">
              Work Items for: 
              {selectedProjects.map((project, index) => (
                <span key={project.id} className="font-medium">
                  {project.name}{index < selectedProjects.length - 1 ? ',' : ''}
                </span>
              ))}
            </p>
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
