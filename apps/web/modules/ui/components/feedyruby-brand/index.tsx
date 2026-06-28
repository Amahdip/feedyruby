import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { APP_NAME, APP_NAME_LATIN } from "@/lib/brand-color";
import { cn } from "@/lib/cn";

interface BrandImageProps {
  className?: string;
  priority?: boolean;
  isRtl?: boolean;
  isDark?: boolean;
}

export const FeedyRubyIcon = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.icon}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("size-8", className)}
  />
);

export const FeedyRubyIconLight = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.iconSimple}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("size-8", className)}
  />
);

export const FeedyRubyMark = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.icon}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("h-auto w-full max-w-[5rem]", className)}
  />
);

export const FeedyRubyWordmark = ({
  className,
  priority = false,
  isRtl = false,
  isDark = false,
}: Readonly<BrandImageProps>) => {
  let src: string = BRAND_ASSETS.wordmarkLight;
  if (isRtl) {
    src = isDark ? BRAND_ASSETS.wordmarkFaDark : BRAND_ASSETS.wordmarkFaLight;
  } else {
    src = isDark ? BRAND_ASSETS.wordmarkDark : BRAND_ASSETS.wordmarkLight;
  }

  return (
    <Image
      src={src}
      alt={isRtl ? "فیدی‌روبی" : APP_NAME_LATIN}
      width={isRtl ? 290 : 256}
      height={isRtl ? 60 : 56}
      priority={priority}
      className={cn("h-8 w-auto max-w-[10rem]", className)}
    />
  );
};
