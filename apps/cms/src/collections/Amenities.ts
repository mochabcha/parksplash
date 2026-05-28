import type { CollectionConfig } from 'payload';

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'label'
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'label', type: 'text', required: true },
    { name: 'sourceIconUrl', type: 'text' }
  ]
};
