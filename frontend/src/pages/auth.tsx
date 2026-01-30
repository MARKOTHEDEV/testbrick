import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TestBrickLogo } from "@/components/ui/testbrick-logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const AuthPage = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/auth/login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to Clerk or your auth provider
    console.log({ email, password });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-white flex mx-auto max-w-8xl">
      {/* Left Panel - Branded */}
      <div className="hidden lg:flex w-[630px] bg-primary m-10 rounded-lg relative overflow-hidden">
        {/* Decorative asterisk */}
        <span className="absolute -top-[140px] -right-[115px] text-[#FFF] text-[796.444px] font-medium font-instrument leading-none select-none pointer-events-none">
          *
        </span>

        {/* Content at bottom */}
        <div className="absolute bottom-12 left-11 right-11">
          {/* TestBrick Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full mb-4">
            <span className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-sm font-medium text-primary font-instrument capitalize">
              Test Brick
            </span>
          </div>

          {/* Tagline */}
          <h2 className="text-5xl font-semibold text-white font-instrument leading-tight tracking-tight capitalize">
            Create and Maintain
            <br />
            Automated Test
            <br />
            Seamlessly
          </h2>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col md:translate-y-[15px]">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <Link to="/" className="flex items-center gap-2">
            <TestBrickLogo size={24} className="text-primary" />
            <span className="text-xl font-semibold text-foreground font-jakarta capitalize">
              TestBrick
            </span>
          </Link>
          <Link
            to={isLogin ? "/auth/register" : "/auth/login"}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-jakarta"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-primary font-medium">
              {isLogin ? "Sign up" : "Login"}
            </span>
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[440px]">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-foreground font-jakarta mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground font-jakarta">
                {isLogin
                  ? "Sign in to continue to TestBrick"
                  : "Get started with TestBrick for free"}
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              {/* Google Button */}
              <button
                type="button"
                className="w-full h-11 px-4 rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 font-jakarta text-sm font-medium text-foreground"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="w-full h-11 px-4 rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 font-jakarta text-sm font-medium text-foreground"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-muted-foreground uppercase tracking-wide">
                  or
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground font-jakarta"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 px-3 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-jakarta text-sm"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground font-jakarta"
                  >
                    Password
                  </label>
                  {isLogin && (
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline font-jakarta"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "••••••••" : "8+ characters"}
                    className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-jakarta text-sm"
                    required
                    minLength={8}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {/* Terms */}
            {!isLogin && (
              <p className="mt-6 text-xs text-center text-muted-foreground font-jakarta leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Mobile branding footer */}
        <div className="lg:hidden p-6 text-center border-t border-border">
          <p className="text-xs text-muted-foreground font-jakarta">
            Create and maintain automated tests seamlessly
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
