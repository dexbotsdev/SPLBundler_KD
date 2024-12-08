'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

interface Wallet {
  address: string;
  tokenBalance: string;
  solBalance: string;
  snipeAmount: string;
}

interface TransferTokensFormProps {
    privateWallets: Wallet[];
    generatedWallets: Wallet[];
}

export default function TransferTokensForm({ privateWallets,generatedWallets }: TransferTokensFormProps) {
  const [isTransferring, setIsTransferring] = useState(false)
  const [isRandomDistribution, setIsRandomDistribution] = useState(false)
  const [selectedFromWallet, setSelectedFromWallet] = useState<string>('')

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTransferring(true)

    // Simulating transfer time
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Here you would implement the actual token transfer logic

    setIsTransferring(false)
  }

  return (
    <div className={isTransferring ? 'pointer-events-none opacity-50' : ''}>
      <form onSubmit={handleTransfer} className="space-y-4 text-sm">
        <div className="space-y-2">
          <Label htmlFor="from-wallet" className="text-xs">From Wallet</Label>
          <Select onValueChange={setSelectedFromWallet} value={selectedFromWallet}>
            <SelectTrigger id="from-wallet" className="h-8 text-sm">
              <SelectValue placeholder="Select source wallet" />
            </SelectTrigger>
            <SelectContent>
              {privateWallets.map((wallet) => (
                <SelectItem key={wallet.address} value={wallet.address} className="text-xs">
                  {wallet.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-amount" className="text-xs">Total Token Amount to Transfer</Label>
          <Input id="token-amount" type="number" placeholder="Enter token amount" className="text-sm h-8" />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="distribution-mode"
            checked={isRandomDistribution}
            onCheckedChange={setIsRandomDistribution}
          />
          <Label htmlFor="distribution-mode" className="text-xs">
            {isRandomDistribution ? "Random Distribution" : "Equal Distribution"}
          </Label>
        </div>

        <Button variant="outline"  size={'md'} className="w-full h-8 text-sm" disabled={isTransferring || !selectedFromWallet}>
          {isTransferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            'Transfer Tokens'
          )}
        </Button>
      </form>
    </div>
  )
}

