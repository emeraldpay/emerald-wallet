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
    ns: ['translation'],
    defaultNS: 'translation',
    resources: {
      ['en-US']: { translation: en_US },
      ['pt-BR']: { translation: pt_BR },
      ['ko-KR']: { translation: ko_KR },
      ['zh-CN']: { translation: zh_CN }
    },
    react: {
      // wait: false,
      useSuspense: false
    }
  });

export default i18n;
