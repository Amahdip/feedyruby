import { FeedyRubyMark } from "@/modules/ui/components/feedyruby-brand";

interface FeedyRubyLogoProps {
  className?: string;
}

/** @deprecated Use FeedyRubyMark — kept for existing imports */
export const FeedyRubyLogo = ({ className }: Readonly<FeedyRubyLogoProps>) => (
  <FeedyRubyMark className={className} />
);
