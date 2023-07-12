import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';

export const defaultLng = 'cn';
// this is exported in order to avoid hard coding supported languages in more than 1 place
const resources = {
  en: {
    translations: {},
  },
  cn: {
    translations: {
      matTypeMap: {
        1: '砂',
        2: '粉',
        3: '树脂',
        4: '固化剂',
        5: '偶联剂',
        6: '钛白粉',
        7: '玻璃',
        8: '彩砂',
        9: '色粉',
        a: '色浆',
      },
      matReqDetailStatusMap: {
        0: '待分配',
        1: '待称重',
        2: '称量中',
        4: '已完成',
        5: '待复核',
      },
      matReqTypeMap: {
        '01': '骨料领料单',
        '02': '辅料领料单',
        '03': '色浆核算单',
        '04': '色粉领料单',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources,
    fallbackLng: defaultLng,
    debug: false,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
