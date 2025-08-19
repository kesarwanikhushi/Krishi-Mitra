import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import hinglish from './hinglish.json';
import pa from './pa.json';
import gu from './gu.json';
import bn from './bn.json';
import te from './te.json';
import ta from './ta.json';
import mr from './mr.json';
import kn from './kn.json';
import ml from './ml.json';
import or from './or.json';
import as from './as.json';
import ur from './ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  hinglish: { translation: hinglish },
  pa: { translation: pa },
  gu: { translation: gu },
  bn: { translation: bn },
  te: { translation: te },
  ta: { translation: ta },
  mr: { translation: mr },
  kn: { translation: kn },
  ml: { translation: ml },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
};

// Always default to 'en' for SSR consistency
// Language will be updated on client-side after hydration
const defaultLanguage = 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    // Add SSR support
    react: {
      useSuspense: false
    }
  });

export default i18n;
