import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { EnhancedOnboarding } from "@/components/EnhancedOnboarding";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { OnboardingTour } from "@/components/OnboardingTour";
import { AchievementBadge } from "@/components/AchievementBadge";

export interface DashboardContext {
  user: User;
  achievements: any[];
  awardAchievement: (type: string) => Promise<void>;
}

export default function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadAchievements(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadAchievements = async (userId: string) => {
    const { data } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(5);
    if (data) setAchievements(data);
  };

  const awardAchievement = async (type: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("user_achievements")
      .insert({ user_id: user.id, achievement_type: type });
    if (!error) {
      loadAchievements(user.id);
      toast({
        title: "🏆 Achievement Unlocked!",
        description: `You earned: ${type.replace(/_/g, ' ').toUpperCase()}`,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EnhancedOnboarding />
        <OfflineIndicator />
        <PushNotificationPrompt />
        <DashboardSidebar onSignOut={handleSignOut} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50 px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Credit Repair AI</h1>
            </div>
            {achievements.length > 0 && (
              <div className="hidden md:flex gap-2">
                {achievements.slice(0, 3).map((a) => (
                  <AchievementBadge key={a.id} achievement={a} />
                ))}
              </div>
            )}
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Outlet context={{ user, achievements, awardAchievement } satisfies DashboardContext} />
          </main>
        </div>

        <OnboardingTour />
      </div>
    </SidebarProvider>
  );
}
