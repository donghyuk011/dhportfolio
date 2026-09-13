import { useEffect, useRef, useState } from "react";
import { useProjects } from "../context/ProjectsContext";
import { assetUrl } from "../data/projects";
import { githubRepositoryUrl } from "../lib/githubPublisher";

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
  const { projects, managerOpen, closeManager, addProject, removeProject, replaceProjects, exportProjects, publishProjects, hasLocalChanges } = useProjects();
  const [values, setValues] = useState(initialValues);
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [message, setMessage] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
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
  async function publish() {
    setPublishMessage("");
    if (!githubToken.trim()) {
      setPublishMessage("저장소 전용 GitHub 토큰을 입력해 주세요.");
      return;
    }
    setPublishBusy(true);
    try {
      const published = await publishProjects(githubToken, setPublishMessage);
      setGithubToken("");
      setPublishMessage(`${published.length}개의 작품을 GitHub에 게시했습니다. 약 1분 뒤 모든 기기에 반영됩니다.`);
    } catch (error) {
      setPublishMessage(error.message || "GitHub에 게시하지 못했습니다.");
    } finally {
      setPublishBusy(false);
    }
  }

  return (
    <div className="manager-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeManager(); }}>
      <section className="manager-panel" role="dialog" aria-modal="true" aria-labelledby="manager-title" tabIndex="-1" ref={panelRef}>
        <div className="manager-header">
          <div><span>작품 편집</span><h2 id="manager-title">작품 관리</h2></div>
          <button type="button" className="manager-close" onClick={closeManager} aria-label="작품 관리 닫기">닫기 ×</button>
        </div>

        <p className="manager-note">작품 저장은 이 기기의 임시 보관함에 먼저 반영됩니다. 모든 기기에서 보이게 하려면 마지막에 “GitHub에 게시하기”를 눌러주세요.</p>

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
          <div className="publish-copy">
            <span className={hasLocalChanges ? "publish-state is-draft" : "publish-state"}>{hasLocalChanges ? "게시 전 변경사항 있음" : "GitHub와 동기화됨"}</span>
            <h3>모든 기기에 게시하기</h3>
            <p>저장소 전용 토큰으로 작품 정보와 이미지를 <a href={githubRepositoryUrl} target="_blank" rel="noreferrer">dhportfolio 저장소 ↗</a>에 올립니다. 토큰은 현재 창에서만 사용하고 저장하지 않습니다.</p>
            <details className="token-help">
              <summary>처음 게시할 때 필요한 설정</summary>
              <ol>
                <li><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">GitHub 토큰 만들기 ↗</a>를 엽니다.</li>
                <li>Repository access에서 <strong>Only select repositories</strong>와 <strong>dhportfolio</strong>를 선택합니다.</li>
                <li>Permissions → Repository permissions → <strong>Contents: Read and write</strong>만 설정해 생성합니다.</li>
              </ol>
            </details>
          </div>
          <div className="publish-controls">
            <label htmlFor="github-token">GitHub 저장소 토큰<input id="github-token" type="password" value={githubToken} onChange={(event) => setGithubToken(event.target.value)} autoComplete="off" spellCheck="false" placeholder="github_pat_…" /></label>
            <button className="publish-primary" type="button" onClick={publish} disabled={publishBusy || !hasLocalChanges}>{publishBusy ? "게시하는 중…" : "GitHub에 게시하기 ↑"}</button>
            {publishMessage && <p className="publish-message" role="status">{publishMessage}</p>}
          </div>
          <div className="publish-backup">
            <span>백업 및 복원</span>
            <div className="publish-actions">
              <button type="button" onClick={exportProjects} disabled={!projects.length}>백업 파일 받기 ↓</button>
              <label className="import-button">백업 불러오기<input type="file" accept="application/json,.json" onChange={importData} /></label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
