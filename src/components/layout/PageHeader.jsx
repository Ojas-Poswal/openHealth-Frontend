/**
 * Page header — title, supporting copy and the page's primary actions.
 * Every route starts with one so the action for a page is always in the
 * same place.
 */
export default function PageHeader({ title, description, actions, breadcrumb, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  )
}
