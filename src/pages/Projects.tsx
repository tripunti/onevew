
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const Projects = () => {
  const { isConnected, fetchProjects, selectedProjects, selectAllProjects, unselectAllProjects } = useAzureDevOps();
  
  useEffect(() => {
    if (isConnected) {
      fetchProjects();
    }
  }, [isConnected]);
  
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
  
  return (
    <AppLayout>
      <div className="container py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground mb-4">
            Select projects to view their work items and hierarchy.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={selectAllProjects}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" /> Select All
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={unselectAllProjects}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Unselect All
            </Button>
            
            {selectedProjects.length > 0 && (
              <Button 
                variant="default" 
                size="sm"
                asChild
              >
                <a href="/work-items">View Work Items ({selectedProjects.length} projects)</a>
              </Button>
            )}
          </div>
        </div>
        
        <ProjectList />
      </div>
    </AppLayout>
  );
};

export default Projects;
