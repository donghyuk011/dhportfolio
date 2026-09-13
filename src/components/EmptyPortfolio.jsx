import { useProjects } from "../context/ProjectsContext";

export default function EmptyPortfolio({ compact = false }) {
  const { openManager } = useProjects();
  if (compact) {
    return (
      <div className="empty-work-list">
        <span className="empty-index">00</span>
        <div><h3>아직 업로드된 작품이 없습니다.</h3><p>첫 작품을 추가하면 이곳에 프로젝트 목록과 상세 페이지가 자동으로 만들어집니다.</p></div>
        <button className="pill pill-primary" onClick={openManager}>첫 작품 업로드</button>
      </div>
    );
  }
  return (
    <div className="empty-carousel" role="region" aria-label="아직 업로드된 작품이 없습니다">
      <div className="empty-orbit" aria-hidden="true">
        {[-72, -36, 0, 36, 72].map((angle, index) => <span key={angle} style={{ "--empty-angle": `${angle}deg`, "--empty-index": index }}><i /></span>)}
      </div>
      <div className="empty-carousel-card">
        <span>작품 준비 중</span>
        <h2>아직 업로드된<br />작품이 없습니다.</h2>
        <p>작품을 추가하면 3D 공간에 카드가 나타납니다.</p>
        <button className="pill pill-primary" onClick={openManager}>작품 업로드 ＋</button>
      </div>
    </div>
  );
}
