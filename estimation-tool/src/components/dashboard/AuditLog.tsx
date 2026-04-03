import type { AuditEvent, ReviewComment } from '@/types'

interface AuditLogProps {
  events: AuditEvent[]
  comments: ReviewComment[]
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatEventDate(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function AuditLog({ events, comments }: AuditLogProps) {
  const recentComments = comments.slice(0, 2)
  const recentEvents = events.slice(0, 4)

  return (
    <section className="bg-surface-container-high p-6 rounded-md">
      <h2 className="text-xs font-black uppercase tracking-widest text-on-surface mb-6 flex items-center">
        <span className="material-symbols-outlined mr-2 text-sm" aria-hidden="true">history</span>
        System Architect Logs
      </h2>

      {/* Review comments */}
      <div className="mb-6 border-b border-outline-variant pb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-3 flex items-center">
          <span className="material-symbols-outlined mr-2 text-sm" aria-hidden="true">chat_bubble</span>
          Latest Review Activity
        </h3>

        {recentComments.length === 0 ? (
          <p className="text-[11px] text-on-surface-variant italic">No review comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentComments.map(comment => (
              <li key={comment.id} className="bg-surface-container-lowest/50 p-3 rounded">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-black text-on-surface uppercase">
                    {comment.author_role.toUpperCase()} — {comment.author_name}
                  </span>
                  <time
                    dateTime={comment.created_at}
                    className="text-[8px] font-bold text-on-surface-variant"
                  >
                    {timeAgo(comment.created_at)}
                  </time>
                </div>
                <p className="text-[11px] text-on-surface-variant italic leading-snug">
                  &ldquo;{comment.body}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface mt-4 flex items-center">
          <span className="material-symbols-outlined mr-2 text-sm" aria-hidden="true">terminal</span>
          System Events
        </h3>
      </div>

      {/* Audit events */}
      {recentEvents.length === 0 ? (
        <p className="text-[11px] text-on-surface-variant italic">No events recorded.</p>
      ) : (
        <ul className="space-y-1">
          {recentEvents.map((event, i) => (
            <li
              key={event.id}
              className={`hover:bg-surface-container-highest transition-colors p-3 -mx-3 rounded cursor-default ${
                i === 0 ? 'border-l-2 border-primary' : ''
              }`}
            >
              <time
                dateTime={event.created_at}
                className={`text-[9px] font-bold uppercase block mb-1 ${
                  i === 0 ? 'text-primary' : 'text-secondary'
                }`}
              >
                {formatEventDate(event.created_at)}
              </time>
              <p className={`text-[11px] text-on-surface leading-snug ${i === 0 ? 'font-bold' : ''}`}>
                {event.description}
              </p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="w-full mt-6 py-2 border border-outline-variant text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors rounded"
      >
        View Full Audit Trail
      </button>
    </section>
  )
}
