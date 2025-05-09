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
            className="mt-1"
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start">
                <h3 className={`text-base font-semibold ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title}
                </h3>
                 <div className="flex items-center space-x-1 flex-shrink-0 ml-2 no-print">
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

            {isEditingNotes && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="text-sm"
                  rows={2}
                />
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {setIsEditingNotes(false); setCurrentNotes(task.notes || '');}}>
                        <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                        <Check className="mr-1 h-3 w-3" /> Save Notes
                    </Button>
                </div>
              </div>
            )}
            {!isEditingNotes && task.notes && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-secondary/50 p-2 rounded-md">
                <strong>Notes:</strong> {task.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}