import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type PersonaType = "buyer" | "owner" | "seller" | null;

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  clearPersona: () => void;
  isPersonaSet: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const STORAGE_KEY = "washbizhub_persona";

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["buyer", "owner", "seller"].includes(stored)) {
      setPersonaState(stored as PersonaType);
    }
  }, []);

  const setPersona = useCallback((newPersona: PersonaType) => {
    setPersonaState(newPersona);
    if (newPersona) {
      localStorage.setItem(STORAGE_KEY, newPersona);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearPersona = useCallback(() => {
    setPersonaState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PersonaContext.Provider 
      value={{ 
        persona, 
        setPersona, 
        clearPersona,
        isPersonaSet: persona !== null 
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}

export const PERSONA_CONFIG = {
  buyer: {
    id: "buyer",
    label: "Buyer",
    fullLabel: "Buying a Laundromat",
    color: "#22C55E",
    description: "Finding & funding your deal",
    primaryLinks: [
      { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "Score any location" },
      { href: "/laundromat-listings", label: "Listings for Sale", desc: "Browse deals" },
      { href: "/funding-wizard", label: "Get Funded", desc: "Match with lenders" },
      { href: "/calculators", label: "Calculators", desc: "Valuation & ROI" },
    ],
    secondaryLinks: [
      { href: "/brokers", label: "Find a Broker" },
      { href: "/template-vault", label: "Due Diligence Templates" },
      { href: "/business-plan-generator", label: "AI Business Plan" },
      { href: "/sba-readiness", label: "SBA Readiness Check" },
    ],
    cta: { href: "/pricing", label: "Unlock Pro Analysis", sublabel: "Get instant funding matches" }
  },
  owner: {
    id: "owner",
    label: "Owner",
    fullLabel: "Running My Laundromat",
    color: "#C8A661",
    description: "Optimizing operations",
    primaryLinks: [
      { href: "/operator-dashboard", label: "Operator Dashboard", desc: "Your command center" },
      { href: "/service-guy-ai", label: "Service Guy AI", desc: "Equipment diagnostics" },
      { href: "/pos-command-center", label: "POS Suite", desc: "Sales & customers" },
      { href: "/design-studio-pro", label: "Design Studio", desc: "Floor planning" },
    ],
    secondaryLinks: [
      { href: "/equipment-marketplace", label: "Equipment Deals" },
      { href: "/marketing-loyalty", label: "Marketing Tools" },
      { href: "/calculators", label: "Revenue Calculators" },
      { href: "/iot-dashboard", label: "Machine Monitoring" },
    ],
    cta: { href: "/pricing", label: "Upgrade Operations", sublabel: "Boost revenue 20-30%" }
  },
  seller: {
    id: "seller",
    label: "Seller",
    fullLabel: "Selling My Laundromat",
    color: "#3B82F6",
    description: "Maximizing your exit",
    primaryLinks: [
      { href: "/sell-your-laundromat", label: "List Your Business", desc: "Reach 73K+ buyers" },
      { href: "/calculators", label: "Valuation Calculator", desc: "Know your worth" },
      { href: "/cleanbi-explorer", label: "CLEANBI Report", desc: "Boost buyer confidence" },
      { href: "/brokers", label: "Broker Directory", desc: "Find representation" },
    ],
    secondaryLinks: [
      { href: "/broker-dashboard", label: "Broker Portal" },
      { href: "/template-vault", label: "Sale Documents" },
      { href: "/consultation", label: "Exit Strategy Call" },
      { href: "/advertising", label: "Premium Listing Ads" },
    ],
    cta: { href: "/list-your-laundromat", label: "List for Free", sublabel: "Get matched with buyers" }
  }
} as const;

export const UNIVERSAL_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Community" },
  { href: "/courses", label: "Academy" },
  { href: "/help-center", label: "Help" },
];
