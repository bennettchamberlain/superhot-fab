import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const musicPlaylist = defineType({
  name: 'musicPlaylist',
  title: 'Music Playlist',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Playlist Name',
      type: 'string',
      initialValue: 'Site Playlist',
    }),
    defineField({
      name: 'tracks',
      title: 'Tracks',
      description:
        'Drag MP3s straight onto this field — bulk drop is supported. Track titles are taken from the filename automatically.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'file',
          options: {
            accept: 'audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/*',
            storeOriginalFilename: true,
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'Music Playlist', media: PlayIcon}
    },
  },
})
