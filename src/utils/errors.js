/**
 * Normalises every failure mode Axios can hand us into a single shape:
 *   { message: string, status: number|null, details: any }
 *
 * The openHealth backend answers errors as `{ message }`, so we prefer that
 * field and fall back to something human-readable for network / CORS /
 * parse failures.
 */
export function toApiError(error) {
  if (error?.isApiError) return error

  if (error?.code === 'ERR_NETWORK') {
    return make(
      'Cannot reach the openHealth server. Check that the backend is running and reachable.',
      null,
      error,
    )
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return make('The request timed out. Please try again.', null, error)
  }

  const response = error?.response
  if (!response) {
    return make(error?.message || 'Something went wrong.', null, error)
  }

  const { status, data } = response

  // The patient JWT middleware has a fallback path that can emit a raw body
  // instead of JSON — treat that as an authentication failure rather than
  // surfacing "401" as an error message.
  if (typeof data === 'string' && /^\d{3}$/.test(data.trim())) {
    const code = Number(data.trim())
    return make(
      code === 401 ? 'Your session has expired. Please sign in again.' : `Request failed (${code}).`,
      code,
      data,
    )
  }

  const message =
    (typeof data === 'object' && (data?.message || data?.error)) ||
    defaultMessage(status)

  return make(message, status, data)
}

function make(message, status, details) {
  const err = new Error(message)
  err.isApiError = true
  err.status = status
  err.details = details
  return err
}

function defaultMessage(status) {
  switch (status) {
    case 400:
      return 'That request was not valid. Please check the details and try again.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to view this.'
    case 404:
      return 'We could not find what you were looking for.'
    case 409:
      return 'That record already exists.'
    case 413:
      return 'That file is too large to upload.'
    case 500:
      return 'The server ran into a problem. Please try again in a moment.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export function isStatus(error, status) {
  return error?.status === status
}

/** 404 on an optional resource (e.g. "no digital will yet") is not an error. */
export function isEmptyResource(error) {
  return error?.status === 404
}
