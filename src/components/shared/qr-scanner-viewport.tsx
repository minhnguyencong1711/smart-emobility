import jsQR from 'jsqr';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { QrCodeIcon } from '@/components/icons';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';

export function QrScannerViewport({
  hintText,
  badgeText = 'QR SCANNER',
  active,
  onActiveChange,
  onScanResult,
  onScanError,
  className,
}: {
  hintText: string;
  badgeText?: string;
  active: boolean;
  onActiveChange: (active: boolean) => void;
  onScanResult: (rawValue: string) => void;
  onScanError?: (message: string) => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanCallbackRef = useRef(onScanResult);
  scanCallbackRef.current = onScanResult;

  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setTorchOn(false);
      return;
    }

    let cancelled = false;
    let pollTimer: number | null = null;

    async function startStream() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera API unavailable. Upload a QR image instead.');
        onActiveChange(false);
        return;
      }
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        pollTimer = window.setInterval(() => {
          const video = videoRef.current;
          if (!video || !ctx || video.readyState < 2 || !video.videoWidth)
            return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          if (code?.data) {
            onActiveChange(false);
            scanCallbackRef.current(code.data);
          }
        }, 160);
      } catch {
        if (!cancelled) {
          setCameraError(
            'Camera unavailable or blocked. Upload a QR image or verify manually.',
          );
          onActiveChange(false);
        }
      }
    }

    void startStream();

    return () => {
      cancelled = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active, onActiveChange]);

  async function handleToggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      onScanError?.('Flashlight control is not supported on this device.');
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const decoded = jsQR(imageData.data, img.width, img.height);
        if (decoded?.data) {
          setCameraError(null);
          onActiveChange(false);
          onScanResult(decoded.data);
        } else {
          const msg = 'No valid QR code found in the selected image.';
          setCameraError(msg);
          onScanError?.(msg);
        }
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      onScanError?.('Unable to load the selected image file.');
    };
    img.src = url;
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[300px] flex-col items-center justify-between overflow-hidden rounded-lg border border-navy-700 bg-ink p-4 text-white sm:p-5',
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {active ? (
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 size-full object-cover opacity-85"
        />
      ) : null}

      <div className="relative z-10 flex w-full flex-wrap items-center justify-between gap-2">
        <Badge
          tone="navy"
          className={cn(
            'border border-white/15 backdrop-blur-sm',
            active ? 'bg-eco/20 text-eco-300' : 'bg-white/10 text-white',
          )}
        >
          {active ? 'LIVE CAMERA' : badgeText}
        </Badge>

        <div className="flex items-center gap-2">
          {active ? (
            <Button size="sm" variant="secondary" onClick={handleToggleTorch}>
              {torchOn ? 'Flash On' : 'Flashlight'}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload QR Image
          </Button>
          {active ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onActiveChange(false)}
            >
              Stop
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 my-5 flex size-48 flex-col items-center justify-center rounded-lg bg-black/35 backdrop-blur-[2px]">
        <span className="absolute left-0 top-0 size-5 rounded-tl-md border-l-2 border-t-2 border-primary-300" />
        <span className="absolute right-0 top-0 size-5 rounded-tr-md border-r-2 border-t-2 border-primary-300" />
        <span className="absolute bottom-0 left-0 size-5 rounded-bl-md border-b-2 border-l-2 border-primary-300" />
        <span className="absolute bottom-0 right-0 size-5 rounded-br-md border-b-2 border-r-2 border-primary-300" />

        {active ? (
          <div className="absolute inset-x-3 h-0.5 animate-qr-scan bg-primary-300 shadow-brand" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <QrCodeIcon size={36} className="text-primary-300/80" />
            <Button
              size="sm"
              variant="primary"
              onClick={() => onActiveChange(true)}
            >
              Start Camera
            </Button>
          </div>
        )}

        <span className="absolute -bottom-3 whitespace-nowrap rounded-full bg-primary px-3 py-0.5 font-mono text-[11px] font-bold text-white shadow-card">
          {active ? 'Scanning QR frame...' : 'Align QR inside frame'}
        </span>
      </div>

      <div className="relative z-10 space-y-1 text-center">
        {cameraError ? (
          <p className="bg-danger/20 rounded px-2.5 py-1 text-caption font-medium text-danger-300">
            {cameraError}
          </p>
        ) : null}
        <p className="text-caption text-white/80">{hintText}</p>
      </div>
    </div>
  );
}
