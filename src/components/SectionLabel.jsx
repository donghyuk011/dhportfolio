export default function SectionLabel({ number, children }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span>{children}</span>
      <span className="section-code" aria-hidden="true">
        TRACE_{number}
      </span>
    </div>
  );
}
