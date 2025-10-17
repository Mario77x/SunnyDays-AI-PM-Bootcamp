import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Users, Edit, Trash2, Sun, CloudRain, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
  const { language, t } = useLanguage();

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
      case 'future': return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
      case 'past': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
    }
  };

  const getStatusBorderColor = (status: Activity['status']) => {
    switch (status) {
      case 'draft': return 'border-l-gray-400';
      case 'future': return 'border-l-blue-500';
      case 'past': return 'border-l-green-500';
      default: return 'border-l-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    const locale = language === 'nl' ? nl : enUS;
    return format(new Date(date), 'EEE d MMM', { locale });
  };

  const canEdit = activity.status !== 'past';

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 h-[220px] flex flex-col border-l-4 ${getStatusBorderColor(activity.status)}`}>
      {/* Compact Header */}
      <CardHeader className="pb-1 flex-shrink-0">
        <div className="space-y-1">
          {/* Title and Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight flex-1">
              {activity.title}
            </CardTitle>
            <Badge className={`${getStatusColor(activity.status)} flex-shrink-0 text-xs px-2 py-0.5`}>
              {t(`status.${activity.status}`)}
            </Badge>
          </div>
          
          {/* Date and Time - Inline */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium">{formatDate(activity.date)}</span>
            {activity.time && (
              <>
                <Clock className="h-3 w-3 flex-shrink-0 ml-1" />
                <span>{activity.time}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      {/* Content */}
      <CardContent className="flex-1 flex flex-col pt-0 space-y-2">
        {/* Details Section - All fields follow same pattern */}
        <div className="flex-1 space-y-1">
          {/* Location */}
          {activity.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3 flex-shrink-0 text-green-600" />
              <span className="line-clamp-1" title={activity.location}>
                {activity.location}
              </span>
            </div>
          )}
          
          {/* Backup Plan */}
          {activity.backupPlan && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="h-3 w-3 flex-shrink-0 text-orange-600" />
              <span>
                {language === 'nl' ? 'Backup beschikbaar' : 'Backup available'}
              </span>
            </div>
          )}
          
          {/* Weather */}
          {activity.weatherAssessment && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {activity.weatherAssessment.recommendation === 'good' ? (
                <Sun className="h-3 w-3 flex-shrink-0 text-yellow-500" />
              ) : (
                <CloudRain className="h-3 w-3 flex-shrink-0 text-gray-500" />
              )}
              <span className={`font-medium ${
                activity.weatherAssessment.recommendation === 'good' 
                  ? 'text-green-700' 
                  : 'text-orange-700'
              }`}>
                {activity.weatherAssessment.recommendation === 'good' 
                  ? (language === 'nl' ? 'Goed weer' : 'Good weather')
                  : (language === 'nl' ? 'Wisselvallig weer' : 'Changing weather')}
              </span>
            </div>
          )}
          
          {/* Invitees */}
          {activity.invitees.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="h-3 w-3 flex-shrink-0 text-purple-600" />
              <span>
                {activity.invitees.length} {language === 'nl' ? 'uitgenodigden' : 'invitees'}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100 flex-shrink-0">
          {canEdit ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(activity)}
                className="flex-1 h-7 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{t('button.edit')}</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(activity.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 h-7"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="w-full h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{t('button.delete')}</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};