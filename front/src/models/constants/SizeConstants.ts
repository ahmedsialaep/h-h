export const EU_SIZES_KIDS = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
export const EU_SIZES_ADULTS = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
export const EU_SIZES_ALL = [...EU_SIZES_KIDS, ...EU_SIZES_ADULTS];

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"];

export const SIZE_TYPE_OPTIONS = [
  { value: "EU_KIDS", label: "EU Enfants (20-34)" },
  { value: "EU_ADULTS", label: "EU Adultes (35-47)" },
  { value: "CLOTHING", label: "Vêtements (XS-6XL)" },
];

export const getSizesByType = (type: string): (number | string)[] => {
  switch (type) {
    case "EU_KIDS": return EU_SIZES_KIDS;
    case "EU_ADULTS": return EU_SIZES_ADULTS;
    case "CLOTHING": return CLOTHING_SIZES;
    default: return EU_SIZES_ALL;
  }
};