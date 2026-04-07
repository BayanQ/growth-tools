'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_tViHubC4HYKDT2ni6r2fG3Coe4qXYdsYo5VLWBt8c7vG', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // handled by PostHogPageView
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
