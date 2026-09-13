import { useEffect, useRef, useState } from "react";
import { useProjects } from "../context/ProjectsContext";
import { assetUrl } from "../data/projects";
import { ADMIN_EMAIL } from "../lib/supabase";

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
  const {
    projects,
    localDrafts,
    authLoading,
    session,
    isAdmin,
    managerOpen,
    closeManager,
    signIn,
    signOut,
    addProject,
    removeProject,
    replaceProjects,
    migrateLocalDrafts,
    exportProjects,
  } = useProjects();
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
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [managerOpen, closeManager]);

  if (!managerOpen) return null;

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function requestLogin() {
    setBusy(true);
    setMessage("");
    try {
      await signIn();
      setMessage(`${ADMIN_EMAIL}로 로그인 링크를 보냈습니다. 메일의 링크를 열어주세요.`);
    } catch (error) {
      setMessage(error.message || "로그인 링크를 보내지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

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
      setMessage("작품을 게시했습니다. 모든 기기에 바로 반영됩니다.");
    } catch (error) {
      setMessage(error.message || "게시하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`“${project.title}” 작품을 삭제할까요?`)) return;
    setBusy(true);
    setMessage("");
    try {
      await removeProject(project.id);
      setMessage("작품을 삭제했습니다.");
    } catch (error) {
      setMessage(error.message || "작품을 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const data = JSON.parse(await file.text());
      await replaceProjects(data);
      setMessage(`${data.length}개의 작품을 클라우드로 가져왔습니다.`);
    } catch (error) {
      setMessage(error.message || "portfolio-data.json 파일을 확인해 주세요.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function migrateDrafts() {
    setBusy(true);
    setMessage("");
    try {
      const count = localDrafts.length;
      await migrateLocalDrafts();
      setMessage(`이 기기에 있던 작품 ${count}개를 클라우드로 옮겼습니다.`);
    } catch (error) {
      setMessage(error.message || "기존 작품을 옮기지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="manager-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeManager(); }}>
      <section className="manager-panel" role="dialog" aria-modal="true" aria-labelledby="manager-title" tabIndex="-1" ref={panelRef}>
        <div className="manager-header">
          <div><span>작품 편집</span><h2 id="manager-title">작품 관리</h2></div>
          <button type="button" className="manager-close" onClick={closeManager} aria-label="작품 관리 닫기">닫기 ×</button>
        </div>

        {authLoading ? (
          <div className="manager-auth"><p>로그인 상태를 확인하고 있습니다…</p></div>
        ) : !isAdmin ? (
          <div className="manager-auth">
            <span className="publish-state">관리자 전용</span>
            <h3>이메일로 관리자 로그인</h3>
            <p>작품을 올릴 때만 로그인하면 됩니다. 비밀번호나 GitHub 토큰은 필요하지 않습니다.</p>
            <div className="manager-auth-email"><span>관리자 이메일</span><strong>{ADMIN_EMAIL}</strong></div>
            {session && <p className="manager-auth-warning">현재 로그인한 계정은 작품을 수정할 권한이 없습니다.</p>}
            {message && <p className="manager-message" role="status">{message}</p>}
            <div className="manager-auth-actions">
              {session ? (
                <button className="publish-primary" type="button" onClick={signOut} disabled={busy}>다른 계정으로 로그인</button>
              ) : (
                <button className="publish-primary" type="button" onClick={requestLogin} disabled={busy}>{busy ? "보내는 중…" : "로그인 링크 받기 →"}</button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="manager-session">
              <p><strong>{ADMIN_EMAIL}</strong> 계정으로 로그인했습니다. 새 작품은 모든 기기에 바로 게시됩니다.</p>
              <button type="button" onClick={signOut}>로그아웃</button>
            </div>

            {localDrafts.length > 0 && (
              <div className="manager-migrate">
                <div><strong>이 기기에 저장된 기존 작품이 있습니다.</strong><p>{localDrafts.length}개를 Supabase로 옮기면 다른 기기에서도 볼 수 있습니다.</p></div>
                <button type="button" onClick={migrateDrafts} disabled={busy}>기존 작품 가져오기 ↑</button>
              </div>
            )}

            {projects.length > 0 && (
              <div className="manager-library">
                <div className="manager-library-heading"><h3>게시된 작품</h3><span>{projects.length}개</span></div>
                {projects.map((project) => (
                  <article className="manager-project" key={project.id}>
                    <img src={assetUrl(project.thumbnail)} alt="" />
                    <div><strong>{project.title}</strong><span>{project.category} · {project.year}</span></div>
                    <button type="button" disabled={busy} onClick={() => deleteProject(project)}>삭제</button>
                  </article>
                ))}
              </div>
            )}

            <form className="project-form" onSubmit={submit}>
              <h3>새 작품 게시</h3>
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
              <button className="save-project" type="submit" disabled={busy}>{busy ? "클라우드에 게시하고 있습니다…" : "모든 기기에 게시하기 ↑"}</button>
            </form>

            <div className="publish-box manager-backup-box">
              <div className="publish-copy">
                <span className="publish-state">Supabase 연결됨</span>
                <h3>백업 및 복원</h3>
                <p>현재 게시된 작품을 JSON 파일로 보관하거나, 이전 백업 파일을 다시 불러올 수 있습니다.</p>
              </div>
              <div className="publish-actions">
                <button type="button" onClick={exportProjects} disabled={!projects.length || busy}>백업 파일 받기 ↓</button>
                <label className="import-button">백업 불러오기<input type="file" accept="application/json,.json" onChange={importData} /></label>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
