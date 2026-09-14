import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ToastProvider";


// ── Gradient Left Panel ────────────────────────────────────────────────────────
function GradientPanel() {
  return (
    <div
      className="relative hidden md:flex flex-col justify-between h-full rounded-2xl overflow-hidden p-8 select-none"
      style={{
        background:
          "radial-gradient(ellipse at 35% 20%, #2b2b2b 0%, #1f1f1f 45%, #121212 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 25% 15%, rgba(255,255,255,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 70% 85% at 75% 55%, rgba(255,255,255,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 100% 45% at 5% 90%, rgba(0,0,0,0.35) 0%, transparent 55%)
          `,
        }}
      />

      {/* Silk wave lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 560 760"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M${-80 + i * 25} ${180 + i * 55} Q${190 + i * 18} ${80 + i * 35} ${480 + i * 12} ${280 + i * 48} T${860 + i * 8} ${230 + i * 42}`}
            fill="none"
            stroke={
              i % 2 === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)"
            }
            strokeWidth={i % 3 === 0 ? "2" : "1.2"}
          />
        ))}
      </svg>

      {/* Blue shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.08) 0%, transparent 38%, rgba(255,255,255,0.04) 72%, transparent 100%)",
        }}
      />

      {/* Top label */}
      <div className="relative z-10 flex items-center gap-3">
        <span className="text-white/75 text-xs font-light tracking-[0.22em] uppercase">
          Version Control for Documents
        </span>
        <Separator className="flex-1 bg-white/30" />
      </div>

      {/* Bottom quote */}
      <div className="relative z-10">
        <h2
          className="text-white text-5xl leading-[1.1] mb-4"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: 300,
          }}
        >
          Track
          <br />
          Every Change
          <br />
          With Confidence
        </h2>

        <p className="text-white/65 text-sm leading-relaxed max-w-[260px]">
          Manage document history and never lose track of changes again.
        </p>
      </div>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signin, loading, error, isAuthenticated } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    try {
      await signin({ email, password });
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Sign in failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden border-0 shadow-2xl rounded-3xl p-0">
        <CardContent className="p-0 flex min-h-[540px]">
          {/* ── Left Panel ── */}
          <div className="w-[48%] flex-shrink-0">
            <GradientPanel />
          </div>

          {/* ── Right Form Panel ── */}
          <div className="flex-1 flex flex-col justify-between px-8 py-8 md:px-10 bg-white">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-gray-900 text-lg tracking-tight"
                style={{ fontFamily: "'Georgia', serif", fontWeight: 600 }}
              >
                Kodoc
              </span>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              {/* Heading */}
              <div className="text-center mb-1">
                <h1
                  className="text-gray-900 text-[2rem] leading-tight mb-1.5"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-sm leading-snug">
                  Enter your email and password to access your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="py-2 px-3">
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-900 focus-visible:border-gray-900"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-11 rounded-xl bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-900 focus-visible:border-gray-900"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm tracking-wide transition-all active:scale-[0.98]"
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>

              {/* Google Sign In */}
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-sm font-bold text-gray-900 hover:text-gray-700 no-underline hover:underline"
              >
                <Link to={"/signup"}> Sign Up</Link>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
