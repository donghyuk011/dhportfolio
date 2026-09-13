import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { publishPortfolio } from "../lib/githubPublisher";

const ProjectsContext = createContext(null);
const DATABASE_NAME = "donghyuk-portfolio";
const STORE_NAME = "content";
const PROJECTS_KEY = "projects";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readLocalProjects() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(PROJECTS_KEY);
    request.onsuccess = () => {
      const saved = request.result;
      if (Array.isArray(saved)) resolve({ projects: saved, dirty: saved.length > 0 });
      else resolve(saved ?? null);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeLocalProjects(projects, dirty) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ projects, dirty }, PROJECTS_KEY);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file) {
  if (!file?.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있습니다.");
  if (file.size > 12 * 1024 * 1024) throw new Error("이미지는 한 장당 12MB 이하로 선택해 주세요.");
  if (file.type === "image/svg+xml" || file.type === "image/gif") return fileToDataUrl(file);
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.86);
}

function makeSlug(title) {
  const readable = title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
  return `${readable || "project"}-${Date.now().toString(36)}`;
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  useEffect(() => {
    let current = true;
    (async () => {
      let local = null;
      try {
        local = await readLocalProjects();
        const response = await fetch(`${import.meta.env.BASE_URL}portfolio-data.json`, { cache: "no-store" });
        const published = response.ok ? await response.json() : [];
        const publishedProjects = Array.isArray(published) ? published : [];
        const useLocalDraft = Boolean(local?.dirty && Array.isArray(local.projects));
        const initialProjects = useLocalDraft ? local.projects : publishedProjects;
        if (current) {
          setProjects(initialProjects);
          setHasLocalChanges(useLocalDraft);
        }
        if (!useLocalDraft) await writeLocalProjects(publishedProjects, false);
      } catch {
        if (current) {
          setProjects(Array.isArray(local?.projects) ? local.projects : []);
          setHasLocalChanges(Boolean(local?.dirty));
        }
      } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, []);

  async function commit(nextProjects, dirty = true) {
    setProjects(nextProjects);
    setHasLocalChanges(dirty);
    await writeLocalProjects(nextProjects, dirty);
  }

  async function addProject(values, coverFile, galleryFiles) {
    const thumbnail = await optimizeImage(coverFile);
    const gallery = await Promise.all(galleryFiles.slice(0, 6).map(async (file, index) => ({
      src: await optimizeImage(file),
      alt: `${values.title} 프로젝트 이미지 ${index + 1}`,
      caption: `${String(index + 1).padStart(2, "0")} / ${values.title}`,
    })));
    const project = {
      id: crypto.randomUUID(),
      slug: makeSlug(values.title),
      title: values.title.trim(),
      category: values.category.trim() || "개인 프로젝트",
      year: values.year.trim() || String(new Date().getFullYear()),
      role: values.role.trim() || "디자이너",
      timeline: values.timeline.trim(),
      tools: values.tools.split(",").map((tool) => tool.trim()).filter(Boolean),
      thumbnail,
      color: "#ecece7",
      description: values.description.trim(),
      overview: values.overview.trim(),
      challenge: values.challenge.trim(),
      research: values.research.trim(),
      process: values.process.trim(),
      solution: values.solution.trim(),
      result: values.result.trim(),
      images: gallery,
    };
    await commit([...projects, project]);
    return project;
  }

  async function removeProject(id) { await commit(projects.filter((project) => project.id !== id)); }
  async function replaceProjects(nextProjects) {
    if (!Array.isArray(nextProjects)) throw new Error("올바른 포트폴리오 데이터가 아닙니다.");
    await commit(nextProjects);
  }
  async function publishProjects(token, onProgress) {
    const published = await publishPortfolio(projects, token, onProgress);
    await commit(published, false);
    return published;
  }
  function exportProjects() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  const value = useMemo(() => ({
    projects, loading, managerOpen,
    openManager: () => setManagerOpen(true),
    closeManager: () => setManagerOpen(false),
    addProject, removeProject, replaceProjects, exportProjects, publishProjects, hasLocalChanges,
  }), [projects, loading, managerOpen, hasLocalChanges]);
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error("useProjects는 ProjectsProvider 안에서 사용해야 합니다.");
  return context;
}
