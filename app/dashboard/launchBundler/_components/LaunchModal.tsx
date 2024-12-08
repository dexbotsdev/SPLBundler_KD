'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import { LaunchData, TokenData } from '@/types'

interface LaunchModalProps {
  tokenData: TokenData;
  onLaunch: (data: LaunchData) => Promise<void>;
}
 

export function LaunchModal({ tokenData , onLaunch }: LaunchModalProps) {
  const [isLaunching, setIsLaunching] = useState(false)
  const [delayEnabled, setDelayEnabled] = useState(false)
  const [delaySeconds, setDelaySeconds] = useState(0)
  const [baseLiquidity, setBaseLiquidity] = useState(0)
  const [quoteLiquidity, setQuoteLiquidity] = useState(0)
  const [primaryBundlerEnabled, setPrimaryBundlerEnabled] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLaunching(true)
    setIsOpen(false)  // Close the modal after launching

    await onLaunch({
      tokenAddress:tokenData.tokenAddress, 
      primaryBundlerEnabled,
      delayEnabled,
      delaySeconds,
      baseLiquidity,
      quoteLiquidity,
      startTime,
    })
    setIsLaunching(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}> 
      <DialogTrigger asChild>
        <Button className="w-full" size="sm" >Launch</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Launch Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLaunch} className="space-y-3 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-bundler" className="text-xs">
                Enable Primary Bundler
              </Label>                    
              <p className='text-xs mt-2 pl-2'>(Fee: 1 sol)</p> 

              <Switch
                id="primary-bundler"
                checked={primaryBundlerEnabled}
                onCheckedChange={setPrimaryBundlerEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delay-bundler" className="text-xs">
                Enable Delayed Bundler
              </Label>
              <p className='text-xs mt-2 pl-2'>(Fee: 1 sol)</p> 

              <Switch
                id="delay-bundler"
                checked={delayEnabled}
                onCheckedChange={setDelayEnabled}
              />
            </div>
            {delayEnabled && (
              <div className="space-y-1">
                <Label htmlFor="delay-seconds" className="text-xs">Delay (seconds)</Label>
                <Input
                  id="delay-seconds"
                  type="number"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(parseInt(e.target.value))}
                  min={0}
                  className="h-8 text-xs"
                />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="base-liquidity" className="text-xs">Base Liquidity ({tokenData.symbol.toUpperCase()})</Label>
                <span className="text-xs text-muted-foreground sr-only">Balance:  </span>
              </div>
              <Input
                id="base-liquidity"
                type="number"
                value={baseLiquidity}
                onChange={(e) => setBaseLiquidity(parseFloat(e.target.value))}
                min={1}
                step={1}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="quote-liquidity" className="text-xs">Quote Liquidity ({tokenData.quoteName.toUpperCase()})</Label>
                <span className="text-xs text-muted-foreground sr-only">Balance: </span>
              </div>
              <Input
                id="quote-liquidity"
                type="number"
                value={quoteLiquidity}
                onChange={(e) => setQuoteLiquidity(parseFloat(e.target.value))}
                min={0.1}
                step={0.1}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="start-time" className="text-xs">Start Time</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button type="submit" className="w-full h-8 text-xs" disabled={isLaunching}>
              {isLaunching ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Launching...
                </>
              ) : (
                'Launch'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

