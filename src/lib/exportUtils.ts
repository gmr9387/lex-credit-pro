// Export utilities for CSV and data downloads

export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const formatScoreSnapshotForExport = (snapshots: any[]) => {
  return snapshots.map(snapshot => ({
    Date: new Date(snapshot.snapshot_date).toLocaleDateString(),
    Score: snapshot.score,
    Bureau: snapshot.bureau || 'N/A',
    Notes: snapshot.notes || '',
  }));
};

export const formatDisputesForExport = (disputes: any[]) => {
  return disputes.map(dispute => ({
    Bureau: dispute.bureau,
    Status: dispute.status,
    'Created Date': new Date(dispute.created_at).toLocaleDateString(),
    'Sent Date': dispute.sent_date ? new Date(dispute.sent_date).toLocaleDateString() : 'Not sent',
    'Response Deadline': dispute.response_deadline ? new Date(dispute.response_deadline).toLocaleDateString() : 'N/A',
    'Response Date': dispute.response_date ? new Date(dispute.response_date).toLocaleDateString() : 'N/A',
    Outcome: dispute.outcome || 'Pending',
    Round: dispute.round_number,
  }));
};

export const formatFlaggedItemsForExport = (items: any[]) => {
  return items.map(item => ({
    Account: item.account_name,
    'Account Type': item.account_type,
    'Issue Type': item.issue_type,
    Description: item.description,
    Balance: item.balance ? `$${item.balance}` : 'N/A',
    'Date Opened': item.date_opened ? new Date(item.date_opened).toLocaleDateString() : 'N/A',
    'Confidence Score': item.confidence_score ? `${(item.confidence_score * 100).toFixed(0)}%` : 'N/A',
    'Created Date': new Date(item.created_at).toLocaleDateString(),
  }));
};
