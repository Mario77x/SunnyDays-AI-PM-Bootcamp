import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'nl' ? 'en' : 'nl');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">
              {language === 'nl' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
            </span>
          </Button>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🌤️ {t('app.tagline')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;