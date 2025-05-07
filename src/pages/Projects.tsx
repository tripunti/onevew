
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { ProjectList } from "@/components/projects/ProjectList";

const Projects = () => {
  const { isConnected, fetchProjects } = useAzureDevOps();
  
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
          <p className="text-muted-foreground">
            Select a project to view its work items and hierarchy.
          </p>
        </div>
        
        <ProjectList />
      </div>
    </AppLayout>
  );
};

export default Projects;
