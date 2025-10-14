import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold">Credit Repair AI</span>
          </Link>
          <p className="text-muted-foreground">
            Your journey to financial freedom starts here
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to access your credit optimization dashboard" 
                : "Start optimizing your credit for free"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>

            <Button className="w-full" size="lg">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {isLogin ? "New to Credit Repair AI?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create an Account" : "Sign In Instead"}
            </Button>

            <div className="pt-4 space-y-2 text-xs text-center text-muted-foreground">
              <p>🔒 Your data is encrypted with AES-256</p>
              <p>✓ FCRA/FDCPA/CFPB Compliant</p>
              <p>✓ Free for Personal Use</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
