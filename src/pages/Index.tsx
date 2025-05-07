
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConnectionForm } from "@/components/connection/ConnectionForm";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, GitBranch, List, Clock } from "lucide-react";

const Index = () => {
  const { isConnected, projects, fetchProjects } = useAzureDevOps();
  
  useEffect(() => {
    if (isConnected) {
      fetchProjects();
    }
  }, [isConnected]);
  
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-brand-600">DevOps Flow</h1>
            <p className="text-muted-foreground">
              Connect to Azure DevOps to visualize your projects and work items.
            </p>
          </div>
          <ConnectionForm />
        </div>
      </div>
    );
  }
  
  return (
    <AppLayout>
      <div className="container py-6 max-w-6xl animate-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to DevOps Flow. Visualize and manage your Azure DevOps work items.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Folder className="mr-2 h-5 w-5 text-brand-500" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{projects.length}</p>
              <CardDescription>Available projects</CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <List className="mr-2 h-5 w-5 text-brand-500" />
                Work Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">--</p>
              <CardDescription>Select a project to view work items</CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <GitBranch className="mr-2 h-5 w-5 text-brand-500" />
                Repositories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">--</p>
              <CardDescription>Code repositories</CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-brand-500" />
                Recent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">--</p>
              <CardDescription>Recent activities</CardDescription>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col">
              <a href="/projects">
                <Folder className="h-6 w-6 mb-2" />
                <span>Projects</span>
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col">
              <a href="/work-items">
                <List className="h-6 w-6 mb-2" />
                <span>Work Items</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
