
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAzureDevOps } from "@/context/AzureDevOpsContext";
import { AzureDevOpsConnection } from "@/types/azure-devops";

const formSchema = z.object({
  organizationUrl: z.string().url({ message: "Please enter a valid URL" })
    .startsWith("https://", { message: "URL must start with https://" })
    .regex(/https:\/\/dev\.azure\.com\/[^/]+/i, { 
      message: "Must be a valid Azure DevOps URL (https://dev.azure.com/organization)" 
    }),
  personalAccessToken: z.string().min(1, { message: "Personal Access Token is required" }),
  project: z.string().optional(),
});

export const ConnectionForm: React.FC = () => {
  const { connect, loading } = useAzureDevOps();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationUrl: "",
      personalAccessToken: "",
      project: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const connection: AzureDevOpsConnection = {
      organizationUrl: values.organizationUrl,
      personalAccessToken: values.personalAccessToken,
      project: values.project || undefined,
    };
    
    await connect(connection);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Connect to Azure DevOps</CardTitle>
        <CardDescription>
          Enter your Azure DevOps organization URL and Personal Access Token
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                    Enter your Azure DevOps organization URL (e.g., https://dev.azure.com/your-organization)
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
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
