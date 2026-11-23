import { cn } from '@/utils/cn';

type HcmutLogoProps = {
  size?: number;
  className?: string;
  alt?: string;
};

export function HcmutLogo({
  size = 36,
  className,
  alt = 'HCMUT BK TP.HCM',
}: HcmutLogoProps) {
  return (
    <img
      src="/images/hcmut-bk-logo.png"
      alt={alt}
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

export default HcmutLogo;
