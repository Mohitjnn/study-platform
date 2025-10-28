import ChatInterface from "@/components/ChatInterface";
import Navbar from "@/components/Navbar";
import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ChevronLeft, Ellipsis } from "lucide-react";

type Survey = {
  submitted: boolean;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  full_name?: string;
  survey?: Survey;
};

type ChatPageProps = {
  searchParams: {
    conversation_id?: string;
    link_id?: string;
    mode?: string;
  };
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  // Get URL parameters
  const conversationId = searchParams.conversation_id;
  const linkId = searchParams.link_id;
  const mode = searchParams.mode;

  // Get user data from API
  const result = await getUserDataFromAPI();

  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    redirect("/login");
  }

  // For free explore mode, we don't need conversation_id or link_id
  if (mode !== 'free-explore' && (!conversationId || !linkId)) {
    redirect("/dashboard");
  }

  const user = result.data;

  // Type guard for user data
  const isValidUser = (data: unknown): data is UserData => {
    return data !== null && typeof data === "object" && "email" in data;
  };

  const typedUser = isValidUser(user) ? user : null;

  if (result.success && typedUser) {
    if (typedUser.survey && !typedUser.survey.submitted) {
      redirect("/survey");
    }
  }

  // Ensure user is not null before rendering
  if (!typedUser) {
    redirect("/login");
  }

  // Transform user data to match ChatInterface expectations
  const chatUser = {
    id: typedUser.id || "",
    name: typedUser.name || typedUser.full_name || "",
    email: typedUser.email,
  };

  return (
    <div className="bg-[#010532] text-white dark min-h-screen px-5 pt-10 relative">
      {/* <Navbar title="AI Assistant" showProfile={true} /> */}

      <div className="absolute inset-0 flex justify-start items-start mt-24 -translate-x-20 right-0 ">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>
      <ChatInterface
        user={chatUser}
        conversationId={conversationId}
        linkId={linkId}
        mode={mode}
      />
    </div>
  );
}
