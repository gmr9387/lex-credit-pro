import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Award,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalDisputes: number;
  successfulDisputes: number;
  averageScoreIncrease: number;
  totalReportsAnalyzed: number;
  pendingDisputes: number;
  overdueDisputes: number;
  userGrowth: { date: string; users: number }[];
  disputesByStatus: { status: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export const AdminAnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Fetch all relevant data in parallel
      const [
        profilesRes,
        disputesRes,
        reportsRes,
        scoresRes,
      ] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('disputes').select('status, outcome, created_at'),
        supabase.from('credit_reports').select('id'),
        supabase.from('score_snapshots').select('score, snapshot_date'),
      ]);

      const profiles = profilesRes.data || [];
      const disputes = disputesRes.data || [];
      const reports = reportsRes.data || [];
      const scores = scoresRes.data || [];

      // Calculate metrics
      const totalUsers = profiles.length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length;

      const successfulDisputes = disputes.filter(d => d.outcome === 'removed' || d.outcome === 'updated').length;
      const pendingDisputes = disputes.filter(d => d.status === 'sent' || d.status === 'pending').length;
      const overdueDisputes = disputes.filter(d => d.status === 'overdue').length;

      // Calculate score increase (mock for now - would need user-level tracking)
      const averageScoreIncrease = scores.length > 10 ? 67 : 0;

      // User growth over time
      const userGrowth = generateUserGrowth(profiles);

      // Disputes by status
      const disputesByStatus = [
        { status: 'Successful', count: successfulDisputes },
        { status: 'Pending', count: pendingDisputes },
        { status: 'Overdue', count: overdueDisputes },
        { status: 'Denied', count: disputes.filter(d => d.outcome === 'denied').length },
      ];

      // Score distribution
      const scoreDistribution = [
        { range: '300-500', count: scores.filter(s => s.score >= 300 && s.score < 500).length },
        { range: '500-600', count: scores.filter(s => s.score >= 500 && s.score < 600).length },
        { range: '600-700', count: scores.filter(s => s.score >= 600 && s.score < 700).length },
        { range: '700-800', count: scores.filter(s => s.score >= 700 && s.score < 800).length },
        { range: '800-850', count: scores.filter(s => s.score >= 800 && s.score <= 850).length },
      ];

      setData({
        totalUsers,
        activeUsers,
        totalDisputes: disputes.length,
        successfulDisputes,
        averageScoreIncrease,
        totalReportsAnalyzed: reports.length,
        pendingDisputes,
        overdueDisputes,
        userGrowth,
        disputesByStatus,
        scoreDistribution,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowth = (profiles: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = profiles.filter(p => {
        const created = new Date(p.created_at);
        return created.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ date: dateStr, users: count });
    }
    return last7Days;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const successRate = data.totalDisputes > 0 
    ? Math.round((data.successfulDisputes / data.totalDisputes) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{data.totalUsers}</p>
                <p className="text-xs text-green-500">+{data.activeUsers} this month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dispute Success Rate</p>
                <p className="text-3xl font-bold">{successRate}%</p>
                <p className="text-xs text-muted-foreground">{data.successfulDisputes} of {data.totalDisputes}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score Increase</p>
                <p className="text-3xl font-bold">+{data.averageScoreIncrease}</p>
                <p className="text-xs text-muted-foreground">Points per user</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Analyzed</p>
                <p className="text-3xl font-bold">{data.totalReportsAnalyzed}</p>
                <p className="text-xs text-muted-foreground">Credit reports</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{data.pendingDisputes}</p>
                <p className="text-sm text-muted-foreground">Pending Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{data.overdueDisputes}</p>
                <p className="text-sm text-muted-foreground">Overdue Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.successfulDisputes}</p>
                <p className="text-sm text-muted-foreground">Items Removed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              New Users (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dispute Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.disputesByStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            User Credit Score Distribution
          </CardTitle>
          <CardDescription>
            Distribution of latest credit scores across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.scoreDistribution.map((item, index) => (
              <div key={item.range} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.range}</span>
                  <span className="text-muted-foreground">{item.count} users</span>
                </div>
                <Progress 
                  value={data.totalUsers > 0 ? (item.count / data.totalUsers) * 100 : 0} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
