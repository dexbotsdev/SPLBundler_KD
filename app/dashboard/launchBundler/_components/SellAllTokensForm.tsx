'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from 'lucide-react'


interface Wallet {
  address: string;
  tokenBalance: string;
  solBalance: string;
  snipeAmount: string;
}
interface SellAllTokensFormProps {
    privateWallets: Wallet[];
    generatedWallets: Wallet[];
} 

export default function SellAllTokensForm({ privateWallets, generatedWallets }: SellAllTokensFormProps) {
  const [isSelling, setIsSelling] = useState(false)
  const [walletType, setWalletType] = useState<'private' | 'generated'>('private')
  const [sellPercentage, setSellPercentage] = useState<'25' | '50' | '100'>('100')

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSelling(true)

    console.log(`Selling ${sellPercentage}% of tokens from ${walletType} wallets`)

    // Simulating sell process
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Here you would implement the actual token selling logic

    setIsSelling(false)
  }

  return (
    <div className={isSelling ? 'pointer-events-none opacity-50' : ''}>
      <form onSubmit={handleSell} className="space-y-4 text-sm">
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
          <Label className="text-xs">Sell Percentage</Label>
          <RadioGroup defaultValue="100" onValueChange={(value: '25' | '50' | '100') => setSellPercentage(value)}>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="25" id="r25" />
                <Label htmlFor="r25" className="text-xs">25%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="r50" />
                <Label htmlFor="r50" className="text-xs">50%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100" id="r100" />
                <Label htmlFor="r100" className="text-xs">100%</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button variant="outline"  size={'md'} className="w-full h-8 text-sm" disabled={isSelling}>
          {isSelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Selling...
            </>
          ) : (
            'Sell Tokens'
          )}
        </Button>
      </form>
    </div>
  )
}

