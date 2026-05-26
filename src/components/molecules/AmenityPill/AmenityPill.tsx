import { AmenityIcon } from '../../atoms/AmenityIcon/AmenityIcon';
import { Badge } from '../../atoms/Badge/Badge';

interface AmenityPillProps {
  label: string;
  iconSrc?: string;
}

export const AmenityPill = ({ label, iconSrc }: AmenityPillProps) => {
  const tone = label.includes('Open') || label.includes('Pre-season') ? 'warm' : label.includes('Splash') ? 'cool' : 'neutral';
  return (
    <Badge tone={tone}>
      <AmenityIcon label={label} src={iconSrc} />
      {label}
    </Badge>
  );
};
