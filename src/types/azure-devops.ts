// Azure DevOps API Types
export interface AzureDevOpsConnection {
  organizationUrl: string;
  personalAccessToken: string;
  project?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
  visibility: string;
  lastUpdateTime: string;
}

export interface ProjectRef {
  id: string;
  name: string;
}

export interface WorkItem {
  id: string;
  rev: number;
  fields: {
    'System.Title': string;
    'System.State': string;
    'System.WorkItemType': string;
    'System.CreatedDate'?: string;
    'System.ChangedDate'?: string;
    'System.Tags'?: string;
    'System.Description'?: string;
    'System.TeamProject'?: string;
    'System.AreaPath'?: string;
    'System.IterationPath'?: string;
    'System.AssignedTo'?: {
      displayName: string;
      uniqueName: string;
      imageUrl?: string;
    };
    'Microsoft.VSTS.Common.Priority'?: number;
    [key: string]: any;
  };
  relations?: WorkItemRelation[];
  url: string;
  projectRef?: ProjectRef;
}

export interface WorkItemRelation {
  rel: string;
  url: string;
  attributes: {
    name?: string;
    comment?: string;
    [key: string]: any;
  };
}

export interface WorkItemHierarchy {
  item: WorkItem;
  children: WorkItemHierarchy[];
  level: number;
  isExpanded: boolean;
}

export interface WorkItemQuery {
  query: string;
}

export interface WorkItemQueryResult {
  workItems: { id: string; url: string }[];
  asOf: string;
  queryType: string;
  queryResultType: string;
}
