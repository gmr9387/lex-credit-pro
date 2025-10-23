import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface ScoreSnapshot {
  id: string;
  score: number;
  bureau: string;
  snapshot_date: string;
  notes: string | null;
}

interface ScoreAnalyticsProps {
  snapshots: ScoreSnapshot[];
}

export const ScoreAnalytics = ({ snapshots }: ScoreAnalyticsProps) => {
  if (snapshots.length === 0) return null;

  // Calculate trend
  const sortedSnapshots = [...snapshots].sort((a, b) => 
    new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
  );
  
  const latestScore = sortedSnapshots[sortedSnapshots.length - 1]?.score || 0;
  const previousScore = sortedSnapshots[sortedSnapshots.length - 2]?.score || latestScore;
  const scoreDiff = latestScore - previousScore;
  const percentChange = previousScore > 0 ? ((scoreDiff / previousScore) * 100).toFixed(1) : '0';

  // Bureau comparison
  const bureauData = ['Equifax', 'Experian', 'TransUnion'].map(bureau => {
    const bureauSnapshots = snapshots.filter(s => s.bureau === bureau);
    const latestBureauScore = bureauSnapshots.sort((a, b) => 
      new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime()
    )[0];
    
    return {
      bureau,
      score: latestBureauScore?.score || 0,
      date: latestBureauScore?.snapshot_date,
    };
  }).filter(d => d.score > 0);

  // Score projection (simple linear projection based on trend)
  const calculateProjection = () => {
    if (sortedSnapshots.length < 2) return null;
    
    const recentSnapshots = sortedSnapshots.slice(-3);
    const avgChange = recentSnapshots.reduce((sum, snap, i) => {
      if (i === 0) return 0;
      return sum + (snap.score - recentSnapshots[i - 1].score);
    }, 0) / (recentSnapshots.length - 1);

    const projections = [];
    for (let i = 1; i <= 3; i++) {
      const lastDate = new Date(sortedSnapshots[sortedSnapshots.length - 1].snapshot_date);
      lastDate.setMonth(lastDate.getMonth() + i);
      
      projections.push({
        date: lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        score: Math.min(850, Math.max(300, Math.round(latestScore + (avgChange * i)))),
        projected: true,
      });
    }
    
    return projections;
  };

  const projections = calculateProjection();
  const chartData = [
    ...sortedSnapshots.map(s => ({
      date: new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      score: s.score,
      projected: false,
    })),
    ...(projections || []),
  ];

  // Impact prediction
  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: 'Exceptional', color: 'text-success' };
    if (score >= 740) return { label: 'Very Good', color: 'text-success-light' };
    if (score >= 670) return { label: 'Good', color: 'text-chart-5' };
    if (score >= 580) return { label: 'Fair', color: 'text-chart-3' };
    return { label: 'Poor', color: 'text-destructive' };
  };

  const currentCategory = getScoreCategory(latestScore);

  return (
    <div className="space-y-6">
      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{latestScore}</span>
              <Badge variant="outline" className={currentCategory.color}>
                {currentCategory.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Score Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {scoreDiff >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <span className={`text-3xl font-bold ${scoreDiff >= 0 ? 'text-success' : 'text-destructive'}`}>
                {scoreDiff >= 0 ? '+' : ''}{scoreDiff}
              </span>
              <span className="text-sm text-muted-foreground">({percentChange}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected (3mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {projections?.[2]?.score || latestScore}
              </span>
              {projections && projections[2].score > latestScore && (
                <Badge variant="outline" className="text-success">
                  +{projections[2].score - latestScore}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bureau Comparison */}
      {bureauData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Bureau Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bureauData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="bureau" className="text-xs" />
                <YAxis domain={[300, 850]} className="text-xs" />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Score Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Score Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[300, 850]} className="text-xs" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload.projected ? 'transparent' : 'hsl(var(--primary))'}
                      stroke={payload.projected ? 'hsl(var(--primary))' : 'none'}
                      strokeWidth={2}
                      strokeDasharray={payload.projected ? '3 3' : '0'}
                    />
                  );
                }}
                name="Credit Score"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Projections are based on recent trends and assume continued positive behavior. Actual results may vary.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
