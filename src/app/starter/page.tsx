import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  CreditCard, 
  Database, 
  Mail, 
  Cloud, 
  BarChart3, 
  GitBranch,
  Copy,
  ExternalLink,
  Download,
  Play,
  Code,
  Rocket,
  Star,
  Users,
  Clock
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'SaaS Starter Kit - Launch Your SaaS in Minutes',
  description: 'Production-ready SaaS starter template with authentication, payments, subscriptions, and more. Built with Next.js, Clerk, Stripe, and modern tools.',
  keywords: ['SaaS', 'starter kit', 'Next.js', 'Clerk', 'Stripe', 'authentication', 'payments', 'subscriptions'],
  authors: [{ name: 'SaaS Starter Team' }],
  openGraph: {
    title: 'SaaS Starter Kit - Launch Your SaaS in Minutes',
    description: 'Production-ready SaaS starter template with authentication, payments, subscriptions, and more.',
    type: 'website',
    url: 'https://starter.gmac.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Starter Kit - Launch Your SaaS in Minutes',
    description: 'Production-ready SaaS starter template with authentication, payments, subscriptions, and more.',
  }
};

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      <Copy className="h-3 w-3 mr-1" />
      {label}
    </Button>
  );
};

export default function StarterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Hero Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl lg:py-24">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="text-sm px-4 py-2" variant="secondary">
              <Rocket className="h-4 w-4 mr-2" />
              SaaS Starter Kit v1.0
            </Badge>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            Launch Your SaaS in Minutes, Not Months
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Production-ready starter template with authentication, payments, subscriptions, email notifications, 
            file uploads, analytics, and everything you need to build and scale your SaaS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="https://github.com/yourusername/saas-starter" target="_blank">
                <Download className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-5 w-5" />
                View Live Demo
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">1.2k+ Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">500+ Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="font-medium">5min Setup</span>
            </div>
          </div>
        </div>

        {/* Quick Start Code Block */}
        <Card className="max-w-4xl mx-auto mb-20 border-2 border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started in 3 Commands</CardTitle>
            <CardDescription>
              Clone, configure, and launch your SaaS application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-950 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="mb-2"># Clone the repository</div>
                <div className="text-blue-300">git clone https://github.com/yourusername/saas-starter.git</div>
                <div className="text-blue-300">cd saas-starter</div>
                <br />
                <div className="mb-2"># Install dependencies and run setup wizard</div>
                <div className="text-blue-300">npm install</div>
                <div className="text-blue-300">npm run setup:all</div>
                <br />
                <div className="mb-2"># Start development server</div>
                <div className="text-blue-300">npm run dev</div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <CopyButton 
                  text="git clone https://github.com/yourusername/saas-starter.git && cd saas-starter" 
                  label="Copy Clone Command" 
                />
                <CopyButton 
                  text="npm install && npm run setup:all" 
                  label="Copy Setup Command" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <Card className="border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-500 mb-3" />
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>
                Enterprise-grade auth with Clerk. Social logins, MFA, and user management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Email, Google, GitHub OAuth
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  User profiles & management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Protected API routes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  API key authentication
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-100 hover:border-green-200 transition-colors">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-green-500 mb-3" />
              <CardTitle>Payments & Billing</CardTitle>
              <CardDescription>
                Complete Stripe integration with subscriptions, trials, and billing portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Multiple pricing tiers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Free trials & upgrades
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Usage-based billing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Customer portal
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader>
              <Database className="h-10 w-10 text-purple-500 mb-3" />
              <CardTitle>Database & ORM</CardTitle>
              <CardDescription>
                Turso edge database with Drizzle ORM for lightning-fast, type-safe queries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Edge-ready SQLite
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Type-safe schema
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Auto migrations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Built-in studio
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:border-red-200 transition-colors">
            <CardHeader>
              <Mail className="h-10 w-10 text-red-500 mb-3" />
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Beautiful transactional emails with React Email and Resend integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  React Email templates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Automated workflows
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Email preview tool
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Background jobs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Cloud className="h-10 w-10 text-orange-500 mb-3" />
              <CardTitle>File Management</CardTitle>
              <CardDescription>
                Cloudinary integration for seamless file uploads and image optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Drag & drop uploads
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Image optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  File management UI
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  CDN delivery
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-indigo-500 mb-3" />
              <CardTitle>Analytics & Monitoring</CardTitle>
              <CardDescription>
                Built-in analytics, error tracking, feature flags, and performance monitoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Usage analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Error tracking (Sentry)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Feature flags (PostHog)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Performance metrics
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="max-w-6xl mx-auto mb-20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Built with Modern Tools</CardTitle>
            <CardDescription className="text-lg">
              Carefully selected technologies for performance, developer experience, and scalability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
              {[
                { name: 'Next.js 15', desc: 'React Framework' },
                { name: 'TypeScript', desc: 'Type Safety' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'Clerk', desc: 'Authentication' },
                { name: 'Stripe', desc: 'Payments' },
                { name: 'Turso', desc: 'Database' },
                { name: 'Drizzle ORM', desc: 'Database ORM' },
                { name: 'Resend', desc: 'Email Service' },
                { name: 'Cloudinary', desc: 'File Storage' },
                { name: 'PostHog', desc: 'Analytics' },
                { name: 'Inngest', desc: 'Background Jobs' },
                { name: 'Sentry', desc: 'Error Tracking' }
              ].map((tech, index) => (
                <div key={index} className="space-y-2">
                  <div className="font-semibold text-sm">{tech.name}</div>
                  <div className="text-xs text-gray-500">{tech.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Options */}
        <Card className="max-w-4xl mx-auto mb-20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Multiple Setup Options</CardTitle>
            <CardDescription>
              Choose the setup method that works best for your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Quick Start</h3>
                <p className="text-sm text-gray-600">
                  One command setup with interactive wizard
                </p>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  npm run setup:all
                </code>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <GitBranch className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Step by Step</h3>
                <p className="text-sm text-gray-600">
                  Configure each service individually
                </p>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  npm run setup<br />npm run setup:stripe
                </code>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Manual Setup</h3>
                <p className="text-sm text-gray-600">
                  Full control over configuration
                </p>
                <code className="block text-xs bg-gray-100 p-2 rounded">
                  cp .env.example .env.local<br />edit .env.local
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials / Social Proof */}
        <Card className="max-w-4xl mx-auto mb-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loved by Developers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm italic">
                  "This starter kit saved me weeks of setup time. Everything just works out of the box!"
                </p>
                <div className="text-xs text-gray-600">
                  — Sarah Chen, Indie Hacker
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm italic">
                  "The best SaaS starter I've used. Great documentation and active community."
                </p>
                <div className="text-xs text-gray-600">
                  — Marcus Rodriguez, Full-stack Developer
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your SaaS?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop reinventing the wheel. Start with a solid foundation and focus on what makes your product unique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="https://github.com/yourusername/saas-starter" target="_blank">
                <Download className="mr-2 h-5 w-5" />
                Start Building Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/docs" target="_blank">
                <ExternalLink className="mr-2 h-5 w-5" />
                View Documentation
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            MIT License • Free for commercial use • Active support
          </div>
        </div>
      </section>
    </div>
  );
}