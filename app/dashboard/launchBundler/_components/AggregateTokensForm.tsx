'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from 'lucide-react'

interface Wallet {
    address: string;
    tokenBalance: string;
    solBalance: string;
    snipeAmount: string;
  }
interface AggregateTokensFormProps {
    privateWallets: Wallet[];
    generatedWallets: Wallet[];
}

export default function AggregateTokensForm({ privateWallets, generatedWallets }: AggregateTokensFormProps) {
  const [isAggregating, setIsAggregating] = useState(false)
  const [walletType, setWalletType] = useState<'private' | 'generated'>('private')
  const [destinationAddress, setDestinationAddress] = useState('')

  const handleAggregate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAggregating(true)

    console.log(`Aggregating tokens from ${walletType} wallets to ${destinationAddress}`)

    // Simulating aggregation process
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Here you would implement the actual token aggregation logic

    setIsAggregating(false)
  }

  return (
    <div className={isAggregating ? 'pointer-events-none opacity-50' : ''}>
      <form onSubmit={handleAggregate} className="space-y-4 text-sm">
        <div className="flex items-center space-x-2">
          <Switch
            id="wallet-type"
            checked={walletType === 'generated'}
            onCheckedChange={(checked) => setWalletType(checked ? 'generated' : 'private')}
          />
          <Label htmlFor="wallet-type" className="text-xs">
            {walletType === 'private' ? `Private Wallets (${privateWallets.length})` : `Generated Wallets (${generatedWallets.length})`}
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination-address" className="text-xs">Destination Address</Label>
          <Input
            id="destination-address"
            type="text"
            placeholder="Enter destination address"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className="text-sm h-8"
          />
        </div>

        <Button type="submit" className="w-full h-8 text-sm" disabled={isAggregating || !destinationAddress.trim()}>
          {isAggregating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aggregating...
            </>
          ) : (
            'Aggregate Tokens'
          )}
        </Button>
      </form>
    </div>
  )
}

