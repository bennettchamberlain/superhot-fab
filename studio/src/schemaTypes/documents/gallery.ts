import {ImagesIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Gallery — a named collection of media items (images + videos).
 * Drag to reorder. Click any item to rename, swap media, or add a description.
 */
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  icon: ImagesIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Gallery Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Gallery Description',
      type: 'text',
      description: 'Optional — shown at the top of the gallery page',
    }),

    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{type: 'galleryItem'}],
      description: 'Drop images and videos here. Drag to reorder. Click any item to edit.',
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'media',
      firstImage: 'media.0.image',
    },
    prepare({title, media, firstImage}) {
      const count = media?.length ?? 0
      return {
        title,
        subtitle: `${count} item${count !== 1 ? 's' : ''}`,
        media: firstImage,
      }
    },
  },

  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})
