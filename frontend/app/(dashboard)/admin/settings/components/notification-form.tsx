'use client';

import { usersApi } from '@/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const defaultValues: NotificationFormValues = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
};

export function NotificationForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  });

  const { mutate: updateNotifications, isPending: isUpdatingNotifications } = useMutation({
    mutationFn: usersApi.updateNotificationSettings,
    onSuccess: () => {
      toast.success('Notification preferences updated');
    },
    onError: () => {
      toast.error('Failed to update notification preferences');
    },
  });

  function onSubmit(data: NotificationFormValues) {
    updateNotifications(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='grid gap-6'>
          <Card className='p-6'>
            <h3 className='text-lg font-medium mb-4'>Email Notifications</h3>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='emailNotifications'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive email notifications for important updates
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='marketingEmails'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Marketing Emails</FormLabel>
                      <FormDescription>
                        Receive emails about new features and improvements
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-medium mb-4'>Push Notifications</h3>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='pushNotifications'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications for important updates
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='securityAlerts'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Security Alerts</FormLabel>
                      <FormDescription>
                        Get notified about security-related activities
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </div>

        <Button type='submit' disabled={isUpdatingNotifications}>
          {isUpdatingNotifications ? 'Saving...' : 'Save Preferences'}
        </Button>
      </form>
    </Form>
  );
}
