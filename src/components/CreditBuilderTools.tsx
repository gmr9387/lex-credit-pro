import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, CreditCard, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CreditBuilderTools = () => {
  const tools = [
    {
      category: "Rent Reporting",
      icon: Home,
      color: "bg-blue-500",
      items: [
        {
          name: "RentTrack",
          description: "Report rent payments to all 3 bureaus",
          impact: "+30-50 points",
          cost: "$9.95/month",
          link: "https://www.renttrack.com"
        },
        {
          name: "LevelCredit",
          description: "Add rent to your credit history",
          impact: "+20-40 points",
          cost: "$6.95/month",
          link: "https://www.levelcredit.com"
        }
      ]
    },
    {
      category: "Credit Builder Loans",
      icon: TrendingUp,
      color: "bg-green-500",
      items: [
        {
          name: "Self Credit Builder",
          description: "Build credit while saving money",
          impact: "+35-50 points",
          cost: "$25-150 loan amount",
          link: "https://www.self.inc"
        },
        {
          name: "Credit Strong",
          description: "Fast credit building in 3-6 months",
          impact: "+40-60 points",
          cost: "$15/month",
          link: "https://www.creditstrong.com"
        }
      ]
    },
    {
      category: "Secured Credit Cards",
      icon: CreditCard,
      color: "bg-purple-500",
      items: [
        {
          name: "Discover it® Secured",
          description: "No annual fee, cashback rewards",
          impact: "+25-45 points",
          cost: "$200 deposit",
          link: "https://www.discover.com/credit-cards/secured/"
        },
        {
          name: "Capital One Secured",
          description: "Low deposit, auto upgrade path",
          impact: "+20-40 points",
          cost: "$49-200 deposit",
          link: "https://www.capitalone.com/credit-cards/secured-mastercard/"
        }
      ]
    },
    {
      category: "Authorized User",
      icon: Users,
      color: "bg-orange-500",
      items: [
        {
          name: "Tradeline Supply",
          description: "Purchase seasoned tradelines",
          impact: "+40-100 points",
          cost: "$150-500 per line",
          link: "https://www.tradelinesupply.com"
        },
        {
          name: "Family/Friends",
          description: "Ask someone with good credit",
          impact: "+30-80 points",
          cost: "Free",
          link: "#"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Building Marketplace</CardTitle>
          <CardDescription>
            Proven tools to build positive credit history while you dispute errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {tools.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`${category.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{category.category}</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {category.items.map((item) => (
                      <Card key={item.name} className="border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <Badge variant="secondary" className="text-success">
                              {item.impact}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.cost}</span>
                            {item.link !== "#" && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                  Learn More
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted text-sm space-y-2">
            <p className="font-medium">💡 Pro Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Start with rent reporting - easiest and most affordable</li>
              <li>Secured cards work best when you keep utilization under 10%</li>
              <li>Credit builder loans report monthly, showing consistent payment history</li>
              <li>Authorized user strategy works fastest but requires trust</li>
              <li>Combine 2-3 strategies for maximum score impact</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};