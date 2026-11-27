import {
  BannerPosition,
  POSITION_LABELS,
} from "@/features/banners/types";

interface Props {
  value: BannerPosition | "";
  onChange: (position: BannerPosition | "") => void;
}

function isBannerPosition(value: string): value is BannerPosition {
  return Object.prototype.hasOwnProperty.call(POSITION_LABELS, value);
}

export function BannerPositionSelect({ value, onChange }: Props) {
  return (
    <label className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-text-sub">
      Vị trí banner
      <select
        value={value}
        onChange={(event) => {
          const selected = event.target.value;
          if (selected === "") onChange("");
          else if (isBannerPosition(selected)) onChange(selected);
        }}
        className="h-10 min-w-48 rounded-xl border border-surface-border bg-white px-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      >
        <option value="">Tất cả vị trí</option>
        {Object.entries(POSITION_LABELS).map(([position, label]) => (
          <option key={position} value={position}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
