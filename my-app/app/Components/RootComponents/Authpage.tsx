"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type AuthMode  = "signup" | "signin" | "forgot";
type SignupStep = "form" | "verify";
type ForgotStep = "request" | "reset";

export const HAS_ACCOUNT_FLAG = "readLite_hasAccount";

interface AuthPageProps {
  onAuthComplete: (user: { name: string; gender: string; email: string }) => void;
  topics: string[];
  initialMode?: AuthMode;
}

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="auth__google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[a-z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "",            color: "transparent" },
    { label: "Weak",        color: "#ef4444" },
    { label: "Fair",        color: "#f97316" },
    { label: "Good",        color: "#eab308" },
    { label: "Strong",      color: "#22c55e" },
    { label: "Very strong", color: "#16a34a" },
  ];
  return { score, ...levels[score] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  return (
    <div style={{ marginTop: "0.4rem" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= score ? color : "var(--border,#e5e7eb)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ─── Banners ──────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
      padding: "0.65rem 0.9rem", color: "#dc2626", fontSize: "0.82rem",
      fontWeight: 500, marginBottom: "0.75rem",
    }}>
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
      padding: "0.65rem 0.9rem", color: "#16a34a", fontSize: "0.82rem",
      fontWeight: 500, marginBottom: "0.75rem",
    }}>
      {message}
    </div>
  );
}

// ─── OTP / Code input ─────────────────────────────────────────────────────────

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = (i: number, char: string) => {
    const sanitized = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = sanitized;
    onChange(next.join(""));
    if (sanitized && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="auth__code-wrap">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`auth__code-input${d ? " auth__code-input--filled" : ""}`}
        />
      ))}
    </div>
  );
}

// ─── Verification step ────────────────────────────────────────────────────────

function VerifyEmailStep({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: (user: { name: string; gender: string; email: string }) => void;
  onBack: () => void;
}) {
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (code.replace(/\D/g, "").length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verification failed."); return; }
      onVerified({ name: data.user.name, gender: data.user.gender, email: data.user.email });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not resend code."); return; }
      setSuccess("New code sent! Check your inbox.");
      setCode("");
      setCountdown(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth__verify">
      <div className="auth__verify-icon">📬</div>
      <p className="auth__form-title">Check your email</p>
      <p className="auth__verify-subtitle">We sent a 6-digit code to</p>
      <p className="auth__verify-email">{email}</p>

      {error   && <ErrorBanner   message={error}   />}
      {success && <SuccessBanner message={success} />}

      <CodeInput value={code} onChange={setCode} />

      <button
        className="auth__submit"
        type="button"
        onClick={handleVerify}
        disabled={loading || code.replace(/\D/g, "").length < 6}
      >
        {loading ? "Verifying…" : "Verify & Create Account →"}
      </button>

      <p className="auth__verify-resend">
        Didn&apos;t receive it?{" "}
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            className="auth__verify-resend-btn"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>

      <button type="button" className="auth__verify-back" onClick={onBack}>
        ← Back to sign up
      </button>
    </div>
  );
}

// ─── Forgot Password: request step ────────────────────────────────────────────

function ForgotPasswordRequestStep({
  onCodeSent,
  onBack,
}: {
  onCodeSent: (email: string) => void;
  onBack: () => void;
}) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      onCodeSent(email.toLowerCase().trim());
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth__form auth__form-fields" onSubmit={handleSubmit}>
      <p className="auth__form-title">Reset your password</p>
      <p className="auth__form-subtitle">
        Enter your account email and we&apos;ll send you a reset code, if an account exists.
      </p>

      {error && <ErrorBanner message={error} />}

      <div className="auth__field">
        <label className="auth__label" htmlFor="forgot-email">Email address</label>
        <input id="forgot-email" className="auth__input" type="email" placeholder="ada@readlite.io"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required autoComplete="email" />
      </div>

      <button className="auth__submit" type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send reset code →"}
      </button>

      <button type="button" className="auth__verify-back" onClick={onBack}>
        ← Back to sign in
      </button>
    </form>
  );
}

