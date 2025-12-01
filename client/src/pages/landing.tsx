import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, Timer, Target, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Organize your tasks with priorities, due dates, and track your completion progress.",
    },
    {
      icon: Target,
      title: "Habit Tracking",
      description: "Build lasting habits with streak counting and daily completion tracking.",
    },
    {
      icon: Timer,
      title: "Pomodoro Timer",
      description: "Stay focused with 25/5 minute work/break cycles and browser notifications.",
    },
    {
      icon: TrendingUp,
      title: "Progress Visualization",
      description: "See your productivity trends with beautiful charts and statistics.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">FocusFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Master Your{" "}
              <span className="text-primary">Productivity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track tasks, build habits, and stay focused with the Pomodoro technique.
              All in one beautiful, simple dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2" data-testid="button-get-started">
                <a href="/api/login">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Your data, synced everywhere
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to save your tasks, habits, and Pomodoro sessions to the cloud.
                  Access your productivity dashboard from any device.
                </p>
                <ul className="space-y-3">
                  {["Cloud sync across devices", "Secure data backup", "Export your data anytime"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="h-20 w-20 rounded-lg bg-primary/20 animate-pulse" />
                    <div className="h-20 w-20 rounded-lg bg-primary/30 animate-pulse delay-100" />
                    <div className="h-20 w-20 rounded-lg bg-primary/30 animate-pulse delay-200" />
                    <div className="h-20 w-20 rounded-lg bg-primary/20 animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FocusFlow - Your personal productivity companion</p>
        </div>
      </footer>
    </div>
  );
}
