import type { CollectionConfig } from 'payload';

export const LoveOfferings: CollectionConfig = {
  slug: 'loveOfferings',
  admin: {
    useAsTitle: 'email'
  },
  access: {
    read: () => true
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'email', type: 'email', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'source', type: 'text', required: true },
    { name: 'park', type: 'relationship', relationTo: 'parks' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'paid', 'zero-choice', 'failed']
    },
    { name: 'stripeCheckoutSessionId', type: 'text' }
  ]
};
