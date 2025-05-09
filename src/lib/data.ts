
import { formatISO } from 'date-fns';
import { getDb, toObjectId, mapMongoId, mapMongoIds } from './mongodb';
import type { Task, Assignee } from '@/types';
import type { Collection, ObjectId } from 'mongodb';

const TASKS_COLLECTION = 'tasks';
const ASSIGNEES_COLLECTION = 'assignees';

// Task functions
export async function getTasks(userId?: string): Promise<Task[]> {
  const db = await getDb();
  const collection: Collection<Omit<Task, 'id'> & { _id: ObjectId }> = db.collection(TASKS_COLLECTION);
  let query = {};
  if (userId) {
    query = { userId }; // Assuming tasks have a userId field
  }
  const tasksFromDb = await collection.find(query).sort({ createdAt: -1 }).toArray();
  return mapMongoIds(tasksFromDb);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await getDb();
  const collection: Collection<Omit<Task, 'id'> & { _id: ObjectId }> = db.collection(TASKS_COLLECTION);
  try {
    const taskFromDb = await collection.findOne({ _id: toObjectId(id) });
    return taskFromDb ? mapMongoId(taskFromDb) : undefined;
  } catch (error) {
    console.error(`Error fetching task by ID ${id}:`, error);
    return undefined;
  }
}

export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>): Promise<Task> {
  const db = await getDb();
  const collection: Collection<Omit<Task, 'id'> & { _id: ObjectId }> = db.collection(TASKS_COLLECTION);
  const newTaskDocument = {
    ...taskData,
    createdAt: formatISO(new Date()),
    isCompleted: false,
  };
  const result = await collection.insertOne(newTaskDocument as any); // `any` due to _id being generated
  
  const insertedTask = await collection.findOne({ _id: result.insertedId });
  if (!insertedTask) {
    throw new Error('Failed to retrieve inserted task');
  }
  return mapMongoId(insertedTask);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const db = await getDb();
  const collection: Collection<Omit<Task, 'id'> & { _id: ObjectId }> = db.collection(TASKS_COLLECTION);
  // Remove id from updates if it exists, as we don't update _id
  const { id: taskId, ...updateData } = updates;

  try {
    const result = await collection.updateOne(
      { _id: toObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
        // If nothing matched, it might mean the task doesn't exist
        const existingTask = await collection.findOne({ _id: toObjectId(id) });
        if (!existingTask) return null; // Task not found
         // Task exists but no fields were changed, return current task
        return mapMongoId(existingTask);
    }
    
    const updatedTaskFromDb = await collection.findOne({ _id: toObjectId(id) });
    return updatedTaskFromDb ? mapMongoId(updatedTaskFromDb) : null;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    return null;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection(TASKS_COLLECTION);
  try {
    const result = await collection.deleteOne({ _id: toObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    return false;
  }
}

// Assignee functions
export async function getAssignees(): Promise<Assignee[]> {
  const db = await getDb();
  const collection: Collection<Omit<Assignee, 'id'> & { _id: ObjectId }> = db.collection(ASSIGNEES_COLLECTION);
  const assigneesFromDb = await collection.find().toArray();
  return mapMongoIds(assigneesFromDb);
}

export async function getAssigneeById(id: string): Promise<Assignee | undefined> {
  const db = await getDb();
  const collection: Collection<Omit<Assignee, 'id'> & { _id: ObjectId }> = db.collection(ASSIGNEES_COLLECTION);
  try {
    const assigneeFromDb = await collection.findOne({ _id: toObjectId(id) });
    return assigneeFromDb ? mapMongoId(assigneeFromDb) : undefined;
  } catch (error) {
    console.error(`Error fetching assignee by ID ${id}:`, error);
    return undefined;
  }
}

export async function addAssigneeData(assigneeData: Omit<Assignee, 'id'>): Promise<Assignee> {
  const db = await getDb();
  const collection: Collection<Omit<Assignee, 'id'> & { _id: ObjectId }> = db.collection(ASSIGNEES_COLLECTION);
  const newAssigneeDocument = {
    name: assigneeData.name,
    designation: assigneeData.designation,
    status: assigneeData.status || 'active',
  };
  const result = await collection.insertOne(newAssigneeDocument as any);
  const insertedAssignee = await collection.findOne({ _id: result.insertedId });
  if (!insertedAssignee) {
    throw new Error('Failed to retrieve inserted assignee');
  }
  return mapMongoId(insertedAssignee);
}

export async function updateAssigneeData(id: string, updates: Partial<Omit<Assignee, 'id'>>): Promise<Assignee | null> {
  const db = await getDb();
  const collection: Collection<Omit<Assignee, 'id'> & { _id: ObjectId }> = db.collection(ASSIGNEES_COLLECTION);
  const { id: assigneeId, ...updateData } = updates;

  try {
    const result = await collection.updateOne(
      { _id: toObjectId(id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0 && result.matchedCount === 0) {
        const existingAssignee = await collection.findOne({ _id: toObjectId(id) });
        if(!existingAssignee) return null; // Assignee not found
        return mapMongoId(existingAssignee); // No changes made
    }

    const updatedAssigneeFromDb = await collection.findOne({ _id: toObjectId(id) });
    return updatedAssigneeFromDb ? mapMongoId(updatedAssigneeFromDb) : null;
  } catch (error) {
    console.error(`Error updating assignee ${id}:`, error);
    return null;
  }
}

export async function deleteAssigneeData(id: string): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection(ASSIGNEES_COLLECTION);
  try {
    const result = await collection.deleteOne({ _id: toObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting assignee ${id}:`, error);
    return false;
  }
}

export async function getAssigneeByName(name: string): Promise<Assignee | undefined> {
  const db = await getDb();
  const collection: Collection<Omit<Assignee, 'id'> & { _id: ObjectId }> = db.collection(ASSIGNEES_COLLECTION);
  const assigneeFromDb = await collection.findOne({ name: name });
  return assigneeFromDb ? mapMongoId(assigneeFromDb) : undefined;
}
