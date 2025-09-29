import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'nl' | 'en';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation & General
  'nav.welcome': { nl: 'Welkom', en: 'Welcome' },
  'nav.logout': { nl: 'Uitloggen', en: 'Logout' },
  'nav.account': { nl: 'Account', en: 'Account' },
  'app.title': { nl: 'SunnyDays', en: 'SunnyDays' },
  'app.tagline': { nl: 'Maak het makkelijker om van buitenactiviteiten te genieten', en: 'Make it easier to enjoy outdoor activities' },
  
  // Dashboard
  'dashboard.title': { nl: 'Jouw buitenactiviteiten', en: 'Your outdoor activities' },
  'dashboard.subtitle': { nl: 'Plan je perfecte zonnige dag met slimme weervoorspellingen', en: 'Plan your perfect sunny day with smart weather forecasts' },
  'dashboard.newActivity': { nl: 'Nieuwe activiteit', en: 'New activity' },
  'dashboard.planned': { nl: 'Gepland', en: 'Planned' },
  'dashboard.drafts': { nl: 'Concepten', en: 'Drafts' },
  'dashboard.completed': { nl: 'Voltooid', en: 'Completed' },
  'dashboard.noPlanned': { nl: 'Geen geplande activiteiten', en: 'No planned activities' },
  'dashboard.noPlannedDesc': { nl: 'Begin met het plannen van je eerste buitenactiviteit!', en: 'Start planning your first outdoor activity!' },
  'dashboard.noDrafts': { nl: 'Geen concepten gevonden', en: 'No drafts found' },
  'dashboard.noCompleted': { nl: 'Geen voltooide activiteiten', en: 'No completed activities' },
  
  // Authentication
  'auth.login.title': { nl: 'Log in om je buitenactiviteiten te plannen', en: 'Log in to plan your outdoor activities' },
  'auth.register.title': { nl: 'Maak een account aan om te beginnen', en: 'Create an account to get started' },
  'auth.email': { nl: 'E-mailadres', en: 'Email address' },
  'auth.password': { nl: 'Wachtwoord', en: 'Password' },
  'auth.name': { nl: 'Naam', en: 'Name' },
  'auth.confirmPassword': { nl: 'Bevestig wachtwoord', en: 'Confirm password' },
  'auth.login': { nl: 'Inloggen', en: 'Log in' },
  'auth.register': { nl: 'Account aanmaken', en: 'Create account' },
  'auth.loggingIn': { nl: 'Inloggen...', en: 'Logging in...' },
  'auth.creating': { nl: 'Account aanmaken...', en: 'Creating account...' },
  'auth.noAccount': { nl: 'Nog geen account?', en: "Don't have an account?" },
  'auth.hasAccount': { nl: 'Al een account?', en: 'Already have an account?' },
  'auth.registerHere': { nl: 'Registreer hier', en: 'Register here' },
  'auth.loginHere': { nl: 'Log hier in', en: 'Log in here' },
  'auth.emailPlaceholder': { nl: 'je@email.nl', en: 'you@email.com' },
  'auth.namePlaceholder': { nl: 'Je volledige naam', en: 'Your full name' },
  
  // Activity Status
  'status.draft': { nl: 'Concept', en: 'Draft' },
  'status.future': { nl: 'Gepland', en: 'Planned' },
  'status.past': { nl: 'Voltooid', en: 'Completed' },
  
  // Activity Form
  'activity.create.title': { nl: 'Nieuwe activiteit plannen', en: 'Plan new activity' },
  'activity.create.subtitle': { nl: 'Plan je perfecte buitenactiviteit met slimme weervoorspellingen', en: 'Plan your perfect outdoor activity with smart weather predictions' },
  'activity.edit.title': { nl: 'Activiteit bewerken', en: 'Edit activity' },
  'activity.edit.subtitle': { nl: 'Pas je activiteit aan en krijg bijgewerkte weervoorspellingen', en: 'Update your activity and get updated weather forecasts' },
  'activity.allActivities': { nl: 'Alle activiteiten', en: 'All activities' },
  
  'activity.form.whatToDo': { nl: 'Wat ga je doen?', en: 'What are you going to do?' },
  'activity.form.name': { nl: 'Activiteit naam', en: 'Activity name' },
  'activity.form.nameRequired': { nl: 'Activiteit naam *', en: 'Activity name *' },
  'activity.form.namePlaceholder': { nl: 'Bijv. Picknick in het park', en: 'E.g. Picnic in the park' },
  'activity.form.description': { nl: 'Beschrijving (optioneel)', en: 'Description (optional)' },
  'activity.form.descriptionPlaceholder': { nl: 'Vertel meer over je activiteit...', en: 'Tell more about your activity...' },
  'activity.form.location': { nl: 'Locatie (optioneel)', en: 'Location (optional)' },
  'activity.form.locationPlaceholder': { nl: 'Bijv. Vondelpark, Amsterdam', en: 'E.g. Central Park, New York' },
  'activity.form.nextDateTime': { nl: 'Volgende: Datum en tijd kiezen', en: 'Next: Choose date and time' },
  
  'activity.form.whenToDo': { nl: 'Wanneer wil je dit doen?', en: 'When do you want to do this?' },
  'activity.form.timeOptional': { nl: 'Tijd (optioneel)', en: 'Time (optional)' },
  'activity.form.nextWeather': { nl: 'Volgende: Weeradvies ophalen', en: 'Next: Get weather advice' },
  'activity.form.selectedDate': { nl: 'Geselecteerde datum', en: 'Selected date' },
  
  'activity.form.weatherAdvice': { nl: 'Weeradvies', en: 'Weather advice' },
  'activity.form.aiAnalyzing': { nl: 'AI analyseert het weer...', en: 'AI is analyzing the weather...' },
  'activity.form.aiAnalyzingDesc': { nl: 'We bekijken historische data en actuele voorspellingen voor jouw datum', en: 'We are looking at historical data and current forecasts for your date' },
  'activity.form.perfectWeather': { nl: '🌞 Perfect weer voor je activiteit!', en: '🌞 Perfect weather for your activity!' },
  'activity.form.changingWeather': { nl: '🌧️ Wisselvallig weer verwacht', en: '🌧️ Changing weather expected' },
  'activity.form.continueWithPlan': { nl: 'Doorgaan met plannen', en: 'Continue with planning' },
  'activity.form.chooseOtherDate': { nl: 'Andere datum', en: 'Choose other date' },
  'activity.form.continueAnyway': { nl: 'Toch doorgaan', en: 'Continue anyway' },
  'activity.form.weatherGoodNote': { nl: 'De data wijst op goede kansen voor mooi weer. Natuurlijk kan het weer altijd veranderen!', en: 'The data indicates good chances for nice weather. Of course, weather can always change!' },
  'activity.form.weatherBadNote': { nl: 'De data wijst op een hoge kans op regen. Wil je toch doorgaan of een andere datum kiezen?', en: 'The data indicates a high chance of rain. Do you want to continue anyway or choose another date?' },
  
  'activity.form.backupPlan': { nl: 'Backup plan', en: 'Backup plan' },
  'activity.form.addBackup': { nl: 'Voeg een backup plan toe (optioneel)', en: 'Add a backup plan (optional)' },
  'activity.form.backupPlaceholder': { nl: 'Wat doe je als het weer toch tegenvalt?', en: 'What will you do if the weather disappoints?' },
  'activity.form.nextInvite': { nl: 'Volgende: Mensen uitnodigen', en: 'Next: Invite people' },
  
  'activity.form.invitePeople': { nl: 'Mensen uitnodigen', en: 'Invite people' },
  'activity.form.emailAddresses': { nl: 'E-mailadressen (optioneel)', en: 'Email addresses (optional)' },
  'activity.form.emailPlaceholder': { nl: 'vriend@email.nl, familie@email.nl', en: 'friend@email.com, family@email.com' },
  'activity.form.emailSeparator': { nl: 'Scheid meerdere e-mailadressen met komma\'s', en: 'Separate multiple email addresses with commas' },
  'activity.form.summary': { nl: 'Samenvatting:', en: 'Summary:' },
  'activity.form.summaryActivity': { nl: 'Activiteit', en: 'Activity' },
  'activity.form.summaryDate': { nl: 'Datum', en: 'Date' },
  'activity.form.summaryTime': { nl: 'Tijd', en: 'Time' },
  'activity.form.summaryLocation': { nl: 'Locatie', en: 'Location' },
  'activity.form.summaryWeather': { nl: 'Weer', en: 'Weather' },
  'activity.form.weatherGood': { nl: 'Goed', en: 'Good' },
  'activity.form.weatherChanging': { nl: 'Wisselvallig', en: 'Changing' },
  'activity.form.notSelected': { nl: 'Niet geselecteerd', en: 'Not selected' },
  'activity.form.createActivity': { nl: 'Activiteit aanmaken', en: 'Create activity' },
  'activity.form.updateActivity': { nl: 'Activiteit bijwerken', en: 'Update activity' },
  'activity.form.creating': { nl: 'Activiteit aanmaken...', en: 'Creating activity...' },
  'activity.form.updating': { nl: 'Bijwerken...', en: 'Updating...' },
  
  // Weather
  'weather.temperature': { nl: 'Temperatuur', en: 'Temperature' },
  'weather.precipitation': { nl: 'Neerslag', en: 'Precipitation' },
  'weather.wind': { nl: 'km/u wind', en: 'km/h wind' },
  'weather.goodExpected': { nl: 'Goed weer verwacht', en: 'Good weather expected' },
  'weather.changingExpected': { nl: 'Wisselvallig weer', en: 'Changing weather' },
  
  // Weather Assessment Messages
  'weather.assessment.forecastGood': { nl: 'Uitstekende weersomstandigheden verwacht! Temperatuur rond {temp}°C met minimale kans op regen.', en: 'Excellent weather conditions expected! Temperature around {temp}°C with minimal chance of rain.' },
  'weather.assessment.forecastBad': { nl: 'Niet ideaal weer verwacht. {precipitation}% kans op regen en wind tot {wind} km/u.', en: 'Not ideal weather expected. {precipitation}% chance of rain and wind up to {wind} km/h.' },
  'weather.assessment.historicGood': { nl: 'Historisch gezien is dit meestal een goede dag voor buitenactiviteiten. {percentage}% van vergelijkbare dagen waren geschikt.', en: 'Historically, this is usually a good day for outdoor activities. {percentage}% of similar days were suitable.' },
  'weather.assessment.historicBad': { nl: 'Historische data toont wisselvallig weer op deze datum. Slechts {percentage}% van vergelijkbare dagen waren geschikt.', en: 'Historical data shows changing weather on this date. Only {percentage}% of similar days were suitable.' },
  
  // Activity Card
  'activity.card.invitees': { nl: 'uitgenodigden', en: 'invitees' },
  'activity.card.at': { nl: 'om', en: 'at' },
  
  // Calendar
  'calendar.days.mon': { nl: 'Ma', en: 'Mo' },
  'calendar.days.tue': { nl: 'Di', en: 'Tu' },
  'calendar.days.wed': { nl: 'Wo', en: 'We' },
  'calendar.days.thu': { nl: 'Do', en: 'Th' },
  'calendar.days.fri': { nl: 'Vr', en: 'Fr' },
  'calendar.days.sat': { nl: 'Za', en: 'Sa' },
  'calendar.days.sun': { nl: 'Zo', en: 'Su' },
  
  // Buttons
  'button.edit': { nl: 'Bewerken', en: 'Edit' },
  'button.delete': { nl: 'Verwijderen', en: 'Delete' },
  'button.save': { nl: 'Opslaan', en: 'Save' },
  'button.cancel': { nl: 'Annuleren', en: 'Cancel' },
  'button.back': { nl: 'Terug', en: 'Back' },
  'button.next': { nl: 'Volgende', en: 'Next' },
  'button.close': { nl: 'Sluiten', en: 'Close' },
  'button.confirm': { nl: 'Bevestigen', en: 'Confirm' },
  'button.saveChanges': { nl: 'Wijzigingen opslaan', en: 'Save changes' },
  'button.editProfile': { nl: 'Profiel bewerken', en: 'Edit profile' },
  
  // Account Management
  'account.title': { nl: 'Account beheer', en: 'Account Management' },
  'account.profile': { nl: 'Profiel', en: 'Profile' },
  'account.language': { nl: 'Taal', en: 'Language' },
  'account.dataExport': { nl: 'Data exporteren', en: 'Export Data' },
  'account.deleteAccount': { nl: 'Account verwijderen', en: 'Delete Account' },
  'account.exportDescription': { nl: 'Download al je gegevens in JSON formaat', en: 'Download all your data in JSON format' },
  'account.deleteDescription': { nl: 'Permanent verwijderen van je account en alle gegevens', en: 'Permanently delete your account and all data' },
  'account.memberSince': { nl: 'Lid sinds', en: 'Member since' },
  'account.dangerZone': { nl: 'Gevaarlijke acties', en: 'Danger Zone' },
  'account.confirmEmail': { nl: 'Typ je e-mailadres om te bevestigen', en: 'Type your email address to confirm' },
  'account.deleteButton': { nl: 'Account permanent verwijderen', en: 'Permanently delete account' },
  'account.deletingButton': { nl: 'Account verwijderen...', en: 'Deleting account...' },
  'account.downloadData': { nl: 'Gegevens downloaden', en: 'Download data' },
  'account.name': { nl: 'Naam', en: 'Name' },
  'account.email': { nl: 'E-mail', en: 'Email' },
  'account.languageLabel': { nl: 'Taal / Language', en: 'Language / Taal' },
  'account.confirmEmailLabel': { nl: 'Typ je e-mailadres om te bevestigen: {email}', en: 'Type your email address to confirm: {email}' },
  'account.editingProfile': { nl: 'Profiel bewerken', en: 'Editing profile' },
  'account.nameRequired': { nl: 'Naam is verplicht', en: 'Name is required' },
  
  // Messages
  'message.loggedOut': { nl: 'Uitgelogd', en: 'Logged out' },
  'message.dataExported': { nl: 'Gegevens geëxporteerd', en: 'Data exported' },
  'message.accountDeleted': { nl: 'Account verwijderd', en: 'Account deleted' },
  'message.activityDeleted': { nl: 'Activiteit verwijderd', en: 'Activity deleted' },
  'message.activityCreated': { nl: 'Activiteit aangemaakt!', en: 'Activity created!' },
  'message.activityUpdated': { nl: 'Activiteit bijgewerkt!', en: 'Activity updated!' },
  'message.welcomeBack': { nl: 'Welkom terug!', en: 'Welcome back!' },
  'message.accountCreated': { nl: 'Account succesvol aangemaakt! Welkom bij SunnyDays!', en: 'Account successfully created! Welcome to SunnyDays!' },
  'message.activityNotFound': { nl: 'Activiteit niet gevonden', en: 'Activity not found' },
  'message.invitationsSent': { nl: 'Uitnodigingen verzonden naar: {emails} voor activiteit: {title}', en: 'Invitations sent to: {emails} for activity: {title}' },
  'message.profileUpdated': { nl: 'Profiel succesvol bijgewerkt!', en: 'Profile updated successfully!' },
  
  // Errors
  'error.fillAllFields': { nl: 'Vul alle velden in', en: 'Fill in all fields' },
  'error.passwordsDontMatch': { nl: 'Wachtwoorden komen niet overeen', en: 'Passwords do not match' },
  'error.passwordTooShort': { nl: 'Wachtwoord moet minimaal 6 karakters lang zijn', en: 'Password must be at least 6 characters long' },
  'error.invalidCredentials': { nl: 'Ongeldige inloggegevens', en: 'Invalid login credentials' },
  'error.emailInUse': { nl: 'Dit e-mailadres is al in gebruik', en: 'This email address is already in use' },
  'error.fillRequired': { nl: 'Vul alle verplichte velden in', en: 'Fill in all required fields' },
  'error.weatherFetch': { nl: 'Kon weergegevens niet ophalen', en: 'Could not fetch weather data' },
  'error.savingActivity': { nl: 'Er ging iets mis bij het opslaan', en: 'Something went wrong while saving' },
  'error.exportData': { nl: 'Er ging iets mis bij het exporteren van je gegevens', en: 'Something went wrong while exporting your data' },
  'error.deleteAccount': { nl: 'Er ging iets mis bij het verwijderen van je account', en: 'Something went wrong while deleting your account' },
  'error.emailMismatch': { nl: 'E-mailadres komt niet overeen', en: 'Email address does not match' },
  'error.updateProfile': { nl: 'Er ging iets mis bij het bijwerken van je profiel', en: 'Something went wrong while updating your profile' },
  'error.nameRequired': { nl: 'Naam is verplicht', en: 'Name is required' },
  
  // Confirmations
  'confirm.deleteActivity': { nl: 'Weet je zeker dat je deze activiteit wilt verwijderen?', en: 'Are you sure you want to delete this activity?' },
  'confirm.deleteAccount': { nl: 'Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.', en: 'Are you sure you want to delete your account? This action cannot be undone.' },
  'confirm.deleteActivityTitle': { nl: 'Activiteit verwijderen', en: 'Delete Activity' },
  'confirm.deleteActivityDesc': { nl: 'Weet je zeker dat je "{title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.', en: 'Are you sure you want to delete "{title}"? This action cannot be undone.' },
  'confirm.deleteButton': { nl: 'Verwijderen', en: 'Delete' },
  'confirm.cancelButton': { nl: 'Annuleren', en: 'Cancel' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('nl');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('sunnydays_language') as Language;
    if (storedLanguage && ['nl', 'en'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sunnydays_language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[key]?.[language] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};