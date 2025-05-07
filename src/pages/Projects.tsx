
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

const Projects = () => {
  const { 
    isConnected, 
    fetchProjects, 
    selectedProjects, 
    selectAllProjects, 
    unselectAllProjects,
    loading
  } = useAzureDevOps();
  
  useEffect(() => {
    if (isConnected) {
      console.log("Projects page: Fetching projects");
      fetchProjects();
    }
  }, [isConnected]);
  
  console.log("Projects page: Selected projects:", selectedProjects);
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
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
              disabled={loading}
            >
              <Check className="h-4 w-4" /> Select All
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={unselectAllProjects}
              className="flex items-center gap-1"
              disabled={loading}
            >
              <X className="h-4 w-4" /> Unselect All
            </Button>
            
            {selectedProjects.length > 0 && (
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link to="/work-items">
                  View Work Items ({selectedProjects.length} projects) <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
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
