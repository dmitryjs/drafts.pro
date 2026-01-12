import DislikeIconSvg from "@assets/icons/Dislike.svg";

interface DislikeIconProps {
  className?: string;
  isActive?: boolean;
}

export default function DislikeIcon({ className, isActive = false }: DislikeIconProps) {
  return (
    <img 
      src={DislikeIconSvg} 
      alt="Dislike" 
      className={className}
      style={{ 
        filter: isActive 
          ? 'brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(7498%) hue-rotate(1deg) brightness(101%) contrast(101%)' // #FF6030
          : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
      }}
    />
  );
}
