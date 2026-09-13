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
          {yearRange}
          <br />
          <span>디자인 & 개발</span>
        </span>
      </div>
      <PortfolioCarousel />
      <SectionNavigation />
      <div className="hero-bottom">
        <span>생각을 실제 경험으로 만듭니다.</span>
        <SectionLink section="work">
          작품 둘러보기 <Arrow direction="down" />
        </SectionLink>
        <span>스크롤해서 살펴보기</span>
      </div>
    </section>
  );
}
