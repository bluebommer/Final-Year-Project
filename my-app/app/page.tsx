"use client";
import dynamic from 'next/dynamic';
import React, { useState } from "react";
import { Page, UserProfile } from "./index";
const WelcomePage = dynamic(() => import('./components/WelcomePage'));
const PreferencesPage = dynamic(() => import('./components/PreferencesPage'));

const AuthPage = dynamic(() => import('./components/Authpage'));


export default function Home() {
  const [page, setPage] = useState<Page>("welcome");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleGetStarted = () => setPage("preferences");

  const handlePreferencesContinue = (topics: string[]) => {
    setSelectedTopics(topics);
    setPage("auth");
  };

  const handleAuthComplete = (authData: { name: string; gender: string; email: string }) => {
    const profile: UserProfile = { ...authData, topics: selectedTopics };
    console.log("User profile complete:", profile);
    alert(`Welcome, ${profile.name || "reader"}! Your feed is being built…`);
  };

  return (
    <>
      {page === "welcome" && <WelcomePage onGetStarted={handleGetStarted} />}
      {page === "preferences" && <PreferencesPage onContinue={handlePreferencesContinue} />}
      {page === "auth" && <AuthPage onAuthComplete={handleAuthComplete} />}
    </>
  );
}