import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import HugoImageView from '../node-views/HugoImageView'

export const HugoImage = Node.create({
  name: 'hugoImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      width: { default: '80%' },
    }
  },

  parseHTML() {
    return [{ tag: 'hugo-img' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hugo-img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HugoImageView)
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const parts = []
          if (node.attrs.src) parts.push(`src="${node.attrs.src}"`)
          if (node.attrs.alt) parts.push(`alt="${node.attrs.alt}"`)
          if (node.attrs.width && node.attrs.width !== '80%') parts.push(`width="${node.attrs.width}"`)
          state.write(`{{< img ${parts.join(' ')} >}}`)
          state.closeBlock(node)
        },
        parse: {},
      },
    }
  },
})
