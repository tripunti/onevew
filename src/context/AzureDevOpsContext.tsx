import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { AzureDevOpsConnection, Project, WorkItem, WorkItemHierarchy, WorkItemQueryResult } from '../types/azure-devops';

interface AzureDevOpsContextType {
  connection: AzureDevOpsConnection | null;
  isConnected: boolean;
  projects: Project[];
  selectedProjects: Project[];
  workItems: WorkItem[];
  workItemHierarchy: WorkItemHierarchy[];
  projectLoading: boolean;
  workItemsLoading: boolean;
  error: string | null;
  connect: (connection: AzureDevOpsConnection) => Promise<boolean>;
  disconnect: () => void;
  fetchProjects: () => Promise<Project[]>;
  selectProject: (project: Project) => void;
  toggleProjectSelection: (project: Project) => void;
  selectAllProjects: () => void;
  unselectAllProjects: () => void;
  fetchWorkItems: (projectIds: string[]) => Promise<WorkItem[]>;
  buildWorkItemHierarchy: (items: WorkItem[]) => WorkItemHierarchy[];
  toggleItemExpansion: (itemId: number | string) => void;
}

const AzureDevOpsContext = createContext<AzureDevOpsContextType | undefined>(undefined);

export const AzureDevOpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<AzureDevOpsConnection | null>(
    JSON.parse(localStorage.getItem('azureConnection') || 'null')
  );
  const [isConnected, setIsConnected] = useState<boolean>(!!connection);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>(
    JSON.parse(localStorage.getItem('selectedProjects') || '[]')
  );
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [workItemHierarchy, setWorkItemHierarchy] = useState<WorkItemHierarchy[]>([]);
  const [projectLoading, setProjectLoading] = useState<boolean>(false);
  const [workItemsLoading, setWorkItemsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure all project IDs are strings everywhere
  const normalizeProjectId = (id: string | number) => String(id);

  // Mock API calls for demo purposes
  const connect = async (connectionDetails: AzureDevOpsConnection): Promise<boolean> => {
    setProjectLoading(true);
    setError(null);

    try {
      // Extract organization from organizationUrl
      const orgMatch = connectionDetails.organizationUrl.match(/https:\/\/dev\.azure\.com\/([^/]+)/i);
      if (!orgMatch) throw new Error('Invalid organization URL');
      const organization = orgMatch[1];

      // Try to fetch projects as a validation step
      const response = await fetch(
        `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`,
        {
          headers: {
            'Authorization': `Basic ${btoa(':' + connectionDetails.personalAccessToken)}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to connect to Azure DevOps');
      // If we get here, the connection is valid
      const newConnection = { ...connectionDetails };
      localStorage.setItem('azureConnection', JSON.stringify(newConnection));
      setConnection(newConnection);
      setIsConnected(true);
      toast.success("Connected to Azure DevOps");
      setProjectLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Azure DevOps';
      setError(errorMessage);
      toast.error(errorMessage);
      setProjectLoading(false);
      return false;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('azureConnection');
    localStorage.removeItem('selectedProjects');
    setConnection(null);
    setIsConnected(false);
    setSelectedProjects([]);
    setProjects([]);
    setWorkItems([]);
    setWorkItemHierarchy([]);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    setProjectLoading(true);
    setError(null);
    try {
      if (!connection) throw new Error('No Azure DevOps connection');
      // Extract organization from organizationUrl
      const orgMatch = connection.organizationUrl.match(/https:\/\/dev\.azure\.com\/([^/]+)/i);
      if (!orgMatch) throw new Error('Invalid organization URL');
      const organization = orgMatch[1];
      // Fetch projects from Azure DevOps REST API
      const response = await fetch(
        `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`,
        {
          headers: {
            'Authorization': `Basic ${btoa(':' + connection.personalAccessToken)}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      const projects: Project[] = (data.value || []).map((proj: any) => ({
        id: proj.id,
        name: proj.name,
        description: proj.description,
        url: proj.url || `${connection.organizationUrl}/${proj.name}`,
        state: proj.state,
        visibility: proj.visibility,
        lastUpdateTime: proj.lastUpdateTime || new Date().toISOString(),
      }));
      setProjects(projects);
      // Filter selectedProjects to only real projects
      const realProjectIds = new Set(projects.map(p => p.id));
      const filteredSelected = selectedProjects.filter(p => realProjectIds.has(p.id));
      if (filteredSelected.length === 0) {
        setSelectedProjects(projects);
        localStorage.setItem('selectedProjects', JSON.stringify(projects));
      } else if (filteredSelected.length !== selectedProjects.length) {
        setSelectedProjects(filteredSelected);
        localStorage.setItem('selectedProjects', JSON.stringify(filteredSelected));
      }
      setProjectLoading(false);
      return projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      setProjectLoading(false);
      return [];
    }
  };

  // Update project selection to support multiple selections
  const selectProject = (project: Project) => {
    const updatedSelection = [project];
    setSelectedProjects(updatedSelection);
    localStorage.setItem('selectedProjects', JSON.stringify(updatedSelection));
    
    // Fetch work items for this project
    fetchWorkItems([project.id]);
  };
  
  const toggleProjectSelection = (project: Project) => {
    const isSelected = selectedProjects.some(p => p.id === project.id);
    let updatedSelection: Project[];
    
    if (isSelected) {
      updatedSelection = selectedProjects.filter(p => p.id !== project.id);
    } else {
      updatedSelection = [...selectedProjects, project];
    }
    
    console.log("Updated project selection:", updatedSelection);
    setSelectedProjects(updatedSelection);
    localStorage.setItem('selectedProjects', JSON.stringify(updatedSelection));
    
    // Fetch work items for all selected projects
    if (updatedSelection.length > 0) {
      console.log("Fetching work items after project selection change");
      fetchWorkItems(updatedSelection.map(p => p.id));
    } else {
      // Clear work items if no projects selected
      console.log("No projects selected, clearing work items");
      setWorkItems([]);
      setWorkItemHierarchy([]);
    }
  };
  
  const selectAllProjects = () => {
    console.log("Selecting all projects:", projects);
    setSelectedProjects(projects);
    localStorage.setItem('selectedProjects', JSON.stringify(projects));
    
    // Fetch work items for all projects
    fetchWorkItems(projects.map(p => p.id));
  };
  
  const unselectAllProjects = () => {
    console.log("Unselecting all projects");
    setSelectedProjects([]);
    localStorage.setItem('selectedProjects', JSON.stringify([]));
    
    // Clear work items if no projects selected
    setWorkItems([]);
    setWorkItemHierarchy([]);
  };

  // Add debug logs to fetchWorkItems function
  const fetchWorkItems = async (projectIds: string[]): Promise<WorkItem[]> => {
    if (!connection) return [];
    setWorkItemsLoading(true);
    setError(null);

    try {
      const orgMatch = connection.organizationUrl.match(/https:\/\/dev\.azure\.com\/([^/]+)/i);
      if (!orgMatch) throw new Error('Invalid organization URL');
      const organization = orgMatch[1];

      let allWorkItems: WorkItem[] = [];
      const fetchedIds = new Set<string>();
      const toFetchIds = new Set<string>();

      // Only fetch for projects that exist in the current projects list
      const selectedProjectObjs = projects.filter(p => projectIds.includes(p.id));
      for (const project of selectedProjectObjs) {
        const projectName = project.name;
        // 1. Query for work item IDs using WIQL
        const wiql = {
          query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${projectName}' ORDER BY [System.ChangedDate] DESC`
        };
        console.log(`[WIQL QUERY] For project '${projectName}':`, wiql.query);
        const wiqlUrl = `https://dev.azure.com/${organization}/${encodeURIComponent(projectName)}/_apis/wit/wiql?api-version=7.0`;
        const wiqlResponse = await fetch(
          wiqlUrl,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(':' + connection.personalAccessToken)}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(wiql),
          }
        );
        const wiqlData = await wiqlResponse.json();
        console.log(`[WIQL] Project: ${projectName}, URL: ${wiqlUrl}, Data:`, wiqlData);
        const ids = (wiqlData.workItems || []).map((wi: any) => String(wi.id)).slice(0, 100); // Limit for demo
        ids.forEach(id => toFetchIds.add(id));
      }

      // Recursively fetch all work items and their parents
      let fetchDepth = 0;
      const MAX_DEPTH = 5; // Prevent infinite loops
      while (toFetchIds.size > 0 && fetchDepth < MAX_DEPTH) {
        const idsToFetch = Array.from(toFetchIds).filter(id => !fetchedIds.has(id));
        if (idsToFetch.length === 0) break;
        // Fetch in batches of 100
        for (let i = 0; i < idsToFetch.length; i += 100) {
          const batch = idsToFetch.slice(i, i + 100);
          const itemsResponse = await fetch(
            `https://dev.azure.com/${organization}/_apis/wit/workitemsbatch?api-version=7.0`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(':' + connection.personalAccessToken)}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids: batch, $expand: 'relations' }),
            }
          );
          const itemsData = await itemsResponse.json();
          console.log(`[WorkItemsBatch] Batch:`, batch, 'Data:', itemsData);
          const mappedItems: WorkItem[] = (itemsData.value || []).map((item: any) => {
            const projectNameField = item.fields && item.fields['System.TeamProject'] ? String(item.fields['System.TeamProject']) : '';
            const projectObj = projects.find(p => p.name === projectNameField);
            const projectId = projectObj ? String(projectObj.id) : '';
            return {
              id: String(item.id),
              rev: item.rev,
              fields: item.fields,
              relations: item.relations,
              url: item.url,
              projectRef: {
                id: projectId,
                name: projectNameField,
              },
            };
          });
          mappedItems.forEach(item => {
            if (!fetchedIds.has(item.id)) {
              allWorkItems.push(item);
              fetchedIds.add(item.id);
              // Find parent IDs from relations
              if (item.relations) {
                item.relations.forEach(rel => {
                  if (rel.rel === 'System.LinkTypes.Hierarchy-Reverse') {
                    const urlParts = rel.url.split('/');
                    const parentId = String(urlParts[urlParts.length - 1]);
                    const childId = String(item.id);
                    if (!fetchedIds.has(parentId)) {
                      toFetchIds.add(parentId);
                    }
                  }
                });
              }
            }
          });
          // Remove fetched IDs from toFetchIds
          batch.forEach(id => toFetchIds.delete(id));
        }
        fetchDepth++;
      }

      setWorkItems(allWorkItems);

      // Debug: Print all fetched work item IDs
      const allIds = allWorkItems.map(wi => String(wi.id));
      console.log('[DEBUG] All fetched work item IDs:', allIds);

      // Debug: Print all parent IDs referenced in relations
      const allParentIds = [];
      allWorkItems.forEach(item => {
        if (item.relations) {
          item.relations.forEach(rel => {
            if (rel.rel === 'System.LinkTypes.Hierarchy-Reverse') {
              const urlParts = rel.url.split('/');
              const parentId = String(urlParts[urlParts.length - 1]);
              allParentIds.push(parentId);
            }
          });
        }
      });
      console.log('[DEBUG] All parent IDs referenced in relations:', allParentIds);

      // Debug: Print a table of each item's ID, title, and parent ID
      const itemTable = allWorkItems.map(item => {
        let parentId = null;
        if (item.relations) {
          const parentRel = item.relations.find(rel => rel.rel === 'System.LinkTypes.Hierarchy-Reverse');
          if (parentRel) {
            const urlParts = parentRel.url.split('/');
            parentId = String(urlParts[urlParts.length - 1]);
          }
        }
        return {
          id: String(item.id),
          title: item.fields && item.fields['System.Title'],
          parentId,
        };
      });
      console.table(itemTable);

      // Debug: Print parent/child relationships
      allWorkItems.forEach(item => {
        if (item.relations) {
          item.relations.forEach(rel => {
            if (rel.rel === 'System.LinkTypes.Hierarchy-Reverse') {
              const urlParts = rel.url.split('/');
              const parentId = String(urlParts[urlParts.length - 1]);
              console.log(`[DEBUG] Child ${item.id} ('${item.fields['System.Title']}') has parent ${parentId}`);
            }
          });
        }
      });

      setWorkItemHierarchy(buildWorkItemHierarchy(allWorkItems));
      setWorkItemsLoading(false);
      return allWorkItems;
    } catch (err) {
      setError('Failed to fetch work items');
      setWorkItemsLoading(false);
      return [];
    }
  };

  const buildWorkItemHierarchy = (items: WorkItem[]): WorkItemHierarchy[] => {
    if (!items.length) return [];

    // Create a map of all items by ID (as string)
    const itemsMap = new Map<string, WorkItem>();
    items.forEach(item => itemsMap.set(String(item.id), item));

    // Build parent and children maps
    const parentMap = new Map<string, string>(); // childId -> parentId
    const childrenMap = new Map<string, string[]>(); // parentId -> [childId]

    items.forEach(item => {
      if (item.relations) {
        item.relations.forEach(rel => {
          // Parent relation
          if (rel.rel === 'System.LinkTypes.Hierarchy-Reverse') {
            const urlParts = rel.url.split('/');
            const parentId = String(urlParts[urlParts.length - 1]);
            const childId = String(item.id);
            parentMap.set(childId, parentId);
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)!.push(childId);
          }
          // Child relation (optional, for completeness)
          if (rel.rel === 'System.LinkTypes.Hierarchy-Forward') {
            const urlParts = rel.url.split('/');
            const childId = String(urlParts[urlParts.length - 1]);
            const parentId = String(item.id);
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)!.push(childId);
            parentMap.set(childId, parentId);
          }
        });
      }
    });

    // For each selected project, create a top-level node
    const projectNodes: WorkItemHierarchy[] = [];
    selectedProjects.forEach(project => {
      const rootItems = items.filter(item =>
        !parentMap.has(String(item.id)) &&
        (item.projectRef && String(item.projectRef.id) === String(project.id))
      );
      const visited = new Set<string>();
      // Recursively build hierarchy for work items, skipping duplicates
      function buildHierarchy(item: WorkItem, level: number): WorkItemHierarchy | null {
        const itemId = String(item.id);
        if (visited.has(itemId)) return null;
        visited.add(itemId);
        const childrenIds = childrenMap.get(itemId) || [];
        return {
          item,
          children: childrenIds
            .map(childId => itemsMap.get(childId))
            .filter(Boolean)
            .map(childItem => buildHierarchy(childItem!, level + 1))
            .filter(Boolean) as WorkItemHierarchy[],
          level,
          isExpanded: level < 2,
        };
      }
      const children = rootItems.map(item => buildHierarchy(item, 1)).filter(Boolean) as WorkItemHierarchy[];
      const projectNode: WorkItemHierarchy = {
        item: {
          id: String(project.id),
          rev: 1,
          fields: {
            'System.Title': project.name,
            'System.State': project.state,
            'System.WorkItemType': 'Project',
            'System.CreatedDate': project.lastUpdateTime,
            'System.ChangedDate': project.lastUpdateTime,
            'System.Description': project.description || `Project: ${project.name}`
          },
          url: project.url,
          projectRef: {
            id: String(project.id),
            name: project.name
          }
        },
        children,
        level: 0,
        isExpanded: true,
      };
      projectNodes.push(projectNode);
    });
    return projectNodes;
  };

  const toggleItemExpansion = (itemId: number | string) => {
    const stringItemId = String(itemId);
    // Helper function to toggle expansion state recursively
    const toggleExpansion = (hierarchies: WorkItemHierarchy[]): WorkItemHierarchy[] => {
      return hierarchies.map(hierarchy => {
        if (hierarchy.item.id === stringItemId) {
          return { ...hierarchy, isExpanded: !hierarchy.isExpanded };
        } else if (hierarchy.children && hierarchy.children.length > 0) {
          return { ...hierarchy, children: toggleExpansion(hierarchy.children) };
        }
        return hierarchy;
      });
    };
    setWorkItemHierarchy(toggleExpansion(workItemHierarchy));
  };
  
  // Check if we have a saved connection on mount
  useEffect(() => {
    if (connection && isConnected) {
      fetchProjects().then(fetchedProjects => {
        // If we have selected projects saved, fetch their work items
        if (selectedProjects.length > 0) {
          console.log("Fetching work items for selected projects:", selectedProjects);
          fetchWorkItems(selectedProjects.map(p => p.id));
        } else if (fetchedProjects.length > 0) {
          // Otherwise, select all projects by default
          setSelectedProjects(fetchedProjects);
          localStorage.setItem('selectedProjects', JSON.stringify(fetchedProjects));
          console.log("Fetching work items for all projects:", fetchedProjects);
          fetchWorkItems(fetchedProjects.map(p => p.id));
        }
      });
    }
  }, [isConnected]);
  
  return (
    <AzureDevOpsContext.Provider
      value={{
        connection,
        isConnected,
        projects,
        selectedProjects,
        workItems,
        workItemHierarchy,
        projectLoading,
        workItemsLoading,
        error,
        connect,
        disconnect,
        fetchProjects,
        selectProject,
        toggleProjectSelection,
        selectAllProjects,
        unselectAllProjects,
        fetchWorkItems,
        buildWorkItemHierarchy,
        toggleItemExpansion,
      }}
    >
      {children}
    </AzureDevOpsContext.Provider>
  );
};

export const useAzureDevOps = (): AzureDevOpsContextType => {
  const context = useContext(AzureDevOpsContext);
  if (context === undefined) {
    throw new Error('useAzureDevOps must be used within an AzureDevOpsProvider');
  }
  return context;
};
