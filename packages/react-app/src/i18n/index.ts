import { initReactI18next } from "react-i18next";
import { en_US, zh_CN, pt_BR, ko_KR } from './locales';

// Couldn't import this fucking module, require it
const i18n = require('i18next').default;
const LanguageDetector = require('i18next-browser-languagedetector');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    debug: true,
    ns: ['translation', 'settings'],
    defaultNS: 'translation'
  })
  .then(() => console.debug('i18n initialized successfully'))
  .catch((error: any)  => console.debug('i18n initialization failed', error));

i18n.addResourceBundle('en-US', 'translation', en_US);
i18n.addResourceBundle('zh-CN', 'translation', zh_CN);
i18n.addResourceBundle('pt-BR', 'translation', pt_BR);
i18n.addResourceBundle('ko-KR', 'translation', ko_KR);


export default i18n;
