
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkItem } from "@/types/azure-devops";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface WorkItemDetailProps {
  workItem: WorkItem;
}

export const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ workItem }) => {
  const { fields } = workItem;
  
  // Get work item type-specific styling
  const getWorkItemTypeStyles = () => {
    const type = fields["System.WorkItemType"];
    switch (type) {
      case "Epic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Feature":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "User Story":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Task":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  // Get state-specific styling
  const getStateStyles = () => {
    const state = fields["System.State"];
    switch (state) {
      case "New":
      case "To Do":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Active":
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300";
      case "Resolved":
        return "bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-300";
      case "Closed":
      case "Done":
        return "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={cn(getWorkItemTypeStyles())}>
            {fields["System.WorkItemType"]}
          </Badge>
          <Badge className={cn(getStateStyles())}>
            {fields["System.State"]}
          </Badge>
          <span className="text-sm text-muted-foreground">#{workItem.id}</span>
        </div>
        
        <CardTitle>{fields["System.Title"]}</CardTitle>
        
        {fields["System.AssignedTo"] && (
          <CardDescription className="flex items-center mt-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2">
              {fields["System.AssignedTo"].displayName.charAt(0)}
            </div>
            <span>Assigned to {fields["System.AssignedTo"].displayName}</span>
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Created</p>
            <p>{format(new Date(fields["System.CreatedDate"]), "MMM d, yyyy")}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Last Updated</p>
            <p>{format(new Date(fields["System.ChangedDate"]), "MMM d, yyyy")}</p>
          </div>
          
          {fields["Microsoft.VSTS.Common.Priority"] && (
            <div>
              <p className="text-muted-foreground mb-1">Priority</p>
              <p>{fields["Microsoft.VSTS.Common.Priority"]}</p>
            </div>
          )}
          
          {fields["System.AreaPath"] && (
            <div>
              <p className="text-muted-foreground mb-1">Area Path</p>
              <p>{fields["System.AreaPath"]}</p>
            </div>
          )}
          
          {fields["System.IterationPath"] && (
            <div>
              <p className="text-muted-foreground mb-1">Iteration Path</p>
              <p>{fields["System.IterationPath"]}</p>
            </div>
          )}
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <div className="text-sm prose max-w-none">
            {fields["System.Description"] || "No description provided."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
