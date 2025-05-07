
import React from "react";
import { WorkItemHierarchy } from "@/types/azure-devops";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { WorkItemRow } from "./WorkItemRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export const WorkItemList: React.FC = () => {
  const { workItemHierarchy, loading } = useAzureDevOps();
  
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
  
  if (!workItemHierarchy.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No work items found. Select a project to view work items.
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
