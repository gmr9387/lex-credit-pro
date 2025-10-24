import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: 'analysis_complete' | 'dispute_deadline' | 'score_update';
  userId: string;
  data?: any;
}

export const sendNotificationEmail = async (notification: NotificationData) => {
  try {
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: notification,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};
