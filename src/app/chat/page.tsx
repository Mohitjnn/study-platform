import ChatInterface from '@/components/ChatInterface';
import Navbar from '@/components/Navbar';
import { getUserDataFromAPI } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function ChatPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();
  
  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    console.log("Redirecting to login:", result.message);
    redirect('/login');
  }

  const user = result.data;

  if (result.success) {
    console.log("User data retrieved:", user);
    if (!user.survey.submitted) {
      redirect('/survey');
    }
  }

  return (
    <div className="bg-background text-foreground dark min-h-screen">
      <Navbar title="AI Assistant" showProfile={true} />
        <ChatInterface user={user} />
    </div>
  );
}
