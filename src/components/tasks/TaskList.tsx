'use client';

import type { Task, Assignee } from '@/types';
import TaskItem from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskListProps {
  title: string;
  tasks: Task[];
  assignees: Assignee[];
  onToggleComplete: (taskId: string, isCompleted: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onUpdateNotes: (taskId: string, notes: string) => Promise<void>;
  className?: string;
}

export default function TaskList({ title, tasks, assignees, onToggleComplete, onDelete, onEdit, onUpdateNotes, className }: TaskListProps) {
  const getAssigneeById = (assigneeId: string) => assignees.find(a => a.id === assigneeId);

  if (tasks.length === 0) {
    return (
      <Card className={cn("shadow-lg", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tasks in this category yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              assignee={getAssigneeById(task.assigneeId)}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onUpdateNotes={onUpdateNotes}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}