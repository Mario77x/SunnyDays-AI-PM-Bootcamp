import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActivityForm } from '@/components/activity/ActivityForm';
import { ArrowLeft, Sun } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity } from '@/types';
import { getActivities } from '@/services/activityService';
import { showError } from '@/utils/toast';

const ActivityEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      navigate('/dashboard');
      return;
    }

    const userActivities = getActivities(user.id);
    const foundActivity = userActivities.find(a => a.id === id);
    
    if (!foundActivity) {
      showError(t('message.activityNotFound'));
      navigate('/dashboard');
      return;
    }

    setActivity(foundActivity);
    setLoading(false);
  }, [user, id, navigate, t]);

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('activity.allActivities')}
              </Button>
              <div className="flex items-center">
                <Sun className="h-6 w-6 mr-2" style={{ color: '#ff9900' }} />
                <h1 className="text-xl font-bold" style={{ color: '#ff9900' }}>
                  {t('app.title')}
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {t('nav.welcome')}, {user.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('activity.edit.title')}
          </h2>
          <p className="text-gray-600">
            {t('activity.edit.subtitle')}
          </p>
        </div>

        {activity && <ActivityForm activity={activity} isEditing={true} />}
      </div>
    </div>
  );
};

export default ActivityEdit;