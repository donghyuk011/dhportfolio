import { profile } from "../data/profile";
import SectionLabel from "../components/SectionLabel";
import Reveal from "../components/Reveal";
export default function Experience() {
  return (
    <section id="experience" className="section experience-section">
      <SectionLabel number="03">경험 / 기술</SectionLabel>
      <Reveal className="experience-content">
        <h2>
          원리를 이해하고,
          <br />
          <span>직접 부딫혀 증명합니다.</span>
        </h2>
        {profile.experienceIsSample && (
          <p className="sample-label">
            예시 경력 · profile.js에서 실제 내용으로 바꿔주세요
          </p>
        )}
        <div className="experience-list">
          {profile.experience.map((item) => (
            <div className="experience-row" key={`${item.period}-${item.role}`}>
              <span>{item.period}</span>
              <div>
                <h3>{item.role}</h3>
                <p>{item.company}</p>
                <p className="experience-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="skills">
          <h3>사용 도구</h3>
          <ul>
            {profile.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
