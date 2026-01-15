import {defineField, defineType} from 'sanity'

/**
 * Product Review schema
 * Customer reviews and ratings for products
 */
export const productReview = defineType({
  name: 'productReview',
  title: 'Product Review',
  type: 'object',
  fields: [
    defineField({
      name: 'author',
      title: 'Review Author',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: (rule) => rule.required(),
        },
        {
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (rule) => rule.email(),
        },
        {
          name: 'verifiedPurchase',
          title: 'Verified Purchase',
          type: 'boolean',
          description: 'Customer verified to have purchased this product',
          initialValue: false,
        },
        {
          name: 'location',
          title: 'Location',
          type: 'string',
          description: 'Optional location (city, state, country)',
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Rating from 1 to 5 stars',
      validation: (rule) => rule.required().min(1).max(5).integer(),
      options: {
        list: [
          {title: '1 Star', value: 1},
          {title: '2 Stars', value: 2},
          {title: '3 Stars', value: 3},
          {title: '4 Stars', value: 4},
          {title: '5 Stars', value: 5},
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      description: 'Short summary of the review',
    }),
    defineField({
      name: 'content',
      title: 'Review Content',
      type: 'text',
      description: 'Full review text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pros',
      title: 'Pros',
      type: 'array',
      description: 'What the customer liked',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      type: 'array',
      description: 'What the customer didn\'t like',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'images',
      title: 'Review Images',
      type: 'array',
      description: 'Images uploaded by the reviewer',
      of: [
        {
          type: 'image',
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
        },
      ],
    }),
    defineField({
      name: 'date',
      title: 'Review Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'helpful',
      title: 'Helpful Count',
      type: 'number',
      description: 'Number of people who found this review helpful',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'isApproved',
      title: 'Approved',
      type: 'boolean',
      description: 'Whether this review has been approved and should be displayed',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Review',
      type: 'boolean',
      description: 'Show this review prominently',
      initialValue: false,
    }),
    defineField({
      name: 'response',
      title: 'Merchant Response',
      type: 'object',
      description: 'Response from the merchant/seller',
      fields: [
        {
          name: 'content',
          title: 'Response Content',
          type: 'text',
        },
        {
          name: 'date',
          title: 'Response Date',
          type: 'datetime',
        },
        {
          name: 'author',
          title: 'Response Author',
          type: 'string',
          description: 'Name of person responding',
        },
      ],
    }),
  ],
  preview: {
    select: {
      author: 'author.name',
      rating: 'rating',
      title: 'title',
      date: 'date',
      approved: 'isApproved',
    },
    prepare({author, rating, title, date, approved}) {
      const stars = '⭐'.repeat(rating || 0)
      const status = approved ? '✓' : '⏳'
      return {
        title: `${status} ${stars} ${author || 'Anonymous'}`,
        subtitle: title || (date ? new Date(date).toLocaleDateString() : 'No title'),
      }
    },
  },
})
