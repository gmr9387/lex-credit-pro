import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, AlertCircle, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_name", "notification_sent")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'analysis_complete':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'dispute_deadline':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'score_update':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'followup_needed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Center
        </CardTitle>
        <CardDescription>
          Recent updates and alerts about your credit repair journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll notify you about important updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const data = notification.event_data;
              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {getNotificationIcon(data.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{data.subject}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-muted text-sm">
          <p className="font-medium mb-2">📧 Email Notifications</p>
          <p className="text-muted-foreground mb-3">
            Manage which notifications you receive via email in Settings
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/settings">Configure Email Preferences</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};