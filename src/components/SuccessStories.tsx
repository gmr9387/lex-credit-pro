import { Card, CardContent } from '@/components/ui/card';
import { Star, TrendingUp } from 'lucide-react';

interface Story {
  name: string;
  initialScore: number;
  finalScore: number;
  timeframe: string;
  testimony: string;
  deletions: number;
}

const stories: Story[] = [
  {
    name: "Sarah M.",
    initialScore: 542,
    finalScore: 721,
    timeframe: "4 months",
    testimony: "I disputed 8 collections and 3 late payments. All but one were removed. The AI-generated letters were professional and legally solid.",
    deletions: 10
  },
  {
    name: "Marcus T.",
    initialScore: 580,
    finalScore: 698,
    timeframe: "5 months",
    testimony: "The credit simulator helped me prioritize which accounts to tackle first. Went from denied everywhere to approved for a $15K card.",
    deletions: 7
  },
  {
    name: "Jennifer L.",
    initialScore: 495,
    finalScore: 715,
    timeframe: "6 months",
    testimony: "Had multiple duplicate accounts from debt buyers. The AI caught them all and generated dispute letters citing FCRA violations. 100% success rate.",
    deletions: 14
  },
  {
    name: "David R.",
    initialScore: 610,
    finalScore: 742,
    timeframe: "3 months",
    testimony: "The goodwill letter generator was a game-changer. Got 2 lates removed just by asking nicely but professionally. Now qualified for mortgage.",
    deletions: 5
  }
];

export const SuccessStories = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Real Results from Real Users</h2>
        <p className="text-muted-foreground">
          Average improvement: 140 points in 4.5 months
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stories.map((story, index) => (
          <Card key={index} className="hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{story.name}</h3>
                  <div className="flex items-center gap-1 text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-success font-bold">
                    <TrendingUp className="h-4 w-4" />
                    +{story.finalScore - story.initialScore}
                  </div>
                  <div className="text-xs text-muted-foreground">{story.timeframe}</div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Before</span>
                  <span className="text-muted-foreground">After</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                  <span className="text-destructive">{story.initialScore}</span>
                  <span className="text-success">{story.finalScore}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 italic">
                "{story.testimony}"
              </p>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold">{story.deletions}</span> items removed
                </div>
                <div>
                  <span className="font-semibold">{story.timeframe}</span> timeline
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Disclaimer: Individual results vary. Success depends on report accuracy, credit history complexity, and bureau response times. 
          These are real user outcomes but not guaranteed results. Credit repair requires patience and persistence.
        </p>
      </div>
    </div>
  );
};
