"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccordionItemProps, AccordionProps } from "@/types/components";


function AccordionItemComponent({ item, isOpen, onToggle }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-300",
        "bg-white/[0.03] backdrop-blur-sm border-white/10",
        "hover:bg-white/[0.06] hover:border-white/20",
        isOpen && "bg-white/[0.06] border-white/20 shadow-lg shadow-black/20"
      )}
    >
      <button
        id={`faq-btn-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${item.id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
      >
        <span
          className={cn(
            "text-base font-semibold leading-snug transition-colors duration-200",
            isOpen ? "text-white" : "text-white/80 group-hover:text-white"
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 size-5 text-white/40 transition-all duration-300 ease-in-out",
            "group-hover:text-white/70",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {/* Animated content panel */}
      <div
        id={`faq-panel-${item.id}`}
        role="region"
        aria-labelledby={`faq-btn-${item.id}`}
        style={{ height, overflow: "hidden", transition: "height 300ms ease" }}
      >
        <div
          ref={contentRef}
          className={cn(
            "px-6 pb-5 text-sm text-white/55 leading-relaxed transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}
