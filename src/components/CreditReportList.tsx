import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CreditReport {
  id: string;
  file_name: string;
  bureau: string;
  current_score: number | null;
  status: string;
  uploaded_at: string;
  file_url: string;
}

export const CreditReportList = () => {
  const [reports, setReports] = useState<CreditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_reports')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading reports',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (url: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('credit-reports')
        .download(url.split('/').pop()!);

      if (error) throw error;

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No credit reports uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="hover-scale">
          <CardHeader>
            <div className="flex items-start justify-between">
              <FileText className="h-5 w-5 text-primary" />
              <Badge variant={report.status === 'analyzed' ? 'default' : 'secondary'}>
                {report.status}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-2">{report.bureau || 'Unknown Bureau'}</CardTitle>
            <CardDescription className="line-clamp-1">{report.file_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.current_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-2xl font-bold text-primary">{report.current_score}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploaded</span>
                <span>{new Date(report.uploaded_at).toLocaleDateString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => downloadReport(report.file_url, report.file_name)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
