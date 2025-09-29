import { Activity } from '@/types';

const ACTIVITIES_KEY = 'sunnydays_activities';

export const getActivities = (userId: string): Activity[] => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  return activities.filter((activity: Activity) => activity.userId === userId);
};

export const saveActivity = (activity: Activity): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const existingIndex = activities.findIndex((a: Activity) => a.id === activity.id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = { ...activity, updatedAt: new Date() };
  } else {
    activities.push(activity);
  }
  
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const deleteActivity = (activityId: string): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const filteredActivities = activities.filter((a: Activity) => a.id !== activityId);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities));
};

export const updateActivityStatus = (activityId: string, status: Activity['status']): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const activityIndex = activities.findIndex((a: Activity) => a.id === activityId);
  
  if (activityIndex >= 0) {
    activities[activityIndex].status = status;
    activities[activityIndex].updatedAt = new Date();
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }
};

// Auto-update activity statuses based on dates - ONLY for completed activities
export const updateActivityStatuses = (userId: string): void => {
  const activities = getActivities(userId);
  const now = new Date();
  
  activities.forEach(activity => {
    const activityDate = new Date(activity.date);
    
    // ONLY transition activities that were previously completed (status: 'future')
    // NEVER automatically change draft activities to past
    if (activity.status === 'future' && activityDate < now) {
      updateActivityStatus(activity.id, 'past');
    }
    // Note: We don't transition from 'past' back to 'future' as that would be unusual
    // and could indicate data corruption. Past activities should stay past.
  });
};