import { Link, useLocation } from "react-router-dom";
export default function SectionLink({ section, children, onClick, ...props }) {
  const location = useLocation();
  return (
    <Link
      to={section === "top" ? "/" : `/?section=${section}`}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          location.pathname === "/" &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          document
            .getElementById(section)
            ?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
        }
      }}
    >
      {children}
    </Link>
  );
}
