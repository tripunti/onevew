import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { WorkItemList } from "@/components/work-items/WorkItemList";
import { WorkItemDetail } from "@/components/work-items/WorkItemDetail";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProjectList } from "@/components/projects/ProjectList";
import { getJiraConnection } from "@/components/connection/ConnectionForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SquareCheck, Square, RefreshCw } from "lucide-react";
import { JiraWorkItemList } from "@/components/work-items/JiraWorkItemList";

const WorkItems = () => {
  const { 
    isConnected, 
    selectedProjects, 
    workItems, 
    workItemHierarchy,
    loading,
    fetchWorkItems,
    fetchProjects
  } = useAzureDevOps();
  const [jiraProjects, setJiraProjects] = React.useState<any[]>([]);
  
  const [selectedWorkItem, setSelectedWorkItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'azdo' | 'jira'>('azdo');
  
  const [jiraLoading, setJiraLoading] = React.useState(false);
  const [selectedJiraProjects, setSelectedJiraProjects] = React.useState<any[]>([]);
  const [jiraProjectsLoading, setJiraProjectsLoading] = React.useState(false);
  const [jiraIssues, setJiraIssues] = React.useState<any[]>([]);
  const [jiraIssuesLoading, setJiraIssuesLoading] = React.useState(false);
  
  // Fetch work items when the component mounts or selectedProjects changes
  useEffect(() => {
    if (selectedProjects.length > 0) {
      console.log("WorkItems page: Fetching work items for selected projects");
      fetchWorkItems(selectedProjects.map(p => p.id));
    }
  }, [selectedProjects]);
  
  // Fetch Jira projects on mount
  React.useEffect(() => {
    const jiraConn = getJiraConnection();
    if (jiraConn && jiraConn.jiraBaseUrl && jiraConn.jiraEmail && jiraConn.jiraApiToken) {
      fetch("http://localhost:3001/api/jira-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jiraBaseUrl: jiraConn.jiraBaseUrl,
          jiraEmail: jiraConn.jiraEmail,
          jiraApiToken: jiraConn.jiraApiToken,
          endpoint: "/rest/api/3/project/search"
        })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.values)) {
            setJiraProjects(data.values);
          } else {
            setJiraProjects([]);
          }
        })
        .catch(() => setJiraProjects([]));
    }
  }, []);
  
  // Fetch Jira issues when selectedJiraProjects changes
  React.useEffect(() => {
    if (selectedJiraProjects.length === 0) {
      setJiraIssues([]);
      return;
    }
    setJiraIssuesLoading(true);
    const jiraConn = getJiraConnection();
    if (!jiraConn || !jiraConn.jiraBaseUrl || !jiraConn.jiraEmail || !jiraConn.jiraApiToken) {
      setJiraIssues([]);
      setJiraIssuesLoading(false);
      return;
    }
    // Fetch issues for all selected projects using project keys
    const projectKeys = selectedJiraProjects.map((p) => p.key).join(",");
    console.log("Fetching Jira issues for project keys:", projectKeys);
    fetch("http://localhost:3001/api/jira-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jiraBaseUrl: jiraConn.jiraBaseUrl,
        jiraEmail: jiraConn.jiraEmail,
        jiraApiToken: jiraConn.jiraApiToken,
        endpoint: `/rest/api/3/search`,
        jql: `project in (${projectKeys}) AND project is not EMPTY ORDER BY issuetype DESC, key ASC`,
        maxResults: 100,
        fields: [
          "summary",
          "issuetype",
          "status",
          "parent",
          "project",
          "customfield_10009",
          "customfield_10014"
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched Jira issues:", data.issues);
        if (Array.isArray(data.issues)) {
          setJiraIssues(data.issues);
        } else {
          setJiraIssues([]);
        }
      })
      .catch(() => setJiraIssues([]))
      .finally(() => setJiraIssuesLoading(false));
  }, [selectedJiraProjects]);
  
  console.log("WorkItems page: Current hierarchy:", workItemHierarchy);
  console.log("WorkItems page: Selected projects:", selectedProjects);
  
  const handleSelectAllJiraProjects = () => {
    setSelectedJiraProjects(jiraProjects);
  };
  const handleUnselectAllJiraProjects = () => {
    setSelectedJiraProjects([]);
  };
  const handleToggleJiraProject = (project: any) => {
    const isSelected = selectedJiraProjects.some((p) => p.key === project.key);
    if (isSelected) {
      setSelectedJiraProjects(selectedJiraProjects.filter((p) => p.key !== project.key));
    } else {
      setSelectedJiraProjects([...selectedJiraProjects, project]);
    }
  };
  const handleRefreshJiraProjects = () => {
    setJiraProjectsLoading(true);
    const jiraConn = getJiraConnection();
    if (jiraConn && jiraConn.jiraBaseUrl && jiraConn.jiraEmail && jiraConn.jiraApiToken) {
      fetch("http://localhost:3001/api/jira-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jiraBaseUrl: jiraConn.jiraBaseUrl,
          jiraEmail: jiraConn.jiraEmail,
          jiraApiToken: jiraConn.jiraApiToken,
          endpoint: "/rest/api/3/project/search"
        })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.values)) {
            setJiraProjects(data.values);
            setSelectedJiraProjects(data.values);
            toast.success("Jira projects refreshed");
          } else {
            setJiraProjects([]);
            setSelectedJiraProjects([]);
            toast.error("Failed to load Jira projects");
          }
        })
        .catch(() => {
          setJiraProjects([]);
          setSelectedJiraProjects([]);
          toast.error("Failed to load Jira projects");
        })
        .finally(() => setJiraProjectsLoading(false));
    } else {
      setJiraProjectsLoading(false);
      toast.error("Jira connection not configured");
    }
  };
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  const currentWorkItem = selectedWorkItem 
    ? workItems.find(item => item.id === selectedWorkItem) 
    : null;
  
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="border-b p-4 bg-background">
          <div className="container max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="azdo">Azure DevOps</TabsTrigger>
                <TabsTrigger value="jira">Jira</TabsTrigger>
              </TabsList>
              <TabsContent value="azdo">
                {/* Azure DevOps Projects Section */}
                <ProjectList />
                {/* Work Items Section */}
                <div className="mt-8">
                  <h1 className="text-2xl font-bold">
                    {selectedProjects.length === 1 
                      ? selectedProjects[0].name 
                      : `${selectedProjects.length} Projects Selected`}
                  </h1>
                  <p className="text-muted-foreground flex flex-wrap gap-1">
                    Work Items for: 
                    {selectedProjects.map((project, index) => (
                      <span key={project.id} className="font-medium">
                        {project.name}{index < selectedProjects.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </p>
                  <div className="flex-1 flex overflow-hidden mt-4">
                    {/* Work Item List */}
                    <div className={`w-full ${currentWorkItem ? 'md:w-1/2 lg:w-2/5' : ''} h-full overflow-hidden flex flex-col border-r`}>
                      <div className="p-2 border-b bg-background">
                        <h2 className="text-sm font-medium">Work Item Hierarchy</h2>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <WorkItemList />
                      </div>
                    </div>
                    {/* Work Item Detail */}
                    {currentWorkItem && (
                      <div className="hidden md:flex md:w-1/2 lg:w-3/5 h-full flex-col">
                        <div className="p-2 border-b bg-background flex items-center">
                          <h2 className="text-sm font-medium flex-1">Work Item Details</h2>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedWorkItem(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <WorkItemDetail workItem={currentWorkItem} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="jira">
                {/* Jira Projects Section */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-bold tracking-tight">Jira Projects</h2>
                  <div className="flex gap-2 items-center">
                    <Button size="sm" variant="outline" onClick={handleSelectAllJiraProjects} disabled={jiraProjectsLoading} aria-label="Select All">
                      <SquareCheck className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleUnselectAllJiraProjects} disabled={jiraProjectsLoading} aria-label="Unselect All">
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRefreshJiraProjects} disabled={jiraProjectsLoading} aria-label="Refresh">
                      {jiraProjectsLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {jiraProjectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded p-4 bg-white dark:bg-muted animate-pulse">
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    ))}
                  </div>
                ) : jiraProjects.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">No Jira projects found or not connected.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                      {jiraProjects.map((project: any) => {
                        const isSelected = selectedJiraProjects.some((p) => p.key === project.key);
                        return (
                          <div key={project.id} className={`border rounded p-4 bg-white dark:bg-muted transition-shadow ${isSelected ? "border-primary/50 shadow-md" : ""}`}>
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleJiraProject(project)}
                                className="mt-1 h-4 w-4 border rounded"
                                aria-label={`Select Jira project ${project.name}`}
                              />
                              <div>
                                <div className="font-semibold text-base">{project.name}</div>
                                <div className="text-xs text-muted-foreground">{project.key} • {project.projectTypeKey}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {project.description || "No description provided."}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Jira Work Item Hierarchy Section */}
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold mb-2">Work Item Hierarchy</h2>
                      <JiraWorkItemList issues={jiraIssues} loading={jiraIssuesLoading} projects={selectedJiraProjects} />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkItems;
