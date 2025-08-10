export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <svg 
                    aria-label="BaseStation Exchange logo" 
                    height="32" 
                    width="32" 
                    viewBox="0 0 48 48" 
                    xmlns="http://www.w3.org/2000/svg" 
                    role="img"
                    className="text-blue-500"
                >
                    <title>BaseStation Exchange logo</title>
                    {/* Simple geometric shape */}
                    <polygon 
                        points="24,8 36,18 36,30 24,40 12,30 12,18" 
                        fill="currentColor"
                    />
                    <polygon 
                        points="24,14 30,20 30,28 24,34 18,28 18,20" 
                        fill="currentColor" 
                        opacity="0.6"
                    />
                    <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.8"/>
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">BaseStation</span>
                <span className="text-blue-500 text-xs leading-none">Exchange</span>
            </div>
        </div>
    )
}