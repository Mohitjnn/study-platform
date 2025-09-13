import React from "react";
import Navbar from "@/components/Navbar";
import { SandboxInterface } from "@/components/sandbox/SandboxInterface";
import { redirect } from "next/navigation";
import { decodeToken } from "@/actions/auth";

export default async function SandboxPage() {
  const result = await decodeToken();
  if (!(result.success && result.data?.email === "adarsh@test.com")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            AI Conversation Sandbox
          </h1>
          <p className="text-muted-foreground">
            Test and experiment with different WebRTC conversation settings
          </p>
        </div>
        <SandboxInterface />
      </div>
    </div>
  );
}
