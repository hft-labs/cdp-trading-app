import { useCallback, useState } from 'react';
import type { LifecycleStatus } from '@/components/swap/types';

export function useLifecycleStatus(
  initialState: LifecycleStatus,
): [LifecycleStatus, (newStatus: LifecycleStatus) => void] {
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStatus>(initialState);

  const updateLifecycleStatus = useCallback(
    (newStatus: LifecycleStatus) => {
      setLifecycleStatus(newStatus);
    },
    [],
  );

  return [lifecycleStatus, updateLifecycleStatus];
}