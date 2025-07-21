export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <svg 
                    aria-label="Basecoin logo" 
                    height="32" 
                    width="32" 
                    viewBox="0 0 48 48" 
                    xmlns="http://www.w3.org/2000/svg" 
                    role="img"
                    className="text-blue-500"
                >
                    <title>Basecoin logo</title>
                    {/* Custom BYOC logo design */}
                    <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.1"/>
                    <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.2"/>
                    <circle cx="24" cy="24" r="12" fill="currentColor" opacity="0.3"/>
                    <circle cx="24" cy="24" r="8" fill="currentColor"/>
                    <path 
                        d="M24 8 L32 16 L24 24 L16 16 Z" 
                        fill="currentColor" 
                        opacity="0.8"
                    />
                    <path 
                        d="M24 24 L32 32 L24 40 L16 32 Z" 
                        fill="currentColor" 
                        opacity="0.6"
                    />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">Basecoin</span>
                <span className="text-blue-500 text-xs leading-none">BYOC</span>
            </div>
        </div>
    )
}