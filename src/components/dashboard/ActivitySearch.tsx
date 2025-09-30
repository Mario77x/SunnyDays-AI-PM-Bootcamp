import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, X, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { Activity } from '@/types';

interface ActivitySearchProps {
  activities: Activity[];
  onFilteredActivities: (filtered: Activity[]) => void;
  activeTab: string;
}

export const ActivitySearch: React.FC<ActivitySearchProps> = ({
  activities,
  onFilteredActivities,
  activeTab
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherFilter, setWeatherFilter] = useState<'all' | 'good' | 'bad'>('all');
  const [hasInviteesFilter, setHasInviteesFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [hasLocationFilter, setHasLocationFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter activities based on current tab
  const tabActivities = activities.filter(activity => activity.status === activeTab);

  React.useEffect(() => {
    if (!Array.isArray(activities)) {
      onFilteredActivities([]);
      return;
    }
    const tabActivities = activities.filter(activity => activity.status === activeTab);
    let filtered = tabActivities;

    // Search by title, description, or location
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(term) ||
        (activity.description && activity.description.toLowerCase().includes(term)) ||
        (activity.location && activity.location.toLowerCase().includes(term))
      );
    }

    // Filter by weather assessment
    if (weatherFilter !== 'all') {
      filtered = filtered.filter(activity => {
        if (!activity.weatherAssessment) return false;
        return weatherFilter === 'good'
          ? activity.weatherAssessment.recommendation === 'good'
          : activity.weatherAssessment.recommendation === 'bad';
      });
    }

    // Filter by invitees
    if (hasInviteesFilter !== 'all') {
      filtered = filtered.filter(activity => {
        return hasInviteesFilter === 'yes'
          ? activity.invitees.length > 0
          : activity.invitees.length === 0;
      });
    }

    // Filter by location
    if (hasLocationFilter !== 'all') {
      filtered = filtered.filter(activity => {
        return hasLocationFilter === 'yes'
          ? !!activity.location
          : !activity.location;
      });
    }

    onFilteredActivities(filtered);
  }, [searchTerm, weatherFilter, hasInviteesFilter, hasLocationFilter, activeTab, activities, onFilteredActivities]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setWeatherFilter('all');
    setHasInviteesFilter('all');
    setHasLocationFilter('all');
  };

  const hasActiveFilters = searchTerm || weatherFilter !== 'all' || hasInviteesFilter !== 'all' || hasLocationFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={language === 'nl' ? 'Zoek activiteiten...' : 'Search activities...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 px-3 ${hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {language === 'nl' ? 'Filters' : 'Filters'}
          </span>
          {hasActiveFilters && (
            <Badge className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5">
              {[searchTerm, weatherFilter !== 'all', hasInviteesFilter !== 'all', hasLocationFilter !== 'all']
                .filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {language === 'nl' ? 'Filters' : 'Filters'}
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="h-4 w-4 mr-1" />
                {language === 'nl' ? 'Wis alles' : 'Clear all'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weather Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {language === 'nl' ? 'Weer' : 'Weather'}
              </label>
              <Select value={weatherFilter} onValueChange={(value: 'all' | 'good' | 'bad') => setWeatherFilter(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'nl' ? 'Alle' : 'All'}</SelectItem>
                  <SelectItem value="good">{language === 'nl' ? 'Goed weer' : 'Good weather'}</SelectItem>
                  <SelectItem value="bad">{language === 'nl' ? 'Wisselvallig' : 'Changing weather'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invitees Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {language === 'nl' ? 'Uitgenodigden' : 'Invitees'}
              </label>
              <Select value={hasInviteesFilter} onValueChange={(value: 'all' | 'yes' | 'no') => setHasInviteesFilter(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'nl' ? 'Alle' : 'All'}</SelectItem>
                  <SelectItem value="yes">{language === 'nl' ? 'Met uitgenodigden' : 'With invitees'}</SelectItem>
                  <SelectItem value="no">{language === 'nl' ? 'Zonder uitgenodigden' : 'No invitees'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {language === 'nl' ? 'Locatie' : 'Location'}
              </label>
              <Select value={hasLocationFilter} onValueChange={(value: 'all' | 'yes' | 'no') => setHasLocationFilter(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'nl' ? 'Alle' : 'All'}</SelectItem>
                  <SelectItem value="yes">{language === 'nl' ? 'Met locatie' : 'With location'}</SelectItem>
                  <SelectItem value="no">{language === 'nl' ? 'Zonder locatie' : 'No location'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {weatherFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {weatherFilter === 'good' 
                ? (language === 'nl' ? 'Goed weer' : 'Good weather')
                : (language === 'nl' ? 'Wisselvallig' : 'Changing weather')
              }
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeatherFilter('all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {hasInviteesFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {hasInviteesFilter === 'yes' 
                ? (language === 'nl' ? 'Met uitgenodigden' : 'With invitees')
                : (language === 'nl' ? 'Zonder uitgenodigden' : 'No invitees')
              }
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasInviteesFilter('all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {hasLocationFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {hasLocationFilter === 'yes' 
                ? (language === 'nl' ? 'Met locatie' : 'With location')
                : (language === 'nl' ? 'Zonder locatie' : 'No location')
              }
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasLocationFilter('all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};