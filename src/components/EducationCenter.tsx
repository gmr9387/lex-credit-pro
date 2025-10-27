import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Scale, Shield, TrendingUp, AlertCircle, FileText, Lightbulb, Target, CreditCard, Users, DollarSign, Sparkles, Home, Zap, Mail, Lock, Building, PiggyBank } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="tips">Credit Tips</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
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

        <TabsContent value="strategies">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Creative Credit Building Strategies
                </CardTitle>
                <CardDescription>
                  Advanced techniques to boost your credit score strategically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="strategy-1">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Authorized User Strategy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Become an authorized user on someone else's account with good payment history and low utilization.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">How it works:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Their positive history appears on your report</li>
                          <li>Best with accounts 5+ years old and under 10% utilization</li>
                          <li>Can add 50-100+ points if done strategically</li>
                          <li>Choose accounts that report to all three bureaus</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Pro Tip: Focus on accounts with high credit limits and perfect payment history for maximum impact.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-2">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>Credit Utilization Optimization</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Strategic management of when and how you pay balances to maximize your score.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Techniques:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li><strong>Multiple Payment Method:</strong> Pay down balances before statement closing date</li>
                          <li><strong>Credit Line Increase:</strong> Request increases every 6-12 months without new spending</li>
                          <li><strong>Balance Distribution:</strong> Keep all cards under 30%, ideally under 10%</li>
                          <li><strong>Zero Balance Strategy:</strong> Maintain one card with small balance, others at zero</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-3">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>Debt Payoff Strategies</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Choose the right debt elimination method for your situation.
                      </p>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Avalanche Method (Best for Savings)</p>
                          <p className="text-sm text-muted-foreground">
                            Pay minimums on all debts, focus extra on highest interest rate first. Saves most money long-term.
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Snowball Method (Best for Motivation)</p>
                          <p className="text-sm text-muted-foreground">
                            Pay minimums on all debts, focus extra on smallest balance first. Creates quick wins and momentum.
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Hybrid Approach</p>
                          <p className="text-sm text-muted-foreground">
                            Target high-interest debts while knocking out one small balance for motivation, then switch to avalanche.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-4">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span>Goodwill Letter Strategy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Request creditors remove accurate but negative information based on goodwill.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">When to use:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>One-time late payment due to unusual circumstances</li>
                          <li>Long history of on-time payments otherwise</li>
                          <li>Account is now current and in good standing</li>
                        </ul>
                        <p className="text-sm font-medium mt-2">Key elements:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Explain the circumstance (job loss, medical emergency)</li>
                          <li>Take responsibility - don't make excuses</li>
                          <li>Highlight your loyalty as a customer</li>
                          <li>Be polite and concise</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-5">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Pay-for-Delete Negotiation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Negotiate with collection agencies to remove items in exchange for payment.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Strategy steps:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Contact collection agency in writing before paying</li>
                          <li>Offer settlement (40-60% of balance) for deletion</li>
                          <li>Get written agreement BEFORE making payment</li>
                          <li>Never admit the debt is yours in writing</li>
                          <li>Keep all documentation for proof</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Important: Only pay after receiving written confirmation they'll delete the entry from all three bureaus.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-6">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Credit Mix Diversification</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Build a healthy mix of credit types to demonstrate responsible credit management (10% of score).
                      </p>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Revolving Credit</p>
                          <p className="text-sm text-muted-foreground">
                            Credit cards, lines of credit - pay off monthly for best impact
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Installment Loans</p>
                          <p className="text-sm text-muted-foreground">
                            Auto loans, personal loans, mortgages - fixed payment schedule
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Credit Builder Loans</p>
                          <p className="text-sm text-muted-foreground">
                            Small loans designed specifically to build credit - money held in savings until paid off
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-7">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>Rapid Rescore for Major Purchases</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Get quick score updates when applying for a mortgage or major loan.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">How it works:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Available through mortgage lenders (not direct to consumers)</li>
                          <li>Pay down credit cards to near-zero before rescore</li>
                          <li>Provide proof of payment to lender</li>
                          <li>Score updates within 3-5 days instead of 30-45 days</li>
                          <li>Can result in better interest rates saving thousands</li>
                        </ul>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        💡 Best Use: When you're within a few points of a better rate tier on a mortgage
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-8">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Statute of Limitations Strategy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Understand how time affects old debts and collections.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Key timelines:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li><strong>Credit reporting:</strong> Most negative items fall off after 7 years</li>
                          <li><strong>Bankruptcy:</strong> Chapter 7 stays for 10 years, Chapter 13 for 7 years</li>
                          <li><strong>Legal debt:</strong> 3-6 years in most states (varies by state)</li>
                          <li>Making a payment can restart the statute of limitations clock</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Warning: Never acknowledge or pay very old debt without legal advice - it may restart the clock
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-9">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        <span>Rent & Utility Reporting</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Add alternative payment history to your credit report to boost your score.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Services to consider:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li><strong>Rent Reporters:</strong> Rental Kharma, RentTrack, LevelCredit report rent payments</li>
                          <li><strong>Utility Reporting:</strong> Experian Boost adds phone, utilities, streaming to credit file</li>
                          <li><strong>Banking History:</strong> UltraFICO includes bank account management</li>
                          <li>Can add 10-50+ points instantly with existing payment history</li>
                        </ul>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        💡 Great for: Thin credit files or those rebuilding credit
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-10">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-primary" />
                        <span>Secured Credit Card Graduation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Use secured cards strategically to build credit, then graduate to unsecured cards.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Step-by-step approach:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Choose secured cards that report to all three bureaus</li>
                          <li>Look for cards with graduation paths (deposit refunded after 6-12 months)</li>
                          <li>Keep utilization under 10% and pay on time every month</li>
                          <li>After 6-12 months, request unsecured conversion or apply for rewards cards</li>
                          <li>Multiple secured cards can accelerate building positive history</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Tip: Avoid secured cards with annual fees unless they offer clear graduation benefits
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-11">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Debt Validation Letters</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Challenge collection accounts by requiring proof of debt ownership and validity.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Strategy steps:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Send validation letter within 30 days of first contact from collector</li>
                          <li>Request original creditor info, account statements, proof of ownership</li>
                          <li>Collection agency must stop collection until they validate</li>
                          <li>Many cannot validate and must remove the item</li>
                          <li>Always send certified mail with return receipt</li>
                        </ul>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        💡 Success Rate: 30-50% of collections cannot be fully validated
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-12">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>Medical Debt Negotiation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Special strategies for medical collections due to unique protections and reporting rules.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Key advantages:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li><strong>New Rules (2023):</strong> Medical debt under $500 not reported</li>
                          <li><strong>Grace Period:</strong> 1-year before medical collections appear on report</li>
                          <li><strong>Paid Deletion:</strong> Paid medical collections removed immediately</li>
                          <li>Negotiate with hospital billing dept before it goes to collections</li>
                          <li>Request itemized bills to identify and dispute errors</li>
                          <li>Apply for hospital financial assistance or charity care</li>
                        </ul>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        💡 Many hospitals will settle for 30-50% if you can pay immediately
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-13">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <span>Credit Freeze Strategy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Protect your credit and control when it can be accessed while managing inquiries.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Benefits:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li><strong>Identity Protection:</strong> Prevents unauthorized credit applications</li>
                          <li><strong>Free Service:</strong> All three bureaus must offer free freezes/unfreezes</li>
                          <li><strong>Inquiry Control:</strong> Prevents soft inquiries from promotional offers</li>
                          <li>Unfreeze temporarily when applying for credit (takes minutes)</li>
                          <li>Does not affect your credit score or existing accounts</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Must freeze/unfreeze at all three bureaus separately
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="strategy-14">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span>Business Credit Building</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm">
                        Build separate business credit to protect personal credit and access more capital.
                      </p>
                      <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <p className="text-sm font-medium">Steps to establish:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                          <li>Register business entity (LLC or Corporation)</li>
                          <li>Get EIN (Employer Identification Number) from IRS</li>
                          <li>Open business bank account and get business phone number</li>
                          <li>Establish trade lines with vendors that report to business bureaus</li>
                          <li>Get business credit cards that don't require personal guarantee</li>
                          <li>Build Dun & Bradstreet, Experian Business, Equifax Business profiles</li>
                        </ul>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        💡 Separates business debt from personal credit reports (when done correctly)
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
