import { Link, useParams } from "react-router-dom";
import { assetUrl } from "../data/projects";
import { useProjects } from "../context/ProjectsContext";
import SectionLink from "../components/SectionLink";
import Arrow from "../components/Arrow";
import Reveal from "../components/Reveal";
export default function ProjectDetail() {
  const { projects, loading, openManager } = useProjects();
  const { slug } = useParams();
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  if (loading) return <section className="not-found"><p>작품을 불러오는 중입니다.</p></section>;
  if (!project)
    return (
      <section className="not-found">
        <p>404 / 작품을 찾을 수 없습니다</p>
        <h1>아직 등록되지 않은 작품입니다.</h1>
        <SectionLink section="work" className="pill pill-primary">
          작품 목록으로 <Arrow />
        </SectionLink>
      </section>
    );
  const next = projects[(index + 1) % projects.length];
  return (
    <article className="project-detail">
      <div className="detail-intro">
        <SectionLink section="work" className="back-link">
          <Arrow direction="left" /> 모든 작품
        </SectionLink>
        <p className="eyebrow">
          CASE TRACE / {project.category} / {project.year}
        </p>
        <h1>
          {project.title}
          <span>.</span>
        </h1>
        <p className="detail-description">{project.description}</p>
        <dl className="detail-metadata">
          <div>
            <dt>역할</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>기간</dt>
            <dd>{project.timeline}</dd>
          </div>
          <div>
            <dt>도구</dt>
            <dd>{project.tools.join(" / ")}</dd>
          </div>
        </dl>
        {project.pdf?.url && (
          <a className="detail-pdf-link" href={project.pdf.url} target="_blank" rel="noreferrer">
            <span>PDF</span>
            <strong>{project.pdf.name || `${project.title}.pdf`}</strong>
            <span>새 창에서 보기 ↗</span>
          </a>
        )}
      </div>
      <div className="detail-cover" style={{ background: project.color }}>
        <img
          src={assetUrl(project.thumbnail)}
          alt={`${project.title} 대표 이미지`}
          width="1200"
          height="840"
          fetchPriority="high"
        />
      </div>
      <div className="case-study">
        {["overview", "challenge", "research", "process", "solution", "result"]
          .filter((key) => project[key])
          .map((key, i) => (
            <Reveal key={key}>
              <section className="case-section">
                <div className="section-label">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h2>{{ overview: "개요", challenge: "문제", research: "리서치", process: "과정", solution: "해결", result: "결과" }[key]}</h2>
                </div>
                <p>{project[key]}</p>
              </section>
            </Reveal>
          ))}
      </div>
      {project.images?.length > 0 && (
        <section className="detail-gallery" aria-label="프로젝트 갤러리">
          <h2>갤러리</h2>
          {project.images.map((item, index) => {
            const image =
              typeof item === "string"
                ? {
                    src: item,
                    alt: `${project.title} 프로젝트 이미지 ${index + 1}`,
                  }
                : item;
            return (
              <Reveal key={image.src}>
                <figure>
                  <img
                    src={assetUrl(image.src)}
                    alt={image.alt}
                    width="1200"
                    height="840"
                    loading="lazy"
                  />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              </Reveal>
            );
          })}
        </section>
      )}
      {projects.length > 1 ? <Link to={`/projects/${next.slug}`} className="next-project"><span>다음 작품</span><strong>{next.title}<Arrow /></strong><span>{next.category}</span></Link> : <div className="next-project single-project"><span>포트폴리오</span><strong>다음 작품을<br />기다리고 있습니다.</strong><button className="pill" onClick={openManager}>작품 추가 ＋</button></div>}
    </article>
  );
}
