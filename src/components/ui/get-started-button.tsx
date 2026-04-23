"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface GetStartedButtonProps {
  text?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function GetStartedButton({ text = "Get Started", className, href, onClick }: GetStartedButtonProps) {
  const content = (
    <div className="flex items-center justify-center w-full h-full">
      <span className="relative z-0 mr-12 transition-opacity duration-500 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute right-1 top-1 bottom-1 rounded-[14px] z-20 grid w-1/4 place-items-center transition-all duration-500 bg-white/10 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white pointer-events-none">
        <ChevronRight size={24} strokeWidth={3} aria-hidden="true" />
      </div>
    </div>
  );

  const sharedClasses = cn(
    "group relative inline-flex items-center justify-center overflow-hidden h-auto py-6 px-10 text-lg font-black rounded-2xl transition-all hover:scale-105 active:scale-95 bg-indigo-600 text-white border-none cursor-pointer select-none", 
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cn(sharedClasses, "no-underline")}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={sharedClasses}>
      {content}
    </button>
  );
}
