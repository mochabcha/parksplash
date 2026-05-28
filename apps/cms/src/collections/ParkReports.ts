import type { CollectionConfig } from 'payload';

export const ParkReports: CollectionConfig = {
  slug: 'parkReports',
  admin: {
    useAsTitle: 'reportType'
  },
  access: {
    read: () => true
  },
  fields: [
    { name: 'park', type: 'relationship', relationTo: 'parks', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'reportType', type: 'text', required: true },
    { name: 'cleanlinessFacility', type: 'text' },
    { name: 'cleanlinessRating', type: 'text' },
    { name: 'safetyConcern', type: 'text' },
    { name: 'weatherIssue', type: 'text' },
    { name: 'crowdednessLevel', type: 'text' },
    { name: 'staffSupportSignal', type: 'text' },
    { name: 'kidFriendlySignal', type: 'text' },
    { name: 'submittedWeather', type: 'text' },
    { name: 'note', type: 'textarea' }
  ]
};
