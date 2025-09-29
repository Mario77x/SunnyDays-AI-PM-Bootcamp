import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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