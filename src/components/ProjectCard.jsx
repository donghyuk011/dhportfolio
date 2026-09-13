import { Link } from "react-router-dom";
import { assetUrl } from "../data/projects";
import Arrow from "./Arrow";
import Reveal from "./Reveal";
export default function ProjectCard({ project, index }) {
  return (
    <Reveal>
      <article className="project-row">
        <div className="project-heading">
          <span className="project-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>
            <Link to={`/projects/${project.slug}`}>
              {project.title}
              <Arrow />
            </Link>
          </h3>
          <span className="project-year">{project.year}</span>
        </div>
        <Link
          to={`/projects/${project.slug}`}
          className="project-cover"
          style={{ background: project.color }}
          aria-label={`${project.title} 상세 보기`}
        >
          <img
            src={assetUrl(project.thumbnail)}
            alt={`${project.title} ${project.category} — project overview`}
            width="1200"
            height="840"
            loading="lazy"
          />
          <span className="view-project">
            작품 보기 <Arrow />
          </span>
        </Link>
        <div className="project-info">
          <div>
            <span className="eyebrow">{project.category}</span>
            <p>{project.description}</p>
          </div>
          <dl>
            <div>
              <dt>역할</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>도구</dt>
              <dd>{project.tools.join(" / ")}</dd>
            </div>
          </dl>
        </div>
      </article>
    </Reveal>
  );
}
