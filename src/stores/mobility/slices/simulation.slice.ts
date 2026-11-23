import { INITIAL_SIMULATIONS } from '@/data';
import { applySimulationAdvisoryApproval } from '@/services';

import type { MobilitySliceCreator, SimulationSlice } from '../types';

export const createSimulationSlice: MobilitySliceCreator<SimulationSlice> = (
  set,
) => ({
  simulations: INITIAL_SIMULATIONS,

  createSimulationScenario: (scenario) =>
    set((state) => ({
      simulations: [scenario, ...state.simulations],
    })),

  approveSimulationRecommendationToM4: (simId, recId) =>
    set((state) =>
      applySimulationAdvisoryApproval({
        simId,
        recId,
        simulations: state.simulations,
        redistributionOrders: state.redistributionOrders,
        dlbActivityLogs: state.dlbActivityLogs,
      }),
    ),
});
