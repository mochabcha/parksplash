import type { CollectionConfig } from 'payload';

export const Parks: CollectionConfig = {
  slug: 'parks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'address', 'hasPool', 'hasSplashPad']
  },
  versions: {
    drafts: true
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'address', type: 'text', required: true },
    { name: 'hours', type: 'text' },
    { name: 'mapQuery', type: 'text', required: true },
    { name: 'detailUrl', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number', required: true },
        { name: 'longitude', type: 'number', required: true }
      ]
    },
    {
      name: 'geoOverride',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'label', type: 'text' }
      ]
    },
    {
      name: 'geocodeSource',
      type: 'select',
      defaultValue: 'import',
      options: ['import', 'override']
    },
    {
      name: 'coolDownCategory',
      type: 'select',
      defaultValue: 'none',
      options: ['none', 'pool', 'splash-pad', 'both']
    },
    { name: 'hasPool', type: 'checkbox', defaultValue: false },
    { name: 'hasSplashPad', type: 'checkbox', defaultValue: false },
    {
      name: 'amenityRefs',
      type: 'relationship',
      relationTo: 'amenities',
      hasMany: true
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media'
    },
    {
      name: 'amenityKeys',
      type: 'array',
      fields: [{ name: 'key', type: 'text', required: true }]
    },
    {
      name: 'poolOverlay',
      type: 'json'
    },
    {
      name: 'facilityDetails',
      type: 'group',
      fields: [
        { name: 'poolDepthRanges', type: 'text' },
        { name: 'kidFriendlyNotes', type: 'textarea' },
        {
          name: 'accessibilityFeatures',
          type: 'array',
          fields: [{ name: 'feature', type: 'text', required: true }]
        },
        { name: 'accessibleRamp', type: 'checkbox', defaultValue: false },
        { name: 'hasLifeguards', type: 'checkbox', defaultValue: false }
      ]
    }
  ]
};
