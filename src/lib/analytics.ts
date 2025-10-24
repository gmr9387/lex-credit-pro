import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEventData {
  [key: string]: any;
}

export const trackEvent = async (eventName: string, eventData?: AnalyticsEventData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      event_name: eventName,
      event_data: eventData || null,
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

// Common event tracking functions
export const analytics = {
  reportUploaded: (fileName: string, fileSize: number) => 
    trackEvent("report_uploaded", { fileName, fileSize }),
  
  disputeGenerated: (disputeId: string, itemType: string) => 
    trackEvent("dispute_generated", { disputeId, itemType }),
  
  disputeMarkedSent: (disputeId: string) => 
    trackEvent("dispute_marked_sent", { disputeId }),
  
  disputeResolved: (disputeId: string) => 
    trackEvent("dispute_resolved", { disputeId }),
  
  scoreUpdated: (score: number, bureau: string) => 
    trackEvent("score_updated", { score, bureau }),
  
  mentorChatMessage: (messageLength: number) => 
    trackEvent("mentor_chat_message", { messageLength }),
  
  recommendationsViewed: () => 
    trackEvent("recommendations_viewed"),
  
  educationArticleViewed: (articleTitle: string) => 
    trackEvent("education_article_viewed", { articleTitle }),
};
