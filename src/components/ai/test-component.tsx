'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Test Button
      </Button>
    </div>
  )
}
