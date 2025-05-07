import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from "sonner";
import { AzureDevOpsConnection, Project, WorkItem, WorkItemHierarchy, WorkItemQueryResult } from '../types/azure-devops';

interface AzureDevOpsContextType {
  connection: AzureDevOpsConnection | null;
  isConnected: boolean;
  projects: Project[];
  selectedProjects: Project[];
  workItems: WorkItem[];
  workItemHierarchy: WorkItemHierarchy[];
  loading: boolean;
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
  toggleItemExpansion: (itemId: number) => void;
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
    localStorage.removeItem('selectedProjects');
    setConnection(null);
    setIsConnected(false);
    setSelectedProjects([]);
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
      
      // Select all projects by default
      if (selectedProjects.length === 0) {
        setSelectedProjects(mockProjects);
        localStorage.setItem('selectedProjects', JSON.stringify(mockProjects));
      }
      
      setLoading(false);
      return mockProjects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      setLoading(false);
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
    
    setSelectedProjects(updatedSelection);
    localStorage.setItem('selectedProjects', JSON.stringify(updatedSelection));
    
    // Fetch work items for all selected projects
    if (updatedSelection.length > 0) {
      fetchWorkItems(updatedSelection.map(p => p.id));
    } else {
      // Clear work items if no projects selected
      setWorkItems([]);
      setWorkItemHierarchy([]);
    }
  };
  
  const selectAllProjects = () => {
    setSelectedProjects(projects);
    localStorage.setItem('selectedProjects', JSON.stringify(projects));
    
    // Fetch work items for all projects
    fetchWorkItems(projects.map(p => p.id));
  };
  
  const unselectAllProjects = () => {
    setSelectedProjects([]);
    localStorage.setItem('selectedProjects', JSON.stringify([]));
    
    // Clear work items if no projects selected
    setWorkItems([]);
    setWorkItemHierarchy([]);
  };

  const fetchWorkItems = async (projectIds: string[]): Promise<WorkItem[]> => {
    if (projectIds.length === 0) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch work items for all selected projects
      const allWorkItems: WorkItem[] = [];
      
      for (const projectId of projectIds) {
        const projectWorkItems = generateMockWorkItems(projectId);
        allWorkItems.push(...projectWorkItems);
      }
      
      setWorkItems(allWorkItems);
      
      // Build hierarchy with projects at the top level
      const hierarchy = buildWorkItemHierarchy(allWorkItems);
      setWorkItemHierarchy(hierarchy);
      
      setLoading(false);
      return allWorkItems;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work items';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  // Helper function to generate mock work items with parent-child relationships
  const generateMockWorkItems = (projectId: string): WorkItem[] => {
    // Generate epics, features, user stories, and tasks
    const workItems: WorkItem[] = [];
    const project = projects.find(p => p.id === projectId);
    
    // Track the project association for each work item
    const projectRef = {
      id: parseInt(projectId),
      name: project?.name || `Project ${projectId}`,
    };
    
    // Create 2 epics per project
    for (let epicIndex = 0; epicIndex < 2; epicIndex++) {
      const epicId = parseInt(`${projectId}${epicIndex + 1}`); // e.g. project 1, epic 1 = 11
      const epic: WorkItem = {
        id: epicId,
        rev: 1,
        fields: {
          'System.Title': `Epic ${epicId}`,
          'System.State': 'Active',
          'System.WorkItemType': 'Epic',
          'System.CreatedDate': new Date().toISOString(),
          'System.ChangedDate': new Date().toISOString(),
          'System.Description': `This is Epic ${epicId} in ${project?.name}`,
          'Microsoft.VSTS.Common.Priority': 1,
          'System.TeamProject': project?.name,
          'System.AreaPath': project?.name
        },
        url: `https://dev.azure.com/org/project/_apis/wit/workItems/${epicId}`,
        relations: [
          {
            rel: 'System.LinkTypes.Hierarchy-Reverse',
            url: `https://dev.azure.com/org/project/_apis/projects/${projectId}`,
            attributes: {
              name: 'Parent'
            }
          }
        ],
        projectRef: projectRef
      };
      workItems.push(epic);
      
      // Create 2-3 features per epic
      for (let featureIndex = 0; featureIndex < 2 + Math.floor(Math.random() * 2); featureIndex++) {
        const featureId = parseInt(`${epicId}${featureIndex + 1}`);
        const feature: WorkItem = {
          id: featureId,
          rev: 1,
          fields: {
            'System.Title': `Feature ${featureId}`,
            'System.State': ['New', 'Active', 'Resolved'][Math.floor(Math.random() * 3)],
            'System.WorkItemType': 'Feature',
            'System.CreatedDate': new Date().toISOString(),
            'System.ChangedDate': new Date().toISOString(),
            'System.Description': `This is Feature ${featureId} in ${project?.name}`,
            'Microsoft.VSTS.Common.Priority': 2,
            'System.TeamProject': project?.name,
            'System.AreaPath': project?.name
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
          ],
          projectRef: projectRef
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
      return isNaN(parentId) ? null : parentId;
    };
    
    // Create a map of parent to children
    const childrenMap = new Map<number, number[]>();
    
    // Group work items by project first
    const projectWorkItems = new Map<string, WorkItem[]>();
    
    items.forEach(item => {
      if (item.projectRef) {
        const projectId = item.projectRef.id.toString();
        const projectItems = projectWorkItems.get(projectId) || [];
        projectItems.push(item);
        projectWorkItems.set(projectId, projectItems);
      }
      
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
        children: children
          .map(childId => buildHierarchy(childId, level + 1))
          .sort((a, b) => {
            // Sort by work item type: Epics first, then Features, then User Stories, then Tasks
            const typeOrder = {
              'Epic': 1,
              'Feature': 2,
              'User Story': 3,
              'Task': 4
            };
            const typeA = a.item.fields['System.WorkItemType'];
            const typeB = b.item.fields['System.WorkItemType'];
            
            return (typeOrder[typeA as keyof typeof typeOrder] || 999) - 
                   (typeOrder[typeB as keyof typeof typeOrder] || 999);
          }),
        level,
        isExpanded: level < 2, // Auto-expand the first two levels
      };
    };
    
    // Build project nodes as the top level
    const result: WorkItemHierarchy[] = [];
    
    selectedProjects.forEach(project => {
      const projectId = parseInt(project.id);
      const projectItems = projectWorkItems.get(project.id) || [];
      
      // Find epics (root items) for this project
      const rootItems = projectItems.filter(item => {
        const parentId = findParentId(item);
        // Check if parent is a project or not a work item
        return parentId === projectId || 
               (parentId !== null && !itemsMap.has(parentId));
      });
      
      if (rootItems.length > 0) {
        // Create virtual project item
        const projectItem: WorkItem = {
          id: projectId,
          rev: 1,
          fields: {
            'System.Title': project.name,
            'System.State': 'Active',
            'System.WorkItemType': 'Project',
            'System.CreatedDate': project.lastUpdateTime,
            'System.ChangedDate': project.lastUpdateTime,
            'System.Description': project.description || `Project: ${project.name}`
          },
          url: project.url,
          projectRef: {
            id: projectId,
            name: project.name
          }
        };
        
        // Add virtual project as a parent of root items
        rootItems.forEach(item => {
          if (!item.relations) item.relations = [];
          
          // Update or add the relation
          const existingRelationIndex = item.relations.findIndex(rel => 
            rel.rel === 'System.LinkTypes.Hierarchy-Reverse' && 
            rel.url.includes(`/projects/${project.id}`));
          
          if (existingRelationIndex >= 0) {
            item.relations[existingRelationIndex].url = `https://dev.azure.com/org/project/_apis/projects/${project.id}`;
          } else {
            item.relations.push({
              rel: 'System.LinkTypes.Hierarchy-Reverse',
              url: `https://dev.azure.com/org/project/_apis/projects/${project.id}`,
              attributes: {
                name: 'Parent'
              }
            });
          }
          
          // Update children map
          const currentChildren = childrenMap.get(projectId) || [];
          if (!currentChildren.includes(item.id)) {
            childrenMap.set(projectId, [...currentChildren, item.id]);
          }
        });
        
        // Add to items map
        itemsMap.set(projectId, projectItem);
        
        // Build hierarchy from project
        result.push(buildHierarchy(projectId, 0));
      }
    });
    
    return result;
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
      fetchProjects().then(fetchedProjects => {
        // If we have selected projects saved, fetch their work items
        if (selectedProjects.length > 0) {
          fetchWorkItems(selectedProjects.map(p => p.id));
        } else if (fetchedProjects.length > 0) {
          // Otherwise, select all projects by default
          setSelectedProjects(fetchedProjects);
          localStorage.setItem('selectedProjects', JSON.stringify(fetchedProjects));
          fetchWorkItems(fetchedProjects.map(p => p.id));
        }
      });
    }
  }, []);

  return (
    <AzureDevOpsContext.Provider
      value={{
        connection,
        isConnected,
        projects,
        selectedProjects,
        workItems,
        workItemHierarchy,
        loading,
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
