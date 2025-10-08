import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Code2, Briefcase, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                The complete platform to build on Polygon.
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Connect with top blockchain developers and creatives in the Web3 space. Securely hire, collaborate, and
                build the future of decentralized applications.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/feed">Explore Talent</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg border border-border bg-card p-8">
                <div className="flex h-full flex-col items-center justify-between">
                  <div className="flex flex-1 items-center justify-center">
                    <Image 
                      src="/polygon-logo.png" 
                      alt="Polygon Logo" 
                      width={350} 
                      height={350}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-base font-medium text-muted-foreground">Powered by Polygon Blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold">1000+</div>
                <div className="mt-2 text-sm text-muted-foreground">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="mt-2 text-sm text-muted-foreground">Companies Hiring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$2M+</div>
                <div className="mt-2 text-sm text-muted-foreground">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="mt-2 text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold">Why Choose DevGon?</h2>
            <p className="mt-4 text-muted-foreground">Built for the Web3 ecosystem with security and transparency</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure Payments</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Smart contract-based payments on Polygon ensure transparency and security for all transactions.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Verified Developers</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All developers are verified and showcase their work through blockchain-verified portfolios.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quality Employers</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Connect with leading Web3 companies and startups looking for top blockchain talent.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fast Transactions</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Leverage Polygon's low fees and fast confirmation times for seamless payments.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">In-App Messaging</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Communicate directly with potential employers or developers through our secure chat system.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">24/7 Support</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our customer care team is always available to help resolve any issues or questions.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-4 text-muted-foreground">Join thousands of developers and employers in the Web3 space</p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
