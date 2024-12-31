import { serverOnly$ } from "vite-env-only/macros";

import enTranslation from "~/locales/en";
import zhTranslation from "~/locales/zh";

// This is the list of languages your application supports, the last one is your
// fallback language
export const supportedLngs = ["zh", "en"];

// This is the language you want to use in case
// the user language is not in the supportedLngs
export const fallbackLng = "en";

// The default namespace of i18next is "translation", but you can customize it
export const defaultNS = "translation";

export const resources = serverOnly$({
  en: { translation: enTranslation },
  zh: { translation: zhTranslation },
});
