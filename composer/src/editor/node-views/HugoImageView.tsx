import { NodeViewWrapper } from '@tiptap/react'

const STATIC_BASE = 'https://static.philippdubach.com'

export default function HugoImageView({ node, updateAttributes, selected }: any) {
  const { src, alt, width } = node.attrs
  const fullSrc = src.startsWith('http') ? src : `${STATIC_BASE}/${src}`

  return (
    <NodeViewWrapper className={`hugo-node hugo-image-node ${selected ? 'selected' : ''}`}>
      <div className="hugo-node-label">img shortcode</div>
      <div style={{ maxWidth: width, margin: '0 auto' }}>
        <img
          src={fullSrc}
          alt={alt}
          style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <div className="hugo-node-attrs">
        <input
          type="text"
          value={src}
          onChange={(e) => updateAttributes({ src: e.target.value })}
          placeholder="Image path or URL"
          className="hugo-node-input"
        />
        <input
          type="text"
          value={alt}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder="Alt text"
          className="hugo-node-input"
        />
        <input
          type="text"
          value={width}
          onChange={(e) => updateAttributes({ width: e.target.value })}
          placeholder="Width (e.g. 80%)"
          className="hugo-node-input"
          style={{ width: 80 }}
        />
      </div>
    </NodeViewWrapper>
  )
}
