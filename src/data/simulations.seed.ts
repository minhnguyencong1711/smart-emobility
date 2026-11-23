import type { SimulationScenario } from '@/types';

export const INITIAL_SIMULATIONS: SimulationScenario[] = [
  {
    id: 'sim-peak',
    name: 'Monday Morning Peak',
    type: 'DEMAND_SURGE',
    selectedHubIds: ['hub-suoi-tien', 'hub-dorm-a', 'hub-dorm-b'],
    demandMultiplier: 1.5,
    durationHours: 24,
    timeStepMins: 15,
    status: 'COMPLETED',
    utilizationRatePct: 91.4,
    avgWaitingTimeMins: 11.2,
    recommendations: [
      {
        id: 'rec-1',
        title: 'Rebalance 6 Shared E-Bikes: Suoi Tien -> Dormitory A',
        targetType: 'REDISTRIBUTION',
        summary:
          'Pre-position 6 shared EVs to cover morning rush deficit while reserving destination bays.',
        expectedWaitReductionPct: 34,
        approvedToM4: false,
      },
      {
        id: 'rec-2',
        title: 'Enable Tier-3 DLB Throttling at Dormitory A (07:30–09:30)',
        targetType: 'SCHEDULING',
        summary:
          'Cap routine EV charging at 3.7 kW to keep feeder demand below 85% warning boundary.',
        expectedWaitReductionPct: 19,
        approvedToM4: false,
      },
    ],
  },
];
