import ChatInterface from '@/components/ChatInterface';
import Navbar from '@/components/Navbar';
import { getUserDataFromAPI } from '@/actions/auth';
import { redirect } from 'next/navigation';

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

export default async function ChatPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();
  
  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    console.log("Redirecting to login:", result.message);
    redirect('/login');
  }

  const user = result.data;

  // Type guard for user data
  const isValidUser = (data: unknown): data is UserData => {
    return data !== null && typeof data === 'object' && 'email' in data;
  };

  const typedUser = isValidUser(user) ? user : null;

  if (result.success && typedUser) {
    console.log("User data retrieved:", typedUser);
    if (typedUser.survey && !typedUser.survey.submitted) {
      redirect('/survey');
    }
  }

  // Ensure user is not null before rendering
  if (!typedUser) {
    redirect('/login');
  }

  // Transform user data to match ChatInterface expectations
  const chatUser = {
    id: typedUser.id || '',
    name: typedUser.name || typedUser.full_name || '',
    email: typedUser.email
  };

  return (
    <div className="bg-background text-foreground dark min-h-screen">
      <Navbar title="AI Assistant" showProfile={true} />
        <ChatInterface user={chatUser} />
    </div>
  );
}
