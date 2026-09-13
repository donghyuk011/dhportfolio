import SectionLink from "./SectionLink";
import { useProjects } from "../context/ProjectsContext";

export default function MobileNav() {
  const { openManager } = useProjects();
  return (
    <nav className="mobile-nav" aria-label="모바일 빠른 메뉴">
      <SectionLink section="top"><span aria-hidden="true">⌂</span>홈</SectionLink>
      <SectionLink section="work"><span aria-hidden="true">□</span>작품</SectionLink>
      <button type="button" onClick={openManager} aria-label="작품 업로드 열기"><span aria-hidden="true">＋</span>업로드</button>
      <SectionLink section="about"><span aria-hidden="true">○</span>소개</SectionLink>
      <SectionLink section="contact"><span aria-hidden="true">↗</span>연락</SectionLink>
    </nav>
  );
}
