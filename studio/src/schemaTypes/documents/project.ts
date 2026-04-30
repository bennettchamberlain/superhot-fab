import {ProjectsIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * A fabrication project — groups related gallery items together.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  icon: ProjectsIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional — shown in the lightbox when browsing this project',
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional — used for future project thumbnail views',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'coverImage',
    },
    prepare({title, media}) {
      return {title, media}
    },
  },

  orderings: [
    {
      title: 'Name A–Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})
