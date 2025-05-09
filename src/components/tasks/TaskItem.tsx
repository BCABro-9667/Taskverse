// src/components/tasks/TaskItem.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Task, Assignee } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2, MessageSquarePlus, Check, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  assignee?: Assignee;
  onToggleComplete: (taskId: string, isCompleted: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onUpdateNotes: (taskId: string, notes: string) => Promise<void>;
}

export default function TaskItem({ task, assignee, onToggleComplete, onDelete, onEdit, onUpdateNotes }: TaskItemProps) {
  const { toast } = useToast();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(task.notes || '');

  const handleToggleComplete = async () => {
    await onToggleComplete(task.id, !task.isCompleted);
  };

  const handleDelete = async () => {
    await onDelete(task.id);
  };

  const handleSaveNotes = async () => {
    await onUpdateNotes(task.id, currentNotes);
    setIsEditingNotes(false);
    toast({ title: "Notes Updated", description: "Your notes have been saved."});
  };

  return (
    <Card className="w-full mb-3 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.isCompleted}
            onCheckedChange={handleToggleComplete}
            aria-label={task.isCompleted ? 'Mark task as pending' : 'Mark task as complete'}
            className="mt-1 flex-shrink-0"
          />
          <div className="flex-grow min-w-0"> {/* Ensure flex-grow can shrink if needed */}
            <div className="flex items-start justify-between w-full space-x-2">
              {/* Left Part: Title, Assignee, Due Date */}
              <div className="flex-grow min-w-0 mr-2 space-y-0.5"> {/* min-w-0 allows shrinking */}
                <h3 className={cn(
                  "text-base font-semibold break-words",
                  task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                )}>
                  {task.title}
                </h3>
                <div className="text-xs text-muted-foreground space-x-2">
                  <span>Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>
                  {assignee && (
                    <span>
                      Assignee: {' '}
                      <Link href={`/tasks/${assignee.name.replace(/\s+/g, '-')}`} className="text-primary hover:underline">
                        {assignee.name}
                      </Link>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Part: Notes Display/Edit */}
              <div className="flex-shrink-0 w-full max-w-[180px] sm:max-w-[220px] md:max-w-xs">
                {isEditingNotes && (
                  <div className="space-y-1">
                    <Textarea
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="text-xs h-20 p-1.5" // Adjusted height and padding
                      rows={3}
                    />
                    <div className="flex justify-end space-x-1">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { setIsEditingNotes(false); setCurrentNotes(task.notes || ''); }}>
                        <X className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSaveNotes}>
                        <Check className="mr-1 h-3 w-3" /> Save
                      </Button>
                    </div>
                  </div>
                )}
                {!isEditingNotes && task.notes && (
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-1.5 rounded-md max-h-20 overflow-y-auto custom-scrollbar">
                    <p className="font-semibold text-xs mb-0.5 text-foreground/80">Notes:</p>
                    {task.notes}
                  </div>
                )}
                {!isEditingNotes && !task.notes && (
                  <div className="text-xs text-muted-foreground p-1.5 rounded-md italic">
                    No notes.
                  </div>
                )}
              </div>

              {/* Right Part: Action Buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0 no-print">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)} aria-label="Edit task">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" aria-label="Delete task">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task
                        "{task.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingNotes(!isEditingNotes)} aria-label={isEditingNotes ? "Cancel editing notes" : "Add/Edit notes"}>
                  {isEditingNotes ? <X className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