// ─── Forgot Password: reset step ──────────────────────────────────────────────

function ResetPasswordStep({
  email,
  onReset,
  onBack,
}: {
  email: string;
  onReset: (user: { name: string; gender: string; email: string }) => void;
  onBack: () => void;
}) {
  const [code,            setCode]            = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [resending,       setResending]       = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [countdown,       setCountdown]       = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.replace(/\D/g, "").length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reset failed."); return; }
      onReset({ name: data.user.name, gender: data.user.gender, email: data.user.email });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not resend code."); return; }
      setSuccess("New code sent, if an account exists for that email.");
      setCode("");
      setCountdown(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <form className="auth__form auth__form-fields" onSubmit={handleSubmit}>
      <div className="auth__verify-icon">🔒</div>
      <p className="auth__form-title">Enter your reset code</p>
      <p className="auth__verify-subtitle">We sent a 6-digit code to</p>
      <p className="auth__verify-email">{email}</p>

      {error   && <ErrorBanner   message={error}   />}
      {success && <SuccessBanner message={success} />}

      <CodeInput value={code} onChange={setCode} />

      <div className="auth__field" style={{ marginTop: "0.75rem" }}>
        <label className="auth__label" htmlFor="new-password">New password</label>
        <div className="auth__password-wrap">
          <input id="new-password" className="auth__input" type={showPw ? "text" : "password"}
            placeholder="Min. 8 characters" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required minLength={8} autoComplete="new-password" />
          <button type="button" className="auth__pw-toggle" onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
        <PasswordStrengthBar password={newPassword} />
      </div>

      <div className="auth__field">
        <label className="auth__label" htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" className="auth__input" type={showPw ? "text" : "password"}
          placeholder="Re-enter your new password" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required autoComplete="new-password" />
      </div>

      <button
        className="auth__submit"
        type="submit"
        disabled={loading || code.replace(/\D/g, "").length < 6}
      >
        {loading ? "Resetting…" : "Reset password →"}
      </button>

      <p className="auth__verify-resend">
        Didn&apos;t receive it?{" "}
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            className="auth__verify-resend-btn"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>

      <button type="button" className="auth__verify-back" onClick={onBack}>
        ← Back to sign in
      </button>
    </form>
  );
}

// ─── Sign-Up Form ─────────────────────────────────────────────────────────────

function SignUpForm({ onCodeSent, topics }: { onCodeSent: (email: string) => void; topics: string[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [gender,    setGender]    = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, gender, topics }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }
      onCodeSent(data.email);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth__form auth__form-fields" onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}

      <div className="auth__row">
        <div className="auth__field">
          <label className="auth__label" htmlFor="firstName">First name</label>
          <input id="firstName" className="auth__input" type="text" placeholder="Ada"
            value={firstName} onChange={(e) => setFirstName(e.target.value)}
            required autoComplete="given-name" />
        </div>
        <div className="auth__field">
          <label className="auth__label" htmlFor="lastName">Last name</label>
          <input id="lastName" className="auth__input" type="text" placeholder="Lovelace"
            value={lastName} onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name" />
        </div>
      </div>

      <div className="auth__field">
        <label className="auth__label" htmlFor="email">Email address</label>
        <input id="email" className="auth__input" type="email" placeholder="ada@readlite.io"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required autoComplete="email" />
      </div>

      <div className="auth__field">
        <label className="auth__label" htmlFor="gender">
          Gender <span style={{ opacity: 0.45 }}>(optional)</span>
        </label>
        <select id="gender" className="auth__select" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="auth__field">
        <label className="auth__label" htmlFor="password">Password</label>
        <div className="auth__password-wrap">
          <input id="password" className="auth__input" type={showPw ? "text" : "password"}
            placeholder="Min. 8 characters" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required minLength={8} autoComplete="new-password" />
          <button type="button" className="auth__pw-toggle" onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
        <PasswordStrengthBar password={password} />
      </div>

      <button className="auth__submit" type="submit" disabled={loading}>
        {loading ? "Sending code…" : "Continue →"}
      </button>

      <p className="auth__terms">
        By creating an account you agree to our{" "}
        <a href="/legal/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{" "}
        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </p>
    </form>
  );
}

