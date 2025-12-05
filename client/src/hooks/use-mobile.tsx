import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsMobileWithHydration() {
  // Initialize as undefined to indicate "not yet determined"
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    setIsHydrated(true)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { 
    // Return undefined when not yet determined, allowing consumers to handle the pre-hydration state
    isMobile: isMobile, 
    isHydrated,
    isLoading: !isHydrated
  }
}
