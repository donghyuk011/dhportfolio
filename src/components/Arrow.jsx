export default function Arrow({ direction = "up-right", ...props }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {direction === "down" ? (
        <path d="M12 4v16m-6-6 6 6 6-6" />
      ) : direction === "left" ? (
        <path d="M20 12H4m6-6-6 6 6 6" />
      ) : direction === "right" ? (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      ) : (
        <path d="M6 18 18 6M6 6h12v12" />
      )}
    </svg>
  );
}
