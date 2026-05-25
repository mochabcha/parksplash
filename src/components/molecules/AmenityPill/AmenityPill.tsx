import { Badge } from '../../atoms/Badge/Badge';

interface AmenityPillProps {
  label: string;
}

export const AmenityPill = ({ label }: AmenityPillProps) => {
  const tone = label.includes('Open') || label.includes('Pre-season') ? 'warm' : label.includes('Splash') ? 'cool' : 'neutral';
  return <Badge tone={tone}>{label}</Badge>;
};
