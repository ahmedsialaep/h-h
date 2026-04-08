import { useState } from "react";
import { X, Plus } from "lucide-react";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface DaySchedule {
  fromDay: string;
  toDay: string;
  open: string;
  close: string;
}

interface OpeningHoursPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const OpeningHoursPicker = ({ value, onChange }: OpeningHoursPickerProps) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    { fromDay: "Lun", toDay: "Sam", open: "09:00", close: "20:00" },
  ]);

  const addSchedule = () => {
    const updated = [
      ...schedules,
      { fromDay: "Lun", toDay: "Sam", open: "09:00", close: "18:00" },
    ];
    setSchedules(updated);
    onChange(formatSchedules(updated));
  };

  const removeSchedule = (index: number) => {
    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
    onChange(formatSchedules(updated));
  };

  const updateSchedule = (index: number, field: keyof DaySchedule, val: string) => {
    const updated = schedules.map((s, i) => (i === index ? { ...s, [field]: val } : s));
    setSchedules(updated);
    onChange(formatSchedules(updated));
  };

  const formatSchedules = (s: DaySchedule[]) =>
    s.map((s) =>
      s.fromDay === s.toDay
        ? `${s.fromDay}: ${s.open}–${s.close}`
        : `${s.fromDay}–${s.toDay}: ${s.open}–${s.close}`
    ).join(" | ");

  return (
    <div className="space-y-2">
      <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
        Horaires du Magasin
      </label>

      {schedules.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-wrap">

          {/* From day */}
          <select
            value={s.fromDay}
            onChange={(e) => updateSchedule(i, "fromDay", e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <span className="text-muted-foreground text-xs">→</span>

          {/* To day */}
          <select
            value={s.toDay}
            onChange={(e) => updateSchedule(i, "toDay", e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <span className="text-muted-foreground text-xs">:</span>

          {/* Open time */}
          <input
            type="time"
            value={s.open}
            onChange={(e) => updateSchedule(i, "open", e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <span className="text-muted-foreground text-xs">–</span>

          {/* Close time */}
          <input
            type="time"
            value={s.close}
            onChange={(e) => updateSchedule(i, "close", e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <button
            type="button"
            onClick={() => removeSchedule(i)}
            disabled={schedules.length === 1}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add row */}
      <button
        type="button"
        onClick={addSchedule}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={13} /> Ajouter un horaire
      </button>

      {/* Preview */}
      {schedules.length > 0 && (
        <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
          {formatSchedules(schedules)}
        </p>
      )}
    </div>
  );
};

export default OpeningHoursPicker;