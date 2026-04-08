import { Link } from "react-router-dom";
import { PackageOpen, Search, ShoppingBag, FileQuestion, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  className?: string;
  icon?: "package" | "search" | "cart" | "file" | LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  compact?: boolean;
}

const iconMap = {
  package: PackageOpen,
  search: Search,
  cart: ShoppingBag,
  file: FileQuestion,
};

export const EmptyState = ({
  className,
  icon = "package",
  title = "Aucun résultat",
  description = "Il n'y a rien à afficher pour le moment.",
  action,
  compact = false,
}: EmptyStateProps) => {
  const IconComponent = typeof icon === "string" ? iconMap[icon] : icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-16 md:py-24",
        className
      )}
    >
      <div
        className={cn(
          "bg-muted rounded-full flex items-center justify-center mb-4",
          compact ? "w-12 h-12" : "w-16 h-16 md:w-20 md:h-20"
        )}
      >
        <IconComponent
          className={cn(
            "text-muted-foreground",
            compact ? "w-6 h-6" : "w-8 h-8 md:w-10 md:h-10"
          )}
        />
      </div>

      <h3
        className={cn(
          "font-heading font-bold text-foreground",
          compact ? "text-base mb-1" : "text-lg md:text-xl mb-2"
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          "font-body text-muted-foreground max-w-sm",
          compact ? "text-sm" : "text-sm md:text-base mb-6"
        )}
      >
        {description}
      </p>

      {action && (
        <Link
          to={action.href}
          onClick={action.onClick}
          className={cn(
            "inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider rounded-lg hover:brightness-110 transition-all",
            compact ? "text-xs px-4 py-2" : "text-sm px-6 py-3"
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
