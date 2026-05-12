export const analyticsColors = {
  indigo: {
    card: "from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    stat: "from-indigo-500/15 to-indigo-500/10 border-indigo-500/30 text-indigo-400",
    ring: "stroke-indigo-500",
  },
  emerald: {
    card: "from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    stat: "from-emerald-500/15 to-emerald-500/10 border-emerald-500/30 text-emerald-400",
    ring: "stroke-emerald-500",
  },
  purple: {
    card: "from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20",
    stat: "from-purple-500/15 to-purple-500/10 border-purple-500/30 text-purple-400",
    ring: "stroke-purple-500",
  },
  amber: {
    card: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20",
    stat: "from-amber-500/15 to-amber-500/10 border-amber-400/30 text-amber-400",
    ring: "stroke-amber-500",
  },
  rose: {
    card: "from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20",
    stat: "from-rose-500/15 to-rose-500/10 border-rose-500/30 text-rose-400",
    ring: "stroke-rose-500",
  },
  blue: {
    card: "from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20",
    stat: "from-blue-500/15 to-blue-500/10 border-blue-500/30 text-blue-400",
    ring: "stroke-blue-500",
  },
  teal: {
    card: "from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20",
    stat: "from-teal-500/15 to-teal-500/10 border-teal-500/30 text-teal-400",
    ring: "stroke-teal-500",
  },
} as const;

export type AnalyticsColor = keyof typeof analyticsColors;
