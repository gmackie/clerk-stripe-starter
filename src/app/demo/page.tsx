import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Zap, Shield, CreditCard, Database, Mail, Cloud, BarChart3, GitBranch } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="px-4 py-20 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">
            SaaS Starter Kit Demo
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Everything You Need to Launch Your SaaS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A production-ready starter kit with authentication, payments, subscriptions, and more. 
            Built with Next.js, Clerk, Stripe, and modern tools.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/yourusername/saas-starter" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Secure authentication with Clerk. Email, social logins, and MFA support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Email & OAuth providers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  User profile management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Protected API routes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Payments & Billing</CardTitle>
              <CardDescription>
                Complete Stripe integration with subscriptions and customer portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multiple pricing tiers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Subscription management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Usage-based billing
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Database & ORM</CardTitle>
              <CardDescription>
                Turso database with Drizzle ORM for type-safe queries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Edge-ready database
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Type-safe schema
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automatic migrations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-10 w-10 text-red-500 mb-2" />
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Beautiful transactional emails with React Email and Resend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  React Email templates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automated workflows
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Email preview tool
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Cloud className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>File Uploads</CardTitle>
              <CardDescription>
                Cloudinary integration for image and file management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Drag & drop uploads
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Image optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File management UI
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-indigo-500 mb-2" />
              <CardTitle>Analytics & Monitoring</CardTitle>
              <CardDescription>
                Built-in analytics, error tracking, and performance monitoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Usage analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Error tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Performance metrics
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Accounts */}
        <Card className="max-w-4xl mx-auto mb-20">
          <CardHeader>
            <CardTitle className="text-2xl">Try Demo Accounts</CardTitle>
            <CardDescription>
              Explore different subscription tiers with our demo accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge>Pro Plan</Badge>
                </h3>
                <p className="text-sm text-gray-600">alice@example.com</p>
                <p className="text-xs text-gray-500">
                  Full access to Pro features including advanced analytics and priority support
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Starter Plan</Badge>
                </h3>
                <p className="text-sm text-gray-600">bob@example.com</p>
                <p className="text-xs text-gray-500">
                  Access to core features with usage limits and email support
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline">Free Plan</Badge>
                </h3>
                <p className="text-sm text-gray-600">charlie@example.com</p>
                <p className="text-xs text-gray-500">
                  Limited access to explore the platform and test basic features
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Use any password to sign in with these demo accounts
            </p>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Start Guide</CardTitle>
            <CardDescription>
              Get your SaaS up and running in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Clone the Repository</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm">
                    git clone https://github.com/yourusername/saas-starter.git
                  </code>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Run Setup Wizard</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm">
                    npm install && npm run setup:all
                  </code>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Start Development</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm">
                    npm run dev
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Pro tip:</strong> Use <code className="bg-blue-100 px-1 rounded">npm run setup:all</code> for 
                the complete setup including Stripe products, demo data, and branding customization.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <section className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your SaaS?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with a solid foundation and focus on what makes your product unique.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Start Building <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">
                Read Documentation
              </Link>
            </Button>
          </div>
        </section>
      </section>
    </div>
  );
}