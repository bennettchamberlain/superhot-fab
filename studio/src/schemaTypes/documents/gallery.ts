import {ImagesIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Gallery schema for mosaic-style image/video galleries
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
      description: 'URL-friendly identifier for this gallery',
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
      description: 'Optional description for the gallery',
    }),
    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      of: [{type: 'galleryItem'}],
      description: 'Drag and drop to reorder gallery items',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          {title: 'Masonry (Pinterest-style)', value: 'masonry'},
          {title: 'Grid (Equal height)', value: 'grid'},
          {title: 'Justified (Equal height rows)', value: 'justified'},
        ],
        layout: 'radio',
      },
      initialValue: 'masonry',
    }),
    defineField({
      name: 'columns',
      title: 'Number of Columns',
      type: 'number',
      description: 'Desktop columns (responsive on mobile)',
      options: {
        list: [2, 3, 4, 5],
      },
      initialValue: 3,
      validation: (rule) => rule.required().min(2).max(5),
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Display this gallery on the homepage',
      initialValue: false,
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
      items: 'items',
      media: 'items.0.image',
    },
    prepare({title, items, media}) {
      const itemCount = items?.length || 0
      return {
        title,
        subtitle: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
        media,
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
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})
