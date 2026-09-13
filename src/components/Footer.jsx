import { profile } from "../data/profile";
import SectionLink from "./SectionLink";
export default function Footer() {
  return (
    <footer className="footer">
      <span>
        {profile.name} © {new Date().getFullYear()}
      </span>
      <span className="footer-note">
        섬세하게 디자인하고, 꼼꼼하게 만들었습니다.
      </span>
      <SectionLink section="top">맨 위로 ↑</SectionLink>
    </footer>
  );
}
