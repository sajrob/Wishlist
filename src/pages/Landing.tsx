/**
 * Landing page for Me List - A community-focused wishlist platform.
 */
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  Gift,
  Users,
  Link2,
  EyeOff,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle2,
  Share2,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Gift,
      title: "Create Wishlists",
      description:
        "Organize your desires by occasion: birthdays, weddings, holidays, the next Awujo or just because.",
    },
    {
      icon: Link2,
      title: "Smart Auto-Fill",
      description:
        "Paste any product link and we'll fetch the details automatically. It's that easy.",
    },
    {
      icon: EyeOff,
      title: "Coordinate Secretly",
      description:
        "Friends claim items without spoiling the surprise. No more duplicate gifts!",
    },
    {
      icon: Users,
      title: "Connect Your Circle",
      description:
        "Follow friends and family to see their wishes and be there when it matters most.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Lists",
      description: "Build wishlists for any occasion and add items in seconds.",
    },
    {
      number: "02",
      title: "Share With Your Circle",
      description: "Invite friends and family to view your public wishlists.",
    },
    {
      number: "03",
      title: "Celebrate Together",
      description: "Watch as your community coordinates to make wishes come true.",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/40 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 container max-w-5xl mx-auto px-6 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="size-4" />
            <span>Now in Beta — Join the Community</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 animate-fade-in-up">
            Where Community
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              & Celebration Meet
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
            Create wishlists, share with your circle, and coordinate gifts without
            spoiling the surprise. Because the best gifts come from knowing exactly
            what's needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-semibold hover:bg-secondary/50 transition-all duration-200"
            >
              <Link to="/faq">See How It Works</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in delay-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Give & Receive</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple tools that make gift-giving joyful for everyone in your circle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative container max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Simple as <span className="text-primary">1, 2, 3</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started in minutes and let the celebration begin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center group"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary text-2xl font-bold mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-8">
            <Heart className="size-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
            Built for <span className="text-primary">Your Circle</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Me List is a shared space for you and your community to truly know each other's needs and desires. Whether it's
            for a wedding, a family outing, a new home, Awujo or just because. We help your friends and family support you with exactly what you need.
          </p>

          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Share2 className="size-4" />
            <span className="text-sm">Share the love, coordinate the giving</span>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-transparent to-secondary/30 rounded-full blur-3xl" />
        </div>

        <div className="relative container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Ready to Transform
            <br />
            <span className="text-primary">Gift-Giving?</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join thousands of people creating wishlists and celebrating together.
            It's free, it's simple, and it's made for your community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
            >
              <Link to="/signup">
                Create Your Free Account
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>

          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* CSS Animations - using Tailwind's extend for lightweight animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default Landing;
