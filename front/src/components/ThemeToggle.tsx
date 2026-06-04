import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={`p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/10 ${className}`}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
export default ThemeToggle;