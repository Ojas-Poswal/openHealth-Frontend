import { useState } from 'react'
import { ExternalLink, FileWarning, Pencil, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { reportIcon, reportTone } from './reportIcon.js'
import { formatDateTime, isImageFile } from '../../utils/format.js'

/**
 * A single uploaded report. Owns its own preview toggle so a long list of
 * reports stays compact until the patient wants to look at one.
 *
 * `fileType` is what the backend stored at upload time, so it decides
 * image-vs-PDF — sniffing the URL only as a fallback for older records.
 */
export default function ReportCard({
  report,
  notes = [],
  onEdit,
  onDelete,
  noteSlot,
  canManage = false,
  className = '',
}) {
  const [previewing, setPreviewing] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  const Icon = reportIcon(report.reportType)
  const tone = reportTone(report.reportType)
  const isImage = report.fileType ? report.fileType !== 'pdf' : isImageFile(report.fileUrl)

  const togglePreview = () => {
    setPreviewFailed(false)
    setPreviewing((value) => !value)
  }

  return (
    <div className={`surface-soft overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tone}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <h4 className="truncate font-semibold text-white">{report.reportName}</h4>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone="neutral" size="sm">
                {report.reportType}
              </Badge>
              <Badge tone={report.uploadedByType === 'Doctor' ? 'royal' : 'brand'} size="sm">
                Added by {report.uploadedByType}
              </Badge>
              <span className="text-xs text-slate-500">
                {formatDateTime(report.createdAt || report.uploadedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {report.fileUrl && (
            <Button variant="ghost" size="sm" onClick={togglePreview}>
              {previewing ? 'Hide' : 'Preview'}
            </Button>
          )}
          {report.fileUrl && (
            <a href={report.fileUrl} target="_blank" rel="noreferrer noopener">
              <Button variant="secondary" size="sm" icon={ExternalLink}>
                Open
              </Button>
            </a>
          )}
          {canManage && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              icon={Pencil}
              onClick={() => onEdit(report)}
              aria-label={`Edit ${report.reportName}`}
              title="Edit this report, including replacing the file"
            >
              Edit
            </Button>
          )}
          {canManage && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(report)}
              aria-label={`Delete ${report.reportName}`}
              title="Delete report"
              className="text-slate-400 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {previewing && (
        <div className="border-t border-ink-600/50 bg-ink-900/60 p-4">
          {!report.fileUrl ? (
            <p className="py-6 text-center text-sm text-slate-500">No file attached to this record.</p>
          ) : previewFailed ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <FileWarning className="h-6 w-6 text-amber-300" aria-hidden="true" />
              <p className="text-sm text-slate-400">
                This file could not be loaded. It may need uploading again.
              </p>
              {canManage && onEdit && (
                <Button variant="secondary" size="sm" icon={Pencil} onClick={() => onEdit(report)}>
                  Replace the file
                </Button>
              )}
            </div>
          ) : isImage ? (
            <img
              src={report.fileUrl}
              alt={report.reportName}
              onError={() => setPreviewFailed(true)}
              className="mx-auto max-h-[28rem] w-auto rounded-xl ring-1 ring-inset ring-white/10"
              loading="lazy"
            />
          ) : (
            <object
              data={`${report.fileUrl}#toolbar=0&view=FitH`}
              type="application/pdf"
              onError={() => setPreviewFailed(true)}
              className="h-[28rem] w-full rounded-xl bg-white/5"
              aria-label={`Preview of ${report.reportName}`}
            >
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <FileWarning className="h-6 w-6 text-amber-300" aria-hidden="true" />
                <p className="text-sm text-slate-400">
                  This browser cannot show PDFs inline. Open it to read it.
                </p>
                <a href={report.fileUrl} target="_blank" rel="noreferrer noopener">
                  <Button variant="secondary" size="sm" icon={ExternalLink}>
                    Open the PDF
                  </Button>
                </a>
              </div>
            </object>
          )}
        </div>
      )}

      {noteSlot}
    </div>
  )
}
