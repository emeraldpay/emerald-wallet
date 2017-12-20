/* eslint-disable */
import i18n from 'i18next';

// import Cache from 'i18next-localstorage-cache';
import LanguageDetector from 'i18next-browser-languagedetector';

const resBundle = require(
  'i18next-resource-store-loader!i18n/locales/index.js'
);


i18n
  // .use(Cache)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en-US',

    // have a common namespace used around the full app
    ns: ['common'],
    defaultNS: 'common',
    resources: resBundle,
    debug: true,

    // cache: {
    //   enabled: true
    // },

    interpolation: {
      escapeValue: false, // not needed for react!!
      formatSeparator: ',',
      format(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase();
        return value;
      },
    },
  });


export default i18n;
