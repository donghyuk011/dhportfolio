import { useEffect, useRef, useState } from "react";
import { useProjects } from "../context/ProjectsContext";
import { assetUrl } from "../data/projects";

const initialValues = {
  title: "",
  category: "",
  year: String(new Date().getFullYear()),
  role: "",
  timeline: "",
  tools: "",
  description: "",
  overview: "",
  challenge: "",
  research: "",
  process: "",
  solution: "",
  result: "",
};

export default function ProjectManager() {
  const { projects, managerOpen, closeManager, addProject, removeProject, replaceProjects, exportProjects } = useProjects();
  const [values, setValues] = useState(initialValues);
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (!cover) { setPreview(""); return; }
    const url = URL.createObjectURL(cover);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  useEffect(() => {
    if (!managerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const closeOnEscape = (event) => { if (event.key === "Escape") closeManager(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [managerOpen, closeManager]);

  if (!managerOpen) return null;

  function change(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    if (!cover) { setMessage("대표 이미지를 선택해 주세요."); return; }
    setBusy(true);
    try {
      await addProject(values, cover, gallery);
      setValues({ ...initialValues, year: String(new Date().getFullYear()) });
      setCover(null);
      setGallery([]);
      form.reset();
      setMessage("작품을 저장했습니다. 화면에 바로 반영되었습니다.");
    } catch (error) {
      setMessage(error.message || "저장하지 못했습니다. 다시 시도해 주세요.");
    } finally { setBusy(false); }
  }
  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    try {
      const data = JSON.parse(await file.text());
      await replaceProjects(data);
      setMessage(`${data.length}개의 작품을 불러왔습니다.`);
    } catch { setMessage("portfolio-data.json 파일을 확인해 주세요."); }
    event.target.value = "";
  }

  return (
    <div className="manager-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeManager(); }}>
      <section className="manager-panel" role="dialog" aria-modal="true" aria-labelledby="manager-title" tabIndex="-1" ref={panelRef}>
        <div className="manager-header">
          <div><span>작품 편집</span><h2 id="manager-title">작품 관리</h2></div>
          <button type="button" className="manager-close" onClick={closeManager} aria-label="작품 관리 닫기">닫기 ×</button>
        </div>

        <p className="manager-note">여기서 올린 작품은 현재 브라우저에 먼저 저장됩니다. 공개 사이트에 반영하려면 아래의 “배포 파일 받기”를 사용하세요.</p>

        {projects.length > 0 && (
          <div className="manager-library">
            <div className="manager-library-heading"><h3>저장된 작품</h3><span>{projects.length}개</span></div>
            {projects.map((project) => (
              <article className="manager-project" key={project.id}>
                <img src={assetUrl(project.thumbnail)} alt="" />
                <div><strong>{project.title}</strong><span>{project.category} · {project.year}</span></div>
                <button type="button" onClick={() => { if (window.confirm(`“${project.title}” 작품을 삭제할까요?`)) removeProject(project.id); }}>삭제</button>
              </article>
            ))}
          </div>
        )}

        <form className="project-form" onSubmit={submit}>
          <h3>새 작품 추가</h3>
          <div className="upload-cover">
            <label htmlFor="project-cover">대표 이미지 <b>필수</b><span>JPG, PNG, WebP, SVG · 최대 12MB</span></label>
            <input id="project-cover" type="file" accept="image/*" required onChange={(event) => setCover(event.target.files?.[0] || null)} />
            <label htmlFor="project-cover" className={preview ? "upload-drop has-preview" : "upload-drop"}>
              {preview ? <img src={preview} alt="선택한 대표 이미지 미리보기" /> : <><span className="upload-plus">＋</span><strong>대표 이미지 선택</strong><small>클릭해서 파일을 골라주세요</small></>}
            </label>
          </div>
          <div className="form-grid">
            <label>작품 이름 <b>필수</b><input name="title" value={values.title} onChange={change} required placeholder="예: 지역 커뮤니티 앱" /></label>
            <label>분야<input name="category" value={values.category} onChange={change} placeholder="예: UI/UX 디자인" /></label>
            <label>연도<input name="year" value={values.year} onChange={change} inputMode="numeric" /></label>
            <label>역할<input name="role" value={values.role} onChange={change} placeholder="예: 프로덕트 디자이너" /></label>
            <label>작업 기간<input name="timeline" value={values.timeline} onChange={change} placeholder="예: 2026.03 — 2026.05" /></label>
            <label>사용 도구<input name="tools" value={values.tools} onChange={change} placeholder="Figma, React, CSS" /><small>쉼표로 구분해 주세요.</small></label>
          </div>
          <label>한 줄 소개 <b>필수</b><textarea name="description" value={values.description} onChange={change} required rows="2" placeholder="작품의 핵심을 짧게 설명해 주세요." /></label>
          <label>프로젝트 개요<textarea name="overview" value={values.overview} onChange={change} rows="4" placeholder="프로젝트의 배경과 목표" /></label>
          <details className="more-fields">
            <summary>상세 내용 더 입력하기 <span>＋</span></summary>
            <label>문제<textarea name="challenge" value={values.challenge} onChange={change} rows="3" /></label>
            <label>리서치<textarea name="research" value={values.research} onChange={change} rows="3" /></label>
            <label>과정<textarea name="process" value={values.process} onChange={change} rows="3" /></label>
            <label>해결<textarea name="solution" value={values.solution} onChange={change} rows="3" /></label>
            <label>결과<textarea name="result" value={values.result} onChange={change} rows="3" /></label>
          </details>
          <label className="gallery-input">추가 이미지 <span>선택 · 최대 6장</span><input type="file" accept="image/*" multiple onChange={(event) => setGallery(Array.from(event.target.files || []).slice(0, 6))} /><small>{gallery.length > 0 ? `${gallery.length}장 선택됨` : "상세 페이지의 갤러리에 표시됩니다."}</small></label>
          {message && <p className="manager-message" role="status">{message}</p>}
          <button className="save-project" type="submit" disabled={busy}>{busy ? "이미지를 처리하고 있습니다…" : "작품 저장하기"}</button>
        </form>

        <div className="publish-box">
          <div><h3>공개 사이트에 반영하기</h3><p>작품을 모두 입력한 뒤 파일을 내려받아 프로젝트의 <code>public/portfolio-data.json</code>과 교체하고 GitHub에 push하세요.</p></div>
          <div className="publish-actions">
            <button type="button" onClick={exportProjects} disabled={!projects.length}>배포 파일 받기 ↓</button>
            <label className="import-button">백업 불러오기<input type="file" accept="application/json,.json" onChange={importData} /></label>
          </div>
        </div>
      </section>
    </div>
  );
}
