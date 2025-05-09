import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/azure-devops";
import { format } from "date-fns";
import { Check, X, RefreshCw, SquareCheck, Square } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const ProjectList: React.FC = () => {
  const { projects, projectLoading, toggleProjectSelection, selectedProjects, selectAllProjects, unselectAllProjects } = useAzureDevOps();
  
  React.useEffect(() => {
    // This effect is left empty intentionally because fetching is handled in the context
  }, []);
  
  if (projectLoading) {
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
    <>
      <TooltipProvider>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold tracking-tight">Azure DevOps Projects</h2>
          <div className="flex gap-2 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={selectAllProjects} disabled={projectLoading} aria-label="Select All">
                  <SquareCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select All</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={unselectAllProjects} disabled={projectLoading} aria-label="Unselect All">
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Unselect All</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()} disabled={projectLoading} aria-label="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
        {projects.map(project => (
          <Card 
            key={project.id} 
            className={isProjectSelected(project.id) ? "border-primary/50 shadow-md" : ""}
          >
            <CardHeader className="py-2 px-3">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id={`project-${project.id}`}
                  checked={isProjectSelected(project.id)}
                  onCheckedChange={() => handleToggleProjectSelection(project)}
                />
                <div>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {project.visibility} • Last updated {format(new Date(project.lastUpdateTime), "MMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-3">
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
