
'use client';

import type { Assignee, Task } from '@/types';
import { useEffect, useState } from 'react';
import { getAssigneesAction } from '@/actions/assigneeActions';
import { getTasksAction } from '@/actions/taskActions'; // Use server action
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface ChartData {
  name: string;
  completed: number;
  pending: number;
  total: number;
}

export default function AssigneeProgressTab() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const assignees = await getAssigneesAction();
        const tasks = await getTasksAction(); // Use server action to fetch all tasks

        const activeAssignees = assignees.filter(a => a.status === 'active');

        const data = activeAssignees.map((assignee) => {
          const assigneeTasks = tasks.filter((task) => task.assigneeId === assignee.id);
          const completed = assigneeTasks.filter((task) => task.isCompleted).length;
          const pending = assigneeTasks.filter((task) => !task.isCompleted).length;
          return {
            name: assignee.name,
            completed,
            pending,
            total: assigneeTasks.length,
          };
        });
        setChartData(data);
      } catch (error) {
        console.error("AssigneeProgressTab fetchData error:", error);
        toast({ title: 'Error', description: 'Failed to load progress data.', variant: 'destructive' });
        setChartData([]); // Ensure chartData is empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
     return (
        <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-72 w-full" />
        </CardContent>
        </Card>
     );
  }

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignee Task Progress</CardTitle>
                <CardDescription>Visual overview of task distribution among active assignees.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No active assignees with tasks to display.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Assignee Task Progress</CardTitle>
        <CardDescription>Overview of task completion for active assignees.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }}/>
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completed Tasks" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="hsl(var(--accent))" name="Pending Tasks" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
