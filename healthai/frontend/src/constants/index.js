export const DOMAINS = [
  'Cardiology',
  'Radiology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Biomedical Engineering',
  'Dermatology',
  'Ophthalmology',
  'Pathology',
  'Pharmacology',
  'Psychiatry',
  'Pulmonology',
  'Genomics',
  'Public Health',
  'Other',
]

export const CITIES = [
  'Ankara',
  'Istanbul',
  'Izmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Gaziantep',
  'Konya',
  'Eskişehir',
  'Kayseri',
  'Other',
]

export const PROJECT_STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'research', label: 'Research' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'clinical_trial', label: 'Clinical Trial' },
]

export const CONFIDENTIALITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'nda', label: 'NDA Required' },
]

export const USER_ROLES = [
  { value: 'engineer', label: 'Engineer' },
  { value: 'healthcare_professional', label: 'Healthcare Professional' },
]

export const POST_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  meeting_scheduled: { label: 'Meeting Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  partner_found: { label: 'Partner Found', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}
