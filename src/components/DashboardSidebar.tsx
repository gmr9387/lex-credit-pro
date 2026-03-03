import {
  Upload, FileText, AlertCircle, Shield, TrendingUp, MessageSquare,
  Target, Award, Calendar, DollarSign, Mail, FileCheck, ClipboardList,
  BarChart3, Trophy, Flame, GraduationCap, FileStack, CalendarDays,
  FileDown, Crown, LogOut, Settings as SettingsIcon, Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navSections = [
  {
    label: "Reports",
    items: [
      { title: "Upload", url: "/dashboard", icon: Upload },
      { title: "Reports", url: "/dashboard/reports", icon: FileText },
      { title: "Issues", url: "/dashboard/issues", icon: AlertCircle },
    ],
  },
  {
    label: "Disputes",
    items: [
      { title: "Disputes", url: "/dashboard/disputes", icon: Shield },
      { title: "Batch Disputes", url: "/dashboard/batch", icon: FileStack, pro: true },
      { title: "Goodwill Letters", url: "/dashboard/goodwill", icon: Mail, pro: true },
      { title: "Bureau Responses", url: "/dashboard/responses", icon: FileCheck },
    ],
  },
  {
    label: "Scores & Tools",
    items: [
      { title: "Score Tracker", url: "/dashboard/scores", icon: TrendingUp },
      { title: "Score Simulator", url: "/dashboard/simulator", icon: Target, pro: true },
      { title: "Credit Builder", url: "/dashboard/builder", icon: TrendingUp },
      { title: "Debt Payoff", url: "/dashboard/payoff", icon: DollarSign },
      { title: "Timeline", url: "/dashboard/timeline", icon: Calendar },
      { title: "Calendar", url: "/dashboard/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "AI & Learning",
    items: [
      { title: "AI Mentor", url: "/dashboard/mentor", icon: MessageSquare },
      { title: "Advisor", url: "/dashboard/advisor", icon: Target },
      { title: "Education", url: "/dashboard/learn", icon: Award },
      { title: "Quiz", url: "/dashboard/quiz", icon: GraduationCap },
    ],
  },
  {
    label: "Progress",
    items: [
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, pro: true },
      { title: "Weekly Plan", url: "/dashboard/weekly", icon: ClipboardList },
      { title: "Journey Export", url: "/dashboard/journey", icon: FileDown, pro: true },
      { title: "Stories", url: "/dashboard/stories", icon: Trophy },
      { title: "Achievements", url: "/dashboard/gamification", icon: Flame },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Plans", url: "/dashboard/subscription", icon: Crown },
    ],
  },
];

interface DashboardSidebarProps {
  onSignOut: () => void;
}

export function DashboardSidebar({ onSignOut }: DashboardSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && <span className="font-bold text-sm">Credit Repair AI</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.pro && !collapsed && (
                          <Crown className="ml-auto h-3 w-3 text-primary opacity-60" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2">
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSignOut} tooltip="Sign Out">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
