import { profile } from "../data/profile";
import { useProjects } from "../context/ProjectsContext";
import PortfolioCarousel from "../components/PortfolioCarousel";
import SectionNavigation from "../components/SectionNavigation";
import SectionLink from "../components/SectionLink";
import Arrow from "../components/Arrow";
export default function Hero() {
  const { projects } = useProjects();
  const years = [...new Set(projects.map((project) => project.year))].sort();
  const yearRange =
    years.length > 1
      ? `${years[0]} — ${years.at(-1)}`
      : years[0] || "작품 업로드 전";
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-system" aria-label="사이트 콘셉트와 상태">
        <span>DH / SIGNAL TRACE</span>
        <span className="system-status">
          <i aria-hidden="true" /> SYSTEM ONLINE
        </span>
      </div>
      <div className="hero-intro">
        <p>{profile.title}</p>
        <p>
          {profile.location}
          <span className="intro-cross" aria-hidden="true">
            +
          </span>
        </p>
      </div>
      <div className="hero-heading">
        <h1 id="hero-title">
          포트폴리오<span className="title-period">.</span>
        </h1>
        <span className="hero-years">
          ARCHIVE / {yearRange}
          <br />
          <span>SECURITY · DESIGN · DEV</span>
        </span>
      </div>
      <div className="hero-carousel-shell">
        <div className="signal-field" aria-hidden="true">
          <span className="signal-orbit signal-orbit-one" />
          <span className="signal-orbit signal-orbit-two" />
          <span className="signal-node signal-node-one" />
          <span className="signal-node signal-node-two" />
          <span className="signal-node signal-node-three" />
        </div>
        <PortfolioCarousel />
      </div>
      <SectionNavigation />
      <div className="hero-bottom">
        <span>관찰하고, 분석하고, 직접 검증합니다.</span>
        <SectionLink section="work">
          작품 둘러보기 <Arrow direction="down" />
        </SectionLink>
        <span className="trace-readout">TRACE 00 / 스크롤해서 살펴보기</span>
      </div>
    </section>
  );
}
