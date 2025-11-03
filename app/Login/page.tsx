"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";


export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/Dashboard" });
  };

  const handleManualLogin = (e: any) => {
    e.preventDefault();
    alert("Login manual em desenvolvimento...");
  };

  return (
    
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 overflow-hidden">
      
  
      <div 
        className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary opacity-30 rounded-full 
                   mix-blend-multiply filter blur-3xl animate-blob"
        style={{ animationDelay: '-2s' }} 
      />
 
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary opacity-30 rounded-full 
                   mix-blend-multiply filter blur-3xl animate-blob"
        style={{ animationDelay: '-4s' }}
      />
      
  
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-border opacity-30 rounded-full 
                   mix-blend-multiply filter blur-3xl animate-blob"
        style={{ animationDelay: '-6s' }}
      />
      
     
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        
        className="relative z-10 w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border bg-card" 
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
         
        </motion.div>

        {/* Title */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Bem-vindo(a)
          </h2>
          <p className="text-sm text-muted-foreground">
            Faça login para continuar
          </p>
        </div>

        {/* Botão Google */}
        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full mt-8 flex items-center justify-center gap-3 bg-purpleMain
            text-muted font-medium py-3 rounded-xl transition-all
            hover:bg-purple-hover disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <motion.div
              className="w-6 h-6 border-2 rounded-full border-popover border-t-transparent animate-spin"
            />
          ) : (
            <>
              <FcGoogle className="text-xl bg-white rounded-sm" />
              Entrar com Google
            </>
          )}
        </motion.button>

        {/* Rodapé */}
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <span className="text-purpleMain cursor-pointer hover:underline">
            termos de uso
          </span>
          .
        </p>
      </motion.div>
    </div>
  );
}