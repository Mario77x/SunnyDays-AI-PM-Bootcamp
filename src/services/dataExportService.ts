import { User, Activity } from '@/types';

export interface UserDataExport {
  exportDate: string;
  user: User;
  activities: Activity[];
  metadata: {
    totalActivities: number;
    draftActivities: number;
    futureActivities: number;
    pastActivities: number;
    exportVersion: string;
  };
}

export const exportUserData = (user: User): UserDataExport => {
  // Get all user activities
  const activities = JSON.parse(localStorage.getItem('sunnydays_activities') || '[]')
    .filter((activity: Activity) => activity.userId === user.id);

  // Calculate metadata
  const metadata = {
    totalActivities: activities.length,
    draftActivities: activities.filter((a: Activity) => a.status === 'draft').length,
    futureActivities: activities.filter((a: Activity) => a.status === 'future').length,
    pastActivities: activities.filter((a: Activity) => a.status === 'past').length,
    exportVersion: '1.0'
  };

  const exportData: UserDataExport = {
    exportDate: new Date().toISOString(),
    user,
    activities,
    metadata
  };

  return exportData;
};

export const downloadDataExport = (user: User): void => {
  const exportData = exportUserData(user);
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sunnydays-data-export-${user.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const deleteAllUserData = (userId: string): void => {
  // Remove user from users list
  const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
  const filteredUsers = users.filter((u: User) => u.id !== userId);
  localStorage.setItem('sunnydays_users', JSON.stringify(filteredUsers));
  
  // Remove all user activities
  const activities = JSON.parse(localStorage.getItem('sunnydays_activities') || '[]');
  const filteredActivities = activities.filter((a: Activity) => a.userId !== userId);
  localStorage.setItem('sunnydays_activities', JSON.stringify(filteredActivities));
  
  // Remove current user session
  localStorage.removeItem('sunnydays_user');
  
  // Remove user language preference
  localStorage.removeItem('sunnydays_language');
};