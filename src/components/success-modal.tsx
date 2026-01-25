"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessModalState {
  show: boolean;
  message: string;
}

let globalShowSuccess: ((message: string) => void) | null = null;

export function showSuccess(message: string) {
  if (globalShowSuccess) {
    globalShowSuccess(message);
  }
}

export function SuccessModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SuccessModalState>({ show: false, message: "" });

  const show = useCallback((message: string) => {
    setState({ show: true, message });
    setTimeout(() => {
      setState({ show: false, message: "" });
    }, 1500);
  }, []);

  useEffect(() => {
    globalShowSuccess = show;
    return () => {
      globalShowSuccess = null;
    };
  }, [show]);

  return (
    <>
      {children}
      {state.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-scale-in mx-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce-once">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-xl font-bold text-zinc-800 dark:text-white text-center">
              {state.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
