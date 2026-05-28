import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: true,
    forgotPassword: {
      generateEmailHTML: (args) =>
        `<p>Reset your parksplash password.</p><p>Token: ${args?.token ?? ''}</p>`
    }
  },
  admin: {
    useAsTitle: 'email'
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true
    },
    {
      name: 'locationConsent',
      type: 'select',
      defaultValue: 'unknown',
      options: ['unknown', 'granted', 'denied']
    },
    {
      name: 'donationGateUnlocked',
      type: 'checkbox',
      defaultValue: false
    }
  ]
};
