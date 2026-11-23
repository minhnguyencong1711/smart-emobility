import type { SystemPolicyConfig } from '@/types';

export const DEFAULT_POLICY_CONFIG: SystemPolicyConfig = {
  gracePeriodMins: 15,
  gridWarningThreshold: 85,
  gridCriticalThreshold: 90,
  baySaturationThreshold: 85,
  minDispatchSoC: 20,
};
