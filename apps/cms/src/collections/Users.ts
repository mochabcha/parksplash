import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: true,
    forgotPassword: {
      generateEmailHTML: ({ token }) =>
        `<p>Reset your parksplash password.</p><p>Token: ${token}</p>`
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
