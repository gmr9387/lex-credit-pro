import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, Target } from 'lucide-react';

interface Analytics {
  scoreHistory: any[];
  disputeStats: any;
  issueBreakdown: any[];
  timeline: any[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    scoreHistory: [],
    disputeStats: {},
    issueBreakdown: [],
    timeline: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Score history
      const { data: scores } = await supabase
        .from('score_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: true });

      // Dispute stats
      const { data: disputes } = await supabase
        .from('disputes')
        .select('status')
        .eq('user_id', user.id);

      // Flagged items breakdown
      const { data: issues } = await supabase
        .from('flagged_items')
        .select('issue_type')
        .eq('user_id', user.id);

      // Process data
      const scoreHistory = (scores || []).map(s => ({
        date: new Date(s.snapshot_date).toLocaleDateString(),
        [s.bureau]: s.score
      }));

      const disputeStats = (disputes || []).reduce((acc: any, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});

      const issueBreakdown = Object.entries(
        (issues || []).reduce((acc: any, i) => {
          acc[i.issue_type] = (acc[i.issue_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      setAnalytics({
        scoreHistory,
        disputeStats,
        issueBreakdown,
        timeline: scoreHistory
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const avgIncrease = analytics.scoreHistory.length >= 2
    ? (() => {
        const latest = analytics.scoreHistory[analytics.scoreHistory.length - 1];
        const first = analytics.scoreHistory[0];
        const latestAvg = Object.values(latest).filter(v => typeof v === 'number').reduce((a, b) => (a as number) + (b as number), 0) as number / 3;
        const firstAvg = Object.values(first).filter(v => typeof v === 'number').reduce((a, b) => (a as number) + (b as number), 0) as number / 3;
        return latestAvg - firstAvg;
      })()
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Score Increase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-success mr-2" />
              <span className="text-2xl font-bold text-success">
                +{avgIncrease.toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-warning mr-2" />
              <span className="text-2xl font-bold">
                {analytics.disputeStats.pending || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Removed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-success mr-2" />
              <span className="text-2xl font-bold text-success">
                {analytics.disputeStats.resolved || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-primary mr-2" />
              <span className="text-2xl font-bold">
                {analytics.scoreHistory.length * 30}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Score Trends</CardTitle>
          <CardDescription>Track your progress across all three bureaus</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[300, 850]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Equifax" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Experian" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="TransUnion" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Issue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
            <CardDescription>Distribution of flagged items</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.issueBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.issueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dispute Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Outcomes</CardTitle>
            <CardDescription>Resolution status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(analytics.disputeStats).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                count: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
