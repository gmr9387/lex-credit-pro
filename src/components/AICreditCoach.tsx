import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Lightbulb,
  TrendingUp,
  Shield,
  CreditCard,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickPrompt {
  icon: any;
  label: string;
  prompt: string;
  category: 'strategy' | 'education' | 'action';
}

const quickPrompts: QuickPrompt[] = [
  {
    icon: TrendingUp,
    label: 'Fastest way to 700+',
    prompt: 'What\'s the fastest strategy to get my credit score above 700? I want actionable steps I can take this week.',
    category: 'strategy',
  },
  {
    icon: Shield,
    label: 'Dispute this collection',
    prompt: 'I have a collection account on my report. What\'s the best dispute strategy to get it removed?',
    category: 'action',
  },
  {
    icon: CreditCard,
    label: 'Credit utilization tips',
    prompt: 'How can I optimize my credit utilization to boost my score quickly?',
    category: 'education',
  },
  {
    icon: HelpCircle,
    label: 'Explain FCRA rights',
    prompt: 'Explain my rights under the Fair Credit Reporting Act (FCRA) and how I can use them in disputes.',
    category: 'education',
  },
  {
    icon: Lightbulb,
    label: 'Next best action',
    prompt: 'Based on typical credit repair strategies, what should be my next action after sending dispute letters?',
    category: 'action',
  },
  {
    icon: Sparkles,
    label: 'Goodwill letter advice',
    prompt: 'How do I write an effective goodwill letter to get a late payment removed? What should I include?',
    category: 'strategy',
  },
];

export const AICreditCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Credit Coach. I\'m here to provide personalized guidance on your credit repair journey.\n\nI can help you with:\n• Dispute strategies and letter writing\n• Understanding your credit report\n• Prioritizing which issues to tackle first\n• Building credit for the long term\n\nWhat would you like to work on today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setApiError(null);
    setShowQuickPrompts(false);

    try {
      const { data, error } = await supabase.functions.invoke('credit-mentor-chat', {
        body: { 
          messages: [...messages, userMessage],
          context: 'credit_coaching'
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          setApiError('Rate limit exceeded. Please wait a moment and try again.');
          return;
        } else if (error.message?.includes('402')) {
          setApiError('AI credits depleted. Please add credits to continue.');
          return;
        }
        throw error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
      analytics.mentorChatMessage(userMessage.content.length);
    } catch (error: any) {
      console.error('AI Coach error:', error);
      setApiError(error.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Credit Coach. I\'m here to provide personalized guidance on your credit repair journey.\n\nI can help you with:\n• Dispute strategies and letter writing\n• Understanding your credit report\n• Prioritizing which issues to tackle first\n• Building credit for the long term\n\nWhat would you like to work on today?',
    }]);
    setShowQuickPrompts(true);
    setApiError(null);
  };

  return (
    <Card className="h-[650px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Credit Coach</CardTitle>
              <p className="text-xs text-muted-foreground">Personalized guidance for your journey</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Start new conversation">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {apiError && (
          <Alert variant="destructive" className="mx-4 mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <p className="text-sm flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </p>
                </div>
              </div>
            )}

            {/* Quick Prompts */}
            {showQuickPrompts && messages.length <= 1 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Quick questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-3 justify-start text-left"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      disabled={loading}
                    >
                      <prompt.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-xs">{prompt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          {!showQuickPrompts && messages.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickPrompts.slice(0, 3).map((prompt, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted whitespace-nowrap"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  <prompt.icon className="h-3 w-3 mr-1" />
                  {prompt.label}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about credit repair strategies..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
