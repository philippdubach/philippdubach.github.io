import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import HugoReadnextView from '../node-views/HugoReadnextView'

export const HugoReadnext = Node.create({
  name: 'hugoReadnext',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      slug: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'hugo-readnext' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hugo-readnext', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HugoReadnextView)
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`{{< readnext slug="${node.attrs.slug}" >}}`)
          state.closeBlock(node)
        },
        parse: {},
      },
    }
  },
})
