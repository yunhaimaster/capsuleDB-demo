'use client'

import React, { useState, useEffect } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

export function OfflineIndicator(): React.ReactElement | null {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-sm font-medium">離線模式 - 部分功能可能受限</span>
      </div>
    </div>
  )
}
