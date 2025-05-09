import { getTasks, getAssigneeByName } from '@/lib/data';
import AssigneeTaskView from '@/components/tasks/AssigneeTaskView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AssigneePageProps {
  params: { assigneeName: string };
}

export default async function AssigneePage({ params }: AssigneePageProps) {
  const assigneeName = decodeURIComponent(params.assigneeName.replace(/-/g, ' '));
  
  const assignee = await getAssigneeByName(assigneeName);
  
  if (!assignee) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Assignee Not Found</h1>
        <p className="text-muted-foreground mb-6">The assignee "{assigneeName}" could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const allTasks = await getTasks(); // In a real app, this might be getTasksByAssigneeId(assignee.id)
  const assigneeTasks = allTasks.filter(task => task.assigneeId === assignee.id);

  return (
    <div>
      <div className="mb-4 no-print">
         <Button asChild variant="outline" size="sm">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
      </div>
      <AssigneeTaskView assignee={assignee} tasks={assigneeTasks} />
    </div>
  );
}

export async function generateStaticParams() {
  // In a real app with many assignees, this might be selective or fetched dynamically.
  // For now, let's assume we don't pre-render these.
  // If we had a getAssignees function that returns all:
  // const assignees = await getAssignees();
  // return assignees.map(assignee => ({
  //   assigneeName: assignee.name.replace(/\s+/g, '-')
  // }));
  return [];
}