import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateTimePicker } from './DateTimePicker';
import { Activity, WeatherAssessment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getWeatherAssessment, sendInvitations } from '@/services/weatherService';
import { saveActivity } from '@/services/activityService';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Sun, CloudRain, Loader2, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';

interface ActivityFormProps {
  activity?: Activity;
  isEditing?: boolean;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ activity, isEditing = false }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(activity?.date ? new Date(activity.date) : null);
  const [time, setTime] = useState(activity?.time || '');
  const [location, setLocation] = useState(activity?.location || '');
  const [backupPlan, setBackupPlan] = useState(activity?.backupPlan || '');
  const [inviteeEmails, setInviteeEmails] = useState(activity?.invitees?.join(', ') || '');
  
  // Weather assessment state
  const [weatherAssessment, setWeatherAssessment] = useState<WeatherAssessment | null>(activity?.weatherAssessment || null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  
  // Form flow state
  const [currentStep, setCurrentStep] = useState<'basic' | 'datetime' | 'weather' | 'details' | 'invites'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string>(activity?.id || '');

  // Auto-save draft functionality
  const saveDraft = React.useCallback(() => {
    if (!user || !title.trim()) return;

    const activityData: Activity = {
      id: draftId || Date.now().toString(),
      userId: user.id,
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDate || new Date(),
      time: time || undefined,
      location: location.trim() || undefined,
      status: 'draft',
      weatherAssessment,
      backupPlan: backupPlan.trim() || undefined,
      invitees: inviteeEmails ? inviteeEmails.split(',').map(email => email.trim()).filter(Boolean) : [],
      createdAt: activity?.createdAt || new Date(),
      updatedAt: new Date()
    };

    saveActivity(activityData);
    
    if (!draftId) {
      setDraftId(activityData.id);
    }
  }, [user, title, description, selectedDate, time, location, backupPlan, inviteeEmails, weatherAssessment, draftId, activity?.createdAt]);

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (!title.trim()) return;
    
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, description, location, backupPlan, inviteeEmails, saveDraft]);

  // Save draft before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title.trim()) {
        saveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft, title]);

  const handleNavigateAway = () => {
    if (title.trim()) {
      saveDraft();
    }
    navigate('/dashboard');
  };

  const handleWeatherCheck = async () => {
    if (!selectedDate) return;
    
    saveDraft();
    
    setIsLoadingWeather(true);
    setWeatherAssessment(null);
    setCurrentStep('weather');
    
    try {
      const [assessment] = await Promise.all([
        getWeatherAssessment(selectedDate, title.trim()),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      setWeatherAssessment(assessment);
    } catch (error) {
      showError(t('error.weatherFetch'));
      setCurrentStep('datetime');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleWeatherDecision = (proceed: boolean) => {
    if (proceed) {
      setCurrentStep('details');
    } else {
      setSelectedDate(null);
      setTime('');
      setWeatherAssessment(null);
      setCurrentStep('datetime');
    }
  };

  const handleBackStep = () => {
    saveDraft();
    
    switch (currentStep) {
      case 'datetime':
        setCurrentStep('basic');
        break;
      case 'weather':
        setWeatherAssessment(null);
        setCurrentStep('datetime');
        break;
      case 'details':
        setCurrentStep('weather');
        break;
      case 'invites':
        setCurrentStep('details');
        break;
      default:
        break;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedDate || !title.trim()) {
      showError(t('error.fillRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData: Activity = {
        id: draftId || Date.now().toString(),
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate,
        time: time || undefined,
        location: location.trim() || undefined,
        status: 'future',
        weatherAssessment,
        backupPlan: backupPlan.trim() || undefined,
        invitees: inviteeEmails ? inviteeEmails.split(',').map(email => email.trim()).filter(Boolean) : [],
        createdAt: activity?.createdAt || new Date(),
        updatedAt: new Date()
      };

      saveActivity(activityData);

      if (activityData.invitees.length > 0) {
        await sendInvitations(activityData.invitees, activityData.title);
      }

      showSuccess(isEditing ? t('message.activityUpdated') : t('message.activityCreated'));
      navigate('/dashboard');
    } catch (error) {
      showError(t('error.savingActivity'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    const locale = language === 'nl' ? nl : enUS;
    return format(date, 'EEEE d MMMM yyyy', { locale });
  };

  // Progress indicator
  const getStepNumber = () => {
    switch (currentStep) {
      case 'basic': return 1;
      case 'datetime': return 2;
      case 'weather': return 3;
      case 'details': return 4;
      case 'invites': return 5;
      default: return 1;
    }
  };

  const renderProgressIndicator = () => (
    <div className="mb-4 sm:mb-8">
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2">
        <span>{language === 'nl' ? 'Stap' : 'Step'} {getStepNumber()} {language === 'nl' ? 'van' : 'of'} 5</span>
        <span>{Math.round((getStepNumber() / 5) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(getStepNumber() / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Sun className="h-5 w-5" style={{ color: '#ff9900' }} />
          {t('activity.form.whatToDo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            {t('activity.form.nameRequired')}
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('activity.form.namePlaceholder')}
            className="h-12 text-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('activity.form.description')}
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('activity.form.descriptionPlaceholder')}
            rows={4}
            className="text-base resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            {t('activity.form.location')}
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('activity.form.locationPlaceholder')}
            className="h-12 text-base"
          />
        </div>

        <Button 
          onClick={() => setCurrentStep('datetime')} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium active:scale-95 transition-transform"
          disabled={!title.trim()}
        >
          {t('activity.form.nextDateTime')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderDateTimeSelection = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackStep}
            className="p-2 h-9 w-9 active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 text-blue-500" />
            {t('activity.form.whenToDo')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <DateTimePicker
          selectedDate={selectedDate}
          selectedTime={time}
          onDateChange={setSelectedDate}
          onTimeChange={setTime}
          onNext={handleWeatherCheck}
        />
      </CardContent>
    </Card>
  );

  const renderWeatherAssessment = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          {!isLoadingWeather && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackStep}
              className="p-2 h-9 w-9 active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {isLoadingWeather ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : weatherAssessment?.recommendation === 'good' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <CloudRain className="h-5 w-5 text-gray-500" />
            )}
            {t('activity.form.weatherAdvice')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {isLoadingWeather ? (
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin mx-auto mb-4 sm:mb-6 text-blue-500" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {t('activity.form.aiAnalyzing')}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {t('activity.form.aiAnalyzingDesc')}
            </p>
          </div>
        ) : weatherAssessment ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {weatherAssessment.recommendation === 'good' ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                  </div>
                )}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold mb-3">
                {weatherAssessment.recommendation === 'good' ? 
                  t('activity.form.perfectWeather') : 
                  t('activity.form.changingWeather')
                }
              </h3>
              
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-2">
                {weatherAssessment.reasoning}
              </p>
            </div>

            {weatherAssessment.temperature && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{weatherAssessment.temperature}°C</div>
                  <div className="text-xs text-gray-500">{t('weather.temperature')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{weatherAssessment.precipitation}%</div>
                  <div className="text-xs text-gray-500">{t('weather.precipitation')}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{weatherAssessment.windSpeed}</div>
                  <div className="text-xs text-gray-500">{t('weather.wind')}</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {weatherAssessment.recommendation === 'good' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center bg-green-50 p-3 sm:p-4 rounded-lg">
                    {t('activity.form.weatherGoodNote')}
                  </p>
                  <Button 
                    onClick={() => handleWeatherDecision(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 active:scale-95 transition-transform"
                  >
                    {t('activity.form.continueWithPlan')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 text-center mb-4">
                      {t('activity.form.weatherBadNote')}
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => handleWeatherDecision(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 active:scale-95 transition-transform"
                      >
                        {t('activity.form.continueAnyway')}
                      </Button>
                      <Button 
                        onClick={() => handleWeatherDecision(false)}
                        variant="outline"
                        className="w-full h-12 active:scale-95 transition-transform"
                      >
                        {t('activity.form.chooseOtherDate')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderDetails = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackStep}
            className="p-2 h-9 w-9 active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="h-5 w-5 text-green-500" />
            {t('activity.form.backupPlan')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="backup" className="text-sm font-medium">
            {t('activity.form.addBackup')}
          </Label>
          <Textarea
            id="backup"
            value={backupPlan}
            onChange={(e) => setBackupPlan(e.target.value)}
            placeholder={t('activity.form.backupPlaceholder')}
            rows={4}
            className="text-base resize-none"
          />
        </div>

        <Button 
          onClick={() => setCurrentStep('invites')} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 active:scale-95 transition-transform"
        >
          {t('activity.form.nextInvite')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderInvites = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackStep}
            className="p-2 h-9 w-9 active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5 text-purple-500" />
            {t('activity.form.invitePeople')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="invitees" className="text-sm font-medium">
            {t('activity.form.emailAddresses')}
          </Label>
          <Textarea
            id="invitees"
            value={inviteeEmails}
            onChange={(e) => setInviteeEmails(e.target.value)}
            placeholder={t('activity.form.emailPlaceholder')}
            rows={3}
            className="text-base resize-none"
          />
          <p className="text-xs text-gray-500">
            {t('activity.form.emailSeparator')}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-base sm:text-lg">{t('activity.form.summary')}</h4>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 text-sm">
            <div><strong>{t('activity.form.summaryActivity')}:</strong> {title}</div>
            <div><strong>{t('activity.form.summaryDate')}:</strong> {selectedDate ? formatDate(selectedDate) : t('activity.form.notSelected')}</div>
            {time && <div><strong>{t('activity.form.summaryTime')}:</strong> {time}</div>}
            {location && <div><strong>{t('activity.form.summaryLocation')}:</strong> {location}</div>}
            {weatherAssessment && (
              <div className="flex items-center gap-2">
                <strong>{t('activity.form.summaryWeather')}:</strong>
                <Badge className={weatherAssessment.recommendation === 'good' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {weatherAssessment.recommendation === 'good' ? t('activity.form.weatherGood') : t('activity.form.weatherChanging')}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium active:scale-95 transition-transform"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEditing ? t('activity.form.updating') : t('activity.form.creating')}
            </>
          ) : (
            <>
              {isEditing ? t('activity.form.updateActivity') : t('activity.form.createActivity')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-0">
      {renderProgressIndicator()}
      {currentStep === 'basic' && renderBasicInfo()}
      {currentStep === 'datetime' && renderDateTimeSelection()}
      {currentStep === 'weather' && renderWeatherAssessment()}
      {currentStep === 'details' && renderDetails()}
      {currentStep === 'invites' && renderInvites()}
    </div>
  );
};