import { store } from '@/store';
import siDict from './dictionaries/si.json';

export const t = (key: string): string => {
  if (!key) return key;

  // We can safely call store.getState() here because t() is evaluated synchronously during render
  // and we have a <LanguageRemounter> that remounts the app when language changes.
  const language = store.getState().settings.appLanguage;

  if (language === 'si') {
    const translated = (siDict as Record<string, string>)[key];
    if (translated) {
      return translated;
    }
  }
  return key;
};
