import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'processStep',
  title: 'Process Step',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Display order (1 = first)',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
      rows: 6,
      description: 'Use \\n for line breaks',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'Upload an mp4/mov video for this step',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'image',
      title: 'Image (optional, shown instead of video)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }) {
      return { title: `${order}. ${title}` }
    },
  },
})
