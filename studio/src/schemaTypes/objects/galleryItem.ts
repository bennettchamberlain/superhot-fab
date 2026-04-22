import {ImageIcon, PlayIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Gallery item object — drag & drop reorderable, supports images and videos.
 * Each item has optional title, description, tags, and a mosaic size for layout control.
 */
export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  icon: ImageIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: '🖼  Image', value: 'image'},
          {title: '🎥  Video', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {imageDescriptionField: 'alt'},
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for accessibility and SEO',
        },
      ],
      hidden: ({parent}) => parent?.type === 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as any)?.type === 'image' && !value) {
            return 'An image file is required'
          }
          return true
        }),
    }),

    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {accept: 'video/*'},
      hidden: ({parent}) => parent?.type === 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as any)?.type === 'video' && !value) {
            return 'A video file is required'
          }
          return true
        }),
    }),

    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      description: 'Cover image shown before the video plays',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.type === 'image',
    }),

    // ── Mosaic size ──────────────────────────────────────────────────────────
    defineField({
      name: 'size',
      title: 'Mosaic Size',
      type: 'string',
      description: 'Controls how much space this item takes in the mosaic layout',
      options: {
        list: [
          {title: 'Small  (1×1)', value: 'small'},
          {title: 'Medium (1×2 tall)', value: 'medium'},
          {title: 'Wide   (2×1)', value: 'wide'},
          {title: 'Large  (2×2)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'small',
    }),

    // ── Optional details (shown in lightbox) ─────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional — shown in the lightbox',
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Optional — shown in the lightbox when you click into an item',
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Optional labels for categorisation',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      type: 'type',
      size: 'size',
      image: 'image',
      videoThumbnail: 'videoThumbnail',
    },
    prepare({title, type, size, image, videoThumbnail}) {
      const media = type === 'video' ? videoThumbnail ?? image : image
      const icon = type === 'video' ? '🎥' : '🖼'
      const sizeLabel = size ? ` · ${size}` : ''
      return {
        title: title || 'Untitled',
        subtitle: `${icon} ${type}${sizeLabel}`,
        media,
      }
    },
  },
})
