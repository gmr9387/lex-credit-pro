import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileDown, FileText, TrendingUp, Award, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface JourneyStats {
  totalDisputes: number;
  resolvedDisputes: number;
  pendingDisputes: number;
  successRate: number;
  bureauBreakdown: { bureau: string; count: number; resolved: number }[];
  timeline: { date: string; event: string; details: string }[];
  achievements: string[];
  startDate: string | null;
  daysSinceStart: number;
}

interface JourneyReportExportProps {
  userId: string;
}

export const JourneyReportExport = ({ userId }: JourneyReportExportProps) => {
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJourneyStats();
  }, [userId]);

  const fetchJourneyStats = async () => {
    setLoading(true);
    try {
      const { data: disputes, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const resolved = disputes?.filter(d => d.status === 'resolved') || [];
      const pending = disputes?.filter(d => d.status !== 'resolved') || [];

      // Bureau breakdown
      const bureauMap = new Map<string, { count: number; resolved: number }>();
      disputes?.forEach(d => {
        const current = bureauMap.get(d.bureau) || { count: 0, resolved: 0 };
        current.count++;
        if (d.status === 'resolved') current.resolved++;
        bureauMap.set(d.bureau, current);
      });

      const bureauBreakdown = Array.from(bureauMap.entries()).map(([bureau, data]) => ({
        bureau,
        ...data,
      }));

      // Timeline events
      const timeline: { date: string; event: string; details: string }[] = [];
      disputes?.forEach(d => {
        timeline.push({
          date: d.created_at,
          event: 'Dispute Created',
          details: `${d.bureau} - Round ${d.round_number}`,
        });
        if (d.sent_date) {
          timeline.push({
            date: d.sent_date,
            event: 'Dispute Sent',
            details: `Sent to ${d.bureau}`,
          });
        }
        if (d.response_date) {
          timeline.push({
            date: d.response_date,
            event: 'Response Received',
            details: `${d.bureau} - ${d.outcome || 'No outcome recorded'}`,
          });
        }
      });

      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get achievements from localStorage
      const savedGamification = localStorage.getItem(`gamification_${userId}`);
      const achievements = savedGamification 
        ? JSON.parse(savedGamification).achievements?.filter((a: any) => a.unlocked).map((a: any) => a.name) || []
        : [];

      const startDate = disputes?.[0]?.created_at || null;
      const daysSinceStart = startDate 
        ? Math.ceil((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      setStats({
        totalDisputes: disputes?.length || 0,
        resolvedDisputes: resolved.length,
        pendingDisputes: pending.length,
        successRate: disputes?.length ? Math.round((resolved.length / disputes.length) * 100) : 0,
        bureauBreakdown,
        timeline: timeline.slice(-20), // Last 20 events
        achievements,
        startDate,
        daysSinceStart,
      });
    } catch (error) {
      console.error('Error fetching journey stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!stats) return;

    setExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Primary blue
      pdf.text('Credit Repair Journey Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // Summary Section
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('Journey Summary', 20, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60);
      
      const summaryItems = [
        `Days in Journey: ${stats.daysSinceStart}`,
        `Total Disputes: ${stats.totalDisputes}`,
        `Resolved: ${stats.resolvedDisputes}`,
        `Pending: ${stats.pendingDisputes}`,
        `Success Rate: ${stats.successRate}%`,
      ];

      summaryItems.forEach(item => {
        pdf.text(`• ${item}`, 25, yPos);
        yPos += 7;
      });
      yPos += 10;

      // Bureau Breakdown
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('Bureau Breakdown', 20, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60);
      stats.bureauBreakdown.forEach(bureau => {
        const rate = bureau.count > 0 ? Math.round((bureau.resolved / bureau.count) * 100) : 0;
        pdf.text(`• ${bureau.bureau.charAt(0).toUpperCase() + bureau.bureau.slice(1)}: ${bureau.count} disputes (${rate}% resolved)`, 25, yPos);
        yPos += 7;
      });
      yPos += 10;

      // Achievements
      if (stats.achievements.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Achievements Earned', 20, yPos);
        yPos += 10;

        pdf.setFontSize(11);
        pdf.setTextColor(60);
        stats.achievements.forEach(achievement => {
          pdf.text(`🏆 ${achievement}`, 25, yPos);
          yPos += 7;
        });
        yPos += 10;
      }

      // Check if we need a new page
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }

      // Recent Timeline
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('Recent Activity Timeline', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60);
      stats.timeline.slice(-10).forEach(event => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`${format(new Date(event.date), 'MMM d, yyyy')} - ${event.event}`, 25, yPos);
        yPos += 5;
        pdf.setTextColor(100);
        pdf.text(`   ${event.details}`, 25, yPos);
        pdf.setTextColor(60);
        yPos += 7;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Generated by Credit Repair AI', pageWidth / 2, 285, { align: 'center' });

      pdf.save(`credit-journey-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: 'Report Downloaded!',
        description: 'Your credit repair journey report has been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Unable to load journey data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Your Credit Repair Journey
          </CardTitle>
          <CardDescription>
            {stats.startDate 
              ? `Started ${format(new Date(stats.startDate), 'MMMM d, yyyy')} • ${stats.daysSinceStart} days ago`
              : 'Start your journey by creating your first dispute'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-3xl font-bold">{stats.totalDisputes}</p>
              <p className="text-sm text-muted-foreground">Total Disputes</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.resolvedDisputes}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{stats.pendingDisputes}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bureau Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Bureau Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.bureauBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm">No disputes yet</p>
            ) : (
              stats.bureauBreakdown.map(bureau => {
                const rate = bureau.count > 0 ? Math.round((bureau.resolved / bureau.count) * 100) : 0;
                return (
                  <div key={bureau.bureau} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{bureau.bureau}</span>
                      <span className="text-sm text-muted-foreground">
                        {bureau.resolved}/{bureau.count} resolved
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.achievements.length === 0 ? (
              <p className="text-muted-foreground text-sm">Complete actions to earn achievements!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map(achievement => (
                  <Badge key={achievement} variant="secondary" className="gap-1">
                    🏆 {achievement}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest credit repair actions</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {stats.timeline.slice(-8).reverse().map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Download Full Report</h3>
              <p className="text-sm text-muted-foreground">
                Get a comprehensive PDF of your entire credit repair journey
              </p>
            </div>
            <Button onClick={generatePDF} disabled={exporting} size="lg">
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
