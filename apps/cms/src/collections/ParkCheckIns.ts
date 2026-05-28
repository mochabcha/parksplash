import type { CollectionConfig } from 'payload';

export const ParkCheckIns: CollectionConfig = {
  slug: 'parkCheckIns',
  admin: {
    useAsTitle: 'createdAt'
  },
  access: {
    read: () => true
  },
  fields: [
    { name: 'park', type: 'relationship', relationTo: 'parks', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'note', type: 'textarea' },
    { name: 'active', type: 'checkbox', defaultValue: true }
  ]
};
