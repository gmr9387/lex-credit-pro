import { Trophy, Star, Target, Zap, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  type: string;
  earned_at: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const achievementConfig: Record<string, { icon: any; label: string; color: string; description: string }> = {
  first_upload: {
    icon: Shield,
    label: "First Report",
    color: "bg-blue-500",
    description: "Uploaded your first credit report"
  },
  first_dispute: {
    icon: Target,
    label: "Dispute Master",
    color: "bg-purple-500",
    description: "Generated your first dispute letter"
  },
  score_improver: {
    icon: TrendingUp,
    label: "Score Booster",
    color: "bg-green-500",
    description: "Improved your credit score by 50+ points"
  },
  dispute_winner: {
    icon: Trophy,
    label: "Victory",
    color: "bg-yellow-500",
    description: "Won your first dispute"
  },
  consistent_tracker: {
    icon: Star,
    label: "Dedicated",
    color: "bg-pink-500",
    description: "Tracked scores for 30 consecutive days"
  },
  power_user: {
    icon: Zap,
    label: "Power User",
    color: "bg-orange-500",
    description: "Generated 10+ dispute letters"
  }
};

export const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  const config = achievementConfig[achievement.type] || {
    icon: Star,
    label: achievement.type,
    color: "bg-gray-500",
    description: "Special achievement"
  };

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`${config.color} text-white border-0 px-3 py-1.5 gap-2`}
        >
          <Icon className="w-4 h-4" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.description}</p>
        <p className="text-xs text-muted-foreground">
          Earned {new Date(achievement.earned_at).toLocaleDateString()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};