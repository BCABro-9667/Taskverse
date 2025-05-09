'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types';
import { updateUserProfileAction } from '@/actions/userActions';
import { User, Building, ImageIcon, MapPin } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  profileImageUrl: z.string().url({ message: 'Please enter a valid URL for profile image.' }).optional().or(z.literal('')),
  companyName: z.string().optional(),
  companyLogoUrl: z.string().url({ message: 'Please enter a valid URL for company logo.' }).optional().or(z.literal('')),
  companyAddress: z.string().optional(),
});

export default function ProfileForm() {
  const { user, updateUserProfileContext, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      profileImageUrl: user?.profileImageUrl || '',
      companyName: user?.companyName || '',
      companyLogoUrl: user?.companyLogoUrl || '',
      companyAddress: user?.companyAddress || '',
    },
  });
  
  // Effect to update form when user data changes (e.g. on initial load)
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        profileImageUrl: user.profileImageUrl || '',
        companyName: user.companyName || '',
        companyLogoUrl: user.companyLogoUrl || '',
        companyAddress: user.companyAddress || '',
      });
    }
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'User not found.', variant: 'destructive' });
      return;
    }

    const result = await updateUserProfileAction(user.id, values);

    if (result.success && result.user) {
      updateUserProfileContext(result.user); // Update context
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully updated.',
      });
    } else {
      toast({
        title: 'Update Failed',
        description: result.error || 'Could not update profile. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading || !user) {
    return <div>Loading profile...</div>; // Or a skeleton loader
  }
  
  const currentProfileImage = form.watch('profileImageUrl') || user?.profileImageUrl;
  const currentCompanyName = form.watch('companyName') || user?.companyName;
  const currentCompanyLogo = form.watch('companyLogoUrl') || user?.companyLogoUrl;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentProfileImage || undefined} alt={user.name} data-ai-hint="profile avatar" />
            <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
          </Avatar>
          <FormField
            control={form.control}
            name="profileImageUrl"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Profile Picture URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormDescription>Enter the URL of your profile picture.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 border-t pt-6 mt-6">
            <h3 className="text-lg font-medium flex items-center"><Building className="mr-2 h-5 w-5 text-muted-foreground" />Company Information</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentCompanyLogo ? (
             <Image src={currentCompanyLogo} alt={currentCompanyName || "Company Logo"} width={100} height={40} className="rounded border p-1 object-contain h-10" data-ai-hint="company logo" />
          ) : (
            <div className="w-[100px] h-10 border rounded flex items-center justify-center bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <FormField
            control={form.control}
            name="companyLogoUrl"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Company Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <FormDescription>URL for your company's logo (shown in navbar).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company Inc." {...field} />
              </FormControl>
              <FormDescription>Your company's name (shown in navbar).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Company Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Business Rd, Suite 400, City, Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Profile Changes'}
        </Button>
      </form>
    </Form>
  );
}