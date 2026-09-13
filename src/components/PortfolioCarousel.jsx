import { useEffect, useRef, useState } from "react";
import { useProjects } from "../context/ProjectsContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import PortfolioCard from "./PortfolioCard";
import Arrow from "./Arrow";
import EmptyPortfolio from "./EmptyPortfolio";

export default function PortfolioCarousel() {
  const { projects, loading } = useProjects();
  const reduced = useReducedMotion();
  const stage = useRef(null);
  const ring = useRef(null);
  const rotation = useRef(-8);
  const interaction = useRef({
    hover: false,
    focus: false,
    dragging: false,
    visible: true,
    resumeAt: 0,
    startX: 0,
    startY: 0,
    previousX: 0,
    moved: false,
    horizontal: false,
  });
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const step = 360 / Math.max(projects.length, 1);

  function paint() {
    if (!ring.current) return;
    ring.current.style.setProperty("--rotation", `${rotation.current}deg`);
    const cards = ring.current.children;
    let closest = 0;
    let maxDepth = -2;
    for (let i = 0; i < cards.length; i++) {
      const radians = ((i * step + rotation.current) * Math.PI) / 180;
      const depth = Math.cos(radians);
      cards[i].style.setProperty("--tilt", `${Math.sin(radians) * -24}deg`);
      cards[i].style.setProperty(
        "--depth-brightness",
        `${0.6 + (depth + 1) * 0.2}`,
      );
      if (depth > maxDepth) {
        maxDepth = depth;
        closest = i;
      }
    }
    if (closest !== activeRef.current) {
      activeRef.current = closest;
      setActive(closest);
    }
  }

  useEffect(() => {
    if (!projects.length || !stage.current || !ring.current) return undefined;
    let frame;
    let last = 0;
    paint();
    const tick = (now) => {
      const elapsed = last ? Math.min(now - last, 40) : 0;
      last = now;
      const state = interaction.current;
      if (
        projects.length > 1 &&
        !reduced &&
        !pauseRef.current &&
        !state.hover &&
        !state.focus &&
        !state.dragging &&
        state.visible &&
        !document.hidden &&
        now > state.resumeAt
      ) {
        rotation.current -= elapsed * 0.005; // 72 seconds per full revolution.
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const observer = new IntersectionObserver(
      ([entry]) => {
        interaction.current.visible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(stage.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced, projects.length]);

  function nudge(direction) {
    rotation.current += direction * step;
    interaction.current.resumeAt = performance.now() + 2500;
    paint();
  }
  function finishDrag(event) {
    const state = interaction.current;
    if (!state.dragging) return;
    state.dragging = false;
    state.resumeAt = performance.now() + 2500;
    stage.current?.classList.remove("is-dragging");
    if (stage.current?.hasPointerCapture(event.pointerId))
      stage.current.releasePointerCapture(event.pointerId);
  }
  if (loading) return <div className="empty-carousel loading-portfolio" aria-label="작품을 불러오는 중입니다" />;
  if (!projects.length) return <EmptyPortfolio />;
  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="선택한 포트폴리오 작품"
    >
      <div
        ref={stage}
        className="carousel-stage"
        tabIndex="0"
        aria-label="드래그해서 작품을 둘러보세요. 키보드 좌우 방향키로 회전할 수 있습니다."
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            nudge(event.key === "ArrowLeft" ? 1 : -1);
          }
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") interaction.current.hover = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            interaction.current.hover = false;
            interaction.current.resumeAt = performance.now() + 1200;
          }
        }}
        onFocusCapture={(event) => {
          interaction.current.focus = event.target.matches(":focus-visible");
          // Bring a keyboard-focused project to the front without moving mouse clicks.
          const card = event.target.closest("[data-orbit-index]");
          if (card && event.target.matches(":focus-visible")) {
            rotation.current = -Number(card.dataset.orbitIndex) * step;
            paint();
          }
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            interaction.current.focus = false;
            interaction.current.resumeAt = performance.now() + 1500;
          }
        }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          Object.assign(interaction.current, {
            dragging: true,
            moved: false,
            horizontal: false,
            startX: event.clientX,
            startY: event.clientY,
            previousX: event.clientX,
          });
        }}
        onPointerMove={(event) => {
          const state = interaction.current;
          if (!state.dragging) return;
          const dx = event.clientX - state.startX;
          const dy = event.clientY - state.startY;
          if (
            !state.horizontal &&
            Math.abs(dy) > Math.abs(dx) &&
            Math.abs(dy) > 8
          ) {
            finishDrag(event);
            return;
          }
          if (!state.horizontal && Math.abs(dx) < 7) return;
          state.horizontal = true;
          state.moved = true;
          stage.current.setPointerCapture(event.pointerId);
          stage.current.classList.add("is-dragging");
          rotation.current += (event.clientX - state.previousX) * 0.18;
          state.previousX = event.clientX;
          paint();
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={(event) => {
          // Touch begins with implicit capture on the link. Ignore its bubbling
          // lost-capture event when we transfer capture to the drag surface.
          if (event.target === event.currentTarget) finishDrag(event);
        }}
        onClickCapture={(event) => {
          if (interaction.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            interaction.current.moved = false;
          }
        }}
      >
        <div className="carousel-space">
          <div className="carousel-ring" ref={ring}>
            {projects.map((project, index) => (
              <PortfolioCard
                key={project.slug}
                project={project}
                index={index}
                angle={index * step}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="carousel-toolbar">
        <span className="carousel-hint">
          <span className="drag-icon" aria-hidden="true">
            ↔
          </span>{" "}
          드래그해서 둘러보기
        </span>
        <span className="carousel-counter">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className="counter-line" />
          {String(projects.length).padStart(2, "0")}
        </span>
        <div className="carousel-controls">
          <button onClick={() => nudge(1)} aria-label="이전 작품">
            <Arrow direction="left" />
          </button>
          <button
            className="pause-button"
            disabled={reduced || projects.length < 2}
            onClick={() => {
              const next = !paused;
              setPaused(next);
              pauseRef.current = next;
            }}
            aria-label={
              projects.length < 2
                ? "작품이 두 개 이상일 때 자동 회전합니다"
                : reduced
                ? "모션 감소 설정에 따라 자동 회전이 꺼져 있습니다"
                : paused
                  ? "자동 회전 재생"
                  : "자동 회전 일시정지"
            }
            aria-pressed={paused || reduced}
          >
            {paused || reduced ? "▷" : "Ⅱ"}
          </button>
          <button onClick={() => nudge(-1)} aria-label="다음 작품">
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}
