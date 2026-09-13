import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { extensionFor, rowsToProjects } from "../lib/projectCloud";
import { ADMIN_EMAIL, supabase } from "../lib/supabase";

const ProjectsContext = createContext(null);
const DATABASE_NAME = "donghyuk-portfolio";
const STORE_NAME = "content";
const PROJECTS_KEY = "projects";
const STORAGE_BUCKET = "portfolio";

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

async function clearLocalProjects() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ projects: [], dirty: false }, PROJECTS_KEY);
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

async function uploadDataUrl(dataUrl, pathPrefix) {
  if (!dataUrl?.startsWith("data:")) return dataUrl;
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${pathPrefix}.${extensionFor(blob.type)}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    contentType: blob.type,
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function prepareProjectForCloud(project, order) {
  const id = project.id || crypto.randomUUID();
  const thumbnail = await uploadDataUrl(project.thumbnail, `${id}/cover`);
  const images = await Promise.all((project.images || []).map(async (image, index) => ({
    ...image,
    src: await uploadDataUrl(image.src, `${id}/gallery-${index + 1}`),
  })));
  const content = { ...project, id, thumbnail, images };
  return { id, content, sort_order: order };
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [localDrafts, setLocalDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [managerOpen, setManagerOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, content, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const nextProjects = rowsToProjects(data);
    setProjects(nextProjects);
    return nextProjects;
  }, []);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const [local, authResult] = await Promise.all([
          readLocalProjects().catch(() => null),
          supabase.auth.getSession(),
        ]);
        if (!current) return;
        if (local?.dirty && Array.isArray(local.projects)) setLocalDrafts(local.projects);
        setSession(authResult.data.session);
        await loadProjects();
      } catch {
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}portfolio-data.json`, { cache: "no-store" });
          const published = response.ok ? await response.json() : [];
          if (current) setProjects(Array.isArray(published) ? published : []);
        } catch {
          if (current) setProjects([]);
        }
      } finally {
        if (current) {
          setLoading(false);
          setAuthLoading(false);
        }
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (current) {
        setSession(nextSession);
        setAuthLoading(false);
      }
    });
    const channel = supabase
      .channel("public-projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        loadProjects().catch(() => {});
      })
      .subscribe();

    return () => {
      current = false;
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [loadProjects]);

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  function assertAdmin() {
    if (!isAdmin) throw new Error("관리자 로그인이 필요합니다.");
  }

  async function signIn() {
    const emailRedirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: { emailRedirectTo, shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function saveCloudProject(project, order = projects.length) {
    assertAdmin();
    const row = await prepareProjectForCloud(project, order);
    const { error } = await supabase.from("projects").upsert(row);
    if (error) throw error;
    await loadProjects();
    return row.content;
  }

  async function addProject(values, coverFile, galleryFiles) {
    assertAdmin();
    const thumbnail = await optimizeImage(coverFile);
    const gallery = await Promise.all(galleryFiles.slice(0, 6).map(async (file, index) => ({
      src: await optimizeImage(file),
      alt: `${values.title} 프로젝트 이미지 ${index + 1}`,
      caption: `${String(index + 1).padStart(2, "0")} / ${values.title}`,
    })));
    return saveCloudProject({
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
    });
  }

  async function removeProject(id) {
    assertAdmin();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    setProjects((current) => current.filter((project) => project.id !== id));
    const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(id);
    if (files?.length) await supabase.storage.from(STORAGE_BUCKET).remove(files.map((file) => `${id}/${file.name}`));
  }

  async function replaceProjects(nextProjects) {
    assertAdmin();
    if (!Array.isArray(nextProjects)) throw new Error("올바른 포트폴리오 데이터가 아닙니다.");
    const prepared = [];
    for (let index = 0; index < nextProjects.length; index += 1) {
      prepared.push(await prepareProjectForCloud(nextProjects[index], index));
    }
    if (prepared.length) {
      const { error } = await supabase.from("projects").upsert(prepared);
      if (error) throw error;
    }
    const keepIds = new Set(prepared.map((row) => row.id));
    const removedIds = projects.map((project) => project.id).filter((id) => !keepIds.has(id));
    if (removedIds.length) {
      const { error } = await supabase.from("projects").delete().in("id", removedIds);
      if (error) throw error;
    }
    await loadProjects();
  }

  async function migrateLocalDrafts() {
    assertAdmin();
    for (let index = 0; index < localDrafts.length; index += 1) {
      await saveCloudProject(localDrafts[index], projects.length + index);
    }
    await clearLocalProjects();
    setLocalDrafts([]);
    await loadProjects();
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
    projects,
    localDrafts,
    loading,
    authLoading,
    session,
    isAdmin,
    managerOpen,
    openManager: () => setManagerOpen(true),
    closeManager: () => setManagerOpen(false),
    signIn,
    signOut,
    addProject,
    removeProject,
    replaceProjects,
    migrateLocalDrafts,
    exportProjects,
  }), [projects, localDrafts, loading, authLoading, session, isAdmin, managerOpen]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error("useProjects는 ProjectsProvider 안에서 사용해야 합니다.");
  return context;
}
