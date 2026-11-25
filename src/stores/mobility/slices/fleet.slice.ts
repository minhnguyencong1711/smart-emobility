import {
  DEFAULT_POLICY_CONFIG,
  INITIAL_HUBS,
  INITIAL_SHARED_VEHICLES,
} from '@/data';
import { backendApi, getStoredAccessToken } from '@/services';

import type { FleetSlice, MobilitySliceCreator } from '../types';

export const createFleetSlice: MobilitySliceCreator<FleetSlice> = (
  set,
  get,
) => ({
  policyConfig: DEFAULT_POLICY_CONFIG,
  hubs: INITIAL_HUBS,
  sharedVehicles: INITIAL_SHARED_VEHICLES,

  updatePolicyConfig: (partial) => {
    set((state) => ({
      policyConfig: { ...state.policyConfig, ...partial },
    }));
    if (get().backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .updatePolicy(partial)
        .then((policyConfig) => set({ policyConfig }))
        .catch(() => undefined);
    }
  },
});
