
import React from "react";
import { WorkItemHierarchy } from "@/types/azure-devops";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WorkItemRowProps {
  workItemHierarchy: WorkItemHierarchy;
}

export const WorkItemRow: React.FC<WorkItemRowProps> = ({ workItemHierarchy }) => {
  const { toggleItemExpansion } = useAzureDevOps();
  const { item, children, isExpanded } = workItemHierarchy;
  
  const hasChildren = children && children.length > 0;
  
  // Get work item type-specific styling
  const getWorkItemTypeStyles = () => {
    const type = item.fields["System.WorkItemType"];
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
    const state = item.fields["System.State"];
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
  
  const handleToggle = () => {
    toggleItemExpansion(item.id);
  };
  
  return (
    <div
      className={cn(
        "group flex items-center py-2 px-2 rounded-md hover:bg-muted/50 text-sm",
      )}
    >
      <div className="flex-1 flex items-center min-w-0">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" /> // Spacer
        )}
        
        <div className="truncate flex-1 flex items-center">
          <Badge variant="outline" className={cn("mr-2 font-medium", getWorkItemTypeStyles())}>
            {item.fields["System.WorkItemType"]}
          </Badge>
          
          <span className="truncate font-medium">
            {item.fields["System.Title"]}
          </span>
          
          <Badge variant="outline" className={cn("ml-2", getStateStyles())}>
            {item.fields["System.State"]}
          </Badge>
          
          {item.fields["System.AssignedTo"] && (
            <span className="ml-2 text-xs text-muted-foreground truncate">
              {item.fields["System.AssignedTo"].displayName}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        #{item.id}
      </div>
    </div>
  );
};
