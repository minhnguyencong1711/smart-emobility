import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom fontSize tokens must be registered with tailwind-merge so utility pairs
 * like `text-label text-ink-3` do not drop the font size in favor of text color.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'label',
            'caption',
            'body-sm',
            'body',
            'body-lg',
            'title',
            'heading',
            'display',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
