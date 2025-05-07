
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/azure-devops";
import { format } from "date-fns";

export const ProjectList: React.FC = () => {
  const { projects, loading, selectProject, selectedProject } = useAzureDevOps();
  
  React.useEffect(() => {
    // This effect is left empty intentionally because fetching is handled in the context
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!projects.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No projects found in this organization.
      </div>
    );
  }
  
  const handleSelectProject = (project: Project) => {
    selectProject(project);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projects.map(project => (
        <Card 
          key={project.id} 
          className={selectedProject?.id === project.id ? "border-primary/50 shadow-md" : ""}
        >
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              {project.visibility} • Last updated {format(new Date(project.lastUpdateTime), "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description || "No description provided."}
            </p>
            <div className="flex justify-end">
              <Button 
                variant={selectedProject?.id === project.id ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSelectProject(project)}
              >
                {selectedProject?.id === project.id ? "Selected" : "Select Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
