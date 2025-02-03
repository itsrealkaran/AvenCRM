import { Calendar, CheckSquare, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: number;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'calendar' | 'email' | 'task';
  isRead: boolean;
}

const activities: Activity[] = [
  {
    id: 1,
    title: 'Client Meeting',
    subtitle: 'with Enterprise Team',
    timestamp: 'Today at 2:00 PM',
    type: 'calendar',
    isRead: false,
  },
  {
    id: 2,
    title: 'New Lead Response',
    subtitle: 'from contact@example.com',
    timestamp: 'Yesterday at 4:30 PM',
    type: 'email',
    isRead: true,
  },
  {
    id: 3,
    title: 'Update Property Listing',
    subtitle: 'Due in 2 hours',
    timestamp: 'Today at 5:00 PM',
    type: 'task',
    isRead: false,
  },
  {
    id: 4,
    title: 'Team Sync',
    subtitle: 'Weekly Progress Review',
    timestamp: 'Tomorrow at 10:00 AM',
    type: 'calendar',
    isRead: false,
  },
  {
    id: 5,
    title: 'Contract Review',
    subtitle: 'Pending approval',
    timestamp: 'Today at 3:00 PM',
    type: 'task',
    isRead: true,
  },
  {
    id: 6,
    title: 'Update Property Listing',
    subtitle: 'Due in 2 hours',
    timestamp: 'Today at 5:00 PM',
    type: 'task',
    isRead: true,
  },
  {
    id: 7,
    title: 'Team Sync',
    subtitle: 'Weekly Progress Review',
    timestamp: 'Tomorrow at 10:00 AM',
    type: 'calendar',
    isRead: true,
  },
  {
    id: 8,
    title: 'Contract Review',
    subtitle: 'Pending approval',
    timestamp: 'Today at 3:00 PM',
    type: 'task',
    isRead: true,
  },
];

const getIconByType = (type: Activity['type']) => {
  const iconProps = { className: 'w-4 h-4 text-white' };

  switch (type) {
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
  }
};

const getIconBgColor = (type: Activity['type']) => {
  switch (type) {
    case 'calendar':
      return 'bg-blue-500';
    case 'email':
      return 'bg-purple-500';
    case 'task':
      return 'bg-green-500';
  }
};

export function NotificationList() {
  const router = useRouter();

  return (
    <div className='w-full'>
      <div className='px-4 py-3 border-b'>
        <h3 className='font-semibold text-base'>Recent Activities</h3>
      </div>
      <div className='p-2 h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
              !activity.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div
              className={`p-2 rounded-full ${getIconBgColor(activity.type)} flex items-center justify-center`}
              style={{ minWidth: '32px', height: '32px' }}
            >
              {getIconByType(activity.type)}
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-sm font-medium ${!activity.isRead ? 'text-blue-600' : 'text-gray-900'}`}
              >
                {activity.title}
              </p>
              <p className='text-sm text-muted-foreground'>{activity.subtitle}</p>
              <p className='text-xs text-muted-foreground mt-1'>{activity.timestamp}</p>
            </div>
            {!activity.isRead && <div className='w-2 h-2 bg-blue-500 rounded-full mt-1'></div>}
          </div>
        ))}
      </div>
      <div className='px-4 py-2 border-t'>
        <button 
          onClick={() => router.push('/admin/notification')}
          className='w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2'
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}
