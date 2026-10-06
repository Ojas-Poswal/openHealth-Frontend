import Badge from '../ui/Badge.jsx'
import { CASE_STATUS } from '../../utils/constants.js'

/** Status pill for a medical case (active / resolved). */
export default function CaseStatusBadge({ status, size = 'md' }) {
  const meta = CASE_STATUS[status] ?? CASE_STATUS.active
  return (
    <Badge tone="neutral" size={size} className={meta.className} dot dotClass={meta.dot}>
      {meta.label}
    </Badge>
  )
}
