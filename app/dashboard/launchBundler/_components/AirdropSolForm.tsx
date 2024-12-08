'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface Wallet {
  address: string;
  tokenBalance: string;
  solBalance: string;
  snipeAmount: string;
}

interface AirdropSolFormProps {
  privateWallets: Wallet[];
  generatedWallets: Wallet[];
}

export default function AirdropSolForm({ privateWallets, generatedWallets }: AirdropSolFormProps) {
  
  const [walletType, setWalletType] = useState<'private' | 'generated'>('private')
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [currentWallet, setCurrentWallet] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [snipeAmount, setSnipeAmount] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const handleAirdrop = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAirdropping(true)

    const wallets = walletType === 'private' ? privateWallets : generatedWallets

    if(walletType === 'private'){
      const payload={
        privateKey,
        wallets: privateWallets,
        minAmount,
        maxAmount
      }
      const results :any= await axios.post('/api/airdropSol/priWallets',payload);
      if(results.status){
        toast.success('Successfully AirDropped '+ results.message)
      } else {
        toast.error('Failed AirDrop '+ results.message)

      }
    } else {
      const payload={
        privateKey,
        wallets: generatedWallets 
      }
      const results :any= await axios.post('/api/airdropSol/genWallets',payload);
      if(results.status){
        toast.success('Successfully AirDropped '+ results.message)
      } else {
        toast.error('Failed AirDrop '+ results.message)

      }

    }
    setIsAirdropping(false)
    setCurrentWallet('')
  }

  return (
    <div className={isAirdropping ? 'pointer-events-none opacity-50' : ''}>
      <form onSubmit={handleAirdrop} className="space-y-3 text-sm">
        <div className="space-y-1">
          <Label htmlFor="wallet-type" className="text-xs">Wallet Type</Label>
          <Select onValueChange={(value: 'private' | 'generated') => setWalletType(value)}>
            <SelectTrigger id="wallet-type" className="h-8 text-sm">
              <SelectValue placeholder="Select wallet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private Wallets</SelectItem>
              <SelectItem value="generated">Generated Wallets</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {walletType === 'private' ? (
          <>
            <div className="space-y-1">
              <Label htmlFor="min-amount" className="text-xs">Min Amount to Transfer</Label>
              <Input 
                id="min-amount" 
                type="number" 
                placeholder="Enter min amount" 
                className="text-sm h-8"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-amount" className="text-xs">Max Amount to Transfer</Label>
              <Input 
                id="max-amount" 
                type="number" 
                placeholder="Enter max amount" 
                className="text-sm h-8"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="funding-wallet-key" className="text-xs">Funding Wallet Private Key</Label>
          <Input 
            id="funding-wallet-key" 
            type="password" 
            placeholder="Enter private key" 
            className="text-sm h-8"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div>

        {isAirdropping && (
          <div className="text-xs text-muted-foreground">
            Transferring to: {currentWallet}
          </div>
        )}

        <Button variant="outline"  size={'md'} className="w-full h-8 text-sm" disabled={isAirdropping}>
          {isAirdropping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Airdropping...
            </>
          ) : (
            'Airdrop Sol'
          )}
        </Button>
      </form>
    </div>
  )
}

