import type { IconProps } from './icon-props';

export function ChargingStationIcon({
  size = 20,
  className,
  ...rest
}: IconProps) {
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
      <path d="M14 20H4V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15z" />
      <path d="M2 20h14" />
      <path d="M14 10h2a2 2 0 0 1 2 2v4a2 2 0 0 0 4 0v-6l-2-2" />
      <path d="M9.5 7.5L7.5 11h3l-2 3.5" />
    </svg>
  );
}

export default ChargingStationIcon;
