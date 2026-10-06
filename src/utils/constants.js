/** Enumerations mirrored from the backend Mongoose schemas. */

export const CASE_STATUS = {
  active: {
    label: 'Active',
    className: 'bg-amber-400/12 text-amber-300 ring-1 ring-inset ring-amber-400/30',
    dot: 'bg-amber-300',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30',
    dot: 'bg-mint-400',
  },
}

export const CASE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
]

/** report.model.js — `reportType` enum. */
export const REPORT_TYPES = [
  'Blood Test',
  'MRI',
  'X-Ray',
  'CT-Scan',
  'Ultrasound',
  'Prescription',
  'Other',
]

export const REPORT_TYPE_OPTIONS = REPORT_TYPES.map((value) => ({ value, label: value }))

/** report.model.js — `fileType` enum, and what the Cloudinary upload accepts. */
export const ACCEPTED_FILE_TYPES = ['pdf', 'jpeg', 'jpg', 'png']
export const FILE_ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** patient.model.js — `gender` enum. */
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => ({
  value,
  label: value,
}))

/** auditLog.model.js — `action` enum. */
export const AUDIT_ACTIONS = {
  CONSENT_REQUESTED: {
    label: 'Consent requested',
    description: 'A doctor asked for access to this timeline.',
    tone: 'bg-royal-500/12 text-royal-400 ring-1 ring-inset ring-royal-500/30',
  },
  CONSENT_GRANTED: {
    label: 'Consent granted',
    description: 'An access request was confirmed with an OTP.',
    tone: 'bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30',
  },
  TIMELINE_VIEWED: {
    label: 'Timeline viewed',
    description: 'A doctor opened this timeline.',
    tone: 'bg-brand-400/12 text-brand-200 ring-1 ring-inset ring-brand-400/30',
  },
  SESSION_ENDED: {
    label: 'Session ended',
    description: 'The access session was closed.',
    tone: 'bg-slate-400/12 text-slate-300 ring-1 ring-inset ring-slate-400/30',
  },
}

/** deathCertificate.model.js — `status` enum. */
export const CERTIFICATE_STATUS = {
  PENDING: {
    label: 'Pending review',
    tone: 'bg-amber-400/12 text-amber-300 ring-1 ring-inset ring-amber-400/30',
  },
  APPROVED: {
    label: 'Approved',
    tone: 'bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30',
  },
  REJECTED: {
    label: 'Rejected',
    tone: 'bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  },
}

/**
 * digitalWill.controller.js seeds exactly these eight sections on create,
 * and `updateSection` looks them up by title — so the order and spelling
 * here must match the backend.
 */
export const WILL_SECTION_META = {
  'Personal Message': {
    icon: 'message',
    hint: 'Words you want your family to read first.',
  },
  'Important Documents': {
    icon: 'document',
    hint: 'Where original paperwork is kept, and any reference numbers.',
  },
  Insurance: { icon: 'shield', hint: 'Policies, policy numbers and claim contacts.' },
  'Emergency Contacts': { icon: 'phone', hint: 'Who to call, and in what order.' },
  'Bank Details': { icon: 'bank', hint: 'Accounts, nominees and branch details.' },
  Passwords: { icon: 'key', hint: 'Account recovery instructions and password hints.' },
  'Final Wishes': { icon: 'heart', hint: 'Instructions you want honoured.' },
  'Custom Notes': { icon: 'note', hint: 'Anything that does not fit above.' },
}

export const RELATIONSHIP_SUGGESTIONS = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Guardian',
  'Other',
]
