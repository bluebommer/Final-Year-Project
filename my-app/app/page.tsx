"use client";
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from "react";
import { Page } from "./index";
import { HAS_ACCOUNT_FLAG } from "./Components/RootComponents/Authpage";
const AuthPage = dynamic(() => import('./Components/RootComponents/Authpage'));
const PreferencesPage = dynamic(() => import('./Components/RootComponents/PreferencesPage'));
const WelcomePage = dynamic(() => import('./Components/RootComponents/WelcomePage'));



export default function Home() {
  const [page, setPage] = useState<Page>("welcome");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [returningUser, setReturningUser] = useState(false);

  // A returning user (already has an account, just landed here because their
  // session expired) should go straight to sign-in — not redo welcome/preferences.
  useEffect(() => {
    if (localStorage.getItem(HAS_ACCOUNT_FLAG) === "1") {
      setReturningUser(true);
      setPage("auth");
    }
  }, []);

  const handleGetStarted = () => setPage("preferences");

  const handlePreferencesContinue = (topics: string[]) => {
    setSelectedTopics(topics);
    setPage("auth");
  };

  // AuthPage handles the actual redirect to /home once sign-in/registration
  // succeeds — selectedTopics is threaded into AuthPage's own API calls
  // instead of being handled here.
  const handleAuthComplete = () => {};

  return (
    <>
      {page === "welcome" && <WelcomePage onGetStarted={handleGetStarted} />}
      {page === "preferences" && <PreferencesPage onContinue={handlePreferencesContinue} />}
      {page === "auth" && (
        <AuthPage
          onAuthComplete={handleAuthComplete}
          topics={selectedTopics}
          initialMode={returningUser ? "signin" : "signup"}
        />
      )}
    </>
  );
}