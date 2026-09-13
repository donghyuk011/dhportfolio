import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import SectionLink from "./SectionLink";
import { useProjects } from "../context/ProjectsContext";
const links = [
  ["work", "작품"],
  ["about", "소개"],
  ["experience", "경험 / 기술"],
  ["contact", "연락처"],
];
export default function Navbar() {
  const { openManager } = useProjects();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    };
    if (open) window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className={`navbar ${scrolled || open ? "navbar-solid" : ""}`}>
      <SectionLink
        className="wordmark"
        section="top"
        onClick={() => setOpen(false)}
        aria-label={`${profile.name}, 맨 위로`}
      >
        {profile.name}
        <span className="wordmark-mark" aria-hidden="true">
          ✳
        </span>
      </SectionLink>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "닫기 −" : "메뉴 +"}
      </button>
      <nav
        id="main-navigation"
        className={open ? "nav-links is-open" : "nav-links"}
        aria-label="주요 메뉴"
      >
        {links.map(([id, label]) => (
          <SectionLink key={id} section={id} onClick={() => setOpen(false)}>
            {label}
            <span className="nav-dot" />
          </SectionLink>
        ))}
        <button className="nav-manager" type="button" onClick={() => { setOpen(false); openManager(); }}>작품 관리 ＋</button>
      </nav>
    </header>
  );
}
