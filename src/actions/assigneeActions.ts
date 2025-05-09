
'use server';

import { revalidatePath } from 'next/cache';
import { 
  addAssigneeData, 
  updateAssigneeData,
  deleteAssigneeData,
  getAssignees as dbGetAssignees, // to avoid confusion if we have a getAssignees action
  getAssigneeById as dbGetAssigneeById
} from '@/lib/data';
import type { Assignee } from '@/types';

export async function createAssigneeAction(assigneeData: Omit<Assignee, 'id'>) {
  try {
    // Ensure status defaults to 'active' if not provided, or handled by addAssigneeData
    const dataWithDefaults = { ...assigneeData, status: assigneeData.status || 'active' } as Omit<Assignee, 'id'>;
    const newAssignee = await addAssigneeData(dataWithDefaults);
    revalidatePath('/assignees');
    revalidatePath('/dashboard'); // In case TaskForm uses assignees
    return { success: true, assignee: newAssignee };
  } catch (error) {
    return { success: false, error: 'Failed to create assignee.' };
  }
}

export async function updateAssigneeAction(assigneeId: string, updates: Partial<Omit<Assignee, 'id'>>) {
  try {
    const updatedAssignee = await updateAssigneeData(assigneeId, updates);
    if (!updatedAssignee) throw new Error('Assignee not found');
    revalidatePath('/assignees');
    revalidatePath('/dashboard');
    return { success: true, assignee: updatedAssignee };
  } catch (error) {
    let message = 'Failed to update assignee.';
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, error: message };
  }
}

export async function deleteAssigneeAction(assigneeId: string) {
  try {
    await deleteAssigneeData(assigneeId);
    revalidatePath('/assignees');
    revalidatePath('/dashboard');
    // Consider revalidating task pages if an assignee is deleted and tasks need reassignment logic
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete assignee.' };
  }
}

export async function toggleAssigneeStatusAction(assigneeId: string, currentStatus: 'active' | 'inactive') {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updatedAssignee = await updateAssigneeData(assigneeId, { status: newStatus });
    if (!updatedAssignee) throw new Error('Assignee not found');
    revalidatePath('/assignees');
    return { success: true, assignee: updatedAssignee };
  } catch (error) {
    return { success: false, error: 'Failed to toggle assignee status.' };
  }
}

export async function getAssigneesAction(): Promise<Assignee[]> {
    return dbGetAssignees();
}

export async function getAssigneeByIdAction(id: string): Promise<Assignee | null> {
    const assignee = await dbGetAssigneeById(id);
    return assignee || null;
}

