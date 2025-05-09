
'use client';

import { useEffect, useState } from 'react';
import TaskForm from '@/components/tasks/TaskForm';
import TaskList from '@/components/tasks/TaskList';
import { useAuth } from '@/context/AuthContext';
import type { Task, Assignee } from '@/types';
import { getTasks, getAssignees, updateTask as dbUpdateTask } from '@/lib/data'; 
import { toggleTaskCompletionAction, deleteTaskAction, updateTaskAction } from '@/actions/taskActions'; 
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';


export default function DashboardPage() {
  const { user, isLoading: authContextLoading } = useAuth(); // isLoading here is for AuthContext initialization
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    // User might be null initially if AuthContext is still loading the default user
    // but getTasks can be called without userId for now (it will return all tasks)
    // or we can wait for user to be non-null.
    // For simplicity, let's assume getTasks works fine if user is null initially or filters appropriately.
    // Or, ensure user is available from context before fetching.
    if (!user && !authContextLoading) { 
        // If auth context is done loading and user is still null (error case for default user)
        toast({ title: 'Error', description: 'User data not available.', variant: 'destructive' });
        setIsLoadingData(false);
        return;
    }
    if (!user && authContextLoading) { // Still waiting for default user from context
        return;
    }

    setIsLoadingData(true);
    try {
      // Pass user?.id if getTasks strictly requires it, otherwise it might fetch all tasks or handle null userId
      const tasksData = user ? await getTasks(user.id) : await getTasks(); 
      const assigneesData = await getAssignees();
      
      setTasks(tasksData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setAssignees(assigneesData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Fetch data when authContextLoading is false (meaning AuthContext has initialized)
    // and user object might be available (or default user is set)
    if (!authContextLoading) {
      fetchData();
    }
  }, [user, authContextLoading]); // Re-fetch if user changes (e.g., profile update) or context finishes loading

  const handleFormSubmit = (newTask: Task) => {
    if (editingTask) { 
      setTasks(prevTasks => prevTasks.map(t => t.id === newTask.id ? newTask : t).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else { 
      setTasks(prevTasks => [newTask, ...prevTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
    setEditingTask(undefined);
    setIsEditModalOpen(false);
    // Optionally call fetchData() if server actions don't revalidate effectively or for more robustness
    // fetchData(); 
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    const result = await toggleTaskCompletionAction(taskId, isCompleted);
    if (result.success && result.task) {
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? result.task! : t).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      toast({ title: 'Task Updated', description: `Task marked as ${isCompleted ? 'complete' : 'pending'}.`});
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTaskAction(taskId);
    if (result.success) {
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast({ title: 'Task Deleted', description: 'The task has been successfully deleted.'});
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateNotes = async (taskId: string, notes: string) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, notes} : t));

    const result = await updateTaskAction(taskId, { notes });
    if (!result.success) {
        setTasks(originalTasks); 
        toast({ title: 'Error', description: 'Failed to update notes.', variant: 'destructive' });
    }
  };

  if (authContextLoading || isLoadingData) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" /> {/* TaskForm placeholder */}
        <Skeleton className="h-64 w-full" /> {/* Pending Tasks placeholder */}
        <Skeleton className="h-64 w-full" /> {/* Completed Tasks placeholder */}
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
      
      {!editingTask && !isEditModalOpen && (
        <TaskForm onFormSubmit={handleFormSubmit} />
      )}

      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false);
          setEditingTask(undefined);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task below.</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              taskToEdit={editingTask} 
              onFormSubmit={handleFormSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingTask(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <TaskList
        title="Pending Tasks"
        tasks={pendingTasks}
        assignees={assignees}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onUpdateNotes={handleUpdateNotes}
        className="bg-card"
      />
      <TaskList
        title="Completed Tasks"
        tasks={completedTasks}
        assignees={assignees}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onUpdateNotes={handleUpdateNotes}
        className="bg-card"
      />
    </div>
  );
}
