import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Truck,
  MonitorSpeaker,
  Calendar,
  Palette,
  Calculator,
  Globe,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  Zap,
  DollarSign,
  MessageSquare,
  Crown,
} from "lucide-react";

interface OperatorSidebarProps {
  locationName?: string;
}

const operatorModules = [
  {
    group: "Command Center",
    items: [
      { title: "Dashboard", url: "/operator-dashboard", icon: LayoutDashboard, badge: null },
      { title: "POS Suite", url: "/pos-suite", icon: ShoppingCart, badge: null },
      { title: "Machine Bookings", url: "/booking-management", icon: Calendar, badge: null },
    ]
  },
  {
    group: "Operations",
    items: [
      { title: "Service Guy AI", url: "/service-guy-ai", icon: Wrench, badge: "AI" },
      { title: "IoT Monitoring", url: "/iot-dashboard", icon: MonitorSpeaker, badge: "Live" },
      { title: "Route Optimization", url: "/route-optimization", icon: Truck, badge: null },
      { title: "Dynamic Pricing", url: "/dynamic-pricing", icon: DollarSign, badge: null },
    ]
  },
  {
    group: "Marketing",
    items: [
      { title: "Website Builder", url: "/website-builder", icon: Globe, badge: null },
      { title: "Design Studio", url: "/design-studio-pro", icon: Palette, badge: "Pro" },
      { title: "Analytics", url: "/owner-analytics", icon: BarChart3, badge: null },
    ]
  },
  {
    group: "Resources",
    items: [
      { title: "Calculators", url: "/calculators", icon: Calculator, badge: "50+" },
      { title: "CLEANBI Explorer", url: "/cleanbi-explorer", icon: Zap, badge: null },
      { title: "Community", url: "/community", icon: Users, badge: null },
    ]
  },
];

export function OperatorSidebar({ locationName = "My Laundromat" }: OperatorSidebarProps) {
  const [location] = useLocation();
  
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/operator-dashboard">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-[#C8A661] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[#0A1628]" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm text-[#0A1628] dark:text-white truncate max-w-[140px]">
                {locationName}
              </span>
              <span className="text-xs text-muted-foreground">Operator OS</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {operatorModules.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={isActive ? "bg-[#C8A661]/10 text-[#C8A661] font-medium" : ""}
                        data-testid={`nav-${item.url.replace('/', '')}`}
                      >
                        <Link href={item.url}>
                          <item.icon className={`h-4 w-4 ${isActive ? "text-[#C8A661]" : ""}`} />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-[#C8A661]/10 text-[#C8A661]"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Help & Support">
              <Link href="/support">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="mt-4 group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-gradient-to-r from-[#C8A661]/20 to-[#C8A661]/10 p-3 border border-[#C8A661]/30">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-[#C8A661]" />
              <span className="text-xs font-semibold text-[#0A1628] dark:text-white">Business</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Unlock unlimited features
            </p>
            <Button size="sm" className="w-full h-7 text-xs bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" asChild>
              <Link href="/pricing">
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
