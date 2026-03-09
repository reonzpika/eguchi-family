const memberColors: Record<string, string> = {
  Ryo: "#7CC9A0",
  Yoko: "#F9C784",
  Haruhi: "#B5A4E0",
  Natsumi: "#F97B6B",
  Motoharu: "#7BBFDC",
  家族: "#7CC9A0",
};

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const color = memberColors[name] || "#F97B6B"; // Default to primary color
  const initials = name.slice(0, 1).toUpperCase();

  // Convert hex to rgba for opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className="flex items-center justify-center rounded-full border-2 font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: hexToRgba(color, 0.2),
        color: color,
        borderColor: hexToRgba(color, 0.3),
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}
