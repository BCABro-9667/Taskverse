
'use client';

import type { Task, Assignee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Circle, CheckCircle2, StickyNote } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';


interface AssigneeTaskViewProps {
  assignee: Assignee;
  tasks: Task[];
}

export default function AssigneeTaskView({ assignee, tasks }: AssigneeTaskViewProps) {
  const [currentPrintDate, setCurrentPrintDate] = useState<string>('');

  useEffect(() => {
    setCurrentPrintDate(format(new Date(), 'PPP'));
  }, []);

  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted); // Corrected filter

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="no-print"> {/* This card is only for screen */}
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Tasks for {assignee.name}</CardTitle>
            {assignee.designation && (
              <CardDescription>{assignee.designation}</CardDescription>
            )}
          </div>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Pending Tasks
          </Button>
        </CardHeader>
      </Card>

      {/* Print-Specific Header */}
      <div className="print-only mb-4 hidden text-center">
        <h1 className="text-2xl font-bold">Pending Tasks for: {assignee.name}</h1>
        {assignee.designation && (<p className="text-lg text-muted-foreground">{assignee.designation}</p>)}
        {currentPrintDate && <p className="text-sm text-muted-foreground mt-1">Date: {currentPrintDate}</p>}
        <Separator className="my-3"/>
      </div>
        
      {/* Main content area for tasks */}
      <div id="printable-content" className="space-y-4">
        <TaskSection title="Pending Tasks" tasks={pendingTasks} isPrintableSection={true}/>
        <TaskSection title="Completed Tasks" tasks={completedTasks} className="no-print" isPrintableSection={false} />
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
    if (tasks.length === 0) {
        // For printable section, if no pending tasks, show a message.
        if (isPrintableSection) {
            return (
                <div className={cn("text-center py-4", className, "print:block hidden")}>
                    <p className="text-muted-foreground">No pending tasks for {title.toLowerCase().replace(' tasks', '')}.</p>
                </div>
            );
        }
        // For non-printable (screen only), show card with message.
        return (
             <Card className={cn("shadow-md", className)}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No tasks in this category.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("shadow-md", className, isPrintableSection && "print:shadow-none print:border-none print:bg-transparent")}>
            <CardHeader className={cn(isPrintableSection && "print:hidden")}>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={cn("pt-0",isPrintableSection && "print:p-0")}>
                <ul className="space-y-3">
                {tasks.map(task => (
                    <li key={task.id} className={cn(
                        "p-3 border rounded-md flex justify-between items-start",
                        !isPrintableSection && "bg-card", // Use card background for screen items
                        isPrintableSection && "card-print print:bg-white" // Use card-print styles for print
                      )}
                    >
                        {/* Left: Task Name, Due Date, Screen Status Icon */}
                        <div className="flex-grow flex flex-col pr-3">
                            <div className="flex items-center space-x-2">
                                {/* Status Icon - Screen only, hidden in print */}
                                {!task.isCompleted ? 
                                <Circle className="h-4 w-4 text-yellow-500 no-print" /> : 
                                <CheckCircle2 className="h-4 w-4 text-green-500 no-print" />
                                }
                                {/* Printable status indicator - simple text for pending tasks */}
                                {isPrintableSection && !task.isCompleted && (
                                    <span className="print-only hidden mr-1 font-mono text-sm">•</span> 
                                )}
                                <span className={cn("font-medium", task.isCompleted && "line-through text-muted-foreground")}>
                                {task.title}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 print:ml-4">
                                Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                            </p>
                        </div>

                        {/* Right: Notes with Icon (only if isPrintableSection AND notes exist) */}
                        {isPrintableSection && task.notes && (
                            <div className="w-2/5 max-w-xs flex-shrink-0 pl-3 ml-3 border-l print:border-l-gray-300 print:pl-2 print:ml-2">
                                <div className="flex items-start text-xs">
                                    <StickyNote className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                                    <p className="whitespace-pre-wrap break-words text-muted-foreground">{task.notes}</p>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
                </ul>
            </CardContent>
        </Card>
    );
}
