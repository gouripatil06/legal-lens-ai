"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ?mode=signup or ?mode=signin in URL for tab switching
  useEffect(() => {
    const mode = searchParams?.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('signin');
    }
  }, [searchParams]);

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = '/';
    }
  }, [isLoaded, isSignedIn]);

  if (!mounted || !isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      {/* Main container with glassmorphism effect */}
      <div className={`w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl overflow-hidden relative shadow-2xl backdrop-blur-xl border ${
        !mounted
          ? 'bg-gray-800/90 border-gray-700/50'
          : theme === 'light'
            ? 'bg-white/60 border-gray-200/30'
            : 'bg-gray-800/60 border-gray-700/30'
      }`}>
        {/* Glass morphism tabs */}
        <div className="flex p-2 gap-2">
          <button
            onClick={() => setAuthMode("signin")}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden ${
              authMode === "signin"
                ? !mounted || theme === 'dark'
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30"
                  : "bg-gray-900/20 text-gray-900 shadow-lg backdrop-blur-md border border-gray-900/30"
                : !mounted || theme === 'dark'
                  ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  : "bg-gray-900/5 text-gray-600 hover:bg-gray-900/10 hover:text-gray-800 backdrop-blur-sm border border-gray-900/10 hover:border-gray-900/20"
            } ${authMode === "signin" ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700" : ""}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden ${
              authMode === "signup"
                ? !mounted || theme === 'dark'
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30"
                  : "bg-gray-900/20 text-gray-900 shadow-lg backdrop-blur-md border border-gray-900/30"
                : !mounted || theme === 'dark'
                  ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  : "bg-gray-900/5 text-gray-600 hover:bg-gray-900/10 hover:text-gray-800 backdrop-blur-sm border border-gray-900/10 hover:border-gray-900/20"
            } ${authMode === "signup" ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700" : ""}`}
          >
            Sign Up
          </button>
        </div>

        {/* Clerk Content Area */}
        <div className="flex justify-center items-center min-h-[450px] mx-2 mb-2">
          {authMode === "signin" ? (
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: '#FF6B00',
                  colorBackground: !mounted || theme === 'dark' ? 'transparent' : 'transparent',
                  colorText: !mounted || theme === 'dark' ? '#FFFFFF' : '#1F2937',
                  colorInputBackground: !mounted || theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  colorInputText: !mounted || theme === 'dark' ? '#FFFFFF' : '#1F2937',
                },
                elements: {
                  card: 'shadow-none border-none p-3 md:p-4 max-w-full bg-transparent rounded-none',
                  cardBox: 'shadow-none border-none bg-transparent rounded-none',
                  main: 'shadow-none border-none bg-transparent rounded-none',
                  rootBox: 'shadow-none border-none bg-transparent rounded-none',
                  headerTitle: `text-lg font-bold ${!mounted || theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
                  headerSubtitle: `text-sm ${!mounted || theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`,
                  socialButtonsIconButton: `backdrop-blur-sm border rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 border-gray-900/20 hover:border-gray-900/40'
                    }`,
                  socialButtonsBlockButton: `backdrop-blur-sm border rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 border-gray-900/20 hover:border-gray-900/40'
                    }`,
                  formFieldLabel: `text-sm font-medium ${!mounted || theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`,
                  formFieldInput: `backdrop-blur-sm border-0 rounded-xl py-3 px-4 w-full focus:ring-2 focus:ring-orange-400 text-sm transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 text-white placeholder-gray-400'
                      : 'bg-gray-900/10 text-gray-900 placeholder-gray-500'
                    }`,
                  formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl w-full text-sm border-none shadow-lg transition-all duration-200 backdrop-blur-sm',
                  footer: 'hidden',
                  footerAction: 'hidden',
                  dividerLine: `${!mounted || theme === 'dark' ? 'bg-white/20' : 'bg-gray-900/20'}`,
                  dividerText: `text-sm ${!mounted || theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`,
                  formFieldErrorText: 'text-red-400 text-xs',
                  identityPreviewEditButton: 'text-orange-500 hover:text-orange-400 text-sm',
                  alternativeMethodsBlockButton: `backdrop-blur-sm rounded-xl text-sm transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
                    }`,
                  otpCodeFieldInput: `backdrop-blur-sm rounded-lg h-12 w-10 text-center text-base font-medium border focus:ring-2 focus:ring-orange-400 transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-gray-900/10 text-gray-900 border-gray-900/20'
                    }`,
                },
              }}
              signUpUrl="/login?mode=signup"
              routing="hash"
            />
          ) : (
            <SignUp
              appearance={{
                variables: {
                  colorPrimary: '#FF6B00',
                  colorBackground: !mounted || theme === 'dark' ? 'transparent' : 'transparent',
                  colorText: !mounted || theme === 'dark' ? '#FFFFFF' : '#1F2937',
                  colorInputBackground: !mounted || theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  colorInputText: !mounted || theme === 'dark' ? '#FFFFFF' : '#1F2937',
                },
                elements: {
                  card: 'shadow-none border-none p-3 md:p-4 max-w-full bg-transparent rounded-none',
                  cardBox: 'shadow-none border-none bg-transparent rounded-none',
                  main: 'shadow-none border-none bg-transparent rounded-none',
                  rootBox: 'shadow-none border-none bg-transparent rounded-none',
                  headerTitle: `text-lg font-bold ${!mounted || theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
                  headerSubtitle: `text-sm ${!mounted || theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`,
                  socialButtonsIconButton: `backdrop-blur-sm border rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 border-gray-900/20 hover:border-gray-900/40'
                    }`,
                  socialButtonsBlockButton: `backdrop-blur-sm border rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 border-gray-900/20 hover:border-gray-900/40'
                    }`,
                  formFieldLabel: `text-sm font-medium ${!mounted || theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`,
                  formFieldInput: `backdrop-blur-sm border-0 rounded-xl py-3 px-4 w-full focus:ring-2 focus:ring-orange-400 text-sm transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 text-white placeholder-gray-400'
                      : 'bg-gray-900/10 text-gray-900 placeholder-gray-500'
                    }`,
                  formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl w-full text-sm border-none shadow-lg transition-all duration-200 backdrop-blur-sm',
                  footer: 'hidden',
                  footerAction: 'hidden',
                  dividerLine: `${!mounted || theme === 'dark' ? 'bg-white/20' : 'bg-gray-900/20'}`,
                  dividerText: `text-sm ${!mounted || theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`,
                  formFieldErrorText: 'text-red-400 text-xs',
                  identityPreviewEditButton: 'text-orange-500 hover:text-orange-400 text-sm',
                  alternativeMethodsBlockButton: `backdrop-blur-sm rounded-xl text-sm transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
                    }`,
                  otpCodeFieldInput: `backdrop-blur-sm rounded-lg h-12 w-10 text-center text-base font-medium border focus:ring-2 focus:ring-orange-400 transition-all duration-200 ${!mounted || theme === 'dark'
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-gray-900/10 text-gray-900 border-gray-900/20'
                    }`,
                },
              }}
              signInUrl="/login?mode=signin"
              routing="hash"
            />
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Hack2Skill. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;
