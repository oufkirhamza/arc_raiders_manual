export interface NavItem {
  href: string;
  label: string;
  icon: string;
  children?: { href: string; label: string }[];
}

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Start",
    items: [
      { href: "/", label: "Home", icon: "home" },
      { href: "/getting-started", label: "Getting Started", icon: "compass" },
    ],
  },
  {
    group: "Database",
    items: [
      { href: "/items", label: "Items & Components", icon: "package" },
      { href: "/weapons", label: "Weapons & Gear", icon: "crosshair", children: [
        { href: "/weapons", label: "Weapons" },
        { href: "/attachments", label: "Attachments" },
        { href: "/items?group=Gear", label: "Shields, augments & gear" },
      ] },
      { href: "/enemies", label: "ARC Enemies", icon: "bot" },
      { href: "/traders", label: "Characters & Traders", icon: "users" },
      { href: "/maps", label: "Maps & Locations", icon: "map", children: [
        { href: "/maps", label: "All maps" },
        { href: "/keys", label: "Keycards" },
      ] },
    ],
  },
  {
    group: "Progression",
    items: [
      { href: "/quests", label: "Quests", icon: "scroll" },
      { href: "/workshop", label: "Workshop", icon: "hammer", children: [
        { href: "/workshop", label: "Station upgrades" },
        { href: "/projects", label: "Expeditions & projects" },
        { href: "/skills", label: "Skill tree" },
      ] },
      { href: "/recycling", label: "Recycle or Sell", icon: "recycle" },
    ],
  },
  {
    group: "Learn",
    items: [
      { href: "/guides", label: "Guides & Strategies", icon: "book" },
      { href: "/updates", label: "Updates", icon: "radio" },
      { href: "/sources", label: "Sources & Data", icon: "shield" },
      { href: "/contribute", label: "Suggest a change", icon: "send" },
    ],
  },
];
