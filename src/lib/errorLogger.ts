import { supabase } from "@/integrations/supabase/client";

interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  componentName?: string;
}

export const logError = async (errorData: ErrorLogData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("error_logs").insert({
      user_id: user?.id || null,
      error_message: errorData.message,
      error_stack: errorData.stack || errorData.componentStack || null,
      component_name: errorData.componentName || null,
      user_agent: navigator.userAgent,
      url: window.location.href,
    });
  } catch (error) {
    console.error("Failed to log error:", error);
  }
};
