
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/9c85be55-ffae-484a-ac75-2e2ea6b2038f.png" 
        alt="AccoSight Logo" 
        className="h-8 w-auto"
      />
      {showText && (
        <span className="text-xl font-semibold text-foreground">
          AccoSight
        </span>
      )}
    </div>
  );
};
