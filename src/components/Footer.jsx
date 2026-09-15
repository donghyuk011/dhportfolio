import { profile } from "../data/profile";
import SectionLink from "./SectionLink";
export default function Footer() {
  return (
    <footer className="footer">
      <span>
        {profile.name} © {new Date().getFullYear()}
      </span>
      <span className="footer-note system-status">
        <i aria-hidden="true" /> SIGNAL TRACE / ONLINE
      </span>
      <SectionLink section="top">맨 위로 ↑</SectionLink>
    </footer>
  );
}
