import { CheckCircleIcon, QrCodeIcon } from '@/components/icons';
import {
  Badge,
  Button,
  Card,
  Pagination,
  StatusPill,
  StepNav,
} from '@/components/ui';
import { usePagination } from '@/hooks';

export const TICKET_EV_ITEMS = [
  { code: 'XMD-123', soc: 78, status: 'AVAILABLE' },
  { code: 'XMD-124', soc: 80, status: 'AVAILABLE' },
  { code: 'XMD-125', soc: 50, status: 'OUT_OF_SERVICE' },
  { code: 'XMD-126', soc: 15, status: 'CHARGING_QUEUE' },
  { code: 'XMD-127', soc: 10, status: 'CHARGING_QUEUE' },
  { code: 'XMD-128', soc: 85, status: 'AVAILABLE' },
  { code: 'XMD-129', soc: 92, status: 'AVAILABLE' },
  { code: 'XMD-130', soc: 66, status: 'AVAILABLE' },
  { code: 'XMD-131', soc: 74, status: 'AVAILABLE' },
  { code: 'XMD-132', soc: 88, status: 'AVAILABLE' },
];

export function WorkTicketPanel({
  ticketStep,
  verifiedEvs,
  onTicketStepChange,
  onScanNext,
  onScanAll,
  onCloseTicket,
  onVerifySingle,
  onReportStatus,
}: {
  ticketStep: 0 | 1 | 2;
  verifiedEvs: string[];
  onTicketStepChange: (step: 0 | 1 | 2) => void;
  onScanNext: () => void;
  onScanAll: () => void;
  onCloseTicket: () => void;
  onVerifySingle: (code: string) => void;
  onReportStatus: (code: string, status: string, soc: number) => void;
}) {
  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(
    TICKET_EV_ITEMS,
    5,
  );

  return (
    <div className="space-y-5">
      <Card padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-title font-extrabold text-ink">
              Order Code: ORD-6767
            </h2>
            <Badge tone="primary">
              {ticketStep === 2 ? 'Completed' : 'Delivering'}
            </Badge>
          </div>
          <span className="text-caption font-semibold text-ink-3">
            Dormitory Zone B → Suoi Tien Metro Station
          </span>
        </div>

        <StepNav
          currentStepIndex={ticketStep}
          onStepClick={(idx) => onTicketStepChange(idx as 0 | 1 | 2)}
          steps={[
            { id: 'assigned', label: 'ASSIGNED' },
            { id: 'picked', label: 'PICKED UP' },
            { id: 'done', label: 'COMPLETED' },
          ]}
        />
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <Card
          padding="md"
          className="flex flex-col items-center space-y-4 text-center lg:col-span-5"
        >
          <div className="flex w-full items-center justify-between">
            <h3 className="text-body-lg font-extrabold text-ink">
              Work Ticket
            </h3>
            <Badge tone="navy">
              {verifiedEvs.length} / {TICKET_EV_ITEMS.length} Scanned
            </Badge>
          </div>

          <div className="flex size-44 items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-surface p-3 text-navy shadow-card">
            <QrCodeIcon size={120} />
          </div>

          <div className="w-full space-y-2">
            <Button
              variant="secondary"
              fullWidth
              leadingIcon={<QrCodeIcon size={15} />}
              onClick={onScanNext}
            >
              Scan EV to Verify
            </Button>

            <Button variant="secondary" fullWidth onClick={onScanAll}>
              Scan All EV to Close Ticket
            </Button>

            <Button
              variant="primary"
              fullWidth
              disabled={verifiedEvs.length < TICKET_EV_ITEMS.length}
              onClick={onCloseTicket}
            >
              Close Work Ticket
            </Button>
          </div>
        </Card>

        <Card
          padding="md"
          className="flex flex-col justify-between gap-3 lg:col-span-7"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-body-lg font-extrabold text-ink">
                Scanned Vehicle List
              </h3>
              <span className="font-mono text-body-sm font-bold text-primary-700">
                {verifiedEvs.length} / {TICKET_EV_ITEMS.length}
              </span>
            </div>

            <div className="divide-y divide-line">
              {pageItems.map((ev) => {
                const isScanned = verifiedEvs.includes(ev.code);
                return (
                  <div
                    key={ev.code}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-[130px]">
                      <p className="font-mono text-body-sm font-bold text-ink">
                        {ev.code}
                      </p>
                      <p className="text-caption text-ink-3">
                        Battery Percentage: {ev.soc}%
                      </p>
                    </div>

                    <Badge
                      tone={
                        ev.status === 'AVAILABLE'
                          ? 'ok'
                          : ev.status === 'CHARGING_QUEUE'
                            ? 'warn'
                            : 'danger'
                      }
                    >
                      {ev.status}
                    </Badge>

                    <div className="flex items-center gap-2">
                      {isScanned ? (
                        <StatusPill
                          tone="ok"
                          icon={<CheckCircleIcon size={12} />}
                        >
                          Scanned
                        </StatusPill>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onVerifySingle(ev.code)}
                        >
                          Verify QR
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() =>
                          onReportStatus(ev.code, ev.status, ev.soc)
                        }
                      >
                        Report Status →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Pagination
            variant="compact"
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={5}
            onPageChange={setPage}
            className="border-t border-line pt-3"
          />
        </Card>
      </div>
    </div>
  );
}
