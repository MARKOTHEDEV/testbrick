import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TestBrickLogo } from "@/components/ui/testbrick-logo";
import { Zap, Bug, Users, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

// Blocked email domains
const DISPOSABLE_DOMAINS = [
  "yopmail.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamail.org",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "tempr.email",
  "dropmail.me",
  "mohmal.com",
  "tempail.com",
  "emailondeck.com",
  "mintemail.com",
  "33mail.com",
];

const PERSONAL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
];

const isValidWorkEmail = (
  email: string,
): { valid: boolean; message: string } => {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, message: "Temporary emails are not allowed" };
  }

  if (PERSONAL_DOMAINS.includes(domain)) {
    return { valid: false, message: "Please use your work email address" };
  }

  return { valid: true, message: "" };
};

const WaitListV2 = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const emailValidation = isValidWorkEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/xzdgkbwa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const audiences = [
    { icon: Bug, label: "QA Engineers" },
    { icon: Users, label: "Product Managers" },
    { icon: Zap, label: "Developers" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-gradient-to-l from-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <TestBrickLogo size={28} className="text-white" />
              </div>
              <span className="text-xl font-semibold font-instrument tracking-tight text-foreground">
                TestBrick
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Early Access Coming Soon
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-instrument leading-tight text-foreground">
              Bug reports that
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                test themselves.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              No scripts. No code. Just record your browser, and TestBrick turns
              it into a reproducible test that devs can replay and verify — so
              you spend less time explaining, and more time finding bugs.
            </p>

            {/* Audience tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {audiences.map((audience) => (
                <div
                  key={audience.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm"
                >
                  <audience.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground font-medium">
                    {audience.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Email Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch p-2 bg-white rounded-2xl shadow-xl shadow-black/5 border border-border">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-[2] h-12 px-4 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[1] h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Join Waitlist
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-destructive text-sm mt-3">{error}</p>
                )}
                <p className="text-muted-foreground text-sm mt-4">
                  No credit card. No code required. Just early access.
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto p-8 rounded-2xl bg-white border border-border shadow-xl shadow-black/5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-instrument text-foreground">
                  You're on the list!
                </h3>
                <p className="text-muted-foreground">
                  We'll reach out when early access is ready. Keep an eye on
                  your inbox.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WaitListV2;
