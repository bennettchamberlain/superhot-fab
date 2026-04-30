import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * A single piece of media — image or video.
 * Auto-named on creation, renameable, swappable, with optional description.
 */
export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Media Item',
  icon: ImageIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Auto-generated from filename — rename it here if you like',
    }),

    defineField({
      name: 'mediaType',
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
        storeOriginalFilename: true,
      },
      hidden: ({parent}) => parent?.mediaType !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as any)?.mediaType === 'image' && !value?.asset) {
            return 'Please upload an image'
          }
          return true
        }),
    }),

    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {accept: 'video/*'},
      hidden: ({parent}) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as any)?.mediaType === 'video' && !value?.asset) {
            return 'Please upload a video'
          }
          return true
        }),
    }),

    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional cover image shown before the video plays',
      hidden: ({parent}) => parent?.mediaType !== 'video',
    }),

    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{type: 'project'}],
      description: 'Optional — groups this item with other images from the same project in the lightbox',
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional — shown in the lightbox',
    }),
  ],

  // Auto-set name from uploaded asset filename on create
  preview: {
    select: {
      name: 'name',
      mediaType: 'mediaType',
      image: 'image',
      videoThumbnail: 'videoThumbnail',
    },
    prepare({name, mediaType, image, videoThumbnail}) {
      const media = mediaType === 'video' ? videoThumbnail ?? image : image
      const icon = mediaType === 'video' ? '🎥' : '🖼'
      return {
        title: name || 'Untitled',
        subtitle: `${icon} ${mediaType ?? 'image'}`,
        media,
      }
    },
  },
})
