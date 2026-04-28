import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const modules = ['auth', 'auction', 'wallet', 'notifications', 'common', 'errors', 'dashboard', 'admin_auctions', 'admin_users', 'admin_audit_logs', 'payouts', 'settings'];
  const messages = {};
  
  for (const module of modules) {
    try {
      const moduleMessages = (await import(`../../messages/${locale}/${module}.json`)).default;
      Object.assign(messages, { [module]: moduleMessages });
    } catch (error) {
      console.warn(`Translation module ${module} not found for locale ${locale}`);
    }
  }

  return {
    locale,
    messages
  };
});
