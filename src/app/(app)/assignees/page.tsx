
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssigneeManagementTab from "@/components/assignees/AssigneeManagementTab";
import AssigneeProgressTab from "@/components/assignees/AssigneeProgressTab";
import { ListChecks, BarChartBig } from "lucide-react";

export default async function AssigneesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignee Hub</h1>
        <p className="text-muted-foreground">
          Manage your team members and view their task progress.
        </p>
      </div>
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="management">
            <ListChecks className="mr-2 h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChartBig className="mr-2 h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>
        <TabsContent value="management" className="mt-6">
          <AssigneeManagementTab />
        </TabsContent>
        <TabsContent value="progress" className="mt-6">
          <AssigneeProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
