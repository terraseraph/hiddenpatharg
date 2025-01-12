"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Users, Lock, Shield, ArrowRight } from "lucide-react";

interface LoginResponse {
  error?: string;
}

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: bookingCode.toUpperCase() }),
      });
      // parse the response as json
      const responseData = await response.json() as LoginResponse;
      console.log("🚀============== ~ file: page.tsx:35 ~ handleSubmit ~ responseData================", responseData)
      if (responseData.success) {
        // Handle redirect from the API
        router.push(`/play/${bookingCode}/info`);
        return;
      }

      const data = await response.json() as LoginResponse;
      if (!response.ok) {
        setError(data.error ?? "An error occurred");
        return;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold inline-block">ARG Game</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <Link
              href="/admin"
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
              target="_blank"
            >
              Admin Dashboard
            </Link>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              An immersive puzzle-solving experience in the{" "}
              <span className="text-gradient_indigo-purple font-bold">
                real world
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Join your team and embark on an adventure that blends digital challenges with real-world exploration.
            </p>
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
            <Card className="relative overflow-hidden border-2">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent"
                style={{ pointerEvents: 'none' }}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="code"
                      name="code"
                      placeholder="Enter your booking code"
                      required
                      className="uppercase"
                      maxLength={6}
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      6-character code using numbers 2-9 and letters A-Z (excluding I and O)
                    </p>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>
                  <Button
                    className="w-full group"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? "Logging in..." : "Start Playing"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent"
                style={{ pointerEvents: 'none' }}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access the admin dashboard to manage games, teams, and puzzles.
                </p>
                <Button asChild variant="secondary" className="w-full group">
                  <Link href="/admin">
                    <Lock className="mr-2 h-4 w-4" />
                    Admin Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex h-14 items-center">
          <p className="text-sm text-muted-foreground">
            Built with shadcn/ui. © 2024 ARG Game. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
