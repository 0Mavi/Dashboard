import { InputArea } from "@/components/Chat/InputArea";
import { QuickActions } from "@/components/Chat/QuickActions";


export default function ChatPage() {
  const userName = "User";

  return (
    
    <div className="flex flex-col items-center flex-1 
                    min-h-[calc(100vh-80px)] 
                    text-foreground px-8 py-10 justify-end">
      
   
      <header className="text-center mb-16"> 
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Hi {userName}, Ready to master your time?
        </h1>
      </header>
      

      <main className="w-full max-w-4xl flex flex-col items-center"> 
        <InputArea placeholderText="O que você precisa priorizar?" />
      
      
        <footer className="w-full max-w-4xl mt-6 flex justify-center mb-10"> 
          
            <QuickActions />
        </footer>
      </main>
      
    </div>
  );
}