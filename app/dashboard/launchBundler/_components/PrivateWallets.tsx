'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { shortenTextWithDots, Wallet } from "@/app/lib/global"
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import { toast } from "sonner"
import SellWalletlTokensForm from './SellWalletTokensForm'
import { WalletRecoverModal } from './WalletRecoverModal'


interface PrivateWalletsProps {
  wallets: Wallet[]
  onAddWallet: (privateKey: string, address: string, snipeAmount: number) => void
  onSave: (wallets: Wallet[]) => void
  onDelete: () => void
  onSell: (wallet: Wallet, sellPercentage: string) => void
  onRecover: (wallet: string, percentage: Number) => void
}

export default function PrivateWallets({ wallets, onAddWallet, onSave, onDelete, onSell, onRecover }: PrivateWalletsProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [snipeAmount, setSnipeAmount] = useState('')

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleAddWallet = () => {
    if (privateKey) {

      try {
        var pk = Keypair.fromSecretKey(bs58.decode(privateKey));
        onAddWallet(privateKey, pk.publicKey.toBase58(), Number(snipeAmount))
        setPrivateKey('')
        setIsDialogOpen(false)
        toast.success('Wallet Added')
      } catch (error) {
        toast.success('Invalid PrivateKey')
      }
    }
  }

  return (
    <Card className="border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
        <CardTitle className="text-sm">Private Wallets ({wallets.length}/3)
          <p className="text-[10px] mt-1 text-gray-400">Save All Wallets only once you have added all wallets, Intermediate Saving will delete already saved wallets</p>

        </CardTitle>

        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg w-6 h-6 p-0"
            onClick={() => setIsDialogOpen(true)}
            disabled={wallets.length >= 3}
          >
            +
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            className="rounded-lg w-6 h-6 p-0"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg w-6 h-6 p-0"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-3 w-3" />
          </Button> */}

        </div>
      </CardHeader>
      <CardContent className="p-2 overflow-hidden">
        <div
          ref={carouselRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide"
        >
          {wallets.map((wallet, index) => (
            <Card key={index} className="bg-[#2C2D321f] border-gray-700 flex-shrink-0 w-[30%]">
              <CardContent className="p-2 flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    Address: {shortenTextWithDots(wallet.address)}
                  </div>
                  <div className="text-xs mb-2">
                    Token Balance: {wallet.tokenbalance}
                  </div>
                  <div className="text-xs mb-2">
                    Sol Balance: {Number(Number(wallet.solbalance) / LAMPORTS_PER_SOL).toFixed(4)}
                  </div>
                  <div className="text-xs mb-2">
                    Snipe Amount: {wallet.snipeAmount}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isSellModalOpen} onOpenChange={setIsSellModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1 text-[10px] rounded-lg h-6"
                        disabled={Number(wallet.tokenbalance) > 0 || isNaN(Number(wallet.tokenbalance))}
                      >Sell</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-[14px]" >Sell Tokens from Wallet </DialogTitle>
                      </DialogHeader>
                      <SellWalletlTokensForm wallet={wallet} sellTokens={onSell} />
                    </DialogContent>
                  </Dialog>
                  <WalletRecoverModal onRecover={onRecover} walletAddress={wallet.address}>
                    <Button size="sm" className="flex-1 text-[10px] rounded-lg h-6">Recover Sol</Button>
                  </WalletRecoverModal>                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex space-x-2 justify-end m-3 p-2">
          <Button size="sm" className="text-[10px] rounded-lg h-6" onClick={() => onSave(wallets)}>Save All</Button>
          <Button size="sm" className="text-[10px] rounded-lg h-6" onClick={() => onDelete()}>Delete All</Button>
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Private Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="private-key" className="text-right">
              Private Key
            </Label>
            <Input
              id="private-key"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter private key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snipe-amount" className="text-right">
              Snipe Amount
            </Label>
            <Input
              id="snipe-amount"
              type="number"
              value={snipeAmount}
              onChange={(e) => setSnipeAmount(e.target.value)}
              placeholder="Enter snipe amount"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddWallet} size="xs" className="rounded-lg">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

