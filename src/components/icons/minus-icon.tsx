import type { IconProps } from './icon-props';

export function MinusIcon({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      className={className}
      {...rest}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default MinusIcon;
