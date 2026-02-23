import { NodeViewWrapper } from '@tiptap/react'

export default function HugoNewsletterView({ selected }: any) {
  return (
    <NodeViewWrapper className={`hugo-node hugo-newsletter-node ${selected ? 'selected' : ''}`}>
      <div className="hugo-node-label">newsletter</div>
      <div className="hugo-node-body">Newsletter signup form</div>
    </NodeViewWrapper>
  )
}
