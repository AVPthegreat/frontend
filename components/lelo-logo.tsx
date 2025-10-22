export function LeLoLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-background rounded-sm transform rotate-45"></div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r
      
      from-purple-600 to-blue-900 bg-clip-text text-transparent">CODEBASE</span>
    </div>
  )
}
