import SectionLink from "./SectionLink";
import Arrow from "./Arrow";
export default function SectionNavigation() {
  return (
    <nav className="section-navigation" aria-label="포트폴리오 둘러보기">
      <SectionLink section="work" className="pill pill-primary">
        작품 전체 보기 <Arrow />
      </SectionLink>
      <SectionLink section="about" className="pill">
        소개
      </SectionLink>
      <SectionLink section="experience" className="pill">
        경험 / 기술
      </SectionLink>
      <SectionLink section="contact" className="pill">
        연락처
      </SectionLink>
    </nav>
  );
}
