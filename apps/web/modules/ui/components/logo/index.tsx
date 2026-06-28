import { cn } from "@/lib/cn";
import { FeedyRubyMark } from "@/modules/ui/components/feedyruby-brand";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: Readonly<LogoProps>) => (
  <FeedyRubyMark className={cn("h-16 w-auto max-w-[4.5rem]", className)} priority />
);
