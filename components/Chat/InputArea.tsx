
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, ChevronRight, Plus, Wrench } from 'lucide-react';

interface InputAreaProps {
  placeholderText: string;
}

export function InputArea({ placeholderText }: InputAreaProps) {
  return (
   
    <div className="relative flex items-center bg-background border border-muted rounded-full py-3 px-6 shadow-lg transition duration-300 hover:shadow-xl w-full"> 
         
      <div className="flex items-center space-x-1 mr-4"> 
        <Button 
          variant="icon" 
          size="icon" 
          className="rounded-full h-8 w-8 "
        >
          <Plus className="h-4 w-4"/>
        </Button>
        
      </div>
     
      <Input
        type="text"
        variant={"default"}
        placeholder={placeholderText}
        className="flex-1 border-none text-base bg-transparent px-0 py-0  placeholder:text-primary/50"
      />
      
  
      <div className="flex items-center space-x-1 ml-4"> 
        <ChevronRight className="h-5 w-5 text-primary cursor-pointer" />
       
        <Button 
          variant="icon" 
          size="icon" 
          className="rounded-full h-8 w-8"
        >
          <Mic className="h-4 w-4" />
        </Button>

       
      </div>
    </div>
  );
}