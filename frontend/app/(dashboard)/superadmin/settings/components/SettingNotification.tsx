'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { userService } from '@/services/user.service';

interface NotificationPreferences {
  emailNotifications: boolean;
  leadUpdates: boolean;
  dealUpdates: boolean;
  teamUpdates: boolean;
  systemUpdates: boolean;
}

export default function SettingNotification() {
  const form = useForm<NotificationPreferences>({
    defaultValues: {
      emailNotifications: true,
      leadUpdates: true,
      dealUpdates: true,
      teamUpdates: true,
      systemUpdates: true,
    },
  });

  const onSubmit = async (values: NotificationPreferences) => {
    try {
      await userService.updateNotificationPreferences(values);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={form.watch('emailNotifications')}
              onCheckedChange={(checked) => form.setValue('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">Lead Updates</h3>
              <p className="text-sm text-muted-foreground">
                Get notified about new leads and lead status changes
              </p>
            </div>
            <Switch
              checked={form.watch('leadUpdates')}
              onCheckedChange={(checked) => form.setValue('leadUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">Deal Updates</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications about deal progress and closures
              </p>
            </div>
            <Switch
              checked={form.watch('dealUpdates')}
              onCheckedChange={(checked) => form.setValue('dealUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">Team Updates</h3>
              <p className="text-sm text-muted-foreground">
                Stay informed about team activities and changes
              </p>
            </div>
            <Switch
              checked={form.watch('teamUpdates')}
              onCheckedChange={(checked) => form.setValue('teamUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">System Updates</h3>
              <p className="text-sm text-muted-foreground">
                Get notified about system maintenance and updates
              </p>
            </div>
            <Switch
              checked={form.watch('systemUpdates')}
              onCheckedChange={(checked) => form.setValue('systemUpdates', checked)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Preferences</Button>
        </div>
      </form>
    </Form>
  );
}
