import { Link } from "react-router-dom";
import { assetUrl } from "../data/projects";
import Arrow from "./Arrow";
export default function PortfolioCard({ project, index, angle }) {
  return (
    <div
      className="orbit-card"
      style={{ "--angle": `${angle}deg` }}
      data-orbit-index={index}
    >
      <Link
        className="portfolio-card"
        to={`/projects/${project.slug}`}
        draggable="false"
        aria-label={`${project.title} 작품 보기`}
      >
        <div className="portfolio-image">
          <img
            src={assetUrl(project.thumbnail)}
            alt={`${project.title} — ${project.category} 대표 이미지`}
            width="1200"
            height="840"
            draggable="false"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </div>
        <div className="portfolio-caption">
          <div>
            <strong>{project.title}</strong>
            <span>
              {project.category} · {project.year}
            </span>
          </div>
          <Arrow />
        </div>
      </Link>
    </div>
  );
}
