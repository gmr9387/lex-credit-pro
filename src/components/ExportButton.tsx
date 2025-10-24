import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadCSV } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  data: any[];
  filename: string;
  formatter: (data: any[]) => any[];
  label?: string;
}

export const ExportButton = ({ data, filename, formatter, label = "Export CSV" }: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formattedData = formatter(data);
      downloadCSV(formattedData, filename);
      toast({
        title: 'Export Successful',
        description: `${filename} downloaded successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export data.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};
