import { Brain, Droplets, FileText, Pill, ScanLine, Waves, Bone } from 'lucide-react'

/** Icon per `reportType` enum, falling back to a generic document. */
const BY_TYPE = {
  'Blood Test': Droplets,
  MRI: Brain,
  'X-Ray': Bone,
  'CT-Scan': ScanLine,
  Ultrasound: Waves,
  Prescription: Pill,
  Other: FileText,
}

export function reportIcon(reportType) {
  return BY_TYPE[reportType] ?? FileText
}

/** Tone per report type, used for the icon chip so lists scan quickly. */
const TONE_BY_TYPE = {
  'Blood Test': 'bg-rose-500/12 text-rose-300 ring-rose-500/25',
  MRI: 'bg-royal-500/12 text-royal-400 ring-royal-500/25',
  'X-Ray': 'bg-amber-400/12 text-amber-300 ring-amber-400/25',
  'CT-Scan': 'bg-brand-400/12 text-brand-200 ring-brand-400/25',
  Ultrasound: 'bg-mint-400/12 text-mint-300 ring-mint-400/25',
  Prescription: 'bg-violet-500/12 text-violet-300 ring-violet-500/25',
  Other: 'bg-white/6 text-slate-300 ring-white/10',
}

export function reportTone(reportType) {
  return TONE_BY_TYPE[reportType] ?? TONE_BY_TYPE.Other
}
