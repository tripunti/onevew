import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Crown, Flag, List, CheckSquare, FileText, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    issuetype: { name: string };
    parent?: { id: string };
    status?: { name: string };
    project?: { id: string; key: string; name: string };
    customfield_10009?: { value: string };
    customfield_10014?: string;
    [key: string]: any;
  };
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraWorkItemListProps {
  issues: JiraIssue[];
  loading: boolean;
  projects?: JiraProject[];
}

// Build a hierarchy tree from flat Jira issues (parent/child)
function buildJiraHierarchy(issues: JiraIssue[]): JiraHierarchyItem[] {
  const map: { [id: string]: JiraHierarchyItem } = {};
  const roots: JiraHierarchyItem[] = [];
  
  // First pass: create all nodes
  for (const issue of issues) {
    map[issue.id] = {
      issue,
      children: [],
      level: 1,
      isExpanded: true,
    };
  }
  
  // Second pass: establish parent-child relationships
  for (const issue of issues) {
    // Check for parent link in customfield_10009 (Epic Link) or other parent fields
    const parentId = issue.fields.parent?.id || 
                    issue.fields.customfield_10009?.value || 
                    issue.fields.customfield_10014; // Common field for parent link
    
    if (parentId && map[parentId]) {
      map[issue.id].level = map[parentId].level + 1;
      map[parentId].children.push(map[issue.id]);
    } else {
      roots.push(map[issue.id]);
    }
  }
  
  // Sort roots by issue key for consistent display
  roots.sort((a, b) => a.issue.key.localeCompare(b.issue.key));
  
  return roots;
}

// Build a hierarchy tree from flat Jira issues, grouped by project
function buildJiraHierarchyByProject(issues: JiraIssue[], projects: JiraProject[]): JiraProjectHierarchyItem[] {
  // Group issues by project key
  const projectMap: { [key: string]: JiraProjectHierarchyItem } = {};
  
  // Initialize project nodes
  for (const project of projects) {
    projectMap[project.key] = {
      project,
      children: [],
      isExpanded: true,
    };
  }
  
  // Build issue hierarchy for each project
  const issuesByProject: { [key: string]: JiraIssue[] } = {};
  for (const issue of issues) {
    const projectKey = issue.fields.project?.key;
    if (projectKey && projectMap[projectKey]) {
      if (!issuesByProject[projectKey]) issuesByProject[projectKey] = [];
      issuesByProject[projectKey].push(issue);
    } else {
      console.warn(`Issue ${issue.key} has project key ${projectKey} which is not in the projects list:`, projects.map(p => p.key));
    }
  }
  
  // Build hierarchy for each project's issues
  for (const projectKey of Object.keys(issuesByProject)) {
    projectMap[projectKey].children = buildJiraHierarchy(issuesByProject[projectKey]);
  }
  
  return Object.values(projectMap);
}

interface JiraHierarchyItem {
  issue: JiraIssue;
  children: JiraHierarchyItem[];
  level: number;
  isExpanded: boolean;
}
interface JiraProjectHierarchyItem {
  project: JiraProject;
  children: JiraHierarchyItem[];
  isExpanded: boolean;
}

