import { profile } from "../data/profile";
import SectionLabel from "../components/SectionLabel";
import Reveal from "../components/Reveal";
export default function About() {
  return (
    <section id="about" className="section about-section">
      <SectionLabel number="01">소개</SectionLabel>
      <Reveal className="about-content">
        <h2>{profile.introduction}</h2>
        <div className="about-bottom">
          <p>{profile.about}</p>
          <div className="about-disciplines">
            <span>{profile.location} ↗</span>
            {profile.disciplines.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