// ─── Sign-In Form ─────────────────────────────────────────────────────────────

function SignInForm({
  onSubmit,
  onForgotPassword,
}: {
  onSubmit: (user: { name: string; gender: string; email: string }) => void;
  onForgotPassword: () => void;
}) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sign in failed."); return; }
      onSubmit({ name: data.user.name, gender: data.user.gender, email: data.user.email });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth__form auth__form-fields" onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}

      <div className="auth__field">
        <label className="auth__label" htmlFor="signin-email">Email address</label>
        <input id="signin-email" className="auth__input" type="email" placeholder="ada@readlite.io"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required autoComplete="email" />
      </div>

      <div className="auth__field">
        <label className="auth__label" htmlFor="signin-password">Password</label>
        <div className="auth__password-wrap">
          <input id="signin-password" className="auth__input" type={showPw ? "text" : "password"}
            placeholder="Your password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required autoComplete="current-password" />
          <button type="button" className="auth__pw-toggle" onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
        <button type="button" onClick={onForgotPassword} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "Manrope, sans-serif", fontSize: "0.75rem",
          fontWeight: 600, color: "var(--text-sub)",
        }}>
          Forgot password?
        </button>
      </div>

      <button className="auth__submit" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign In →"}
      </button>
    </form>
  );
}

// ─── Main AuthPage ────────────────────────────────────────────────────────────

