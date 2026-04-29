// FlexiSpace Logo - Purple theme version of geometric cube
const Logo = ({ className = '', size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main cube structure with purple gradients */}
      <defs>
        <linearGradient id="purpleTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="purpleLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="purpleRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      
      {/* Top face */}
      <path 
        d="M50 5 L95 30 L50 55 L5 30 Z" 
        fill="url(#purpleTop)"
      />
      
      {/* Left face */}
      <path 
        d="M5 30 L50 55 L50 95 L5 70 Z" 
        fill="url(#purpleLeft)"
      />
      
      {/* Right face */}
      <path 
        d="M50 55 L95 30 L95 70 L50 95 Z" 
        fill="url(#purpleRight)"
      />
      
      {/* Highlight lines */}
      <path 
        d="M50 5 L50 55" 
        stroke="rgba(255,255,255,0.3)" 
        strokeWidth="1"
      />
      <path 
        d="M50 55 L95 30" 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="1"
      />
      <path 
        d="M50 55 L5 30" 
        stroke="rgba(0,0,0,0.1)" 
        strokeWidth="1"
      />
    </svg>
  )
}

export default Logo
