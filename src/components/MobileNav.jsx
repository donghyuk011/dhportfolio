import SectionLink from "./SectionLink";
import { useProjects } from "../context/ProjectsContext";

function NavIcon({ name }) {
  const paths = {
    home: <><path d="M3.5 10.5 12 3.7l8.5 6.8" /><path d="M5.7 9.2v10.3h12.6V9.2M9.4 19.5v-6.2h5.2v6.2" /></>,
    work: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    about: <><circle cx="12" cy="8" r="3.3" /><path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" /></>,
    contact: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
  };
  return <span className="mobile-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>;
}

export default function MobileNav() {
  const { openManager } = useProjects();
  return (
    <nav className="mobile-nav" aria-label="모바일 빠른 메뉴">
      <SectionLink section="top"><NavIcon name="home" />홈</SectionLink>
      <SectionLink section="work"><NavIcon name="work" />작품</SectionLink>
      <button type="button" onClick={openManager} aria-label="작품 업로드 열기"><span aria-hidden="true">＋</span>업로드</button>
      <SectionLink section="about"><NavIcon name="about" />소개</SectionLink>
      <SectionLink section="contact"><NavIcon name="contact" />연락</SectionLink>
    </nav>
  );
}
