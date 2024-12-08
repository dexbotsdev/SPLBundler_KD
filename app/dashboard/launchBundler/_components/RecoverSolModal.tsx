'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'

interface RecoverSolModalProps {
  onRecover: (walletType: 'private' | 'generated', percentage: '50' | '100') => Promise<void>;
  children: React.ReactNode;
}

export function RecoverSolModal({ onRecover, children }: RecoverSolModalProps) {
  const [walletType, setWalletType] = useState<'private' | 'generated'>('private')
  const [percentage, setPercentage] = useState<'50' | '100'>('100')
  const [isRecovering, setIsRecovering] = useState(false)

  const handleRecover = async () => {
    setIsRecovering(true)
    await onRecover(walletType, percentage)
    setIsRecovering(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recover Sol</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Wallet Type</Label>
            <RadioGroup value={walletType} onValueChange={(value: 'private' | 'generated') => setWalletType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generated" id="generated" />
                <Label htmlFor="generated">Generated</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Percentage to Recover</Label>
            <RadioGroup value={percentage} onValueChange={(value: '50' | '100') => setPercentage(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="fifty" />
                <Label htmlFor="fifty">50%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100" id="hundred" />
                <Label htmlFor="hundred">100%</Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={handleRecover} disabled={isRecovering} variant="outline"  size={'md'} className="w-full">
            {isRecovering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recovering...
              </>
            ) : (
              'Recover Sol'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

