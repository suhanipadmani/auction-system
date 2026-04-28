"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const handleLanguageChange = (newLocale: string | null) => {
    if (!newLocale) return;
    // next-intl's router.replace will automatically handle the locale prefix
    // @ts-ignore
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[90px] h-9 gap-2 bg-white/5 border-white/10 hover:bg-white/10 rounded-full transition-all text-white outline-none focus:ring-0 focus:ring-offset-0 border-0 ring-0 ring-offset-0 focus-visible:ring-0">
        <Globe className="w-4 h-4 text-primary shrink-0" />
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent className="bg-slate-950 border-white/10 text-white shadow-2xl rounded-xl z-50">
        <SelectItem value="en" className="focus:bg-white/10 focus:text-primary cursor-pointer font-bold py-2">English (EN)</SelectItem>
        <SelectItem value="de" className="focus:bg-white/10 focus:text-primary cursor-pointer font-bold py-2">German (DE)</SelectItem>
      </SelectContent>
    </Select>
  );
}
