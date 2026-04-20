export const maskName = (name: string): string => {
  if (!name) return "Anonymous";

  const parts = name.split(" ");

  return parts
    .map((part) => {
      if (part.length <= 1) return part;

      return (
        part[0] +
        "*".repeat(Math.min(part.length - 2, 3)) +
        (part.length > 2 ? part[part.length - 1] : "")
      );
    })
    .join(" ");
};