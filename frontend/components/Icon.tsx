const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  alert: '<path d="M12 3l10 18H2L12 3zM12 10v5M12 18h.01"/>', check: '<path d="M5 12l5 5 9-10"/>', pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>', scalpel: '<path d="M4 20L16 8l3 3L7 23M14 6l4-4 4 4-4 4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', dot: '<circle cx="12" cy="12" r="4"/>',
  home: '<path d="M3 12l9-8 9 8M5 10v10h14V10"/>', doc: '<path d="M8 3h8l4 4v14H4V3zM8 11h8M8 15h8"/>',
  pill: '<path d="M10 14l4-4M7 17a3.5 3.5 0 010-5l4-4a3.5 3.5 0 015 5l-4 4a3.5 3.5 0 01-5 0z"/>',
};
export type IconName = keyof typeof ICONS;
export function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}
