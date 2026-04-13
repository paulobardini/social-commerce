import { tagColors, tagLabels, type TagCRM } from "@/data/mockCRM";

interface TagBadgeProps {
  tag: TagCRM;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${tagColors[tag]} ${
      size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
    }`}>
      {tagLabels[tag]}
    </span>
  );
}
