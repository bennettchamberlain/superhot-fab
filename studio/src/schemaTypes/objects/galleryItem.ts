import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Gallery item object for individual images/videos
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
          {title: 'Image', value: 'image'},
          {title: 'Video', value: 'video'},
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
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility',
        },
      ],
      hidden: ({parent}) => parent?.type === 'video',
      validation: (rule) =>
        rule.custom((image, context) => {
          const type = (context.parent as any)?.type
          if (type === 'image' && !image) {
            return 'Image is required when type is "image"'
          }
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) => parent?.type === 'image',
      validation: (rule) =>
        rule.custom((video, context) => {
          const type = (context.parent as any)?.type
          if (type === 'video' && !video) {
            return 'Video is required when type is "video"'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      description: 'Optional custom thumbnail for video (auto-generated if not provided)',
      options: {
        hotspot: true,
      },
      hidden: ({parent}) => parent?.type === 'image',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title shown in lightbox',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Description shown in lightbox',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      description: 'Tags for filtering and categorization',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Mark as featured item (larger display)',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      image: 'image',
      videoThumbnail: 'videoThumbnail',
    },
    prepare({title, type, image, videoThumbnail}) {
      const media = type === 'video' ? videoThumbnail || image : image
      const typeLabel = type === 'video' ? '🎥' : '🖼️'
      return {
        title: title || 'Untitled',
        subtitle: `${typeLabel} ${type}`,
        media,
      }
    },
  },
})
