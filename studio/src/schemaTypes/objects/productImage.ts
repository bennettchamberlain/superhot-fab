import {defineField, defineType} from 'sanity'

/**
 * Product Image schema
 * Enhanced image object for product galleries
 */
export const productImage = defineType({
  name: 'productImage',
  title: 'Product Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      validation: (rule) => rule.required(),
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.image as any)?.asset?._ref && !alt) {
                return 'Alt text is required'
              }
              return true
            })
          },
        },
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display with the image',
    }),
    defineField({
      name: 'isPrimary',
      title: 'Primary Image',
      type: 'boolean',
      description: 'Main product image (shown first)',
      initialValue: false,
    }),
    defineField({
      name: 'isThumbnail',
      title: 'Use as Thumbnail',
      type: 'boolean',
      description: 'Use this image as the product thumbnail',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which to display this image (lower numbers first)',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
    defineField({
      name: 'variant',
      title: 'Variant Association',
      type: 'string',
      description: 'Optional: Associate this image with a specific variant SKU',
    }),
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption',
      primary: 'isPrimary',
      order: 'order',
    },
    prepare({media, caption, primary, order}) {
      const prefix = primary ? '⭐ ' : ''
      return {
        title: `${prefix}Image ${order !== undefined ? `#${order}` : ''}`,
        subtitle: caption || 'No caption',
        media,
      }
    },
  },
})
