import type { CollectionConfig } from 'payload';

export const ParkComments: CollectionConfig = {
  slug: 'parkComments',
  admin: {
    useAsTitle: 'body'
  },
  access: {
    read: () => true
  },
  fields: [
    { name: 'park', type: 'relationship', relationTo: 'parks', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'body', type: 'textarea', required: true }
  ]
};
