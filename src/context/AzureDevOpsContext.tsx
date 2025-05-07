
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from "sonner";
import { AzureDevOpsConnection, Project, WorkItem, WorkItemHierarchy, WorkItemQueryResult } from '../types/azure-devops';

interface AzureDevOpsContextType {
  connection: AzureDevOpsConnection | null;
  isConnected: boolean;
  projects: Project[];
  selectedProject: Project | null;
  workItems: WorkItem[];
  workItemHierarchy: WorkItemHierarchy[];
  loading: boolean;
  error: string | null;
  connect: (connection: AzureDevOpsConnection) => Promise<boolean>;
  disconnect: () => void;
  fetchProjects: () => Promise<Project[]>;
  selectProject: (project: Project) => void;
  fetchWorkItems: (projectId: string) => Promise<WorkItem[]>;
  buildWorkItemHierarchy: (items: WorkItem[]) => WorkItemHierarchy[];
  toggleItemExpansion: (itemId: number) => void;
}

const AzureDevOpsContext = createContext<AzureDevOpsContextType | undefined>(undefined);

export const AzureDevOpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<AzureDevOpsConnection | null>(
    JSON.parse(localStorage.getItem('azureConnection') || 'null')
  );
  const [isConnected, setIsConnected] = useState<boolean>(!!connection);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    JSON.parse(localStorage.getItem('selectedProject') || 'null')
  );
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [workItemHierarchy, setWorkItemHierarchy] = useState<WorkItemHierarchy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock API calls for demo purposes
  const connect = async (connectionDetails: AzureDevOpsConnection): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, validate the connection with Azure DevOps API
      // For demo: simulate a successful connection
      
      // Mock successful connection
      const newConnection = {
        ...connectionDetails,
      };
      
      localStorage.setItem('azureConnection', JSON.stringify(newConnection));
      setConnection(newConnection);
      setIsConnected(true);
      
      toast.success("Connected to Azure DevOps");
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Azure DevOps';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('azureConnection');
    localStorage.removeItem('selectedProject');
    setConnection(null);
    setIsConnected(false);
    setSelectedProject(null);
    setProjects([]);
    setWorkItems([]);
    setWorkItemHierarchy([]);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch projects from Azure DevOps API
      // For demo: return mock projects
      
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Contoso Web App',
          description: 'Main web application for Contoso',
          url: 'https://dev.azure.com/contoso/web-app',
          state: 'wellFormed',
          visibility: 'private',
          lastUpdateTime: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Contoso Mobile App',
          description: 'Mobile application for Contoso',
          url: 'https://dev.azure.com/contoso/mobile-app',
          state: 'wellFormed',
          visibility: 'private',
          lastUpdateTime: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Contoso API',
          description: 'Backend API services',
          url: 'https://dev.azure.com/contoso/api',
          state: 'wellFormed',
          visibility: 'private',
          lastUpdateTime: new Date().toISOString()
        }
      ];
      
      setProjects(mockProjects);
      setLoading(false);
      return mockProjects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
    // Fetch work items for this project
    fetchWorkItems(project.id);
  };

  const fetchWorkItems = async (projectId: string): Promise<WorkItem[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch work items from Azure DevOps API
      // For demo: return mock work items
      
      // Generate a hierarchy of work items
      const mockWorkItems: WorkItem[] = generateMockWorkItems();
      
      setWorkItems(mockWorkItems);
      
      // Build hierarchy
      const hierarchy = buildWorkItemHierarchy(mockWorkItems);
      setWorkItemHierarchy(hierarchy);
      
      setLoading(false);
      return mockWorkItems;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work items';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  // Helper function to generate mock work items with parent-child relationships
  const generateMockWorkItems = (): WorkItem[] => {
    // Generate epics, features, user stories, and tasks
    const workItems: WorkItem[] = [];
    
    // Create 2 epics
    for (let epicId = 1; epicId <= 2; epicId++) {
      const epic: WorkItem = {
        id: epicId,
        rev: 1,
        fields: {
          'System.Title': `Epic ${epicId}`,
          'System.State': 'Active',
          'System.WorkItemType': 'Epic',
          'System.CreatedDate': new Date().toISOString(),
          'System.ChangedDate': new Date().toISOString(),
          'System.Description': `This is Epic ${epicId}`,
          'Microsoft.VSTS.Common.Priority': 1
        },
        url: `https://dev.azure.com/org/project/_apis/wit/workItems/${epicId}`,
        relations: []
      };
      workItems.push(epic);
      
      // Create 2-3 features per epic
      for (let featureIndex = 0; featureIndex < 2 + Math.floor(Math.random() * 2); featureIndex++) {
        const featureId = workItems.length + 1;
        const feature: WorkItem = {
          id: featureId,
          rev: 1,
          fields: {
            'System.Title': `Feature ${featureId}`,
            'System.State': ['New', 'Active', 'Resolved'][Math.floor(Math.random() * 3)],
            'System.WorkItemType': 'Feature',
            'System.CreatedDate': new Date().toISOString(),
            'System.ChangedDate': new Date().toISOString(),
            'System.Description': `This is Feature ${featureId}`,
            'Microsoft.VSTS.Common.Priority': 2
          },
          url: `https://dev.azure.com/org/project/_apis/wit/workItems/${featureId}`,
          relations: [
            {
              rel: 'System.LinkTypes.Hierarchy-Reverse',
              url: `https://dev.azure.com/org/project/_apis/wit/workItems/${epicId}`,
              attributes: {
                name: 'Parent'
              }
            }
          ]
        };
        workItems.push(feature);
        
        // Create 2-4 user stories per feature
        for (let storyIndex = 0; storyIndex < 2 + Math.floor(Math.random() * 3); storyIndex++) {
          const storyId = workItems.length + 1;
          const userStory: WorkItem = {
            id: storyId,
            rev: 1,
            fields: {
              'System.Title': `User Story ${storyId}`,
              'System.State': ['New', 'Active', 'Resolved', 'Closed'][Math.floor(Math.random() * 4)],
              'System.WorkItemType': 'User Story',
              'System.CreatedDate': new Date().toISOString(),
              'System.ChangedDate': new Date().toISOString(),
              'System.Description': `This is User Story ${storyId}`,
              'Microsoft.VSTS.Common.Priority': 2
            },
            url: `https://dev.azure.com/org/project/_apis/wit/workItems/${storyId}`,
            relations: [
              {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: `https://dev.azure.com/org/project/_apis/wit/workItems/${featureId}`,
                attributes: {
                  name: 'Parent'
                }
              }
            ]
          };
          workItems.push(userStory);
          
          // Create 1-5 tasks per user story
          for (let taskIndex = 0; taskIndex < 1 + Math.floor(Math.random() * 5); taskIndex++) {
            const taskId = workItems.length + 1;
            const task: WorkItem = {
              id: taskId,
              rev: 1,
              fields: {
                'System.Title': `Task ${taskId}`,
                'System.State': ['To Do', 'In Progress', 'Done'][Math.floor(Math.random() * 3)],
                'System.WorkItemType': 'Task',
                'System.CreatedDate': new Date().toISOString(),
                'System.ChangedDate': new Date().toISOString(),
                'System.Description': `This is Task ${taskId}`,
                'Microsoft.VSTS.Common.Priority': 3,
                'System.AssignedTo': {
                  displayName: `User ${Math.floor(Math.random() * 5) + 1}`,
                  uniqueName: `user${Math.floor(Math.random() * 5) + 1}@example.com`
                }
              },
              url: `https://dev.azure.com/org/project/_apis/wit/workItems/${taskId}`,
              relations: [
                {
                  rel: 'System.LinkTypes.Hierarchy-Reverse',
                  url: `https://dev.azure.com/org/project/_apis/wit/workItems/${storyId}`,
                  attributes: {
                    name: 'Parent'
                  }
                }
              ]
            };
            workItems.push(task);
          }
        }
      }
    }
    
    return workItems;
  };

  const buildWorkItemHierarchy = (items: WorkItem[]): WorkItemHierarchy[] => {
    if (!items.length) return [];
    
    // Create a map of all items by ID
    const itemsMap = new Map<number, WorkItem>();
    items.forEach(item => itemsMap.set(item.id, item));
    
    // Function to find a parent ID from relations
    const findParentId = (item: WorkItem): number | null => {
      if (!item.relations) return null;
      
      const parentRelation = item.relations.find(rel => 
        rel.rel === 'System.LinkTypes.Hierarchy-Reverse');
      
      if (!parentRelation) return null;
      
      // Extract ID from URL
      const urlParts = parentRelation.url.split('/');
      const parentId = parseInt(urlParts[urlParts.length - 1]);
      return parentId;
    };
    
    // Create a map of parent to children
    const childrenMap = new Map<number, number[]>();
    
    // Identify all children relationships
    items.forEach(item => {
      const parentId = findParentId(item);
      if (parentId !== null) {
        const currentChildren = childrenMap.get(parentId) || [];
        childrenMap.set(parentId, [...currentChildren, item.id]);
      }
    });
    
    // Function to build hierarchy recursively
    const buildHierarchy = (itemId: number, level: number): WorkItemHierarchy => {
      const item = itemsMap.get(itemId)!;
      const children = childrenMap.get(itemId) || [];
      
      return {
        item,
        children: children.map(childId => buildHierarchy(childId, level + 1)),
        level,
        isExpanded: true, // Default to expanded
      };
    };
    
    // Find root items (no parent)
    const rootItemIds = items
      .filter(item => !findParentId(item))
      .map(item => item.id);
    
    // Build hierarchy starting from root items
    return rootItemIds.map(id => buildHierarchy(id, 0));
  };

  const toggleItemExpansion = (itemId: number) => {
    // Helper function to toggle expansion state recursively
    const toggleExpansion = (hierarchies: WorkItemHierarchy[]): WorkItemHierarchy[] => {
      return hierarchies.map(hierarchy => {
        if (hierarchy.item.id === itemId) {
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
  React.useEffect(() => {
    if (connection && isConnected) {
      fetchProjects();
      
      if (selectedProject) {
        fetchWorkItems(selectedProject.id);
      }
    }
  }, []);

  return (
    <AzureDevOpsContext.Provider
      value={{
        connection,
        isConnected,
        projects,
        selectedProject,
        workItems,
        workItemHierarchy,
        loading,
        error,
        connect,
        disconnect,
        fetchProjects,
        selectProject,
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
