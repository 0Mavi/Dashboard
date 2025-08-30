import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";


export default function LoginPage() {

  

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
    
      <div className="relative hidden md:block">
        <Image
          src="/assests/login-image.png"
          alt="Comida variada"
          layout="fill"
          objectFit="cover"
          
        />
      </div>

    
      <div className="flex flex-col justify-center items-center px-8 py-10 bg-background">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-foreground mb-2">Entrar</h1>
          <p className="text-sm text-foreground font-medium mb-6">
            Entre com a sua conta
          </p>

          <form className="space-y-4">
            <Input
              placeholder="Seuemail@gmail.com"
              type="email"
              variant="formatLogin"
              
            />
            <Input
              placeholder="Senha"
              type="password"
              variant="formatLogin"
              
            />
            <Button
              type="submit"
              variant="gradient"

            >
              Entrar
            </Button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">Ou continue com:</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <div className="flex gap-4">
            <Button
              variant="icon"
             
            >
              <FcGoogle className="text-xl" /> Google
            
            </Button>
            <Button
              variant="icon"
            >
              <FaFacebookF className="text-blue-600 text-xl" /> Facebook
            </Button>
          </div>

          <p className="text-xs text-gray-600 mt-6 text-center">
            Ao registrar você concorda com os nossos{' '}
            <span className="text-foreground underline cursor-pointer">
              Termos e condições
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}