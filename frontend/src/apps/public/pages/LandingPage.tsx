import { HeroSection } from '../components/HeroSection'
import { AboutSection } from '../components/AboutSection'
import { SkillsSection } from '../components/SkillsSection'
import { ProjectsSection } from '../components/ProjectsSection'
import { EducationSection } from '../components/EducationSection'
import { ExperienceSection } from '../components/ExperienceSection'
import { CertificatesSection } from '../components/CertificatesSection'
import { BlogSection } from '../components/BlogSection'
import { ResumeSection } from '../components/ResumeSection'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { ContactSection } from '../components/ContactSection'
import { SEO } from '../components/SEO'

export default function LandingPage() {
  return (
    <>
      <SEO />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <EducationSection />
      <ExperienceSection />
      <CertificatesSection />
      <BlogSection />
      <ResumeSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  )
}
