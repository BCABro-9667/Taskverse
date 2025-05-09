
'use client';

import type { Assignee } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import {
  createAssigneeAction,
  deleteAssigneeAction,
  getAssigneesAction,
  toggleAssigneeStatusAction,
  updateAssigneeAction,
} from '@/actions/assigneeActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Search } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const assigneeFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  designation: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type AssigneeFormData = z.infer<typeof assigneeFormSchema>;

export default function AssigneeManagementTab() {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState<Assignee | null>(null);

  const { toast } = useToast();

  const form = useForm<AssigneeFormData>({
    resolver: zodResolver(assigneeFormSchema),
    defaultValues: {
      name: '',
      designation: '',
      status: 'active',
    },
  });

  const fetchAssignees = async () => {
    setIsLoading(true);
    try {
      const data = await getAssigneesAction();
      setAssignees(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load assignees.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignees();
  }, []);

  const filteredAssignees = useMemo(() => {
    return assignees.filter(
      (assignee) =>
        assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignee.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignees, searchTerm]);

  const handleFormSubmit = async (data: AssigneeFormData) => {
    let result;
    if (editingAssignee) {
      result = await updateAssigneeAction(editingAssignee.id, data);
    } else {
      result = await createAssigneeAction(data);
    }

    if (result.success && result.assignee) {
      toast({
        title: editingAssignee ? 'Assignee Updated' : 'Assignee Created',
        description: `${result.assignee.name} has been ${editingAssignee ? 'updated' : 'added'}.`,
      });
      fetchAssignees(); // Re-fetch to update list
      setIsFormDialogOpen(false);
      setEditingAssignee(null);
      form.reset({ name: '', designation: '', status: 'active' });
    } else {
      toast({
        title: 'Error',
        description: result.error || `Failed to ${editingAssignee ? 'update' : 'create'} assignee.`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (assignee: Assignee) => {
    setEditingAssignee(assignee);
    form.reset(assignee);
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (assigneeId: string) => {
    const result = await deleteAssigneeAction(assigneeId);
    if (result.success) {
      toast({ title: 'Assignee Deleted', description: 'Assignee has been removed.' });
      fetchAssignees();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (assignee: Assignee) => {
    const result = await toggleAssigneeStatusAction(assignee.id, assignee.status);
    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `${assignee.name}'s status changed to ${result.assignee?.status}.`,
      });
      fetchAssignees();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const openCreateForm = () => {
    setEditingAssignee(null);
    form.reset({ name: '', designation: '', status: 'active' });
    setIsFormDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="relative w-full sm:w-auto sm:flex-grow max-w-sm">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
            type="search"
            placeholder="Search assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Button onClick={openCreateForm} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Assignee
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignees.length > 0 ? (
              filteredAssignees.map((assignee) => (
                <TableRow key={assignee.id}>
                  <TableCell className="font-medium">{assignee.name}</TableCell>
                  <TableCell>{assignee.designation || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={assignee.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(assignee)}
                        aria-label={`Toggle status for ${assignee.name}`}
                        id={`status-${assignee.id}`}
                      />
                       <label htmlFor={`status-${assignee.id}`} className="ml-2 text-sm sr-only">
                        {assignee.status === 'active' ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(assignee)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {assignee.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(assignee.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No assignees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsFormDialogOpen(false);
            setEditingAssignee(null);
            form.reset({ name: '', designation: '', status: 'active' });
          } else {
            setIsFormDialogOpen(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAssignee ? 'Edit Assignee' : 'Add New Assignee'}</DialogTitle>
            <DialogDescription>
              {editingAssignee ? 'Update the details for this assignee.' : 'Enter the details for the new assignee.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                       <FormDescription>
                        Set the assignee as active or inactive.
                      </FormDescription>
                    </div>
                    <FormControl>
                       <Switch
                        checked={field.value === 'active'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : (editingAssignee ? 'Save Changes' : 'Add Assignee')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
