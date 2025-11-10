import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  limit: number;
  utilization: number;
}

export const DebtPayoffCalculator = () => {
  const [accounts, setAccounts] = useState<DebtAccount[]>([
    { id: "1", name: "Card A", balance: 2500, limit: 5000, utilization: 50 },
    { id: "2", name: "Card B", balance: 1800, limit: 3000, utilization: 60 },
    { id: "3", name: "Card C", balance: 900, limit: 10000, utilization: 9 },
  ]);

  const [paymentAmount, setPaymentAmount] = useState(1000);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLimit = accounts.reduce((sum, acc) => sum + acc.limit, 0);
  const currentUtilization = (totalBalance / totalLimit) * 100;

  // Calculate optimal payment distribution (pay highest utilization first)
  const calculateOptimalPayment = () => {
    let remaining = paymentAmount;
    const payments: { [key: string]: number } = {};
    
    // Sort by utilization (highest first)
    const sorted = [...accounts].sort((a, b) => b.utilization - a.utilization);
    
    for (const account of sorted) {
      if (remaining <= 0) break;
      
      const payoff = Math.min(remaining, account.balance);
      payments[account.id] = payoff;
      remaining -= payoff;
    }
    
    return payments;
  };

  const payments = calculateOptimalPayment();
  
  const projectedAccounts = accounts.map(acc => ({
    ...acc,
    balance: Math.max(0, acc.balance - (payments[acc.id] || 0)),
    utilization: Math.max(0, ((acc.balance - (payments[acc.id] || 0)) / acc.limit) * 100)
  }));

  const projectedBalance = projectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const projectedUtilization = (projectedBalance / totalLimit) * 100;
  
  // Score impact calculation
  // Utilization under 30% = baseline
  // Every 10% reduction = ~15 points
  const utilizationChange = currentUtilization - projectedUtilization;
  const scoreImpact = Math.round(utilizationChange * 1.5);

  const addAccount = () => {
    const newId = String(accounts.length + 1);
    setAccounts([...accounts, {
      id: newId,
      name: `Card ${String.fromCharCode(65 + accounts.length)}`,
      balance: 0,
      limit: 1000,
      utilization: 0
    }]);
  };

  const updateAccount = (id: string, field: keyof DebtAccount, value: number) => {
    setAccounts(accounts.map(acc => {
      if (acc.id !== id) return acc;
      
      const updated = { ...acc, [field]: value };
      if (field === "balance" || field === "limit") {
        updated.utilization = (updated.balance / updated.limit) * 100;
      }
      return updated;
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Debt Payoff Impact Calculator
          </CardTitle>
          <CardDescription>
            See exactly how paying down debt affects your credit score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Accounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Your Credit Accounts</Label>
              <Button onClick={addAccount} size="sm" variant="outline">
                Add Account
              </Button>
            </div>
            
            {accounts.map((account) => (
              <Card key={account.id} className="border-muted">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Account Name</Label>
                      <Input
                        value={account.name}
                        onChange={(e) => updateAccount(account.id, "name", e.target.value as any)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Utilization</Label>
                      <div className="mt-1 text-2xl font-bold text-primary">
                        {Math.round(account.utilization)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Balance</Label>
                      <Input
                        type="number"
                        value={account.balance}
                        onChange={(e) => updateAccount(account.id, "balance", parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Credit Limit</Label>
                      <Input
                        type="number"
                        value={account.limit}
                        onChange={(e) => updateAccount(account.id, "limit", parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Progress value={account.utilization} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Amount */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              How much can you pay? ${paymentAmount.toLocaleString()}
            </Label>
            <Slider
              value={[paymentAmount]}
              onValueChange={(v) => setPaymentAmount(v[0])}
              max={totalBalance}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Funds will be distributed to highest utilization accounts first for maximum impact
            </p>
          </div>

          {/* Results */}
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Balance</span>
                  <span className="font-semibold">${totalBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Limit</span>
                  <span className="font-semibold">${totalLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Utilization</span>
                  <span className="font-semibold text-destructive">{currentUtilization.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-success">
                  <TrendingUp className="w-4 h-4" />
                  After Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Balance</span>
                  <span className="font-semibold">${projectedBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Utilization</span>
                  <span className="font-semibold text-success">{projectedUtilization.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Score Impact</span>
                  <span className="font-bold text-lg text-success">+{scoreImpact} pts</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Breakdown */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Recommended Payment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projectedAccounts.map((acc) => {
                  const payment = payments[acc.id] || 0;
                  if (payment === 0) return null;
                  
                  return (
                    <div key={acc.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{acc.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          ${accounts.find(a => a.id === acc.id)?.balance.toLocaleString()} → ${acc.balance.toLocaleString()}
                        </span>
                        <span className="font-semibold text-success">${payment.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">💡 Pro Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Keep utilization under 30% for good scores, under 10% for excellent</li>
              <li>Paying down high-utilization cards gives the biggest score boost</li>
              <li>Score updates typically reflect within 30-45 days of payment</li>
              <li>Consider making payments before statement closing date for faster impact</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
