'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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


interface GeneratedWalletsProps {
    wallets: Wallet[]
    onGenerateWallets: (count: number, minSol: number, maxSol: number) => void
    onSave: (wallets: Wallet[]) => void
    onDelete: () => void
    onSell: (wallet: Wallet, sellPercentage: string) => void
    onRecover: (wallet: string, percentage: Number) => void
}

export default function GeneratedWallets({ wallets, onGenerateWallets, onSave, onDelete, onSell, onRecover }: GeneratedWalletsProps) {
    const carouselRefG = useRef<HTMLDivElement>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [walletCount, setWalletCount] = useState('')
    const [minSol, setMinSol] = useState('')
    const [maxSol, setMaxSol] = useState('')
    const [isSellModalOpen, setIsSellModalOpen] = useState(false)

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRefG.current) {
            const scrollAmount = direction === 'left' ? -200 : 200
            carouselRefG.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    const handleGenerateWallets = () => {
        const count = parseInt(walletCount)
        const min = parseFloat(minSol)
        const max = parseFloat(maxSol)
        if (count && min && max) {
            onGenerateWallets(count, min, max)
            setWalletCount('')
            setMinSol('')
            setMaxSol('')
            setIsDialogOpen(false)
        }
    }

    return (
        <Card className="border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                <CardTitle className="text-sm">Generated Wallets ({wallets.length})
                    <p className="text-[10px] mt-1 text-gray-400">Save All Wallets only once you have added all wallets, Intermediate Saving will delete already saved wallets</p>

                </CardTitle>
                <div className="flex space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg w-6 h-6 p-0"
                        onClick={() => setIsDialogOpen(true)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">

                    {wallets.map((wallet, index) => (
                        <Card key={index} className="bg-[#2C2D321f] border-gray-700 flex-shrink-0 ">
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
                                    </WalletRecoverModal>                                
                                </div>
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
                        <DialogTitle>Generate Wallets</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="number"
                            placeholder="Number of Wallets"
                            value={walletCount}
                            onChange={(e) => setWalletCount(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Min SOL Amount"
                            value={minSol}
                            onChange={(e) => setMinSol(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Max SOL Amount"
                            value={maxSol}
                            onChange={(e) => setMaxSol(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleGenerateWallets} size="sm" className="rounded-lg">Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

