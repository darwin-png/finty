"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const dotColors = {
  success: "bg-green-400",
  error: "bg-red-400",
  info: "bg-blue-400",
};

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div
        className={`bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${dotColors[type]}`}></span>
        {message}
      </div>
    </div>
  );
}
