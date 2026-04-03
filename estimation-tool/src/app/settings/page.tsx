// Settings page — shell. Will cover org profile, user management, and integrations.

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase mb-8">
        Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: 'domain',         title: 'Organisation',   desc: 'Name, logo, fiscal year configuration.' },
          { icon: 'manage_accounts', title: 'Users & Roles',  desc: 'Invite members and manage CIO / SA / Viewer permissions.' },
          { icon: 'webhook',         title: 'Integrations',   desc: 'Connect to Jira, Confluence, or an HR system for live rate data.' },
        ].map(card => (
          <div
            key={card.title}
            className="bg-surface-container-lowest rounded-md p-8 border border-dashed border-outline-variant"
          >
            <span className="material-symbols-outlined text-secondary mb-4 block" aria-hidden="true">
              {card.icon}
            </span>
            <h2 className="text-sm font-black uppercase tracking-widest text-on-surface mb-2">
              {card.title}
            </h2>
            <p className="text-sm text-on-surface-variant">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
