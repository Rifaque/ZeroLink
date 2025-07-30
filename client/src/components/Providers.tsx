// client/src/components/Providers.tsx
'use client'

import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  // no SessionProvider anymore
  return <>{children}</>
}
