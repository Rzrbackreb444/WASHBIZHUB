import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NumberFieldProps {
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
  unit?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  min,
  max,
  step = 1,
  required = false,
  helpText,
  disabled = false,
  unit
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
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
          className={unit ? 'pr-12' : ''}
          data-testid={`input-${id}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
