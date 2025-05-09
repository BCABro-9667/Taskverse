'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addAssigneeAction } from '@/actions/taskActions'; // Using the server action
import type { Assignee } from '@/types';

interface AssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigneeAdded: (newAssignee: Assignee) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Assignee name must be at least 2 characters.' }),
  designation: z.string().optional(),
});

export default function AssigneeModal({ isOpen, onClose, onAssigneeAdded }: AssigneeModalProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      designation: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addAssigneeAction(values);
    if (result.success && result.assignee) {
      toast({
        title: 'Assignee Added',
        description: `${result.assignee.name} has been added to the list.`,
      });
      onAssigneeAdded(result.assignee);
      form.reset();
      onClose();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add assignee.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Assignee</DialogTitle>
          <DialogDescription>
            Enter the details for the new assignee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Assignee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}