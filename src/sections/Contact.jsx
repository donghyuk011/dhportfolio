import { profile } from "../data/profile";
import SectionLabel from "../components/SectionLabel";
import Arrow from "../components/Arrow";
import Reveal from "../components/Reveal";
export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <SectionLabel number="04">연락처</SectionLabel>
      <Reveal className="contact-content">
        <p>연락 정보</p>
        <h2>
          {profile.fullName}
        </h2>
        <div className="contact-links">
          <div className="contact-person"><span>이름</span><strong>{profile.fullName}</strong></div>
          <div className="contact-methods"><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<Arrow /></a><a href={`tel:${profile.phone.replace(/-/g, "")}`}>{profile.phone}<Arrow /></a></div>
        </div>
      </Reveal>
    </section>
  );
}
