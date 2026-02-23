import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import HugoDisclaimerView from '../node-views/HugoDisclaimerView'

export const HugoDisclaimer = Node.create({
  name: 'hugoDisclaimer',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: { default: 'finance' },
    }
  },

  parseHTML() {
    return [{ tag: 'hugo-disclaimer' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hugo-disclaimer', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HugoDisclaimerView)
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`{{< disclaimer type="${node.attrs.type}" >}}`)
          state.closeBlock(node)
        },
        parse: {},
      },
    }
  },
})
