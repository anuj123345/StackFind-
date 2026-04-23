"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GetStartedButtonProps {
  text?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function GetStartedButton({ text = "Get Started", className, href, onClick }: GetStartedButtonProps) {
  const router = useRouter();

  const handlePress = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    if (href) {
      router.push(href);
    }
  };

  const content = (
    <>
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
        {text}
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-[14px] z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/10 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white">
        <ChevronRight size={24} strokeWidth={3} aria-hidden="true" />
      </i>
    </>
  );

  return (
    <Button 
      onClick={handlePress}
      className={cn(
        "group relative overflow-hidden h-auto py-6 px-10 text-lg font-black rounded-2xl transition-all hover:scale-105 active:scale-95", 
        className
      )} 
    >
      {content}
    </Button>
  );
}