export const JiraWorkItemList: React.FC<JiraWorkItemListProps> = ({ issues, loading, projects = [] }) => {
  const [expanded, setExpanded] = React.useState<{ [id: string]: boolean }>({});

  React.useEffect(() => {
    setExpanded({});
    // eslint-disable-next-line
  }, [
    issues.map(i => i.id).join(','),
    projects?.map(p => p.key).join(',')
  ]);

  // Filter issues to only include those from selected projects
  const selectedProjectKeys = new Set(projects.map(p => p.key));
  const filteredIssues = issues.filter(issue => 
    issue.fields.project?.key && selectedProjectKeys.has(issue.fields.project.key)
  );

  // Debug information
  React.useEffect(() => {
    if (filteredIssues.length > 0 && projects.length > 0) {
      console.log("Jira Work Item List Debug Info:");
      console.log("Selected Project Keys:", Array.from(selectedProjectKeys));
      console.log("Filtered Issues Count:", filteredIssues.length);
      console.log("Sample Issue:", {
        id: filteredIssues[0].id,
        key: filteredIssues[0].key,
        projectKey: filteredIssues[0].fields.project?.key,
        projectName: filteredIssues[0].fields.project?.name,
        parentId: filteredIssues[0].fields.parent?.id,
        epicLink: filteredIssues[0].fields.customfield_10009?.value,
        customfield_10014: filteredIssues[0].fields.customfield_10014
      });
    }
  }, [filteredIssues, projects]);

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

  if (!filteredIssues || filteredIssues.length === 0 || !projects || projects.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <p className="text-center text-muted-foreground mb-4">
          No issues found for the selected Jira projects.
        </p>
      </div>
    );
  }

  const hierarchy = buildJiraHierarchyByProject(filteredIssues, projects);

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case "Epic":
        return <span title="Epic"><Crown className="w-4 h-4 text-purple-500 mr-1" /></span>;
      case "Story":
      case "User Story":
        return <span title="Story"><List className="w-4 h-4 text-green-500 mr-1" /></span>;
      case "Task":
        return <span title="Task"><CheckSquare className="w-4 h-4 text-orange-500 mr-1" /></span>;
      case "Bug":
        return <span title="Bug"><Flag className="w-4 h-4 text-red-500 mr-1" /></span>;
      default:
        return <span title={type}><FileText className="w-4 h-4 text-gray-400 mr-1" /></span>;
    }
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case "To Do":
      case "Open":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300";
      case "Done":
      case "Closed":
        return "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleToggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderHierarchy = (items: JiraHierarchyItem[], parentLevel = 1) => {
    return (
      <div className="space-y-1">
        {items.map((node) => {
          const { issue, children, level } = node;
          const hasChildren = children.length > 0;
          const isExpanded = expanded[issue.id] ?? true;
          const type = issue.fields.issuetype.name;
          const status = issue.fields.status?.name;
          const jiraUrl = `${issue.self.split('/rest/api/3/issue')[0]}/browse/${issue.key}`;
          return (
            <React.Fragment key={issue.id}>
              <div
                className={
                  `group flex items-center py-2 px-2 rounded-md hover:bg-muted/50 text-sm ${level > 1 ? "ml-4 pl-3 border-l-2 border-border" : ""}`
                }
                style={{ marginLeft: level > 1 ? `${level * 1.25}rem` : undefined }}
              >
                <div className="flex-1 flex items-center min-w-0">
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleToggle(issue.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  ) : (
                    <div className="w-6" />
                  )}
                  <div className="truncate flex-1 flex items-center">
                    <span className="mr-2 flex items-center justify-center">
                      {getIssueTypeIcon(type)}
                    </span>
                    <a 
                      href={jiraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {issue.key} - {issue.fields.summary}
                    </a>
                    {status && (
                      <Badge variant="outline" className={`ml-2 ${getStatusStyles(status)}`}>{status}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  #{issue.id}
                </div>
              </div>
              {hasChildren && isExpanded && (
                <div className="ml-6 border-l pl-3 border-border">
                  {renderHierarchy(children, parentLevel + 1)}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {hierarchy.map((projectNode) => {
          const { project, children, isExpanded } = projectNode;
          const expandedState = expanded[project.id] ?? true;
          return (
            <React.Fragment key={project.id}>
              <div className="group flex items-center py-2 px-2 rounded-md hover:bg-muted/50 text-base font-semibold bg-muted/30">
                <div className="flex-1 flex items-center min-w-0">
                  {children.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleToggle(project.id)}
                    >
                      {expandedState ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  ) : (
                    <div className="w-6" />
                  )}
                  <span className="mr-2 flex items-center justify-center"><Folder className="w-4 h-4 text-indigo-500 mr-1" /></span>
                  <span className="truncate font-semibold">{project.name} ({project.key})</span>
                </div>
              </div>
              {children.length > 0 && expandedState && (
                <div className="ml-6 border-l pl-3 border-border">
                  {renderHierarchy(children, 1)}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
}; 