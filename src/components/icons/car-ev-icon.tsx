import type { IconProps } from './icon-props';

export function CarEvIcon({ size = 20, className, ...rest }: IconProps) {
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
      <path d="M5 17h14v-5l-2-5H7L5 12v5z" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
      <path d="M12.5 8.5l-1.5 2.5h2l-1 2.5" />
    </svg>
  );
}

export default CarEvIcon;
