"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

type AuthTab = "login" | "signup";
type SignupStep = 1 | 2 | "success";
type AuthView =
  | "default"
  | "forgotPassword"
  | "forgotPasswordMethod"
  | "forgotPasswordCode"
  | "forgotPasswordReset"
  | "forgotPasswordSuccess";
type ResetMethod = "phone" | "email";

const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "At least 1 uppercase letter",
  "At least 1 lowercase letter",
  "At least 1 symbol",
  "No spaces",
] as const;

function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    !/\s/.test(password)
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.3 3.1-7.5Z" fill="#4285F4" />
      <path d="M12 22c2.8 0 5.1-.9 6.8-2.4l-3.2-2.6c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-5.9-4.4H2.8v2.7A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.1 13.6A6 6 0 0 1 5.8 12c0-.6.1-1.1.3-1.6V7.7H2.8A10 10 0 0 0 2 12c0 1.5.4 3 1 4.3l3.1-2.7Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3C17.1 2.8 14.8 2 12 2A10 10 0 0 0 2.8 7.7l3.3 2.6c.8-2.5 3.1-4.4 5.9-4.4Z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.5l-.6 3.5h-2.9V24C19.6 23.1 24 18.1 24 12.1Z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#F2552C" />
      <path
        d="M12 15V8M9.5 10.5 12 8l2.5 2.5M8.5 15.5v.3c0 .66.54 1.2 1.2 1.2h4.6c.66 0 1.2-.54 1.2-1.2v-.3"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.61 2.64a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.44-1.27a2 2 0 0 1 2.11-.45c.85.28 1.74.49 2.64.61A2 2 0 0 1 22 16.92Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type LabelInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  withEye?: boolean;
  requiredMark?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  invalid?: boolean;
};

function LabelInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  withEye = false,
  requiredMark = false,
  onFocus,
  onBlur,
  invalid = false,
}: LabelInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = withEye ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[#4f4f4f] sm:text-[14px]">
        {label}
        {requiredMark && <span className="text-[#f2552c]">*</span>}
      </label>

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-[46px] w-full rounded-full border bg-[#ead8d2] px-5 text-[14px] text-[#4f4f4f] placeholder:text-[#b5aaa6] outline-none transition focus:border-[#f2552c] ${
            invalid ? "border-[#d94c3d]" : "border-[#b9b9b9]"
          } ${
            withEye ? "pr-12" : ""
          }`}
        />

        {withEye && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e8e] transition hover:text-[#f2552c]"
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

function SocialLogin({ text }: { text: string }) {
  const supabase = createClient();
  const handleRedirect = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="pt-3">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#bcbcbc]" />
        <span className="text-[12px] text-[#767676]">{text}</span>
        <div className="h-px flex-1 bg-[#bcbcbc]" />
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => handleRedirect('google')}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#d8d8d8] bg-white shadow-sm transition hover:-translate-y-0.5"
        >
          <GoogleIcon />
        </button>

        <button
          type="button"
          onClick={() => handleRedirect('facebook')}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#d8d8d8] bg-white shadow-sm transition hover:-translate-y-0.5"
        >
          <FacebookIcon />
        </button>
      </div>
    </div>
  );
}

function PasswordRequirementsPopup() {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-2xl border border-[#f0c8bd] bg-[#fff4f1] p-4 text-[12px] text-[#6a4b43] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
      <p className="mb-2 font-semibold text-[#d94c3d]">Password requirements</p>
      <ul className="space-y-1">
        {PASSWORD_REQUIREMENTS.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AuthCard() {
  const router = useRouter();

  const [authView, setAuthView] = useState<AuthView>("default");
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [resetMethod, setResetMethod] = useState<ResetMethod>("phone");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetCode, setResetCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  
  const supabase = createClient();

  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
    firstName: "",
    lastName: "",
    signupEmail: "",
    phoneNumber: "",
    signupPassword: "",
    reenterPassword: "",
    idNumber: "",
  });

  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetAll = () => {
    setActiveTab("login");
    setSignupStep(1);
    setAuthView("default");
    setRememberPassword(false);
    setResetMethod("phone");
    setForgotIdentifier("");
    setResetCode(["", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPasswordPopup(false);
    setPasswordError("");
    setAuthError("");
    setVerificationFile(null);
    setFormData({
      loginEmail: "",
      loginPassword: "",
      firstName: "",
      lastName: "",
      signupEmail: "",
      phoneNumber: "",
      signupPassword: "",
      reenterPassword: "",
      idNumber: "",
    });
  };

  const cardPaddingClass =
    authView === "forgotPassword"
      ? "px-8 pt-8 pb-20 sm:px-10"
      : authView === "forgotPasswordMethod"
      ? "px-10 pt-10 pb-20 sm:px-12"
      : authView === "forgotPasswordCode"
      ? "px-8 pt-8 pb-20 sm:px-10"
      : authView === "forgotPasswordReset"
      ? "px-8 pt-8 pb-20 sm:px-10"
      : authView === "forgotPasswordSuccess"
      ? "px-8 pt-10 pb-20 sm:px-10"
      : signupStep === "success"
      ? "px-8 pt-10 pb-20 sm:px-10"
      : signupStep === 2
      ? "px-8 pt-10 pb-14 sm:px-10"
      : "px-8 pt-8 pb-16 sm:px-10";

  const maskedPhone = forgotIdentifier || "******0975";
  const maskedEmail = forgotIdentifier || "*****@gmail.com";
  const codeTarget = resetMethod === "phone" ? maskedPhone : maskedEmail;

  const updateResetCode = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    setResetCode((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="relative w-full max-w-[580px] p-4">
      <div
        className={`relative mx-auto w-full ${
          authView === "forgotPasswordMethod" ? "max-w-[520px]" : "max-w-[430px]"
        } rounded-[56px] bg-[#efefef] shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${cardPaddingClass}`}
      >
        {authView === "default" && signupStep === 1 && (
          <div className="mb-5 flex items-center justify-center gap-8 text-[20px] font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setSignupStep(1);
              }}
              className={`relative pb-2 ${
                activeTab === "login"
                  ? "text-[#f2552c]"
                  : "text-[#676767] hover:text-[#f2552c]"
              }`}
            >
              Login
              {activeTab === "login" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#f2552c]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setSignupStep(1);
              }}
              className={`relative pb-2 ${
                activeTab === "signup"
                  ? "text-[#f2552c]"
                  : "text-[#676767] hover:text-[#f2552c]"
              }`}
            >
              Sign Up
              {activeTab === "signup" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#f2552c]" />
              )}
            </button>
          </div>
        )}

        {authView === "forgotPassword" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAuthView("forgotPasswordMethod");
            }}
            className="space-y-6"
          >
            <button
              type="button"
              onClick={() => setAuthView("default")}
              className="text-[#222] transition hover:text-[#f2552c]"
              aria-label="Back to login"
            >
              <BackIcon />
            </button>

            <div>
              <h2 className="text-[24px] font-bold leading-none text-[#303030] sm:text-[28px]">
                FORGOT PASSWORD?
              </h2>
              <p className="mt-2 text-[14px] text-[#666]">
                Enter your Phone Number or Email
              </p>
            </div>

            <input
              type="text"
              placeholder="Phone Number or Email"
              value={forgotIdentifier}
              onChange={(e) => setForgotIdentifier(e.target.value)}
              className="h-[46px] w-full rounded-[10px] border border-[#b9b1ae] bg-[#ead8d2] px-4 text-[14px] text-[#4f4f4f] placeholder:text-[#8f8480] outline-none transition focus:border-[#f2552c]"
            />

            <button
              type="submit"
              className="h-[44px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Continue
            </button>
          </form>
        )}

        {authView === "forgotPasswordMethod" && (
          <div className="space-y-8">
            <button
              type="button"
              onClick={() => setAuthView("forgotPassword")}
              className="text-[#222] transition hover:text-[#f2552c]"
              aria-label="Back to forgot password"
            >
              <BackIcon />
            </button>

            <div className="text-center">
              <h2 className="text-[30px] font-bold leading-none text-[#303030] sm:text-[34px]">
                Reset Password
              </h2>
              <p className="mt-4 text-[14px] text-[#777]">
                Select which contact should we use to reset your password
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <button
                type="button"
                onClick={() => {
                  setResetMethod("phone");
                  setAuthView("forgotPasswordCode");
                }}
                className="rounded-[14px] border border-[#8f8f8f] bg-[#d9d9d9] px-5 py-6 text-left text-[#333] shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition hover:border-[#f2552c]"
              >
                <div className="flex items-center gap-4">
                  <PhoneIcon />
                  <div>
                    <p className="text-[12px] text-[#666]">Send Code via SMS</p>
                    <p className="mt-1.5 text-[14px] font-medium">{maskedPhone}</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetMethod("email");
                  setAuthView("forgotPasswordCode");
                }}
                className="rounded-[14px] border border-[#8f8f8f] bg-[#d9d9d9] px-5 py-6 text-left text-[#333] shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition hover:border-[#f2552c]"
              >
                <div className="flex items-center gap-4">
                  <MailIcon />
                  <div>
                    <p className="text-[12px] text-[#666]">Send Code via Email</p>
                    <p className="mt-1.5 text-[14px] font-medium">{maskedEmail}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {authView === "forgotPasswordCode" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAuthView("forgotPasswordReset");
            }}
            className="space-y-6"
          >
            <button
              type="button"
              onClick={() => setAuthView("forgotPasswordMethod")}
              className="text-[#222] transition hover:text-[#f2552c]"
              aria-label="Back to reset method"
            >
              <BackIcon />
            </button>

            <div className="text-center">
              <h2 className="text-[24px] font-bold leading-none text-[#303030] sm:text-[28px]">
                Reset Password
              </h2>
              <p className="mt-3 text-[12px] leading-5 text-[#777]">
                Input the 4-digit code sent to
                <br />
                {codeTarget}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {resetCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateResetCode(index, e.target.value)}
                  className="h-14 w-12 rounded-[8px] border border-[#d8c1b8] bg-[#ead8d2] text-center text-[22px] font-semibold text-[#333] shadow-[0_3px_8px_rgba(0,0,0,0.15)] outline-none transition focus:border-[#f2552c]"
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-[11px] font-semibold text-[#f2552c] transition hover:text-[#e74d24]"
              >
                Resend Code?
              </button>
            </div>

            <button
              type="submit"
              className="h-[44px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Continue
            </button>
          </form>
        )}

        {authView === "forgotPasswordReset" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidPassword(newPassword)) {
                setPasswordError("Password does not meet the required format.");
                setShowPasswordPopup(true);
                return;
              }
              if (newPassword !== confirmNewPassword) {
                setPasswordError("Passwords do not match.");
                return;
              }
              setPasswordError("");
              setAuthView("forgotPasswordSuccess");
            }}
            className="space-y-6"
          >
            <button
              type="button"
              onClick={() => setAuthView("forgotPasswordCode")}
              className="text-[#222] transition hover:text-[#f2552c]"
              aria-label="Back to verification code"
            >
              <BackIcon />
            </button>

            <div className="text-center">
              <h2 className="text-[24px] font-bold uppercase leading-none text-[#303030] sm:text-[28px]">
                Reset Password
              </h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <LabelInput
                  label="Enter New Password"
                  placeholder="Enter New Password"
                  withEye
                  value={newPassword}
                  onChange={(value) => {
                    setNewPassword(value);
                    if (passwordError) setPasswordError("");
                  }}
                  onFocus={() => setShowPasswordPopup(true)}
                  onBlur={() => setShowPasswordPopup(false)}
                  invalid={Boolean(passwordError) && !isValidPassword(newPassword)}
                />
                {showPasswordPopup && <PasswordRequirementsPopup />}
              </div>

              <LabelInput
                label="Re-Enter New Password"
                placeholder="Re-Enter New Password"
                withEye
                value={confirmNewPassword}
                onChange={(value) => {
                  setConfirmNewPassword(value);
                  if (passwordError) setPasswordError("");
                }}
                invalid={Boolean(passwordError) && newPassword !== confirmNewPassword}
              />
            </div>

            {passwordError && (
              <p className="text-[12px] font-medium text-[#d94c3d]">{passwordError}</p>
            )}

            <button
              type="submit"
              className="h-[44px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Confirm
            </button>
          </form>
        )}

        {authView === "forgotPasswordSuccess" && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[28px] font-bold text-[#303030]">Password Reset</h2>

            <img
              src="/passwordreset.png"
              alt="Password reset"
              className="my-6 h-28 w-28 object-contain mix-blend-multiply"
            />

            <p className="mb-10 max-w-[240px] text-[13px] leading-6 text-[#666]">
              Your Password has been changed!
              <br />
              Please Login again.
            </p>

            <button
              type="button"
              onClick={resetAll}
              className="h-[44px] w-full max-w-[220px] rounded-xl bg-[#f2552c] text-[15px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Back to Login
            </button>
          </div>
        )}

        {authView === "default" && activeTab === "login" && signupStep === 1 && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError("");
              const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.loginEmail,
                password: formData.loginPassword,
              });
              if (error) {
                setAuthError(error.message);
              } else {
                const user = data.user;
                const metadataRole = user?.user_metadata?.role;
                
                if (metadataRole === 'pending_dispatcher') {
                   setAuthError("Your account is still pending admin review.");
                   await supabase.auth.signOut();
                   return;
                }

                if (metadataRole === 'admin' || user?.email === 'admin_test@test.com') {
                   router.push("/admin");
                   return;
                }

                // Or check user_profiles for actual DB role if metadata doesn't have it
                const { data: profile } = await supabase
                   .from('user_profiles')
                   .select('role')
                   .eq('auth_user_id', user?.id)
                   .single();
                   
                if (profile?.role === 'admin') {
                   router.push("/admin");
                } else {
                   router.push("/dashboard");
                }
              }
            }}
            className="space-y-4"
          >
            <LabelInput
              label="Email"
              placeholder="Email"
              type="email"
              value={formData.loginEmail}
              onChange={(v) => updateField("loginEmail", v)}
            />

            <LabelInput
              label="Password"
              placeholder="Password"
              withEye
              value={formData.loginPassword}
              onChange={(v) => updateField("loginPassword", v)}
            />

            <div className="flex items-center justify-between gap-3 px-1 text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 text-[#4f4f4f]">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="h-4 w-4 rounded border border-[#a9a9a9] accent-[#f2552c]"
                />
                <span>Remember Password</span>
              </label>

              <button
                type="button"
                onClick={() => setAuthView("forgotPassword")}
                className="font-semibold text-[#f2552c] transition hover:text-[#e74d24]"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 h-[44px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Login
            </button>

            {authError && (
              <p className="text-[12px] font-medium text-[#d94c3d] text-center mt-2">{authError}</p>
            )}

            <div className="text-center mt-3">
              <p className="text-[13px] text-[#676767]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setSignupStep(1);
                  }}
                  className="font-bold text-[#f2552c] hover:text-[#e74d24] transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>

            <SocialLogin text="Or login with" />
          </form>
        )}

        {authView === "default" && activeTab === "signup" && signupStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidPassword(formData.signupPassword)) {
                setPasswordError("Password does not meet the required format.");
                setShowPasswordPopup(true);
                return;
              }
              if (formData.signupPassword !== formData.reenterPassword) {
                setPasswordError("Passwords do not match.");
                return;
              }
              setPasswordError("");
              setSignupStep(2);
            }}
            className="space-y-2.5"
          >
            <div className="grid grid-cols-2 gap-3">
              <LabelInput
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChange={(v) => updateField("firstName", v)}
              />
              <LabelInput
                label="Last Name"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(v) => updateField("lastName", v)}
              />
            </div>

            <LabelInput
              label="Email"
              placeholder="Email"
              type="email"
              value={formData.signupEmail}
              onChange={(v) => updateField("signupEmail", v)}
            />

            <LabelInput
              label="Phone Number"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={(v) => updateField("phoneNumber", v)}
            />

            <div className="relative">
              <LabelInput
                label="Password"
                placeholder="Password"
                withEye
                value={formData.signupPassword}
                onChange={(v) => {
                  updateField("signupPassword", v);
                  if (passwordError) setPasswordError("");
                }}
                onFocus={() => setShowPasswordPopup(true)}
                onBlur={() => setShowPasswordPopup(false)}
                invalid={Boolean(passwordError) && !isValidPassword(formData.signupPassword)}
              />
              {showPasswordPopup && <PasswordRequirementsPopup />}
            </div>

            <LabelInput
              label="Re-Enter Password"
              placeholder="Re-enter password"
              withEye
              value={formData.reenterPassword}
              onChange={(v) => {
                updateField("reenterPassword", v);
                if (passwordError) setPasswordError("");
              }}
              invalid={Boolean(passwordError) && formData.signupPassword !== formData.reenterPassword}
            />

            {passwordError && (
              <p className="text-[12px] font-medium text-[#d94c3d]">{passwordError}</p>
            )}

            <button
              type="submit"
              className="mt-5 h-[44px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white transition hover:bg-[#e74d24]"
            >
              Continue
            </button>

            <div className="text-center mt-3">
              <p className="text-[13px] text-[#676767]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setSignupStep(1);
                  }}
                  className="font-bold text-[#f2552c] hover:text-[#e74d24] transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>

            <SocialLogin text="Or sign up with" />
          </form>
        )}

        {authView === "default" && activeTab === "signup" && signupStep === 2 && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError("");

              if (!verificationFile) {
                setAuthError("Please upload an ID for verification.");
                return;
              }

              const fileExt = verificationFile.name.split('.').pop();
              const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

              const fileFormData = new FormData();
              fileFormData.append("file", verificationFile);
              fileFormData.append("fileName", fileName);

              const uploadRes = await fetch("/api/upload-id", {
                method: "POST",
                body: fileFormData,
              });

              if (!uploadRes.ok) {
                const upErr = await uploadRes.json();
                setAuthError("Remote ID upload failed: " + (upErr.error || "Please wait and try again."));
                return;
              }

              const { error } = await supabase.auth.signUp({
                email: formData.signupEmail,
                password: formData.signupPassword,
                options: {
                  data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phoneNumber,
                    id_number: formData.idNumber,
                    document_filename: fileName,
                    role: 'pending_dispatcher'
                  }
                }
              });

              if (error) {
                setAuthError(error.message);
              } else {
                setSignupStep("success");
              }
            }}
            className="space-y-5"
          >
            <LabelInput
              label="ID Number"
              placeholder="Enter ID number"
              requiredMark
              value={formData.idNumber}
              onChange={(v) => updateField("idNumber", v)}
            />

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#4f4f4f] sm:text-[14px]">
                Upload ID for Verification
                <span className="text-[#f2552c]">*</span>
              </label>

              <div className="rounded-[28px] border-2 border-dashed border-[#acacac] bg-[#ead8d2] px-5 py-6 text-center">
                <div className="mb-3 flex justify-center">
                  <UploadIcon />
                </div>

                <p className="text-[13px] font-semibold text-[#3f4d66]">
                  Drop your ID here or click to browse
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-full bg-[#f2552c] px-5 py-1.5 text-[11px] font-semibold text-white"
                >
                  Browse Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setVerificationFile(e.target.files?.[0] ?? null)
                  }
                />

                {verificationFile && (
                  <p className="mt-2 break-all text-[10px] text-[#f2552c]">
                    {verificationFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="h-[42px] w-full rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white"
              >
                Sign Up
              </button>

              <button
                type="button"
                onClick={() => setSignupStep(1)}
                className="h-[42px] w-full rounded-xl bg-[#cfcfcf] text-[#3f3f3f]"
              >
                Back
              </button>
            </div>
            
            {authError && (
              <p className="text-[12px] font-medium text-[#d94c3d] text-center mt-2">{authError}</p>
            )}
          </form>
        )}

        {authView === "default" && signupStep === "success" && (
          <div className="flex flex-col items-center text-center">
            <p className="mb-2 text-[14px] font-semibold text-[#f2552c]">
              Registration Under Review
            </p>

            <p className="mb-5 text-[12px] text-[#666]">
              Your profile is being <span className="font-semibold">Verified</span>
            </p>

            <div className="mb-6 flex justify-center">
              <img
                src="/art-auth.png"
                alt="Under Review"
                className="h-auto w-[220px] object-contain"
              />
            </div>

            <h2 className="mb-4 text-[20px] font-bold leading-tight text-[#222]">
              Your profile
              <br />
              is under review
            </h2>

            <p className="mb-8 max-w-[270px] text-[12px] leading-relaxed text-[#666]">
              Your profile has been submitted & will be reviewed by our team.
              You will be notified if any extra information is needed.
            </p>

            <button
              type="button"
              onClick={resetAll}
              className="mb-3 h-[46px] w-full max-w-[240px] rounded-xl bg-[#f2552c] text-[16px] font-semibold text-white shadow-lg transition hover:bg-[#e74d24]"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      <div className="absolute -bottom-8 left-1/2 flex h-[92px] w-[92px] -translate-x-1/2 items-center justify-center rounded-full bg-[#f6f6f6] shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
        <img
          src="/logo-auth.png"
          alt="Logo"
          className="h-[72px] w-[72px] translate-x-[4px] object-contain"
        />
      </div>
    </div>
  );
}
