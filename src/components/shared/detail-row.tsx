import { CardRow } from '@/components/ui';
import { cn } from '@/utils/cn';

type DetailRowProps = {
  label: string;
  value: string;
  mono?: boolean;
};

export function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <CardRow>
      <span className="text-caption text-ink-2">{label}</span>
      <span
        className={cn(
          'text-right text-body-sm font-semibold text-ink',
          mono && 'font-mono',
        )}
      >
        {value}
      </span>
    </CardRow>
  );
}
