import type { IconProps } from './icon-props';

export function FlaskIcon({ size = 20, className, ...rest }: IconProps) {
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
      <path d="M9 3h6" />
      <path d="M10 9V3" />
      <path d="M14 9V3" />
      <path d="M10 9l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9" />
      <path d="M7.5 16h9" />
    </svg>
  );
}

export default FlaskIcon;
