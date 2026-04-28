export const calculateTimeLeft = (endTime: string) => {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) return null;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
    raw: diff
  };
};

export const formatTimeLeft = (endTime: string, fallback: string = "Ended") => {
  const timeLeft = calculateTimeLeft(endTime);
  if (!timeLeft) return fallback;
  return `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`;
};
