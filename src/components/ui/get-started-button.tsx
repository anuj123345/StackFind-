import { Button } from "@/components/ui/button";
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
    <>
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
        {text}
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-[14px] z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/10 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white">
        <ChevronRight size={24} strokeWidth={3} aria-hidden="true" />
      </i>
    </>
  );

  const classes = cn(
    "group relative overflow-hidden h-auto py-6 px-10 text-lg font-black rounded-2xl transition-all hover:scale-105 active:scale-95", 
    className
  );

  if (href) {
    return (
      <Button asChild className={classes}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button onClick={onClick} className={classes}>
      {content}
    </Button>
  );
}
