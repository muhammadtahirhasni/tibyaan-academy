export default function InitialsAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2"];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colors[colorIndex],
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: "600",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