export default function AuthPage({ onAuthComplete, topics, initialMode }: AuthPageProps) {
  const router = useRouter();                                                   // ← NEW
  const [mode,         setMode]         = useState<AuthMode>(initialMode ?? "signup");
  const [signupStep,   setSignupStep]   = useState<SignupStep>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [forgotStep,   setForgotStep]   = useState<ForgotStep>("request");
  const [resetEmail,   setResetEmail]   = useState("");
  const [googleError,  setGoogleError]  = useState("");
  // Loaded only on this page (not the root layout) so every other route
  // skips this script entirely — see the removed <Script> in app/layout.tsx.
  const [googleReady,  setGoogleReady]  = useState(false);

  // Wraps the parent's onAuthComplete and redirects to /home               // ← NEW
  const handleAuthComplete = (user: { name: string; gender: string; email: string }) => {
    // So a later expired session skips straight to sign-in instead of
    // restarting welcome/preferences — see app/page.tsx.
    localStorage.setItem(HAS_ACCOUNT_FLAG, "1");
    onAuthComplete(user);
    router.push("/home");
  };

  const handleGoogleAuth = async (credential: string) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, topics }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    handleAuthComplete({                                                       // ← was onAuthComplete
      name:   data.user.name,
      gender: data.user.gender,
      email:  data.user.email,
    });
  };

  const triggerGooglePopup = () => {
    setGoogleError("");
    if (!googleReady || !window.google) {
      setGoogleError("Still loading Google sign-in — try again in a moment.");
      return;
    }
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async ({ credential }: { credential: string }) => {
        try {
          await handleGoogleAuth(credential);
        } catch (err) {
          console.error("Google auth failed:", err);
          setGoogleError("Google sign-in failed. Please try again.");
        }
      },
    });
    window.google.accounts.id.prompt();
  };

  const handleCodeSent = (email: string) => {
    setPendingEmail(email);
    setSignupStep("verify");
  };

  const handleBackToForm = () => {
    setSignupStep("form");
    setPendingEmail("");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSignupStep("form");
    setPendingEmail("");
    setForgotStep("request");
    setResetEmail("");
    setGoogleError("");
  };

  const handleForgotPassword = () => {
    setMode("forgot");
    setForgotStep("request");
    setResetEmail("");
  };

  const handleResetCodeSent = (email: string) => {
    setResetEmail(email);
    setForgotStep("reset");
  };

  const handleBackToSignIn = () => {
    setMode("signin");
    setForgotStep("request");
    setResetEmail("");
  };

  const isVerifyStep = mode === "signup" && signupStep === "verify";
  const hideTopSection = isVerifyStep || mode === "forgot";

  return (
    <main className="auth">
      <div className="auth__orb auth__orb--1" />
      <div className="auth__orb auth__orb--2" />

      <div className="auth__inner">
        <aside className="auth__left">
          <div className="auth__brand-wrap">
            <div className="auth__logo">⚡</div>
            <p className="auth__brand-name">ReadLite</p>
            <p className="auth__brand-sub">Read anywhere. Instantly.</p>
          </div>
          <div className="auth__context">
            <h2 className="auth__context-headline">
              Your feed,<br /><span>precisely tuned</span><br />to your mind.
            </h2>
            <p className="auth__context-body">
              We use your name, gender, and selected topics to surface stories that
              actually matter to you — filtered from noise, curated for depth.
            </p>
            <div className="auth__stats">
              <div className="auth__stat">
                <span className="auth__stat-num">14K+</span>
                <span className="auth__stat-label">Sources</span>
              </div>
              <div className="auth__stat">
                <span className="auth__stat-num">98%</span>
                <span className="auth__stat-label">Signal ratio</span>
              </div>
              <div className="auth__stat">
                <span className="auth__stat-num">0</span>
                <span className="auth__stat-label">Ads</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth__right">
          {!hideTopSection && (
            <>
              <div className="auth__tabs" role="tablist">
                <button
                  role="tab"
                  className={`auth__tab ${mode === "signup" ? "auth__tab--active" : ""}`}
                  onClick={() => switchMode("signup")}
                  aria-selected={mode === "signup"}
                >
                  Create account
                </button>
                <button
                  role="tab"
                  className={`auth__tab ${mode === "signin" ? "auth__tab--active" : ""}`}
                  onClick={() => switchMode("signin")}
                  aria-selected={mode === "signin"}
                >
                  Sign in
                </button>
              </div>

              <p className="auth__form-title">
                {mode === "signup" ? "Join ReadLite" : "Welcome back"}
              </p>
              <p className="auth__form-subtitle">
                {mode === "signup"
                  ? "Create your account to save your curiosity profile."
                  : "Sign in to pick up exactly where you left off."}
              </p>

              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setGoogleReady(true)}
              />

              {googleError && <ErrorBanner message={googleError} />}

              <button className="auth__google-btn" type="button" onClick={triggerGooglePopup}>
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="auth__divider">
                <div className="auth__divider-line" />
                <span className="auth__divider-text">or</span>
                <div className="auth__divider-line" />
              </div>
            </>
          )}

          {mode === "signup" && signupStep === "form" && (
            <SignUpForm onCodeSent={handleCodeSent} topics={topics} />
          )}

          {mode === "signup" && signupStep === "verify" && (
            <VerifyEmailStep
              email={pendingEmail}
              onVerified={handleAuthComplete}                                 
              onBack={handleBackToForm}
            />
          )}

          {mode === "signin" && (
            <SignInForm onSubmit={handleAuthComplete} onForgotPassword={handleForgotPassword} />
          )}

          {mode === "forgot" && forgotStep === "request" && (
            <ForgotPasswordRequestStep onCodeSent={handleResetCodeSent} onBack={handleBackToSignIn} />
          )}

          {mode === "forgot" && forgotStep === "reset" && (
            <ResetPasswordStep email={resetEmail} onReset={handleAuthComplete} onBack={handleBackToSignIn} />
          )}

          {!hideTopSection && (
            <p className="auth__switch">
              {mode === "signup" ? "Already have an account?" : "New to ReadLite?"}
              <button onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}>
                {mode === "signup" ? "Sign in" : "Create account"}
              </button>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}