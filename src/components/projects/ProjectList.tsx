
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/azure-devops";
import { format } from "date-fns";

export const ProjectList: React.FC = () => {
  const { projects, loading, toggleProjectSelection, selectedProjects } = useAzureDevOps();
  
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
  
  const handleToggleProjectSelection = (project: Project) => {
    toggleProjectSelection(project);
  };
  
  const isProjectSelected = (projectId: string) => {
    return selectedProjects.some(p => p.id === projectId);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projects.map(project => (
        <Card 
          key={project.id} 
          className={isProjectSelected(project.id) ? "border-primary/50 shadow-md" : ""}
        >
          <CardHeader>
            <div className="flex items-start gap-2">
              <Checkbox 
                id={`project-${project.id}`}
                checked={isProjectSelected(project.id)}
                onCheckedChange={() => handleToggleProjectSelection(project)}
              />
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.visibility} • Last updated {format(new Date(project.lastUpdateTime), "MMM d, yyyy")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description || "No description provided."}
            </p>
            <div className="flex justify-end">
              <Button 
                variant={isProjectSelected(project.id) ? "default" : "outline"} 
                size="sm"
                onClick={() => handleToggleProjectSelection(project)}
              >
                {isProjectSelected(project.id) ? "Selected" : "Select Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
