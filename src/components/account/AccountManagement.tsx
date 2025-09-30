import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { downloadDataExport, deleteAllUserData } from '@/services/dataExportService';
import { showSuccess, showError } from '@/utils/toast';
import { User, Download, Trash2, Globe, UserCircle, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';

interface AccountManagementProps {
  onClose: () => void;
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ onClose }) => {
  const { user, logout, updateProfile, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  if (!user) return null;

  const handleDataExport = () => {
    try {
      downloadDataExport(user);
      showSuccess(t('message.dataExported'));
    } catch (error) {
      showError(t('error.exportData'));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.email) {
      showError(t('error.emailMismatch'));
      return;
    }

    if (!window.confirm(t('confirm.deleteAccount'))) {
      return;
    }

    setIsDeleting(true);
    
    try {
      downloadDataExport(user);
      await new Promise(resolve => setTimeout(resolve, 1000));
      deleteAllUserData(user.id);
      logout();
      showSuccess(t('message.accountDeleted'));
    } catch (error) {
      showError(t('error.deleteAccount'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditedName(user.name);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedName(user.name);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      showError(t('error.nameRequired'));
      return;
    }

    const success = await updateProfile({ name: editedName.trim() });
    
    if (success) {
      setIsEditingProfile(false);
      showSuccess(t('message.profileUpdated'));
    } else {
      showError(t('error.updateProfile'));
    }
  };

  const formatDate = (date: Date) => {
    const locale = language === 'nl' ? nl : enUS;
    return format(new Date(date), 'PPP', { locale });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              {t('account.title')}
            </h2>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('account.profile')}
                  </CardTitle>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('button.editProfile')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('account.name')}</Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder={t('auth.namePlaceholder')}
                        disabled={isLoading}
                      />
                    ) : (
                      <Input value={user.name} disabled />
                    )}
                  </div>
                  <div>
                    <Label>{t('account.email')}</Label>
                    <Input value={user.email} disabled />
                  </div>
                </div>
                <div>
                  <Label>{t('account.memberSince')}</Label>
                  <Input value={formatDate(user.createdAt)} disabled />
                </div>
                
                {/* Edit Profile Actions */}
                {isEditingProfile && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading || !editedName.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('button.save')}...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('button.saveChanges')}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('button.cancel')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('account.language')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>{t('account.languageLabel')}</Label>
                  <Select value={language} onValueChange={(value: 'nl' | 'en') => setLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('account.dataExport')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {t('account.exportDescription')}
                </p>
                <Button onClick={handleDataExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t('account.downloadData')}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t('account.dangerZone')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600 mb-2">{t('account.deleteAccount')}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('account.deleteDescription')}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">
                        {t('account.confirmEmailLabel', { email: user.email })}
                      </Label>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={user.email}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== user.email || isDeleting}
                      variant="destructive"
                      className="w-full"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('account.deletingButton')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('account.deleteButton')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};