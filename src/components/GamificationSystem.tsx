import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Star, Zap, Target, Award, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  type: 'dispute' | 'learn' | 'review' | 'simulate';
}

interface GamificationSystemProps {
  userId: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_dispute', name: 'First Strike', description: 'Generate your first dispute letter', icon: 'FileText', xp: 50, unlocked: false },
  { id: 'debt_tamer', name: 'Debt Tamer', description: 'Use the debt payoff calculator', icon: 'Calculator', xp: 30, unlocked: false },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Complete your first credit quiz', icon: 'GraduationCap', xp: 40, unlocked: false },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', xp: 100, unlocked: false },
  { id: 'score_simulator', name: 'Score Simulator', description: 'Run 5 score simulations', icon: 'TrendingUp', xp: 60, unlocked: false },
  { id: 'triple_threat', name: 'Triple Threat', description: 'Dispute with all 3 bureaus', icon: 'Target', xp: 150, unlocked: false },
  { id: 'mentor_master', name: 'Mentor Master', description: 'Have 10 conversations with AI Coach', icon: 'MessageSquare', xp: 80, unlocked: false },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on any quiz', icon: 'Award', xp: 75, unlocked: false },
];

const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'daily_review', title: 'Daily Review', description: 'Check your dispute status', xp: 10, completed: false, type: 'review' },
  { id: 'learn_strategy', title: 'Learn Something New', description: 'Read an education article', xp: 15, completed: false, type: 'learn' },
  { id: 'run_simulation', title: 'Future Vision', description: 'Run a score simulation', xp: 20, completed: false, type: 'simulate' },
];

const XP_PER_LEVEL = 200;

export const GamificationSystem = ({ userId }: GamificationSystemProps) => {
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const { toast } = useToast();

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXp % XP_PER_LEVEL;
  const progressToNextLevel = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`gamification_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setTotalXp(data.totalXp || 0);
      setCurrentStreak(data.currentStreak || 0);
      setLongestStreak(data.longestStreak || 0);
      if (data.achievements) {
        setAchievements(prev => prev.map(a => {
          const saved = data.achievements.find((s: Achievement) => s.id === a.id);
          return saved ? { ...a, unlocked: saved.unlocked, unlockedAt: saved.unlockedAt } : a;
        }));
      }
      if (data.dailyChallenges) {
        const today = new Date().toDateString();
        if (data.lastChallengeDate === today) {
          setDailyChallenges(data.dailyChallenges);
        }
      }
    }
  }, [userId]);

  // Save state to localStorage
  useEffect(() => {
    const data = {
      totalXp,
      currentStreak,
      longestStreak,
      achievements,
      dailyChallenges,
      lastChallengeDate: new Date().toDateString(),
    };
    localStorage.setItem(`gamification_${userId}`, JSON.stringify(data));
  }, [totalXp, currentStreak, longestStreak, achievements, dailyChallenges, userId]);

  const awardXp = (amount: number, reason: string) => {
    setTotalXp(prev => prev + amount);
    toast({
      title: `+${amount} XP`,
      description: reason,
    });
  };

  const completeChallenge = (challengeId: string) => {
    setDailyChallenges(prev => prev.map(c => {
      if (c.id === challengeId && !c.completed) {
        awardXp(c.xp, c.title);
        return { ...c, completed: true };
      }
      return c;
    }));
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === achievementId && !a.unlocked) {
        awardXp(a.xp, `Achievement: ${a.name}`);
        toast({
          title: '🏆 Achievement Unlocked!',
          description: a.name,
        });
        return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      return a;
    }));
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completedChallenges = dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="space-y-6">
      {/* Level & XP Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {level}</h3>
                <p className="text-sm text-muted-foreground">{totalXp} Total XP</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-5 h-5" />
                  <span className="text-xl font-bold">{currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Trophy className="w-5 h-5" />
                  <span className="text-xl font-bold">{unlockedCount}/{achievements.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{xpInCurrentLevel}/{XP_PER_LEVEL} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn bonus XP ({completedChallenges}/{dailyChallenges.length} completed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  challenge.completed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {challenge.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <div>
                    <p className={`font-medium ${challenge.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {challenge.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="w-3 h-3" />
                    {challenge.xp} XP
                  </Badge>
                  {!challenge.completed && (
                    <Button size="sm" variant="outline" onClick={() => completeChallenge(challenge.id)}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock achievements by completing credit repair milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-muted'
                }`}>
                  <Trophy className={`w-5 h-5 ${achievement.unlocked ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                </div>
                <Badge variant={achievement.unlocked ? 'default' : 'secondary'} className="shrink-0">
                  {achievement.xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
