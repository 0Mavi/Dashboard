"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth?client_id=724483825253-erp9rk04ot3r24a6npfamikdpmouprlg.apps.googleusercontent.com&redirect_uri=https://calendaraiapi.onrender.com/auth/google/login/&response_type=code&scope=https://www.googleapis.com/auth/calendar%20https://www.googleapis.com/auth/calendar.events%20openid%20email%20profile&access_type=offline&prompt=consent";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = GOOGLE_AUTH_URL; 
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 overflow-hidden">
 

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border bg-card"
      >
        <div className="text-center mt-6">
          
          <h2 className="text-2xl font-semibold text-foreground">
            Bem-vindo(a) ao <br /> <span className="mt-2 text-[30px]">Sync Study</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-4">
            Faça login para continuar
          </p>
        </div>

        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full mt-3 flex items-center justify-center gap-3 bg-purpleMain
            text-foreground font-medium py-3 rounded-xl transition-all
            hover:bg-purple-hover disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <motion.div className="w-6 h-6 border-2 rounded-full border-popover border-t-transparent animate-spin " />
          ) : (
            <>
              <FcGoogle className="text-xl bg-white rounded-full" />
              Entrar com Google
            </>
          )}
        </motion.button>

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
