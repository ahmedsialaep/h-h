import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Sélectionner...",
  className,
}: EnhancedSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className={cn("relative", className)} ref={ref}>
      <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between bg-background border rounded-lg px-3 py-2.5 text-sm transition-all",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-muted-foreground/40"
        )}
      >
        <span className={cn("truncate", selectedLabel ? "text-foreground" : "text-muted-foreground")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform shrink-0 ml-2",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
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

export default EnhancedSelect;
