import React from "react";
import { WorkItemHierarchy } from "@/types/azure-devops";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Crown, Flag, List, CheckSquare, FileText } from "lucide-react";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WorkItemRowProps {
  workItemHierarchy: WorkItemHierarchy;
}

export const WorkItemRow: React.FC<WorkItemRowProps> = ({ workItemHierarchy }) => {
  const { toggleItemExpansion, connection } = useAzureDevOps();
  const { item, children, isExpanded, level } = workItemHierarchy;
  
  const hasChildren = children && children.length > 0;
  const workItemType = item.fields["System.WorkItemType"];
  const isProject = workItemType === "Project";
  
  // Get work item type-specific styling
  const getWorkItemTypeStyles = () => {
    switch (workItemType) {
      case "Project":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
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
  
  // Get work item type-specific icon
  const getWorkItemTypeIcon = () => {
    switch (workItemType) {
      case "Epic":
        return <span title="Epic"><Crown className="w-4 h-4 text-purple-500 mr-1" /></span>;
      case "Feature":
        return <span title="Feature"><Flag className="w-4 h-4 text-blue-500 mr-1" /></span>;
      case "User Story":
        return <span title="User Story"><List className="w-4 h-4 text-green-500 mr-1" /></span>;
      case "Task":
        return <span title="Task"><CheckSquare className="w-4 h-4 text-orange-500 mr-1" /></span>;
      case "Issue":
        return <span title="Issue"><FileText className="w-4 h-4 text-gray-500 mr-1" /></span>;
      case "Project":
        return <span title="Project"><Flag className="w-4 h-4 text-indigo-500 mr-1" /></span>;
      default:
        return <span title={workItemType}><FileText className="w-4 h-4 text-gray-400 mr-1" /></span>;
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
  
  // Build Azure DevOps web UI link for the work item
  const getWorkItemWebUrl = () => {
    if (!connection || !item.projectRef || !item.id) return undefined;
    // Extract organization from connection.organizationUrl
    const orgMatch = connection.organizationUrl.match(/https:\/\/dev\.azure\.com\/([^/]+)/i);
    const organization = orgMatch ? orgMatch[1] : undefined;
    const project = item.projectRef.name;
    const id = item.id;
    if (organization && project && id) {
      return `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_workitems/edit/${id}/`;
    }
    return undefined;
  };
  
  const handleToggle = () => {
    toggleItemExpansion(item.id);
  };
  
  return (
    <div
      className={cn(
        "group flex items-center py-2 px-2 rounded-md hover:bg-muted/50 text-sm",
        isProject && "font-semibold",
        // Indent children visually and add a left border for hierarchy
        level > 0 && "ml-4 pl-3 border-l-2 border-border"
      )}
      style={{ marginLeft: level > 0 ? `${level * 1.25}rem` : undefined }}
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
          <span className="mr-2 flex items-center justify-center">
            {getWorkItemTypeIcon()}
          </span>
          
          <span className={cn("truncate", isProject ? "font-semibold" : "font-medium")}>
            {isProject ? (
              (() => {
                if (!connection || !item.projectRef) return item.fields["System.Title"];
                const orgMatch = connection.organizationUrl.match(/https:\/\/dev\.azure\.com\/([^/]+)/i);
                const organization = orgMatch ? orgMatch[1] : undefined;
                const project = item.projectRef.name;
                if (organization && project) {
                  const projectUrl = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}`;
                  return (
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-inherit"
                      title="Open project in Azure DevOps"
                    >
                      {item.fields["System.Title"]}
                    </a>
                  );
                }
                return item.fields["System.Title"];
              })()
            ) : (
              getWorkItemWebUrl() ? (
                <a
                  href={getWorkItemWebUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-inherit"
                  title="Open in Azure DevOps"
                >
                  {item.fields["System.Title"]}
                </a>
              ) : (
                item.fields["System.Title"]
              )
            )}
          </span>
          
          {!isProject && (
            <Badge variant="outline" className={cn("ml-2", getStateStyles())}>
              {item.fields["System.State"]}
            </Badge>
          )}
          
          {item.fields["System.AssignedTo"] && (
            <span className="ml-2 text-xs text-muted-foreground truncate">
              {item.fields["System.AssignedTo"].displayName}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {!isProject && `#${item.id}`}
      </div>
    </div>
  );
};
