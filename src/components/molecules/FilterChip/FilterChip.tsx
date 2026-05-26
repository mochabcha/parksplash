import type { ReactNode } from 'react';
import { Button } from '../../atoms/Button/Button';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  leadingVisual?: ReactNode;
  trailingValue?: number | string;
}

export const FilterChip = ({ label, selected, onClick, leadingVisual, trailingValue }: FilterChipProps) => (
  <Button selected={selected} onClick={onClick}>
    {leadingVisual}
    {label}
    {trailingValue ? <span>{trailingValue}</span> : null}
  </Button>
);
