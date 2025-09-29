import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { ActivitySearch } from '@/components/dashboard/ActivitySearch';
import { AccountManagement } from '@/components/account/AccountManagement';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity } from '@/types';
import { getActivities, deleteActivity, updateActivityStatuses } from '@/services/activityService';
import { Plus, Sun, LogOut, Menu, User, X } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('future');
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    activityId: string;
    activityTitle: string;
  }>({ open: false, activityId: '', activityTitle: '' });

  useEffect(() => {
    if (user) {
      updateActivityStatuses(user.id);
      loadActivities();
    }
  }, [user]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
          setShowMobileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const loadActivities = () => {
    if (user) {
      const userActivities = getActivities(user.id);
      setActivities(userActivities);
    }
  };

  const handleDeleteActivity = (activityId: string, activityTitle: string) => {
    setDeleteConfirmation({
      open: true,
      activityId,
      activityTitle
    });
  };

  const confirmDeleteActivity = () => {
    deleteActivity(deleteConfirmation.activityId);
    loadActivities();
    showSuccess(t('message.activityDeleted'));
    setDeleteConfirmation({ open: false, activityId: '', activityTitle: '' });
  };

  const handleEditActivity = (activity: Activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleCreateActivity = () => {
    navigate('/activity/new');
  };

  const handleLogout = () => {
    logout();
    showSuccess(t('message.loggedOut'));
  };

  const filterActivities = (status: Activity['status']) => {
    return activities.filter(activity => activity.status === status);
  };

  const futureActivities = filterActivities('future');
  const draftActivities = filterActivities('draft');
  const pastActivities = filterActivities('past');

  // Get current tab activities for display
  const getCurrentTabActivities = () => {
    switch (activeTab) {
      case 'future': return futureActivities;
      case 'draft': return draftActivities;
      case 'past': return pastActivities;
      default: return [];
    }
  };

  const currentTabActivities = getCurrentTabActivities();
  const displayActivities = filteredActivities.length > 0 || activities.length === 0 ? filteredActivities : currentTabActivities;

  if (!user) return null;

  const renderEmptyState = (tabType: string) => {
    const isFiltered = filteredActivities.length === 0 && currentTabActivities.length > 0;
    
    if (isFiltered) {
      return (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {language === 'nl' ? 'Geen resultaten gevonden' : 'No results found'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {language === 'nl' 
                ? 'Probeer je zoekopdracht of filters aan te passen' 
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      );
    }

    // Original empty states with mobile optimization
    switch (tabType) {
      case 'future':
        return (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Sun className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.noPlanned')}
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                {t('dashboard.noPlannedDesc')}
              </p>
              <Button 
                onClick={handleCreateActivity} 
                className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-10 px-6 text-base sm:text-sm"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.newActivity')}
              </Button>
            </CardContent>
          </Card>
        );
      case 'draft':
        return (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
              <p className="text-gray-600 text-sm sm:text-base">{t('dashboard.noDrafts')}</p>
            </CardContent>
          </Card>
        );
      case 'past':
        return (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✅</div>
              <p className="text-gray-600 text-sm sm:text-base">{t('dashboard.noCompleted')}</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Sun className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" style={{ color: '#ff9900' }} />
              <h1 className="text-lg sm:text-2xl font-bold" style={{ color: '#ff9900' }}>
                {t('app.title')}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowAccountManagement(true)}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{t('nav.welcome')}, {user.name}</span>
                <span className="md:hidden">{user.name}</span>
              </button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-9">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">{t('nav.logout')}</span>
                <span className="md:hidden">Out</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-menu-button h-9 w-9 p-0"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="sm:hidden border-t border-gray-200 py-3 space-y-1 mobile-menu">
              <button
                onClick={() => {
                  setShowAccountManagement(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <User className="h-4 w-4" />
                {t('nav.welcome')}, {user.name}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            {t('dashboard.title')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 sm:mb-8">
          <Button 
            onClick={handleCreateActivity} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-12 sm:h-11 text-base sm:text-sm font-medium shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('dashboard.newActivity')}
          </Button>
        </div>

        {/* Activities Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-12 sm:h-10 bg-gray-100 p-1">
            <TabsTrigger 
              value="future" 
              className="text-xs sm:text-sm px-1 sm:px-2 h-10 sm:h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <span className="hidden sm:inline">{t('dashboard.planned')}</span>
              <span className="sm:hidden">{language === 'nl' ? 'Plan' : 'Plan'}</span>
              <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                {futureActivities.length}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="draft" 
              className="text-xs sm:text-sm px-1 sm:px-2 h-10 sm:h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <span className="hidden sm:inline">{t('dashboard.drafts')}</span>
              <span className="sm:hidden">{language === 'nl' ? 'Concept' : 'Draft'}</span>
              <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                {draftActivities.length}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="text-xs sm:text-sm px-1 sm:px-2 h-10 sm:h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <span className="hidden sm:inline">{t('dashboard.completed')}</span>
              <span className="sm:hidden">{language === 'nl' ? 'Klaar' : 'Done'}</span>
              <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                {pastActivities.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          {activities.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <ActivitySearch
                activities={activities}
                onFilteredActivities={setFilteredActivities}
                activeTab={activeTab}
              />
            </div>
          )}

          <TabsContent value="future" className="space-y-4">
            {displayActivities.length === 0 ? (
              renderEmptyState('future')
            ) : (
              <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={handleEditActivity}
                    onDelete={(id) => handleDeleteActivity(id, activity.title)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {displayActivities.length === 0 ? (
              renderEmptyState('draft')
            ) : (
              <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={handleEditActivity}
                    onDelete={(id) => handleDeleteActivity(id, activity.title)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {displayActivities.length === 0 ? (
              renderEmptyState('past')
            ) : (
              <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={handleEditActivity}
                    onDelete={(id) => handleDeleteActivity(id, activity.title)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Account Management Modal */}
      {showAccountManagement && (
        <AccountManagement onClose={() => setShowAccountManagement(false)} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
        title={t('confirm.deleteActivityTitle')}
        description={t('confirm.deleteActivityDesc', { title: deleteConfirmation.activityTitle })}
        confirmText={t('confirm.deleteButton')}
        cancelText={t('confirm.cancelButton')}
        onConfirm={confirmDeleteActivity}
        variant="destructive"
      />
    </div>
  );
};

export default Dashboard;