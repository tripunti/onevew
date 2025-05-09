import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { AzureDevOpsConnection } from "@/types/azure-devops";
import { toast } from "sonner";

const formSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("azure"),
    organizationUrl: z.string().url({ message: "Please enter a valid URL" })
      .startsWith("https://", { message: "URL must start with https://" })
      .regex(/https:\/\/dev\.azure\.com\/[^/]+/i, { 
        message: "Must be a valid Azure DevOps URL (https://dev.azure.com/organization)" 
      }),
    personalAccessToken: z.string().min(1, { message: "Personal Access Token is required" }),
    project: z.string().optional(),
  }),
  z.object({
    provider: z.literal("jira"),
    jiraBaseUrl: z.string().url({ message: "Please enter a valid Jira Cloud URL" })
      .startsWith("https://", { message: "URL must start with https://" }),
    jiraEmail: z.string().email({ message: "Please enter a valid email address" }),
    jiraApiToken: z.string().min(1, { message: "API Token is required" }),
    jiraProjectKey: z.string().min(1, { message: "Project Key is required" }),
  })
]);

const JIRA_STORAGE_KEY = 'jiraConnection';

export function getJiraConnection() {
  try {
    return JSON.parse(localStorage.getItem(JIRA_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export const ConnectionForm: React.FC = () => {
  const { connect, loading, connection } = useAzureDevOps();
  const [azureStatus, setAzureStatus] = useState<null | 'success' | 'error'>(null);
  const [jiraStatus, setJiraStatus] = useState<null | 'success' | 'error'>(null);
  const [jiraLoading, setJiraLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "azure",
      organizationUrl: "",
      personalAccessToken: "",
      project: "",
      jiraBaseUrl: "",
      jiraEmail: "",
      jiraApiToken: "",
      jiraProjectKey: "",
    } as any,
  });
  
  // Prefill Azure DevOps and Jira fields from last connection
  useEffect(() => {
    // Try to get Jira connection from localStorage
    let jiraConnection = getJiraConnection();

    if (connection) {
      form.reset({
        provider: "azure",
        organizationUrl: connection.organizationUrl || "",
        personalAccessToken: connection.personalAccessToken || "",
        project: connection.project || "",
        jiraBaseUrl: jiraConnection?.jiraBaseUrl || "",
        jiraEmail: jiraConnection?.jiraEmail || "",
        jiraApiToken: jiraConnection?.jiraApiToken || "",
        jiraProjectKey: jiraConnection?.jiraProjectKey || "",
      } as z.infer<typeof formSchema>);
    } else if (jiraConnection) {
      form.reset({
        provider: "jira",
        organizationUrl: "",
        personalAccessToken: "",
        project: "",
        jiraBaseUrl: jiraConnection.jiraBaseUrl || "",
        jiraEmail: jiraConnection.jiraEmail || "",
        jiraApiToken: jiraConnection.jiraApiToken || "",
        jiraProjectKey: jiraConnection.jiraProjectKey || "",
      } as z.infer<typeof formSchema>);
    }
  }, [connection, form]);

  // Azure DevOps connect handler
  const handleAzureConnect = async () => {
    setAzureStatus(null);
    const values = form.getValues() as {
      organizationUrl: string;
      personalAccessToken: string;
      project?: string;
    };
    const connection: AzureDevOpsConnection = {
      organizationUrl: values.organizationUrl,
      personalAccessToken: values.personalAccessToken,
      project: values.project || undefined,
    };
    try {
      const result = await connect(connection);
      setAzureStatus(result ? 'success' : 'error');
      if (result) {
        toast.success("Connected to Azure DevOps");
      } else {
        toast.error("Failed to connect to Azure DevOps. Please check your credentials.");
      }
    } catch {
      setAzureStatus('error');
      toast.error("Failed to connect to Azure DevOps. Please check your credentials.");
    }
  };

  // Jira connect handler
  const handleJiraConnect = async () => {
    setJiraStatus(null);
    setJiraLoading(true);
    const values = form.getValues() as {
      jiraBaseUrl: string;
      jiraEmail: string;
      jiraApiToken: string;
      jiraProjectKey: string;
    };
    try {
      // Use the Node.js proxy for Jira API
      const response = await fetch(
        'http://localhost:3001/api/jira-proxy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jiraBaseUrl: values.jiraBaseUrl,
            jiraEmail: values.jiraEmail,
            jiraApiToken: values.jiraApiToken,
          }),
        }
      );
      if (response.ok) {
        setJiraStatus('success');
        // Save Jira connection to localStorage
        localStorage.setItem(JIRA_STORAGE_KEY, JSON.stringify(values));
        toast.success("Connected to Jira");
      } else {
        setJiraStatus('error');
        toast.error("Failed to connect to Jira. Please check your credentials.");
      }
    } catch {
      setJiraStatus('error');
      toast.error("Failed to connect to Jira. Please check your credentials.");
    }
    setJiraLoading(false);
  };
  
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Connect to Team Tooling</CardTitle>
        <CardDescription>
          Enter your Team Tooling details to connect.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-x-0 gap-y-8">
              {/* Azure DevOps Section */}
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-lg mb-4">Azure DevOps</h3>
                <div className="flex flex-col space-y-6 flex-1">
                  <FormField
                    control={form.control}
                    name="organizationUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://dev.azure.com/your-org" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Azure DevOps organization URL (e.g., https://dev.azure.com/your-organization)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalAccessToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Access Token</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Personal Access Token" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Azure DevOps personal access token with appropriate permissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Project name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optionally specify a default project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-auto pt-6 flex flex-col">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleAzureConnect}
                    disabled={loading}
                  >
                    {loading ? "Connecting..." : "Connect to Azure DevOps"}
                  </Button>
                </div>
              </div>
              {/* Vertical Divider */}
              <div className="hidden md:block w-px bg-muted mx-6" />
              {/* Jira Section */}
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-lg mb-4">Jira</h3>
                <div className="flex flex-col space-y-6 flex-1">
                  <FormField
                    control={form.control}
                    name="jiraBaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jira Base URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-domain.atlassian.net" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Jira Cloud base URL (e.g., https://your-domain.atlassian.net)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jiraEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The email address associated with your Jira account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jiraApiToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Token</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Jira API Token" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Jira API token (see Atlassian documentation to generate one)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jiraProjectKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABC" {...field} />
                        </FormControl>
                        <FormDescription>
                          The key of your Jira project (e.g., ABC)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-auto pt-6 flex flex-col">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleJiraConnect}
                    disabled={jiraLoading}
                  >
                    {jiraLoading ? "Connecting..." : "Connect to Jira"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
};
