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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { changePasswordAction } from '@/actions/userActions';
import { Lock } from 'lucide-react';

const passwordFormSchema = z.object({
  // currentPassword: z.string().min(1, { message: "Current password is required." }), // Mock auth doesn't easily support this
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'], // path of error
});

export default function ChangePasswordForm() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      // currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'User not found.', variant: 'destructive' });
      return;
    }

    // Here, you would typically also send values.currentPassword to verify on the backend.
    // For this mock setup, we'll directly attempt to change it.
    const result = await changePasswordAction(user.id, values.newPassword);

    if (result.success) {
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      });
      form.reset();
    } else {
      toast({
        title: 'Password Change Failed',
        description: result.error || 'Could not change password. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Changing...' : <><Lock className="mr-2 h-4 w-4"/>Change Password</>}
        </Button>
      </form>
    </Form>
  );
}