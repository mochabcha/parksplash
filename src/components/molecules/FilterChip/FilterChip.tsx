import { Button } from '../../atoms/Button/Button';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export const FilterChip = ({ label, selected, onClick }: FilterChipProps) => (
  <Button selected={selected} onClick={onClick}>
    {label}
  </Button>
);
