import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import SectionLink from "./components/SectionLink";
import ProjectManager from "./components/ProjectManager";
import MobileNav from "./components/MobileNav";
import { profile } from "./data/profile";
import { useProjects } from "./context/ProjectsContext";

function RouteEffects() {
  const location = useLocation();
  const { projects } = useProjects();
  useEffect(() => {
    const slug = location.pathname.split("/projects/")[1];
    const project = projects.find((item) => item.slug === slug);
    document.title = project
      ? `${project.title} — ${profile.name}`
      : `${profile.name} — ${profile.title}`;
    const section = new URLSearchParams(location.search).get("section");
    const frame = requestAnimationFrame(() => {
      if (location.pathname === "/" && section)
        document
          .getElementById(section)
          ?.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search, projects]);
  return null;
}
export default function App() {
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <Navbar />
      <RouteEffects />
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route
            path="*"
            element={
              <section className="not-found">
                <p>404 / 페이지를 찾을 수 없습니다</p>
                <h1>처음으로 돌아갈까요?</h1>
                <SectionLink section="top" className="pill pill-primary">
                  홈으로 돌아가기
                </SectionLink>
              </section>
            }
          />
        </Routes>
      </main>
      <ProjectManager />
      <Footer />
      <MobileNav />
    </>
  );
}
