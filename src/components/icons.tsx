import {
  BookOpen, Bot, Compass, Crosshair, Hammer, Home, Map, Package, Radio, Recycle, ScrollText, Send, ShieldCheck, Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  compass: Compass,
  package: Package,
  crosshair: Crosshair,
  bot: Bot,
  users: Users,
  map: Map,
  scroll: ScrollText,
  hammer: Hammer,
  recycle: Recycle,
  book: BookOpen,
  radio: Radio,
  shield: ShieldCheck,
  send: Send,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} aria-hidden="true" />;
}
