import type { IconProps } from './icon-props';

export function NavigationIcon({ size = 20, className, ...rest }: IconProps) {
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
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

export default NavigationIcon;
