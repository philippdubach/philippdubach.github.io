import { NodeViewWrapper } from '@tiptap/react'

export default function HugoReadnextView({ node, updateAttributes, selected }: any) {
  const { slug } = node.attrs

  return (
    <NodeViewWrapper className={`hugo-node hugo-readnext-node ${selected ? 'selected' : ''}`}>
      <div className="hugo-node-label">readnext</div>
      <div className="hugo-node-body">
        Related: <code>/posts/{slug}/</code>
      </div>
      <input
        type="text"
        value={slug}
        onChange={(e) => updateAttributes({ slug: e.target.value })}
        placeholder="Post slug"
        className="hugo-node-input"
      />
    </NodeViewWrapper>
  )
}
