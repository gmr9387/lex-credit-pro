import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="w-6 h-6 text-primary" />
          <span>Credit Repair AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </button>
          <button onClick={() => scrollTo("stories")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Success Stories
          </button>
          <Button asChild size="sm">
            <Link to="/auth">Log In</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background px-4 py-4 space-y-3">
          <button onClick={() => scrollTo("features")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">Features</button>
          <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">Pricing</button>
          <button onClick={() => scrollTo("stories")} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">Success Stories</button>
          <Button asChild size="sm" className="w-full">
            <Link to="/auth">Log In</Link>
          </Button>
        </div>
      )}
    </header>
  );
};
