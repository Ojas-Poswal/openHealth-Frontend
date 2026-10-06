import { useRef, useState } from 'react'
import { FileCheck2, UploadCloud, X } from 'lucide-react'
import Alert from './Alert.jsx'
import Meter from './Meter.jsx'
import { ACCEPTED_FILE_TYPES, FILE_ACCEPT_ATTR, MAX_UPLOAD_BYTES } from '../../utils/constants.js'

export function formatBytes(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Drag-and-drop file picker with client-side validation.
 *
 * The backend accepts pdf/jpeg/jpg/png on Cloudinary, so the same list is
 * enforced here — failing fast beats a 500 after an upload round-trip.
 */
export default function FileDropzone({
  id = 'file',
  value,
  onChange,
  label = 'File',
  hint,
  progress = null,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)

  const validate = (file) => {
    if (!file) return 'No file selected.'
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_FILE_TYPES.includes(extension)) {
      return `Unsupported file type “.${extension}”. Upload a PDF, JPG or PNG.`
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`
    }
    return null
  }

  const accept = (file) => {
    const message = validate(file)
    setError(message)
    onChange(message ? null : file)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    accept(event.dataTransfer.files?.[0])
  }

  const clear = () => {
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <span className="label-base">{label}</span>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed p-5 text-center transition ${
          dragging
            ? 'border-brand-400/70 bg-brand-400/10'
            : error
              ? 'border-rose-500/50 bg-rose-500/5'
              : 'border-ink-600 bg-ink-900/50 hover:border-brand-400/40'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={FILE_ACCEPT_ATTR}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => accept(event.target.files?.[0])}
        />

        {value ? (
          <div className="flex items-center justify-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/25">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-white">{value.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(value.size)}</p>
            </div>
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="ml-2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto h-7 w-7 text-slate-500" aria-hidden="true" />
            <p className="mt-2 text-sm text-slate-300">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="font-semibold text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline"
              >
                Choose a file
              </button>{' '}
              or drag it here
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hint ?? `PDF, JPG or PNG · up to ${formatBytes(MAX_UPLOAD_BYTES)}`}
            </p>
          </>
        )}
      </div>

      {typeof progress === 'number' && progress > 0 && progress < 100 && (
        <Meter className="mt-3" value={progress} tone="brand" label="Uploading" showValue />
      )}

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  )
}
