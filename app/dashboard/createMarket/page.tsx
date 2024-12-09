'use client'

import { Moon, Settings, CheckCircle } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useState } from 'react'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    useConfirm
  } from '@omit/react-confirm-dialog'
import axios from "axios";


export default function CreateMarket() {
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
    const [baseMint, setBaseMint] = useState('')
    const [quoteMint, setQuoteMint] = useState('sol')
    const [minOrderSize, setMinOrderSize] = useState('')
    const [tickSize, setTickSize] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const confirm = useConfirm();

    const createMarketId = async () => {
        setIsLoading(true)
        try {
            const marketMeta={
                baseMint,
                    quoteMint,
                    minOrderSize,
                    tickSize,
            }
            const response = await axios.post('/api/createMarketId', marketMeta);

            if (!response.status) {
                await confirm({
                    title: `Failed`,
                    description: `Market Created Failed : ${response.data.message}`,
                    alertDialogContent: { className: 'w-full' },
  
                    icon: <CheckCircle className="size-4 text-red-500" />,
                    confirmText: 'OK/Cancel',
                    cancelButton: null, // Hide cancel button
                    alertDialogTitle: {
                      className: 'flex items-center gap-2 text-red-500'
                    }
                  })
  
            } else {
                await confirm({
                    title: `Success`,
                    description: `${response.data.message}`,
                    alertDialogContent: { className: 'w-full' },
  
                    icon: <CheckCircle className="size-4 text-green-500" />,
                    confirmText: 'OK/Cancel',
                    cancelButton: null, // Hide cancel button
                    alertDialogTitle: {
                      className: 'flex items-center gap-2 text-green-500'
                    }
                  })

            }

 
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }


    return (
        <main className="flex-1 p-2">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-3xl font-bold">Create Openbook Market ID</h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Enter Mints Section */}
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">1. Enter Mints</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the token address for the token you want to create a market for, Only Token Program.
                            </p>
                            <Card className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="base-mint">Base Mint (Only Token Program)</Label>
                                        <Input
                                            id="base-mint"
                                            placeholder="Enter base mint address"
                                            className="mt-1"
                                            onChange={(e) => setBaseMint(e.target.value)}

                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="quote-mint">Quote Mint</Label>
                                        <Select value={quoteMint} onValueChange={setQuoteMint}>
                                            <SelectTrigger className="w-full mt-1">
                                                <SelectValue placeholder="Select quote token" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sol">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="https://solana.com/favicon.ico"
                                                            alt="SOL"
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        <span>Wrapped Sol</span>
                                                        <span className="text-sm text-muted-foreground">SOL</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="usdt">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="https://tether.to/favicon.ico"
                                                            alt="USDT"
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        <span>Tether USD</span>
                                                        <span className="text-sm text-muted-foreground">USDT</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="usdc">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="https://assets.coingecko.com/coins/images/32018/large/usdc_ll.png?1696530816"
                                                            alt="USDC"
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        <span>USD Coin</span>
                                                        <span className="text-sm text-muted-foreground">USDC</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select> 
                                    </div>
                                </div>
                            </Card>
                        </section>


                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Tickers Section */}
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">2. Tickers</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Configure the tick sizes, or lowest representable quantities of base and quote
                                <br />
                                tokens.
                            </p>
                            <Card className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="min-order-size">Min. Order Size (1e * -x) ( 1 = 0.1 Tokens)</Label>
                                        <Input
                                            id="min-order-size"
                                            type="number"
                                            placeholder="Enter minimum order size"
                                            className="mt-1"
                                            value={minOrderSize}
                                            onChange={(e) => setMinOrderSize(e.target.value)}

                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="tick-size">Price Tick (1e * -y) ( 1 = 0.1 SOL)</Label>
                                        <Input
                                            id="tick-size"
                                            type="number"
                                            placeholder="Enter price tick"
                                            className="mt-1"
                                            value={tickSize}
                                            onChange={(e) => setTickSize(e.target.value)}

                                        />
                                    </div>
                                </div>
                            </Card>
                        </section>
                        <Separator className="my-6" />


                        {/* Total Cost */}
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Total Cost</h3>
                                    <p className="text-sm text-muted-foreground">Total Rent + Fee Estimate</p>
                                </div>
                                <div className="text-xl font-bold">0.3 sol</div>
                            </div>
                        </div>

                        {/* Preview Button */}
                        <div className="flex justify-end">
                            <div className="flex justify-end">
                                <Button
                                   variant="outline"  size={'md'}
                                    onClick={createMarketId}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating..." : "Create Market ID"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

