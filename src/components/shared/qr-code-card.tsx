import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

export function QrCodeCard({
  value,
  size = 156,
  label,
  caption,
  downloadable = false,
  downloadFileName = 'qr-code.png',
  className,
}: {
  value: string;
  size?: number;
  label?: string;
  caption?: string;
  downloadable?: boolean;
  downloadFileName?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleDownloadPng() {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const quietZone = 20;
    const outputSize = size + quietZone * 2;
    const serialized = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serialized], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, outputSize, outputSize);
        ctx.drawImage(img, quietZone, quietZone, size, size);
        const link = document.createElement('a');
        link.download = downloadFileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      {label ? (
        <span className="text-label font-bold uppercase tracking-wider text-ink-3">
          {label}
        </span>
      ) : null}

      <div
        ref={containerRef}
        className="rounded-lg border border-line bg-surface p-3 shadow-card"
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          fgColor="#0F172A"
          bgColor="#FFFFFF"
          includeMargin={false}
        />
      </div>

      {caption ? (
        <span className="max-w-full truncate font-mono text-caption text-ink-3">
          {caption}
        </span>
      ) : null}

      {downloadable ? (
        <Button size="sm" variant="secondary" onClick={handleDownloadPng}>
          Download QR PNG
        </Button>
      ) : null}
    </div>
  );
}
