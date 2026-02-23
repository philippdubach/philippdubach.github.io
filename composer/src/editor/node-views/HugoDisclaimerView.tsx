import { NodeViewWrapper } from '@tiptap/react'

const DISCLAIMER_LABELS: Record<string, string> = {
  finance: 'Financial Disclaimer',
  medical: 'Medical Disclaimer',
  ai: 'AI Disclaimer',
  research: 'Research Disclaimer',
  gambling: 'Gambling Disclaimer',
  general: 'General Disclaimer',
}

export default function HugoDisclaimerView({ node, updateAttributes, selected }: any) {
  const { type } = node.attrs

  return (
    <NodeViewWrapper className={`hugo-node hugo-disclaimer-node ${selected ? 'selected' : ''}`}>
      <div className="hugo-node-label">disclaimer</div>
      <div className="hugo-node-body">
        {DISCLAIMER_LABELS[type] || `Disclaimer (${type})`}
      </div>
      <select
        value={type}
        onChange={(e) => updateAttributes({ type: e.target.value })}
        className="hugo-node-select"
      >
        {Object.entries(DISCLAIMER_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </NodeViewWrapper>
  )
}
