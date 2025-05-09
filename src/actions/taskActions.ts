// This file would typically contain server actions.
// Due to the complexity of setting up Server Actions with mocked data
// and revalidation in this environment, these functions will be called directly
// from client components or simulated as if they were server actions.
// In a real Next.js app with a database, these would be 'use server' functions.

'use server';

import { revalidatePath } from 'next/cache';
import { 
  addTask as dbAddTask, 
  updateTask as dbUpdateTask, 
  deleteTask as dbDeleteTask,
  addAssignee as dbAddAssignee
} from '@/lib/data';
import type { Task, Assignee } from '@/types';

export async function createTaskAction(taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) {
  try {
    const newTask = await dbAddTask(taskData);
    revalidatePath('/dashboard');
    return { success: true, task: newTask };
  } catch (error) {
    return { success: false, error: 'Failed to create task.' };
  }
}

export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
  try {
    const updatedTask = await dbUpdateTask(taskId, updates);
    if (!updatedTask) throw new Error('Task not found');
    revalidatePath('/dashboard');
    revalidatePath(`/tasks/${updatedTask.assigneeId}`); // Potentially revalidate assignee page
    return { success: true, task: updatedTask };
  } catch (error) {
    return { success: false, error: 'Failed to update task.' };
  }
}

export async function toggleTaskCompletionAction(taskId: string, isCompleted: boolean) {
  try {
    const updatedTask = await dbUpdateTask(taskId, { isCompleted });
    if (!updatedTask) throw new Error('Task not found');
    revalidatePath('/dashboard');
    revalidatePath(`/tasks/${updatedTask.assigneeId}`);
    return { success: true, task: updatedTask };
  } catch (error) {
    return { success: false, error: 'Failed to update task completion.' };
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    await dbDeleteTask(taskId);
    revalidatePath('/dashboard');
    // Potentially revalidate relevant assignee pages if tasks are shown there
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete task.' };
  }
}

export async function addAssigneeAction(assigneeData: Omit<Assignee, 'id'>) {
  try {
    const newAssignee = await dbAddAssignee(assigneeData);
    revalidatePath('/dashboard'); // Revalidate dashboard as assignee list might be used in TaskForm
    return { success: true, assignee: newAssignee };
  } catch (error) {
    return { success: false, error: 'Failed to add assignee.' };
  }
}