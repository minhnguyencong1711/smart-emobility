import { Injectable } from '@nestjs/common';

import type { UpdatePolicyDto } from './dto/policy.dto';
import { PolicyRepository } from './policy.repository';

@Injectable()
export class PolicyService {
  constructor(private readonly policyRepository: PolicyRepository) {}

  async getPolicy() {
    const policy = await this.policyRepository.getOrCreate();
    return {
      gracePeriodMins: policy.gracePeriodMins,
      gridWarningThreshold: policy.gridWarningThreshold,
      gridCriticalThreshold: policy.gridCriticalThreshold,
      baySaturationThreshold: policy.baySaturationThreshold,
      minDispatchSoC: policy.minDispatchSoC,
    };
  }

  async updatePolicy(dto: UpdatePolicyDto) {
    const updated = await this.policyRepository.update(dto);
    return {
      gracePeriodMins: updated.gracePeriodMins,
      gridWarningThreshold: updated.gridWarningThreshold,
      gridCriticalThreshold: updated.gridCriticalThreshold,
      baySaturationThreshold: updated.baySaturationThreshold,
      minDispatchSoC: updated.minDispatchSoC,
    };
  }

  async resetBaseline() {
    const policy = await this.policyRepository.resetAllBaseline();
    return {
      ok: true,
      policy: {
        gracePeriodMins: policy.gracePeriodMins,
        gridWarningThreshold: policy.gridWarningThreshold,
        gridCriticalThreshold: policy.gridCriticalThreshold,
        baySaturationThreshold: policy.baySaturationThreshold,
        minDispatchSoC: policy.minDispatchSoC,
      },
    };
  }
}
