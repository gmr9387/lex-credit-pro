import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, FileText, TrendingUp, Brain, Lock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SuccessStories } from "@/components/SuccessStories";
import { PricingSection } from "@/components/PricingSection";
import { LandingHeader } from "@/components/LandingHeader";

const Landing = () => {
  const features = [
    {
      icon: FileText,
      title: "Credit Mirror",
      description: "AI-powered OCR extracts and analyzes your credit reports, flagging errors automatically."
    },
    {
      icon: Shield,
      title: "Legal Clerk",
      description: "Generate FCRA-compliant dispute letters with statute citations - completely automated."
    },
    {
      icon: TrendingUp,
      title: "ScoreVault Analytics",
      description: "Predictive modeling shows exactly how each action impacts your credit score."
    },
    {
      icon: Brain,
      title: "Credit Mentor AI",
      description: "Your personal AI coach providing strategy, education, and motivation."
    },
    {
      icon: Zap,
      title: "Smart Rebuilder",
      description: "Curated recommendations for credit-building products and optimized payment plans."
    },
    {
      icon: Lock,
      title: "Guardian Security",
      description: "Military-grade encryption with optional offline vault for zero-cloud storage."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <LandingHeader />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
            <Shield className="w-4 h-4" />
            FCRA/FDCPA/CFPB Compliant
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Credit Repair AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Self-learning credit optimization platform that autonomously analyzes, disputes, 
            and rebuilds your credit file under U.S. consumer protection law
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/dashboard">View Demo</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Free &amp; Pro Plans
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Cancel Anytime
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              100% Automated
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enterprise-Grade Credit Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Six powerful modules working together to optimize your credit profile
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 bg-card/50 backdrop-blur"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From upload to credit improvement in 4 simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {[
            {
              step: "01",
              title: "Upload Your Credit Report",
              description: "Drag & drop your PDF or connect to a free credit source. Our AI extracts and normalizes all data instantly."
            },
            {
              step: "02",
              title: "AI Analysis & Detection",
              description: "Advanced algorithms flag errors, duplicates, and obsolete items with confidence scores."
            },
            {
              step: "03",
              title: "Automated Disputes",
              description: "Legal Clerk generates FCRA-compliant letters with statute citations. Approve and send with one click."
            },
            {
              step: "04",
              title: "Track & Rebuild",
              description: "Monitor 30-day response cycles, see score predictions, and get personalized rebuilding strategies."
            }
          ].map((item, index) => (
            <div key={index} className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready for unlimited power
          </p>
        </div>
        <PricingSection />
      </div>

      {/* Success Stories */}
      <div className="container mx-auto px-4 py-20">
        <SuccessStories />
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands using AI-powered credit repair. Get started for free
            and upgrade to Pro for unlimited features.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link to="/auth">Start Your Free Account</Link>
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Credit Repair AI. Built with enterprise-grade security and compliance.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/terms" className="hover:text-primary transition-colors underline">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
