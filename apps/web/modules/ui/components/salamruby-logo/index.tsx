import { FeedyRubyMark } from "@/modules/ui/components/feedyruby-brand";

interface SalamRubyLogoProps {
  className?: string;
}

/** @deprecated Use FeedyRubyMark — kept for existing imports */
export const SalamRubyLogo = ({ className }: Readonly<SalamRubyLogoProps>) => (
  <FeedyRubyMark className={className} />
);
