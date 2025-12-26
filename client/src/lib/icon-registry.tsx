import type { LucideIcon, LucideProps } from "lucide-react";
import { forwardRef, type ComponentType, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";

type IconComponent = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

let lucideModule: typeof import("lucide-react") | null = null;
let loadAttempted = false;

function loadLucideSync(): typeof import("lucide-react") | null {
  if (lucideModule) return lucideModule;
  if (loadAttempted) return null;
  
  try {
    loadAttempted = true;
    const mod = require("lucide-react");
    if (mod) {
      lucideModule = mod;
      return mod;
    }
  } catch (e) {
    console.warn("[icon-registry] Failed to load lucide-react synchronously");
  }
  return null;
}

const PlaceholderIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" opacity="0.3" />
    </svg>
  )
);
PlaceholderIcon.displayName = "PlaceholderIcon";

const iconCache = new Map<string, IconComponent>();

export function getIcon(name: string): IconComponent {
  if (iconCache.has(name)) {
    return iconCache.get(name)!;
  }

  const lucide = loadLucideSync();
  if (lucide && name in lucide) {
    const Icon = (lucide as any)[name] as IconComponent;
    iconCache.set(name, Icon);
    return Icon;
  }

  const DynamicIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    const lucide = loadLucideSync();
    if (lucide && name in lucide) {
      const RealIcon = (lucide as any)[name] as IconComponent;
      iconCache.set(name, RealIcon);
      return <RealIcon ref={ref} {...props} />;
    }
    return <PlaceholderIcon ref={ref} {...props} />;
  });
  DynamicIcon.displayName = `DynamicIcon(${name})`;
  
  return DynamicIcon as IconComponent;
}

export function createIconBundle<T extends string[]>(...names: T): Record<T[number], IconComponent> {
  const bundle = {} as Record<T[number], IconComponent>;
  for (const name of names) {
    (bundle as any)[name] = getIcon(name);
  }
  return bundle;
}

export const Star = getIcon("Star");
export const MapPin = getIcon("MapPin");
export const Phone = getIcon("Phone");
export const Clock = getIcon("Clock");
export const DollarSign = getIcon("DollarSign");
export const TrendingUp = getIcon("TrendingUp");
export const Users = getIcon("Users");
export const Building2 = getIcon("Building2");
export const ArrowRight = getIcon("ArrowRight");
export const ChevronRight = getIcon("ChevronRight");
export const ChevronDown = getIcon("ChevronDown");
export const ChevronUp = getIcon("ChevronUp");
export const CheckCircle = getIcon("CheckCircle");
export const CheckCircle2 = getIcon("CheckCircle2");
export const Lock = getIcon("Lock");
export const Crown = getIcon("Crown");
export const Zap = getIcon("Zap");
export const Shield = getIcon("Shield");
export const Award = getIcon("Award");
export const Target = getIcon("Target");
export const FileText = getIcon("FileText");
export const Mail = getIcon("Mail");
export const Eye = getIcon("Eye");
export const Loader2 = getIcon("Loader2");
export const Search = getIcon("Search");
export const Upload = getIcon("Upload");
export const X = getIcon("X");
export const Image = getIcon("Image");
export const Film = getIcon("Film");
export const GripVertical = getIcon("GripVertical");
export const ExternalLink = getIcon("ExternalLink");
export const Globe = getIcon("Globe");
export const Package = getIcon("Package");
export const ShoppingCart = getIcon("ShoppingCart");
export const Wrench = getIcon("Wrench");
export const Store = getIcon("Store");
export const Truck = getIcon("Truck");
export const Bell = getIcon("Bell");
export const MessageSquare = getIcon("MessageSquare");
export const Trophy = getIcon("Trophy");
export const Settings = getIcon("Settings");
export const CheckCheck = getIcon("CheckCheck");
export const Download = getIcon("Download");
export const Home = getIcon("Home");
export const Sparkles = getIcon("Sparkles");
export const Play = getIcon("Play");
export const Navigation = getIcon("Navigation");
export const BarChart3 = getIcon("BarChart3");
export const ArrowLeft = getIcon("ArrowLeft");
export const Pencil = getIcon("Pencil");
export const Trash2 = getIcon("Trash2");
export const Plus = getIcon("Plus");
export const Ban = getIcon("Ban");
export const AlertTriangle = getIcon("AlertTriangle");
export const Gift = getIcon("Gift");
export const ArrowUpRight = getIcon("ArrowUpRight");
export const Rocket = getIcon("Rocket");
export const ChevronLeft = getIcon("ChevronLeft");
export const Leaf = getIcon("Leaf");
export const Factory = getIcon("Factory");
export const Droplets = getIcon("Droplets");
export const Dog = getIcon("Dog");
export const WashingMachine = getIcon("WashingMachine");
export const Refrigerator = getIcon("Refrigerator");
export const Lightbulb = getIcon("Lightbulb");
export const CreditCard = getIcon("CreditCard");
export const Building = getIcon("Building");
export const Landmark = getIcon("Landmark");
export const Banknote = getIcon("Banknote");
export const Calendar = getIcon("Calendar");
export const Timer = getIcon("Timer");
export const Briefcase = getIcon("Briefcase");
export const Calculator = getIcon("Calculator");
export const Book = getIcon("Book");
export const Table2 = getIcon("Table2");
export const Box = getIcon("Box");
export const ShoppingBag = getIcon("ShoppingBag");
