import { Activity } from '@/types';
import { api, API_ENDPOINTS } from '@/lib/api';

// Backend API types
interface ActivityCreateRequest {
  title: string;
  date: string; // ISO string
}

interface ActivityUpdateRequest {
  title: string;
  date: string; // ISO string
}

interface ActivityResponse {
  id: string;
  title: string;
  date: string; // ISO string
  status: 'draft' | 'future' | 'past';
}

// Convert backend response to frontend Activity type
const convertToActivity = (response: ActivityResponse, userId: string): Activity => {
  return {
    id: response.id,
    userId,
    title: response.title,
    date: new Date(response.date),
    status: response.status,
    invitees: [],
    createdAt: new Date(), // We don't get this from backend yet
    updatedAt: new Date(), // We don't get this from backend yet
  };
};

export const getActivities = async (userId: string): Promise<Activity[]> => {
  try {
    const response = await api.get<ActivityResponse[]>(API_ENDPOINTS.ACTIVITIES.BASE);
    if (!Array.isArray(response)) {
      console.error('API did not return an array for activities:', response);
      return getActivitiesFromLocalStorage(userId);
    }
    return response.map(activity => convertToActivity(activity, userId));
  } catch (error) {
    console.error('Error fetching activities:', error);
    // Fallback to localStorage for offline functionality
    return getActivitiesFromLocalStorage(userId);
  }
};

export const saveActivity = async (activity: Activity): Promise<Activity> => {
  try {
    const activityData: ActivityCreateRequest | ActivityUpdateRequest = {
      title: activity.title,
      date: activity.date.toISOString(),
    };

    let response: ActivityResponse;
    
    if (activity.id && activity.id !== 'temp-id') {
      // Update existing activity
      response = await api.put<ActivityResponse>(
        API_ENDPOINTS.ACTIVITIES.BY_ID(activity.id),
        activityData
      );
    } else {
      // Create new activity
      response = await api.post<ActivityResponse>(
        API_ENDPOINTS.ACTIVITIES.BASE,
        activityData
      );
    }

    const savedActivity = convertToActivity(response, activity.userId);
    
    // Also save to localStorage as backup
    saveActivityToLocalStorage(savedActivity);
    
    return savedActivity;
  } catch (error) {
    console.error('Error saving activity:', error);
    // Fallback to localStorage
    saveActivityToLocalStorage(activity);
    return activity;
  }
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    await api.delete(API_ENDPOINTS.ACTIVITIES.BY_ID(activityId));
    
    // Also remove from localStorage
    deleteActivityFromLocalStorage(activityId);
  } catch (error) {
    console.error('Error deleting activity:', error);
    // Fallback to localStorage
    deleteActivityFromLocalStorage(activityId);
  }
};

export const updateActivityStatus = async (activityId: string, status: Activity['status']): Promise<void> => {
  try {
    // For now, we'll handle status updates locally since the backend doesn't have a specific endpoint
    // In a future version, we could add a PATCH endpoint for status updates
    updateActivityStatusInLocalStorage(activityId, status);
  } catch (error) {
    console.error('Error updating activity status:', error);
    updateActivityStatusInLocalStorage(activityId, status);
  }
};

// Auto-update activity statuses based on dates - ONLY for completed activities
export const updateActivityStatuses = async (userId: string): Promise<void> => {
  try {
    const activities = await getActivities(userId);
    const now = new Date();
    
    for (const activity of activities) {
      const activityDate = new Date(activity.date);
      
      // ONLY transition activities that were previously completed (status: 'future')
      // NEVER automatically change draft activities to past
      if (activity.status === 'future' && activityDate < now) {
        await updateActivityStatus(activity.id, 'past');
      }
    }
  } catch (error) {
    console.error('Error updating activity statuses:', error);
    // Fallback to localStorage version
    updateActivityStatusesInLocalStorage(userId);
  }
};

// Fallback localStorage functions (keeping the original logic as backup)
const ACTIVITIES_KEY = 'sunnydays_activities';

const getActivitiesFromLocalStorage = (userId: string): Activity[] => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  return activities.filter((activity: Activity) => activity.userId === userId);
};

const saveActivityToLocalStorage = (activity: Activity): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const existingIndex = activities.findIndex((a: Activity) => a.id === activity.id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = { ...activity, updatedAt: new Date() };
  } else {
    activities.push(activity);
  }
  
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

const deleteActivityFromLocalStorage = (activityId: string): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const filteredActivities = activities.filter((a: Activity) => a.id !== activityId);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities));
};

const updateActivityStatusInLocalStorage = (activityId: string, status: Activity['status']): void => {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  const activityIndex = activities.findIndex((a: Activity) => a.id === activityId);
  
  if (activityIndex >= 0) {
    activities[activityIndex].status = status;
    activities[activityIndex].updatedAt = new Date();
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }
};

const updateActivityStatusesInLocalStorage = (userId: string): void => {
  const activities = getActivitiesFromLocalStorage(userId);
  const now = new Date();
  
  activities.forEach(activity => {
    const activityDate = new Date(activity.date);
    
    // ONLY transition activities that were previously completed (status: 'future')
    // NEVER automatically change draft activities to past
    if (activity.status === 'future' && activityDate < now) {
      updateActivityStatusInLocalStorage(activity.id, 'past');
    }
  });
};