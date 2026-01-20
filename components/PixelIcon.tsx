
import React from 'react';

type IconType = 'home' | 'vibe' | 'ledger' | 'sensei' | 'quest' | 'trophy' | 'skull' | 'ghost' | 'sparkle' | 'chart' | 'pie';

interface PixelIconProps {
  type: IconType;
  size?: number;
  className?: string;
  color?: string;
}

const PixelIcon: React.FC<PixelIconProps> = ({ type, size = 24, className = "", color = "currentColor" }) => {
  const getPaths = () => {
    switch (type) {
      case 'home':
        return (
          <path d="M4 4h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v8h-2v-3h-4v3h-2v-8zM7 8h2v2h-2v-2z" />
        );
      case 'vibe':
        return (
          <path d="M2 4h10v8h-10v-8zM12 6h2v4h-2v-4zM4 6h2v4h-2v-4zM7 6h2v4h-2v-4z" />
        );
      case 'ledger':
        return (
          <path d="M3 2h10v12h-10v-12zM5 4h6v1h-6v-1zM5 6h6v1h-6v-1zM5 8h6v1h-6v-1zM5 10h4v1h-4v-1z" />
        );
      case 'sensei':
        return (
          <path d="M7 2h2v2h-2v-2zM5 5h6v1h-6v-1zM4 6h8v4h-1v4h-6v-4h-1v-4zM6 11h4v1h-4v-1z" />
        );
      case 'quest':
        return (
          <path d="M2 4h12v7h-1v1h-3v-1h-4v1h-3v-1h-1v-7zM4 6h2v2h-2v-2zM10 6h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z" />
        );
      case 'trophy':
        return (
          <path d="M4 2h8v1h1v4h-1v1h-1v2h2v1h-10v-1h2v-2h-1v-1h-1v-4h1v-1zM2 3h1v3h-1v-3zM13 3h1v3h-1v-3z" />
        );
      case 'skull':
        return (
          <path d="M5 2h6v1h1v3h1v4h-1v2h-1v1h-6v-1h-1v-2h-1v-4h1v-3h1v-1zM5 6h2v2h-2v-2zM9 6h2v2h-2v-2zM7 9h2v1h-2v-1z" />
        );
      case 'ghost':
        return (
          <path d="M4 2h8v1h1v9h-1v1h-1v1h-1v-1h-2v1h-2v-1h-1v1h-1v-1h-1v-11zM6 5h2v2h-2v-2zM10 5h2v2h-2v-2z" />
        );
      case 'sparkle':
        return (
          <path d="M7 2h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2zM2 7h2v2h-2v-2zM12 12h2v2h-2v-2z" />
        );
      case 'chart':
        return (
          <path d="M2 13h12v1h-12v-1zM4 10h2v3h-2v-3zM7 7h2v6h-2v-6zM10 4h2v9h-2v-9z" />
        );
      case 'pie':
        return (
          <path d="M8 2v6h6c0-3.3-2.7-6-6-6zM7 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h-6v-6z" />
        );
      default:
        return <path d="M2 2h12v12h-12z" />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      {getPaths()}
    </svg>
  );
};

export default PixelIcon;
