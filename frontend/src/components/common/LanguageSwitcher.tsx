"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";

import { Dropdown } from "@/components/ui/Dropdown";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string | null) => {
    if (!newLocale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Dropdown
      value={locale}
      onChange={handleLanguageChange}
      options={[
        { label: "English (EN)", value: "en" },
        { label: "German (DE)", value: "de" }
      ]}
      triggerIcon={<Globe className="w-4 h-4 text-primary shrink-0" />}
      placeholder="Lang"
      showSearch={false}
      triggerClassName="w-12 sm:w-[160px] h-9 gap-0 sm:gap-2 bg-white/5 border-white/10 hover:bg-white/10 rounded-full transition-all text-white outline-none focus:ring-0 focus:ring-offset-0 border-0 ring-0 ring-offset-0 focus-visible:ring-0 [&>div>span:not(:first-child)]:hidden sm:[&>div>span:not(:first-child)]:block"
    />
  );
}
