import AppLogo from "@/components/AppLogo";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { ArrowRight, Check, History, Layers, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: History,
    title: "Complete version timeline",
    description: "Every save becomes a structured checkpoint with clear metadata and history.",
  },
  {
    icon: Layers,
    title: "Compare drafts instantly",
    description: "See what changed between any two versions before you decide to restore.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    description: "Recover from mistakes in seconds and keep a reliable audit trail of edits.",
  },
];

const steps = [
  {
    title: "Write naturally",
    description: "Use the editor like any normal document tool. No technical setup needed.",
  },
  {
    title: "Commit each milestone",
    description: "Save with a message to capture progress and maintain meaningful history.",
  },
  {
    title: "Review and recover",
    description: "Open timeline, inspect previous versions, and restore with confidence.",
  },
];

const testimonials = [
  {
    quote:
      "We stopped losing client-facing copy revisions. The timeline made approvals and rewrites painless.",
    name: "Riya Patel",
    role: "Content Lead",
  },
  {
    quote:
      "It feels like Git, but for our non-technical team. Exactly what we needed for spec iteration.",
    name: "Aman Verma",
    role: "Product Manager",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-18 pb-16 sm:pt-24 sm:pb-24">
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 35%, #f3f3f3 0%, #e9e9e9 55%, #dcdcdc 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(120,120,120,0.24)_1px,_transparent_1px)] [background-size:24px_24px] opacity-35" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
              <Sparkles className="h-3.5 w-3.5" />
              Version Control for Documents
            </span>

            <div className="space-y-5">
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Document history
                <span className="block text-gray-500">that actually feels effortless.</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                Keep every meaningful change, annotate progress with commit messages, and move between drafts
                without fear. Built for teams that care about clarity, quality, and control.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/80 px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-gray-400"
              >
                Open dashboard
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {["No credit card", "Built for collaboration", "Restore anytime"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-700" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2">
              <AppLogo />
            </div>
            <div className="rounded-3xl border border-gray-300/80 bg-white/85 p-6 pt-14 shadow-2xl backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Current document</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">Launch Strategy Brief</p>
                </div>
                <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">v12</span>
              </div>
              <div className="space-y-3">
                {[
                  { v: "v12", msg: "Refine positioning for enterprise", active: true },
                  { v: "v11", msg: "Update pricing narrative" },
                  { v: "v10", msg: "Add rollout timeline table" },
                  { v: "v09", msg: "First internal review draft" },
                ].map((item) => (
                  <div
                    key={item.v}
                    className={`rounded-xl border px-3 py-2.5 transition-colors ${
                      item.active
                        ? "border-gray-800 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${item.active ? "text-gray-200" : "text-gray-400"}`}>
                      {item.v}
                    </p>
                    <p className="mt-1 text-sm">{item.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Why teams choose Kodoc</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Modern workflow, minimal friction
          </h2>
          <p className="mt-4 text-gray-500">
            Clean information architecture, strong defaults, and versioning behaviors that scale from solo writing
            to team reviews.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:bg-white hover:shadow-lg"
            >
              <item.icon className="h-5 w-5 text-gray-700" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="bg-gray-950 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">How it works</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Keep momentum.
              <span className="block text-gray-400">Never lose context.</span>
            </h2>
            <p className="mt-4 max-w-lg text-gray-400">
              The workflow mirrors how modern version control works, without introducing technical overhead for writers.
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-xs font-bold text-gray-300">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Trusted by teams</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Built for real collaboration loops
            </h2>
          </div>
          <p className="max-w-sm text-sm text-gray-500">
            From strategy docs to client deliverables, teams rely on Kodoc to keep every revision traceable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-base leading-relaxed text-gray-700">"{item.quote}"</p>
              <footer className="mt-5">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-white px-4 pb-20">
      <div className="mx-auto max-w-6xl rounded-3xl border border-gray-800 bg-gray-950 px-6 py-14 text-center sm:px-10 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Start now</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Your best draft is already in the timeline.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">
          Create your workspace, write naturally, and let version history work quietly in the background.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
          >
            Create free account
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-full border border-gray-700 px-7 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Kodoc. All rights reserved.</p>
        <p>Every edit tracked. Every decision recoverable.</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <Hero />
      <FeatureGrid />
      <Workflow />
      <SocialProof />
      <CTA />
      <Footer />
    </div>
  );
}
