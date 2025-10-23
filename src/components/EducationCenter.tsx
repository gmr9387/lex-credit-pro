import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Scale, Shield, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EducationCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Credit Education Center</h3>
        <p className="text-sm text-muted-foreground">
          Learn about your rights and how to improve your credit
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="tips">Credit Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is a credit dispute?</AccordionTrigger>
                  <AccordionContent>
                    A credit dispute is a formal challenge to inaccurate, incomplete, or unverifiable information
                    on your credit report. Under the Fair Credit Reporting Act (FCRA), you have the right to
                    dispute any information you believe is incorrect. The credit bureaus must investigate your
                    dispute within 30 days.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How long does the dispute process take?</AccordionTrigger>
                  <AccordionContent>
                    By law, credit bureaus have 30 days to investigate your dispute from the date they receive it.
                    They may take up to 45 days if you provide additional information during the investigation.
                    After the investigation, they must provide you with written results within 5 business days.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I dispute multiple items at once?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can dispute multiple items, but it's often more effective to focus on the most
                    impactful errors first. Disputing too many items at once may cause bureaus to label your
                    disputes as "frivolous." Our AI helps you prioritize which disputes to send first for
                    maximum impact.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What happens if my dispute is rejected?</AccordionTrigger>
                  <AccordionContent>
                    If your dispute is rejected, you have several options: 1) Request that a statement of dispute
                    be added to your file, 2) Gather more evidence and file another dispute, 3) Contact the
                    creditor directly to resolve the issue, or 4) File a complaint with the Consumer Financial
                    Protection Bureau (CFPB).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How much can disputing errors improve my score?</AccordionTrigger>
                  <AccordionContent>
                    The impact varies based on the type and severity of the error. Removing a late payment or
                    collection account can improve your score by 20-100+ points. Correcting incorrect balances
                    or credit limits can also have significant impact. The biggest improvements typically come
                    from removing negative items that are inaccurate or unverifiable.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Your Rights Under FCRA
              </CardTitle>
              <CardDescription>
                The Fair Credit Reporting Act protects consumers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Right to Accuracy</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to dispute any inaccurate or incomplete information on your credit report.
                    Credit bureaus must investigate and correct or remove unverified information.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Right to Access</h4>
                  <p className="text-sm text-muted-foreground">
                    You're entitled to one free credit report from each of the three major credit bureaus
                    (Equifax, Experian, TransUnion) every 12 months through AnnualCreditReport.com.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Right to Dispute</h4>
                  <p className="text-sm text-muted-foreground">
                    If you find errors, you can dispute them for free. Credit bureaus must investigate within
                    30 days and notify you of the results in writing.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Right to Correction</h4>
                  <p className="text-sm text-muted-foreground">
                    If information is found to be inaccurate or unverifiable, it must be corrected or deleted.
                    The bureau must notify all parties who received your report in the past 6 months.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Credit Building Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">1. Pay Bills On Time</h4>
                  <p className="text-sm text-muted-foreground">
                    Payment history is the most important factor (35% of your score). Set up automatic payments
                    or reminders to never miss a due date.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">2. Keep Credit Utilization Low</h4>
                  <p className="text-sm text-muted-foreground">
                    Try to use less than 30% of your available credit. Lower is better - under 10% is ideal.
                    This shows lenders you're not overly dependent on credit.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">3. Don't Close Old Accounts</h4>
                  <p className="text-sm text-muted-foreground">
                    Length of credit history matters (15% of score). Keep old accounts open even if you don't
                    use them much, as they help establish your credit history.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">4. Limit New Credit Applications</h4>
                  <p className="text-sm text-muted-foreground">
                    Each hard inquiry can lower your score by a few points. Only apply for new credit when
                    necessary, and try to keep applications within a short timeframe when rate shopping.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">5. Diversify Credit Types</h4>
                  <p className="text-sm text-muted-foreground">
                    Having a mix of credit types (credit cards, installment loans, etc.) can help your score.
                    However, don't open accounts you don't need just for this purpose.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">6. Monitor Your Credit Regularly</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your credit reports regularly for errors. Early detection of identity theft or
                    reporting errors can save you significant credit score damage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
