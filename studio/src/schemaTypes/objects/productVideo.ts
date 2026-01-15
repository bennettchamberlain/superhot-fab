import {defineField, defineType} from 'sanity'

/**
 * Product Video schema
 * Video content for products (demo videos, tutorials, etc.)
 */
export const productVideo = defineType({
  name: 'productVideo',
  title: 'Product Video',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Video Title',
      type: 'string',
      description: 'Title or description of the video',
    }),
    defineField({
      name: 'videoType',
      title: 'Video Type',
      type: 'string',
      description: 'Source of the video',
      options: {
        list: [
          {title: 'Uploaded File', value: 'file'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'URL', value: 'url'},
        ],
        layout: 'radio',
      },
      initialValue: 'file',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File',
      type: 'file',
      description: 'Upload video file (MP4, WebM, etc.)',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) => parent?.videoType !== 'file',
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube Video ID',
      type: 'string',
      description: 'YouTube video ID (from the URL: youtube.com/watch?v=VIDEO_ID)',
      hidden: ({parent}) => parent?.videoType !== 'youtube',
      validation: (rule) =>
        rule.custom((value, context: any) => {
          if (context.parent?.videoType === 'youtube' && !value) {
            return 'YouTube ID is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'vimeoId',
      title: 'Vimeo Video ID',
      type: 'string',
      description: 'Vimeo video ID (from the URL: vimeo.com/VIDEO_ID)',
      hidden: ({parent}) => parent?.videoType !== 'vimeo',
      validation: (rule) =>
        rule.custom((value, context: any) => {
          if (context.parent?.videoType === 'vimeo' && !value) {
            return 'Vimeo ID is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Direct URL to video file',
      hidden: ({parent}) => parent?.videoType !== 'url',
      validation: (rule) =>
        rule.custom((value, context: any) => {
          if (context.parent?.videoType === 'url' && !value) {
            return 'Video URL is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      description: 'Custom thumbnail image (optional)',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Video duration in seconds',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'isPrimary',
      title: 'Primary Video',
      type: 'boolean',
      description: 'Main product video (shown first)',
      initialValue: false,
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      description: 'Automatically play video when page loads',
      initialValue: false,
    }),
    defineField({
      name: 'loop',
      title: 'Loop',
      type: 'boolean',
      description: 'Loop video playback',
      initialValue: false,
    }),
    defineField({
      name: 'muted',
      title: 'Muted',
      type: 'boolean',
      description: 'Play video muted by default',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which to display this video',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      videoType: 'videoType',
      youtubeId: 'youtubeId',
      vimeoId: 'vimeoId',
      thumbnail: 'thumbnail',
      primary: 'isPrimary',
    },
    prepare({title, videoType, youtubeId, vimeoId, thumbnail, primary}) {
      const prefix = primary ? '⭐ ' : ''
      let subtitle = videoType || 'Unknown'
      if (videoType === 'youtube' && youtubeId) {
        subtitle = `YouTube: ${youtubeId}`
      } else if (videoType === 'vimeo' && vimeoId) {
        subtitle = `Vimeo: ${vimeoId}`
      }
      return {
        title: `${prefix}${title || 'Untitled Video'}`,
        subtitle,
        media: thumbnail,
      }
    },
  },
})
