interface Props {
  size?: number;
  className?: string;
}

export function StartLogo({ size = 20, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-baseline font-medium tracking-tight ${className}`}
      style={{ fontSize: size, fontFamily: "Inter, sans-serif" }}
    >
      <span style={{ color: "#1A1A1A" }}>nextil</span>
      <span style={{ color: "#1D9E75" }}>&nbsp;start</span>
    </span>
  );
}
