import { cn } from '@/utils/cn';

type AuthTransitIllustrationProps = {
  className?: string;
};

/**
 * Custom VNU EV Hub & Metro Line 1 vector illustration matching Figma M0_1_Desktop_Login.
 */
export function AuthTransitIllustration({
  className,
}: AuthTransitIllustrationProps) {
  return (
    <div className={cn('w-full max-w-[460px]', className)}>
      <svg
        viewBox="0 0 460 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full"
        role="img"
        aria-label="VNU-HCM EV Hub and Metro Line 1 transit network diagram"
      >
        {/* Subtle translucent campus backdrop arch */}
        <rect
          x="64"
          y="18"
          width="332"
          height="156"
          rx="28"
          fill="white"
          fillOpacity="0.06"
          stroke="white"
          strokeOpacity="0.12"
        />

        {/* Metro badge pill */}
        <g transform="translate(274 28)">
          <rect width="74" height="24" rx="8" fill="white" />
          <rect
            x="8"
            y="6"
            width="10"
            height="12"
            rx="2"
            stroke="#030391"
            strokeWidth="1.5"
          />
          <line
            x1="10"
            y1="10"
            x2="16"
            y2="10"
            stroke="#030391"
            strokeWidth="1.3"
          />
          <text
            x="24"
            y="15.5"
            fill="#030391"
            fontSize="9.5"
            fontWeight="700"
            fontFamily="Be Vietnam Pro, sans-serif"
            letterSpacing="0.06em"
          >
            METRO
          </text>
        </g>

        {/* Left EV Hub Shelter Canopy */}
        <rect
          x="28"
          y="74"
          width="162"
          height="14"
          rx="4"
          fill="white"
          fillOpacity="0.18"
          stroke="white"
          strokeOpacity="0.4"
        />
        <text
          x="42"
          y="99"
          fill="white"
          fillOpacity="0.8"
          fontSize="8.5"
          fontWeight="700"
          fontFamily="IBM Plex Mono, monospace"
          letterSpacing="0.08em"
        >
          VNU · EV HUB
        </text>
        <line
          x1="38"
          y1="88"
          x2="38"
          y2="174"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="2.5"
        />
        <line
          x1="180"
          y1="88"
          x2="180"
          y2="174"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="2.5"
        />

        {/* Shared E-Bike 1 */}
        <g
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="58" cy="160" r="11" />
          <circle cx="94" cy="160" r="11" />
          <path d="M58 160 L72 142 L88 142 L94 160" />
          <path d="M72 142 L68 134 L62 134" />
          <path d="M88 142 L84 130 L90 128" />
        </g>

        {/* Shared E-Bike 2 */}
        <g
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="114" cy="160" r="11" />
          <circle cx="146" cy="160" r="11" />
          <path d="M114 160 L126 142 L140 142 L146 160" />
          <path d="M126 142 L122 134 L117 134" />
          <path d="M140 142 L136 130 L142 128" />
        </g>

        {/* Charging Pedestal */}
        <rect x="155" y="122" width="18" height="52" rx="4" fill="white" />
        <path
          d="M165 130 L161 137 H165 L163 144 L168 136 H164 L165 130 Z"
          fill="#030391"
        />
        <circle cx="164" cy="154" r="3" fill="#10B981" />

        {/* Elevated Metro Train */}
        <rect x="208" y="78" width="184" height="64" rx="14" fill="white" />
        <rect
          x="220"
          y="90"
          width="26"
          height="22"
          rx="4"
          fill="#1488D8"
          fillOpacity="0.85"
        />
        <rect
          x="254"
          y="90"
          width="26"
          height="22"
          rx="4"
          fill="#1488D8"
          fillOpacity="0.85"
        />
        <rect
          x="288"
          y="90"
          width="26"
          height="22"
          rx="4"
          fill="#1488D8"
          fillOpacity="0.85"
        />
        <rect
          x="322"
          y="90"
          width="54"
          height="22"
          rx="5"
          fill="#1488D8"
          fillOpacity="0.85"
        />
        <rect x="208" y="122" width="184" height="5" fill="#1488D8" />
        <circle cx="242" cy="144" r="7" fill="white" />
        <circle cx="356" cy="144" r="7" fill="white" />

        {/* Elevated viaduct */}
        <rect
          x="198"
          y="148"
          width="224"
          height="6"
          rx="3"
          fill="white"
          fillOpacity="0.45"
        />
        <line
          x1="234"
          y1="154"
          x2="234"
          y2="174"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="3"
        />
        <line
          x1="362"
          y1="154"
          x2="362"
          y2="174"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="3"
        />

        {/* Ground line */}
        <line
          x1="20"
          y1="175"
          x2="440"
          y2="175"
          stroke="white"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />

        {/* Legend caption */}
        <circle cx="116" cy="198" r="3" fill="white" fillOpacity="0.7" />
        <text
          x="126"
          y="201"
          fill="white"
          fillOpacity="0.75"
          fontSize="9"
          fontWeight="600"
          fontFamily="Be Vietnam Pro, sans-serif"
          letterSpacing="0.08em"
        >
          CAMPUS HUBS
        </text>
        <line
          x1="205"
          y1="198"
          x2="236"
          y2="198"
          stroke="white"
          strokeOpacity="0.35"
        />
        <text
          x="244"
          y="201"
          fill="white"
          fillOpacity="0.75"
          fontSize="9"
          fontWeight="600"
          fontFamily="Be Vietnam Pro, sans-serif"
          letterSpacing="0.08em"
        >
          METRO NETWORK
        </text>
      </svg>
    </div>
  );
}
