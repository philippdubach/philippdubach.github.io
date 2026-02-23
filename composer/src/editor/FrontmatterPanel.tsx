import { useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import EssentialFields from './frontmatter/EssentialFields'
import SeoFields from './frontmatter/SeoFields'
import AdvancedFields from './frontmatter/AdvancedFields'
import TakeawaysEditor from './frontmatter/TakeawaysEditor'
import FaqEditor from './frontmatter/FaqEditor'

function Section({ title, defaultOpen, children }: { title: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="fm-section">
      <div className="fm-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={`fm-chevron ${open ? 'open' : ''}`}>&#9654;</span>
      </div>
      <div className={`fm-section-body-wrapper ${open ? 'open' : ''}`}>
        <div className="fm-section-body">{children}</div>
      </div>
    </div>
  )
}

export default function FrontmatterPanel() {
  const [collapsed, setCollapsed] = useState(true)
  const frontmatter = useEditorStore((s) => s.frontmatter)

  const filledSeoCount = [frontmatter.description, frontmatter.seoTitle, frontmatter.keywords.length > 0, frontmatter.images.length > 0].filter(Boolean).length
  const filledAdvCount = [frontmatter.external_url, frontmatter.doi, frontmatter.aliases.length > 0].filter(Boolean).length

  return (
    <div className="frontmatter-panel">
      <div
        className="fm-section-header"
        onClick={() => setCollapsed(!collapsed)}
        style={{ borderBottom: collapsed ? 'none' : undefined }}
      >
        <span>Frontmatter</span>
        <span className={`fm-chevron ${!collapsed ? 'open' : ''}`}>&#9654;</span>
      </div>
      {!collapsed && (
        <>
          <Section title="Essential" defaultOpen={true}>
            <EssentialFields />
          </Section>
          <Section title={`SEO & Metadata${filledSeoCount > 0 ? ` (${filledSeoCount})` : ''}`} defaultOpen={false}>
            <SeoFields />
          </Section>
          <Section title={`Advanced${filledAdvCount > 0 ? ` (${filledAdvCount})` : ''}`} defaultOpen={false}>
            <AdvancedFields />
          </Section>
          <Section title={`Takeaways (${frontmatter.takeaways.length})`} defaultOpen={false}>
            <TakeawaysEditor />
          </Section>
          <Section title={`FAQ (${frontmatter.faq.length})`} defaultOpen={false}>
            <FaqEditor />
          </Section>
        </>
      )}
    </div>
  )
}
