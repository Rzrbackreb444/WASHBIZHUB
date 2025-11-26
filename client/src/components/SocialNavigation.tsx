import { Facebook, Twitter, Linkedin, Mail, Github, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialNavigation() {
  const socials = [
    { href: "https://facebook.com/groups/thelaundromat", icon: Users, label: "FB Group (72K)", color: "hover:text-blue-600" },
    { href: "https://facebook.com/washbizhub1", icon: Facebook, label: "Facebook Page", color: "hover:text-blue-600" },
    { href: "https://twitter.com/washbizhub", icon: Twitter, label: "Twitter", color: "hover:text-blue-400" },
    { href: "https://linkedin.com/company/washbizhub", icon: Linkedin, label: "LinkedIn", color: "hover:text-blue-700" },
    { href: "mailto:nick@washbizhub.com", icon: Mail, label: "Email", color: "hover:text-red-600" },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {socials.map(({ href, icon: Icon, label, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit WashBizHub on ${label}`}
          className={`p-2 rounded-full transition-all hover-elevate text-muted-foreground ${color}`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>
      ))}
    </div>
  );
}
