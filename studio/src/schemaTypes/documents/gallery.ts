import {ImagesIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Gallery document — full-width mosaic gallery with drag-and-drop ordering.
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
      description: 'URL path for this gallery  (e.g. /gallery/my-gallery)',
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

    // ── Items — drag & drop ──────────────────────────────────────────────────
    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      of: [{type: 'galleryItem'}],
      description:
        'Drag items to reorder. Click any item to set its size, add a title, description, or tags.',
      validation: (rule) => rule.required().min(1),
    }),

    // ── Layout options ───────────────────────────────────────────────────────
    defineField({
      name: 'columns',
      title: 'Base Columns',
      type: 'number',
      description: 'Number of base columns in the mosaic grid (desktop)',
      options: {list: [2, 3, 4, 5]},
      initialValue: 3,
      validation: (rule) => rule.required().min(2).max(5),
    }),

    defineField({
      name: 'gap',
      title: 'Gap between items',
      type: 'string',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Small (4px)', value: 'small'},
          {title: 'Medium (8px)', value: 'medium'},
          {title: 'Large (16px)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'small',
    }),

    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
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
      const count = items?.length ?? 0
      return {
        title,
        subtitle: `${count} item${count !== 1 ? 's' : ''}`,
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
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})
