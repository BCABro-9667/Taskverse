'use client';

import type { Task, Assignee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Circle, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface AssigneeTaskViewProps {
  assignee: Assignee;
  tasks: Task[];
}

export default function AssigneeTaskView({ assignee, tasks }: AssigneeTaskViewProps) {
  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="print-section">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Tasks for {assignee.name}</CardTitle>
            {assignee.designation && (
              <CardDescription>{assignee.designation}</CardDescription>
            )}
          </div>
          <Button onClick={handlePrint} variant="outline" className="no-print">
            <Printer className="mr-2 h-4 w-4" /> Print Pending Tasks
          </Button>
        </CardHeader>
      </Card>

      {/* This section will be primarily what's printed */}
      <div id="printable-content">
        <div className="print-only mb-4 hidden"> {/* Hidden by default, shown only on print */}
            <h1 className="text-xl font-bold">Pending Tasks for: {assignee.name}</h1>
            {assignee.designation && (<p className="text-sm text-gray-600">{assignee.designation}</p>)}
            <p className="text-sm text-gray-600">Date: {format(new Date(), 'PPP')}</p>
            <Separator className="my-2"/>
        </div>
        
        <TaskSection title="Pending Tasks" tasks={pendingTasks} isPrintableSection={true}/>
        <TaskSection title="Completed Tasks" tasks={completedTasks} className="no-print" />
      </div>
    </div>
  );
}

interface TaskSectionProps {
    title: string;
    tasks: Task[];
    className?: string;
    isPrintableSection?: boolean;
}

function TaskSection({ title, tasks, className, isPrintableSection }: TaskSectionProps) {
    if (tasks.length === 0 && !isPrintableSection) { // Don't show empty completed tasks on print
        return (
             <Card className={className}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No tasks in this category.</p>
                </CardContent>
            </Card>
        );
    }
     if (tasks.length === 0 && isPrintableSection) {
        return (
            <div className={className}>
                <h2 className="text-xl font-semibold mb-3">{title}</h2>
                <p className="text-gray-500">No pending tasks.</p>
            </div>
        );
    }


    return (
        <Card className={cn("shadow-md", className)}>
            <CardHeader className={cn(isPrintableSection && "print:hidden")}>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={cn(isPrintableSection && "print:pt-0")}>
                <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.id} className="p-3 border rounded-md bg-background card-print">
                    <div className="flex items-center space-x-2">
                        {task.isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500 print:hidden" /> : <Circle className="h-4 w-4 text-yellow-500 print:hidden" />}
                        <span className={cn("font-medium", task.isCompleted && "line-through text-muted-foreground")}>{task.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                        Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </p>
                    {task.notes && isPrintableSection && (
                         <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap bg-gray-100 p-1 rounded-sm">
                            <strong>Notes:</strong> {task.notes}
                        </p>
                    )}
                    </li>
                ))}
                </ul>
            </CardContent>
        </Card>
    );
}