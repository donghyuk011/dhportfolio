import { useProjects } from "../context/ProjectsContext";
import SectionLabel from "../components/SectionLabel";
import ProjectCard from "../components/ProjectCard";
import EmptyPortfolio from "../components/EmptyPortfolio";
export default function Projects() {
  const { projects, loading } = useProjects();
  return (
    <section id="work" className="section works-section">
      <div className="works-intro">
        <SectionLabel number="02">작품</SectionLabel>
        <div>
          <h2>
            생각을 형태로<span>.</span>
          </h2>
          <p>
            큰 방향부터 작은 디테일까지, 직접 고민하고 만든 결과를 담습니다.
          </p>
        </div>
        <span className="works-count">
          ({String(projects.length).padStart(2, "0")})
        </span>
      </div>
      {!loading && projects.length === 0 ? <EmptyPortfolio compact /> : <div className="project-list">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>}
    </section>
  );
}
