import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import HugoNewsletterView from '../node-views/HugoNewsletterView'

export const HugoNewsletter = Node.create({
  name: 'hugoNewsletter',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'hugo-newsletter' }]
  },

  renderHTML() {
    return ['hugo-newsletter']
  },

  addNodeView() {
    return ReactNodeViewRenderer(HugoNewsletterView)
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any) {
          state.write('{{< newsletter >}}')
          state.closeBlock(state.node || { type: { name: 'hugoNewsletter' } })
        },
        parse: {},
      },
    }
  },
})
