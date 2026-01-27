import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isBefore, isAfter } from 'date-fns';

interface Deadline {
  id: string;
  bureau: string;
  type: 'response_deadline' | 'sent_date' | 'resolved';
  date: Date;
  status: string;
  isOverdue: boolean;
}

interface CalendarDeadlineViewProps {
  userId: string;
}

export const CalendarDeadlineView = ({ userId }: CalendarDeadlineViewProps) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, [userId]);

  const fetchDeadlines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('id, bureau, status, sent_date, response_deadline, response_date')
        .eq('user_id', userId);

      if (error) throw error;

      const now = new Date();
      const parsedDeadlines: Deadline[] = [];

      data?.forEach((dispute) => {
        if (dispute.sent_date) {
          parsedDeadlines.push({
            id: dispute.id,
            bureau: dispute.bureau,
            type: 'sent_date',
            date: new Date(dispute.sent_date),
            status: dispute.status,
            isOverdue: false,
          });
        }
        if (dispute.response_deadline && dispute.status !== 'resolved') {
          const deadline = new Date(dispute.response_deadline);
          parsedDeadlines.push({
            id: dispute.id,
            bureau: dispute.bureau,
            type: 'response_deadline',
            date: deadline,
            status: dispute.status,
            isOverdue: isBefore(deadline, now),
          });
        }
        if (dispute.response_date) {
          parsedDeadlines.push({
            id: dispute.id,
            bureau: dispute.bureau,
            type: 'resolved',
            date: new Date(dispute.response_date),
            status: dispute.status,
            isOverdue: false,
          });
        }
      });

      setDeadlines(parsedDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(d => isSameDay(d.date, date));
  };

  const selectedDateDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : [];

  // Get dates with deadlines for the current month
  const monthInterval = {
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  };

  const datesWithDeadlines = deadlines
    .filter(d => isWithinInterval(d.date, monthInterval))
    .map(d => d.date);

  const overdueDeadlines = deadlines.filter(d => d.isOverdue);
  const upcomingDeadlines = deadlines
    .filter(d => d.type === 'response_deadline' && !d.isOverdue && isAfter(d.date, new Date()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getDeadlineIcon = (type: string, isOverdue: boolean) => {
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (type === 'resolved') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (type === 'sent_date') return <Clock className="w-4 h-4 text-blue-600" />;
    return <CalendarDays className="w-4 h-4 text-orange-600" />;
  };

  const getDeadlineColor = (type: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    if (type === 'resolved') return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (type === 'sent_date') return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={overdueDeadlines.length > 0 ? 'border-red-200 dark:border-red-800' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                overdueDeadlines.length > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${overdueDeadlines.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueDeadlines.length}</p>
                <p className="text-sm text-muted-foreground">Overdue Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deadlines.filter(d => d.type === 'resolved').length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Deadline Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasDeadline: datesWithDeadlines,
                overdue: deadlines.filter(d => d.isOverdue).map(d => d.date),
              }}
              modifiersStyles={{
                hasDeadline: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                },
                overdue: {
                  color: 'rgb(239 68 68)',
                },
              }}
            />
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Sent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Deadline</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details & Upcoming */}
        <div className="space-y-6">
          {/* Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDateDeadlines.length} event(s) on this date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateDeadlines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No events on this date</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateDeadlines.map((deadline) => (
                    <div
                      key={`${deadline.id}-${deadline.type}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${getDeadlineColor(deadline.type, deadline.isOverdue)}`}
                    >
                      {getDeadlineIcon(deadline.type, deadline.isOverdue)}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{deadline.bureau}</p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.type === 'sent_date' && 'Dispute sent'}
                          {deadline.type === 'response_deadline' && (deadline.isOverdue ? 'Response overdue!' : 'Response deadline')}
                          {deadline.type === 'resolved' && 'Resolved'}
                        </p>
                      </div>
                      <Badge variant={deadline.isOverdue ? 'destructive' : 'secondary'}>
                        {deadline.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              <CardDescription>Next response deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="font-medium capitalize">{deadline.bureau}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(deadline.date, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Math.ceil((deadline.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
