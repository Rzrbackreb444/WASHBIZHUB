import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Plus,
  Edit,
  FileText,
  Users,
  Store,
  Settings,
  LogOut,
  ChevronDown,
  Megaphone,
  BarChart3,
  BookOpen,
  MessageSquare,
  Ticket,
  Search,
  Mail,
  Package,
  MapPin,
  Home,
  User,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EditContext {
  type: string;
  label: string;
  editUrl: string;
}

function getEditContext(pathname: string): EditContext | null {
  if (pathname.startsWith('/laundromat-listings/') && pathname !== '/laundromat-listings') {
    const slug = pathname.replace('/laundromat-listings/', '');
    return { type: 'listing', label: 'Edit Listing', editUrl: `/admin/listings/edit/${slug}` };
  }
  if (pathname.startsWith('/blog/') && pathname !== '/blog') {
    const slug = pathname.replace('/blog/', '');
    return { type: 'post', label: 'Edit Post', editUrl: `/admin/blog/edit/${slug}` };
  }
  if (pathname.startsWith('/courses/') && pathname !== '/courses') {
    return { type: 'course', label: 'Edit Course', editUrl: `/admin/courses` };
  }
  if (pathname === '/') {
    return { type: 'page', label: 'Edit Homepage', editUrl: '/admin/settings' };
  }
  if (pathname === '/directory') {
    return { type: 'directory', label: 'Manage Directory', editUrl: '/admin/marketplace' };
  }
  if (pathname === '/forum') {
    return { type: 'forum', label: 'Moderate Forum', editUrl: '/admin/forum' };
  }
  return null;
}

export default function AdminBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const editContext = getEditContext(location);

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-[9999] bg-[#1d2327] text-[#c3c4c7] h-8 flex items-center px-2 text-sm shadow-md"
        data-testid="admin-bar"
      >
        <div className="flex items-center gap-1 flex-1">
          {/* Dashboard */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={() => setLocation('/admin')}
            data-testid="admin-bar-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          {/* Edit This - Context Aware */}
          {editContext && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation(editContext.editUrl)}
              data-testid="admin-bar-edit"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">{editContext.label}</span>
            </Button>
          )}

          {/* New Content Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                data-testid="admin-bar-new"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/add-listing')}
                data-testid="admin-bar-new-listing"
              >
                <MapPin className="w-4 h-4 mr-2" /> Listing
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/blog')}
                data-testid="admin-bar-new-blog"
              >
                <FileText className="w-4 h-4 mr-2" /> Blog Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/courses')}
                data-testid="admin-bar-new-course"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Course
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/promo-codes')}
                data-testid="admin-bar-new-promo"
              >
                <Ticket className="w-4 h-4 mr-2" /> Promo Code
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/ads')}
                data-testid="admin-bar-new-ad"
              >
                <Megaphone className="w-4 h-4 mr-2" /> Advertisement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Quick Links */}
          <div className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-content-menu"
                >
                  <Package className="w-4 h-4" />
                  Content
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/blog')}
                  data-testid="admin-bar-content-blog"
                >
                  <FileText className="w-4 h-4 mr-2" /> Blog Posts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/courses')}
                  data-testid="admin-bar-content-courses"
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Courses
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/resources')}
                  data-testid="admin-bar-content-resources"
                >
                  <Package className="w-4 h-4 mr-2" /> Resources
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/forum')}
                  data-testid="admin-bar-content-forum"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Forum
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-listings-menu"
                >
                  <Store className="w-4 h-4" />
                  Listings
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/laundromat-listings')}
                  data-testid="admin-bar-listings-all"
                >
                  <MapPin className="w-4 h-4 mr-2" /> All Listings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/add-listing')}
                  data-testid="admin-bar-listings-add"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/marketplace')}
                  data-testid="admin-bar-listings-vendors"
                >
                  <Store className="w-4 h-4 mr-2" /> Vendors
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-marketing-menu"
                >
                  <Megaphone className="w-4 h-4" />
                  Marketing
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/ads')}
                  data-testid="admin-bar-marketing-ads"
                >
                  <Megaphone className="w-4 h-4 mr-2" /> Ads
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/promo-codes')}
                  data-testid="admin-bar-marketing-promos"
                >
                  <Ticket className="w-4 h-4 mr-2" /> Promo Codes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/newsletter')}
                  data-testid="admin-bar-marketing-newsletter"
                >
                  <Mail className="w-4 h-4 mr-2" /> Newsletter
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/indexing')}
                  data-testid="admin-bar-marketing-seo"
                >
                  <Search className="w-4 h-4 mr-2" /> SEO/Indexing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation('/admin/users')}
              data-testid="admin-bar-users"
            >
              <Users className="w-4 h-4" />
              Users
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation('/admin/analytics')}
              data-testid="admin-bar-analytics"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={() => setLocation('/')}
            data-testid="admin-bar-view-site"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">View Site</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                data-testid="admin-bar-user-menu"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline max-w-24 truncate" data-testid="admin-bar-username">
                  {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/settings')}
                data-testid="admin-bar-user-profile"
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/settings')}
                data-testid="admin-bar-user-settings"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#3c4043]" />
              <DropdownMenuItem 
                onClick={logout}
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer text-red-400"
                data-testid="admin-bar-logout"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="admin-bar-mobile-toggle"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed top-8 left-0 right-0 z-[9998] bg-[#1d2327] border-b border-[#3c4043] p-2 lg:hidden"
          data-testid="admin-bar-mobile-menu"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => { setLocation('/admin/blog'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-blog"
            >
              <FileText className="w-4 h-4" /> Blog
            </button>
            <button
              onClick={() => { setLocation('/admin/courses'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-courses"
            >
              <BookOpen className="w-4 h-4" /> Courses
            </button>
            <button
              onClick={() => { setLocation('/laundromat-listings'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-listings"
            >
              <MapPin className="w-4 h-4" /> Listings
            </button>
            <button
              onClick={() => { setLocation('/admin/marketplace'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-vendors"
            >
              <Store className="w-4 h-4" /> Vendors
            </button>
            <button
              onClick={() => { setLocation('/admin/ads'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-ads"
            >
              <Megaphone className="w-4 h-4" /> Ads
            </button>
            <button
              onClick={() => { setLocation('/admin/promo-codes'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-promos"
            >
              <Ticket className="w-4 h-4" /> Promos
            </button>
            <button
              onClick={() => { setLocation('/admin/users'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-users"
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button
              onClick={() => { setLocation('/admin/analytics'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-analytics"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
          </div>
        </div>
      )}

      {/* Spacer to push content down when admin bar is visible */}
      <div className="h-8" data-testid="admin-bar-spacer" />
    </>
  );
}
