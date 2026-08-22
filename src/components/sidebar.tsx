"use client";

import { useState } from "react";

export interface SidebarSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
}

interface SidebarProps {
  sections: SidebarSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  header?: React.ReactNode;
}

export default function Sidebar({
  sections,
  activeSection,
  onSectionChange,
  header,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => {
      initial[s.id] = s.defaultOpen ?? true;
    });
    return initial;
  });

  function toggleSection(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-black border-r border-white/5 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 lg:hidden">
          {header}
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block p-4 border-b border-white/5">
          {header}
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.id}>
              {/* Section header (collapsible) */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-[family-name:var(--font-montserrat)] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
              >
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${expanded[section.id] ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {section.label}
              </button>

              {/* Section items */}
              {expanded[section.id] && (
                <div className="pb-2">
                  {/* If section has a direct action, show it */}
                  <button
                    onClick={() => {
                      onSectionChange(section.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-[family-name:var(--font-montserrat)] transition-colors ${
                      activeSection === section.id
                        ? "text-gold bg-gold/5 border-r-2 border-gold"
                        : "text-white/50 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {section.icon}
                    {section.label}
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <img src="/logo.png" alt="Frame Dynasty" className="h-6 mx-auto opacity-40" />
        </div>
      </aside>
    </>
  );
}
