
import type { Task, Assignee, UserProfile } from '@/types';
import { formatISO, subDays, addDays } from 'date-fns';

// In-memory store
let tasks: Task[] = [
  { id: 'task1', title: 'Setup project repository', assigneeId: 'assignee1', dueDate: formatISO(new Date()), notes: 'Use GitHub and Next.js template', isCompleted: true, createdAt: formatISO(subDays(new Date(), 2)) },
  { id: 'task2', title: 'Design homepage UI', assigneeId: 'assignee2', dueDate: formatISO(addDays(new Date(), 2)), notes: 'Follow Figma mockups', isCompleted: false, createdAt: formatISO(subDays(new Date(), 1)) },
  { id: 'task3', title: 'Implement authentication', assigneeId: 'assignee1', dueDate: formatISO(addDays(new Date(), 5)), isCompleted: false, createdAt: formatISO(new Date()) },
  { id: 'task4', title: 'Write API documentation', assigneeId: 'assignee3', dueDate: formatISO(addDays(new Date(), 7)), notes: 'Use Swagger/OpenAPI', isCompleted: false, createdAt: formatISO(addDays(new Date(),1)) },
];

let assignees: Assignee[] = [
  { id: 'assignee1', name: 'Alice Wonderland', designation: 'Frontend Developer', status: 'active' },
  { id: 'assignee2', name: 'Bob The Builder', designation: 'UI/UX Designer', status: 'active' },
  { id: 'assignee3', name: 'Charlie Brown', designation: 'Backend Developer', status: 'inactive' },
];


// Task functions
export async function getTasks(userId?: string): Promise<Task[]> {
  // In a real app, filter tasks by userId
  return JSON.parse(JSON.stringify(tasks)); // Return copies
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return JSON.parse(JSON.stringify(tasks.find(task => task.id === id)));
}

export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>): Promise<Task> {
  const newTask: Task = {
    ...taskData,
    id: `task${Date.now()}`,
    createdAt: formatISO(new Date()),
    isCompleted: false,
  };
  tasks.push(newTask);
  return JSON.parse(JSON.stringify(newTask));
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    return JSON.parse(JSON.stringify(tasks[taskIndex]));
  }
  return null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  return tasks.length < initialLength;
}

// Assignee functions
export async function getAssignees(): Promise<Assignee[]> {
  return JSON.parse(JSON.stringify(assignees));
}

export async function getAssigneeById(id: string): Promise<Assignee | undefined> {
    return JSON.parse(JSON.stringify(assignees.find(a => a.id === id)));
}

// Renamed from addAssignee to addAssigneeData to avoid confusion with action
export async function addAssigneeData(assigneeData: Omit<Assignee, 'id'>): Promise<Assignee> {
  const newAssignee: Assignee = {
    id: `assignee${Date.now()}`,
    name: assigneeData.name,
    designation: assigneeData.designation,
    status: assigneeData.status || 'active', // Default to active if not provided
  };
  assignees.push(newAssignee);
  return JSON.parse(JSON.stringify(newAssignee));
}

export async function updateAssigneeData(id: string, updates: Partial<Omit<Assignee, 'id'>>): Promise<Assignee | null> {
  const assigneeIndex = assignees.findIndex(a => a.id === id);
  if (assigneeIndex !== -1) {
    assignees[assigneeIndex] = { ...assignees[assigneeIndex], ...updates };
    return JSON.parse(JSON.stringify(assignees[assigneeIndex]));
  }
  return null;
}

export async function deleteAssigneeData(id: string): Promise<boolean> {
  const initialLength = assignees.length;
  assignees = assignees.filter(a => a.id !== id);
  return assignees.length < initialLength;
}


export async function getAssigneeByName(name: string): Promise<Assignee | undefined> {
  return JSON.parse(JSON.stringify(assignees.find(a => a.name === name)));
}
