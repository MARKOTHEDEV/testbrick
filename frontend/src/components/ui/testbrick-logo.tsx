interface TestBrickLogoProps {
  className?: string;
  size?: number;
}

export const TestBrickLogo = ({
  className = "",
  size = 32,
}: TestBrickLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.1738 2.3247C10.7024 2.02587 10.9667 1.87646 11.257 1.87646C11.5472 1.87646 11.8116 2.02587 12.3402 2.3247L18.6165 5.87253C19.1451 6.17136 19.4095 6.32078 19.5546 6.56687C19.6997 6.81297 19.6997 7.1118 19.6997 7.70945V14.8051C19.6997 15.4028 19.6997 15.7016 19.5546 15.9477C19.4095 16.1937 19.1451 16.3432 18.6165 16.6421L12.3402 20.1899C11.8116 20.4887 11.5472 20.6381 11.257 20.6381C10.9667 20.6381 10.7024 20.4887 10.1738 20.1899L3.89745 16.6421C3.36881 16.3432 3.10449 16.1937 2.95936 15.9477C2.81424 15.7016 2.81424 15.4028 2.81424 14.8051V7.70945C2.81424 7.1118 2.81424 6.81297 2.95936 6.56687C3.10449 6.32078 3.36881 6.17136 3.89745 5.87253L10.1738 2.3247Z"
      stroke="currentColor"
      strokeWidth="1.4853"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5403 4.00586L12.3208 5.20671C11.8013 5.48773 11.5417 5.62824 11.257 5.62824C10.9723 5.62824 10.7126 5.48773 10.1932 5.20671L7.97369 4.00586"
      stroke="currentColor"
      strokeWidth="1.4853"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.257 10.896V20.6376M11.257 10.896L19.2307 6.56641M11.257 10.896L3.28328 6.56641"
      stroke="currentColor"
      strokeWidth="1.4853"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.81424 11.2568L5.52946 12.7188C6.03406 12.9906 6.28637 13.1264 6.42647 13.3705C6.56657 13.6147 6.56657 13.9185 6.56657 14.5261V17.8234"
      stroke="currentColor"
      strokeWidth="1.4853"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.6997 11.2568L16.9845 12.7188C16.4799 12.9906 16.2276 13.1264 16.0874 13.3705C15.9474 13.6147 15.9474 13.9185 15.9474 14.5261V17.8234"
      stroke="currentColor"
      strokeWidth="1.4853"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
