import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
}

export function CurrencyField({
  id,
  label,
  value,
  onChange,
  placeholder = '0.00',
  min,
  max,
  step = 0.01,
  required = false,
  helpText,
  disabled = false
}: CurrencyFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          className="pl-9"
          data-testid={`input-${id}`}
        />
      </div>
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
