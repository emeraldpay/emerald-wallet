import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en_US, ko_KR, pt_BR, zh_CN } from './locales';
const LanguageDetector = require('i18next-browser-languagedetector');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    debug: true,
    ns: ['translation', 'settings'],
    defaultNS: 'translation',
    react: {
      wait: false
    }
  }, () => {
    i18n.addResourceBundle('en-US', 'translation', en_US);
    i18n.addResourceBundle('zh-CN', 'translation', zh_CN);
    i18n.addResourceBundle('pt-BR', 'translation', pt_BR);
    i18n.addResourceBundle('ko-KR', 'translation', ko_KR);
  })
  .then(() => console.debug('i18n initialized successfully'))
  .catch((error: any) => console.debug('i18n initialization failed', error));

export default i18n;
