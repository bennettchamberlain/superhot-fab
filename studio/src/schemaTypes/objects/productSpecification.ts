import {defineField, defineType} from 'sanity'

/**
 * Product Specification schema
 * Technical specifications and details
 */
export const productSpecification = defineType({
  name: 'productSpecification',
  title: 'Product Specification',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Specification Name',
      type: 'string',
      description: 'e.g., "Material", "Dimensions", "Warranty"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Specification Value',
      type: 'string',
      description: 'The value of this specification',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
      description: 'Optional unit of measurement (e.g., "inches", "lbs", "watts")',
    }),
    defineField({
      name: 'group',
      title: 'Specification Group',
      type: 'string',
      description: 'Group this spec with others (e.g., "Dimensions", "Performance", "Materials")',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the group',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      value: 'value',
      unit: 'unit',
      group: 'group',
    },
    prepare({name, value, unit, group}) {
      const displayValue = unit ? `${value} ${unit}` : value
      return {
        title: `${name}: ${displayValue}`,
        subtitle: group || 'No group',
      }
    },
  },
})
