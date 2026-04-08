import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  label: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = ({
  label,
  values,
  options,
  onChange,
  placeholder = "Sélectionner...",
  className,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    const updated = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    onChange(updated);
  };

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  // ← show max 2 tags then "+N more"
  const MAX_VISIBLE = 2;
  const visibleLabels = selectedLabels.slice(0, MAX_VISIBLE);
  const extraCount = selectedLabels.length - MAX_VISIBLE;

  return (
    <div className={cn("relative", className)} ref={ref}>
      {label && (
        <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between bg-background border rounded-lg px-3 py-2.5 text-sm transition-all min-h-[42px]",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-muted-foreground/40"
        )}
      >
        {/* ← flex-nowrap with overflow hidden keeps tags on one line */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          {selectedLabels.length > 0 ? (
            <>
              {visibleLabels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center shrink-0 bg-primary/10 text-primary text-xs font-heading px-2 py-0.5 rounded-md whitespace-nowrap"
                >
                  {lbl}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="inline-flex items-center shrink-0 bg-muted text-muted-foreground text-xs font-heading px-2 py-0.5 rounded-md whitespace-nowrap">
                  +{extraCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {values.length > 0 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <Check size={10} className="text-primary-foreground" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;