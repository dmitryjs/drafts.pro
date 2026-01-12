import FavoritesIconSvg from "@assets/icons/Favorites.svg";

interface FavoritesIconProps {
  className?: string;
  isActive?: boolean;
}

export default function FavoritesIcon({ className, isActive = false }: FavoritesIconProps) {
  return (
    <img 
      src={FavoritesIconSvg} 
      alt="Favorite" 
      className={className}
      style={{ 
        filter: isActive 
          ? 'brightness(0) saturate(100%) invert(100%)' // white when active
          : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
      }}
    />
  );
}
