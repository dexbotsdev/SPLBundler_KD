export function RocketIcon() {
    return (
      <div className="relative w-full h-full">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#4F6EF6] opacity-20 blur-3xl rounded-full" />
        
        {/* Rocket */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <path
            d="M12 2L8 6V12L4 16H20L16 12V6L12 2Z"
            fill="#4F6EF6"
            className="animate-pulse"
          />
          <circle
            cx="12"
            cy="9"
            r="2"
            fill="#8BA4FF"
          />
          <path
            d="M12 14V20"
            stroke="#4F6EF6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
  
        {/* Ring */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-8 border-2 border-[#4F6EF6] rounded-full opacity-50" />
      </div>
    )
  }
  
  