'use client';

export default function ModeTabs({
  tabs,
  active,
  onSelect
}: {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <nav className="tabs" aria-label="viewer modes">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab${tab === active ? ' active' : ''}`}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
