
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEffect, useState, type FC } from 'react';
import AssigneeModal from './AssigneeModal';
import type { Task, Assignee } from '@/types';
import { createTaskAction, updateTaskAction } from '@/actions/taskActions';
import { useAuth } from '@/context/AuthContext';


interface TaskFormProps {
  taskToEdit?: Task;
  onFormSubmit: (task: Task) => void; 
  onCancel?: () => void;
  assignees: Assignee[]; // Added assignees prop
}

const formSchema = z.object({
  title: z.string().min(3, { message: 'Task title must be at least 3 characters.' }),
  assigneeId: z.string({ required_error: 'Please select an assignee.' }),
  dueDate: z.date({ required_error: 'A due date is required.' }),
});

const TaskForm: FC<TaskFormProps> = ({ taskToEdit, onFormSubmit, onCancel, assignees: initialAssignees }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [assignees, setAssignees] = useState<Assignee[]>(initialAssignees);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: taskToEdit?.title || '',
      assigneeId: taskToEdit?.assigneeId || '',
      dueDate: taskToEdit?.dueDate ? parseISO(taskToEdit.dueDate) : new Date(),
    },
  });
  
  useEffect(() => {
    setAssignees(initialAssignees);
  }, [initialAssignees]);

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        assigneeId: taskToEdit.assigneeId,
        dueDate: parseISO(taskToEdit.dueDate),
      });
    } else {
      form.reset({ title: '', assigneeId: '', dueDate: new Date()});
    }
  }, [taskToEdit, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create or update tasks.',
        variant: 'destructive',
      });
      return;
    }
    const taskData = {
      ...values,
      dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      userId: user.id, // Associate task with current user
    };

    let result;
    if (taskToEdit) {
      // For update, ensure we don't change userId if it's already set and different
      // or handle this logic based on requirements (e.g., admin editing any task)
      const updatePayload = { ...taskData };
      if(taskToEdit.userId && taskToEdit.userId !== user.id) {
        // Potentially disallow editing if task belongs to another user, or allow if admin
        // For now, we assume user can edit their own tasks.
        // If taskToEdit.userId is undefined, it means it's an older task, associate it now.
        // updatePayload.userId = taskToEdit.userId || user.id;
      }
      result = await updateTaskAction(taskToEdit.id, updatePayload);
    } else {
      result = await createTaskAction(taskData);
    }

    if (result.success && result.task) {
      toast({
        title: taskToEdit ? 'Task Updated' : 'Task Created',
        description: `Task "${result.task.title}" has been ${taskToEdit ? 'updated' : 'added'}.`,
      });
      onFormSubmit(result.task);
      if (!taskToEdit) form.reset({ title: '', assigneeId: '', dueDate: new Date()}); 
    } else {
      toast({
        title: 'Error',
        description: result.error || `Failed to ${taskToEdit ? 'update' : 'create'} task.`,
        variant: 'destructive',
      });
    }
  }
  
  const handleAssigneeAdded = (newAssignee: Assignee) => {
    setAssignees(prev => [...prev, newAssignee]);
    form.setValue('assigneeId', newAssignee.id); 
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-2 mb-6 p-4 border rounded-lg shadow-sm bg-card">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only md:not-sr-only">Task Title</FormLabel>
                <FormControl>
                  <Input placeholder="What needs to be done?" {...field} />
                </FormControl>
                <FormMessage className="md:hidden"/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem className="w-full md:w-auto md:min-w-[180px]">
                <FormLabel className="sr-only md:not-sr-only">Assignee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignees.filter(a => a.status === 'active').map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </SelectItem>
                    ))}
                    <Button type="button" variant="ghost" className="w-full justify-start p-2 mt-1 text-sm" onClick={() => setIsAssigneeModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Assignee
                    </Button>
                  </SelectContent>
                </Select>
                <FormMessage className="md:hidden" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full md:w-auto">
                <FormLabel className="sr-only md:not-sr-only">Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="md:hidden" />
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2 pt-2 md:pt-0">
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (taskToEdit ? 'Saving...' : 'Adding...') : (taskToEdit ? 'Save Changes' : 'Add Task')}
            </Button>
            {taskToEdit && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full md:w-auto">
                Cancel
              </Button>
            )}
          </div>
        </form>
         <div className="md:hidden"> 
            {form.formState.errors.title?.message && <FormMessage>{form.formState.errors.title?.message}</FormMessage>}
            {form.formState.errors.assigneeId?.message && <FormMessage>{form.formState.errors.assigneeId?.message}</FormMessage>}
            {form.formState.errors.dueDate?.message && <FormMessage>{form.formState.errors.dueDate?.message}</FormMessage>}
        </div>
      </Form>
      <AssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        onAssigneeAdded={handleAssigneeAdded}
      />
    </>
  );
};
export default TaskForm;
