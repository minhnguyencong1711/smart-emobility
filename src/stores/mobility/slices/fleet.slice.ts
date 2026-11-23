import {
  DEFAULT_POLICY_CONFIG,
  INITIAL_HUBS,
  INITIAL_SHARED_VEHICLES,
} from '@/data';

import type { FleetSlice, MobilitySliceCreator } from '../types';

export const createFleetSlice: MobilitySliceCreator<FleetSlice> = (set) => ({
  policyConfig: DEFAULT_POLICY_CONFIG,
  hubs: INITIAL_HUBS,
  sharedVehicles: INITIAL_SHARED_VEHICLES,

  updatePolicyConfig: (partial) =>
    set((state) => ({
      policyConfig: { ...state.policyConfig, ...partial },
    })),
});
