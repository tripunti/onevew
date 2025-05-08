import React from "react";
import { WorkItemHierarchy } from "@/types/azure-devops";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { WorkItemRow } from "./WorkItemRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const WorkItemList: React.FC = () => {
  const { workItemHierarchy, loading, selectedProjects, fetchWorkItems, workItems } = useAzureDevOps();
  
  console.log("WorkItemList - workItemHierarchy:", workItemHierarchy);
  console.log("WorkItemList - loading:", loading);
  
  const handleRefresh = () => {
    if (selectedProjects.length > 0) {
      fetchWorkItems(selectedProjects.map(p => p.id));
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!workItemHierarchy || workItemHierarchy.length === 0) {
    // Fallback: show all work items flat if any exist
    if (workItems && workItems.length > 0) {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <p className="text-center text-muted-foreground mb-4">
            No hierarchy found. Showing all work items:
          </p>
          <div className="w-full max-w-2xl mx-auto">
            {workItems.map(item => (
              <div key={item.id} className="border rounded p-2 mb-2 flex flex-col">
                <span className="font-medium">#{item.id} - {item.fields['System.Title']}</span>
                <span className="text-xs text-muted-foreground">{item.fields['System.WorkItemType']} | {item.fields['System.State']}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <p className="text-center text-muted-foreground mb-4">
          No work items found for the selected projects.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Work Items
        </Button>
      </div>
    );
  }
  
  const renderHierarchy = (items: WorkItemHierarchy[]) => {
    return (
      <div className="space-y-1">
        {items.map((hierarchyItem) => (
          <React.Fragment key={hierarchyItem.item.id}>
            <WorkItemRow
              workItemHierarchy={hierarchyItem}
            />
            
            {hierarchyItem.isExpanded && hierarchyItem.children.length > 0 && (
              <div className="ml-6 border-l pl-3 border-border">
                {renderHierarchy(hierarchyItem.children)}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {renderHierarchy(workItemHierarchy)}
      </div>
    </ScrollArea>
  );
};
