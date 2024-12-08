"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Minus, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { getMarketInfoById } from "./_actions"
import { shortenTextWithDots } from "@/app/lib/global"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Keypair } from "@solana/web3.js"
import axios from "axios";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes"

interface PoolDetails {
  openBookMarketId: string
  ammId: string
  baseTokenMint: string
  quoteTokenMint: string
  startTime: string
  baseTokenBalance?: string
  quoteTokenBalance?: string
  baseTokenInitialLiquidity?: string
  quoteTokenInitialLiquidity?: string
  baseTokenSymbol?: string
  quoteTokenSymbol?: string
}


interface WalletInputsProps {
  onValidate: () => void
}

interface Wallet {
  address: string
  privateKey: string
  balance: number
  snipeAmount: number
}

export default function CreateBundlerPage() {
  const [marketId, setMarketId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [poolDetails, setPoolDetails] = useState<PoolDetails | null>(null)
  const [showWalletInfo, setShowWalletInfo] = useState(false)
  const [privateWallets, setPrivateWallets] = useState<Wallet[]>([])
  const [showDelayedWallets, setShowDelayedWallets] = useState(false)
  const [showPrivateWallets, setShowPrivateWallets] = useState(false)
  const [numWallets, setNumWallets] = useState(1)
  const [delayBeforeSnipe, setDelayBeforeSnipe] = useState(1000)
  const [minSnipeAmount, setMinSnipeAmount] = useState(0.1)
  const [maxSnipeAmount, setMaxSnipeAmount] = useState(10)
  const [generatedWallets, setGeneratedWallets] = useState<Wallet[]>([])


  const generateWallets = () => {
    const newWallets: Wallet[] = []
     for (let i = 0; i < numWallets; i++) {
      const addPK = Keypair.generate() 
      newWallets.push({
        address: addPK.publicKey.toBase58(),
        privateKey: bs58.encode(addPK.secretKey),
        snipeAmount: parseFloat((Math.random() * (maxSnipeAmount - minSnipeAmount) + minSnipeAmount).toFixed(4)),
        balance: 0
      })
    }
    setGeneratedWallets(newWallets)
  }

  const handleSaveWallets = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to save wallet info
      let isvalid=true;

      for(var i=0;i<privateWallets.length;i++){
        try {
          const privTest = Keypair.fromSecretKey(bs58.decode(privateWallets[i].privateKey));
          updateWallet(i, "address", privTest.publicKey.toBase58())
        } catch (error) {
          isvalid=false;
          break;
          
        }

      }


      if(!isvalid){
        toast.error('Invalid Privatekey Entered')
        return;
      }
 

      if (poolDetails) {
        const poolData = {
          baseTokenMint: poolDetails.baseTokenMint,
          privateWallets: privateWallets,
          generatedWallets: generatedWallets

        }

        const results = await axios.post('/api/saveWallets',poolData);

        if(results.status){
          toast.success("Your wallet information has been saved successfully.") 
        } else {
          toast.error("Failed to save wallet information") 
     
        }
      }
    } catch (error) {
      toast.error("Failed to save wallet information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!marketId) return

    setIsLoading(true)
    try {
      // Simulate API call to fetch pool details
      await new Promise(resolve => setTimeout(resolve, 1000))

      const targetPoolInfo: any = await getMarketInfoById(marketId);
      setPoolDetails({
        openBookMarketId: targetPoolInfo.marketId,
        ammId: targetPoolInfo.ammId,
        baseTokenMint: targetPoolInfo.baseMint,
        quoteTokenMint: targetPoolInfo.quoteMint,
        startTime: new Date().toDateString(),
        baseTokenBalance: targetPoolInfo.baseTokenBalance,
        quoteTokenBalance: targetPoolInfo.quoteTokenBalance,
        baseTokenSymbol: targetPoolInfo.baseTokenSymbol,
        quoteTokenSymbol: targetPoolInfo.quoteTokenSymbol,
        baseTokenInitialLiquidity: '0',
        quoteTokenInitialLiquidity: '0' 

      })

      setStep(2)
    } catch (error) {
      toast.success('Error')

    } finally {
      setIsLoading(false)
    }
  }

  const addWallet = () => {
    if (privateWallets.length < 3) {
      setPrivateWallets([...privateWallets, { address: "", privateKey: "", balance: 0, snipeAmount: 0 }])
    }
  }

  const removeWallet = (index: number) => {
    const newWallets = privateWallets.filter((_, i) => i !== index)
    setPrivateWallets(newWallets)
  }

  const updateWallet = (index: number, field: keyof Wallet, value: string) => {
    const newWallets = [...privateWallets]
    newWallets[index] = { ...newWallets[index], [field]: value }
    setPrivateWallets(newWallets)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Info Copied -' + text)


  }

  const handleSavePoolInfo = async () => {
    setIsLoading(true)
    try {

     
      // Simulate API call to save pool info
      const results = await axios.post('/api/savePoolInfo',poolDetails)

 
      if(results.status){
        toast.success('Successfully Saved Pool Info')
      }
      setStep(3)
    } catch (error) {
      toast.error('Failed Saving Data')

    } finally {
      setIsLoading(false)
    }
  }
 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create Bundle Config</h1>
        <Button
          variant="outline"
          onClick={() => {
            setMarketId("")
            setStep(1)
            setPoolDetails(null)
            setShowWalletInfo(false)
          }}
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Step 1 content */}
          <Card className="p-4">

            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                step > 1 ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"
              )}>
                {step > 1 ? <Check className="h-5 w-5" /> : 1}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Import OpenBook Market ID</h2>
                <p className="text-sm text-white/70">
                  Enter your OpenBook Market ID. If you don&apos;t have,{" "}
                  <a href="/dashboard/createMarket" className="text-purple-400 hover:underline">
                    create here
                  </a>
                  .
                </p>
              </div>
            </div>

            {step === 1 && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-white/70">OpenBook Market ID</label>
                  <Input
                    placeholder="BEeZcPryXLTu335BAUVUyYTf1QRTKfLpDmVg1rRudrgD"
                    className="mt-1.5 bg-white/5 border-white/10"
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Fee: 0.07 SOL</div>
                  <Button
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Confirm"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Step 2 content */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                step >= 2 ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white/70"
              )}>
                {step > 2 ? <Check className="h-5 w-5" /> : 2}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Price & Initial Liquidity</h2>
                <p className="text-sm text-white/70">
                  Configure initial price and trading start time of your pool.
                </p>
              </div>
            </div>

            {step >= 2 && poolDetails && (
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">OpenBook Market ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{shortenTextWithDots(poolDetails.openBookMarketId)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(poolDetails.openBookMarketId)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">AMM ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{shortenTextWithDots(poolDetails.ammId)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(poolDetails.ammId)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Base Token Mint Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{shortenTextWithDots(poolDetails.baseTokenMint)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(poolDetails.baseTokenMint)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Quote Token Mint Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{shortenTextWithDots(poolDetails.quoteTokenMint)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(poolDetails.quoteTokenMint)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <label className="text-sm text-white/70">Base Token Initial Liquidity</label>
                      {poolDetails.baseTokenBalance && (
                        <div className="text-sm text-white/50">
                          Balance: {poolDetails.baseTokenBalance}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-white/5 border-white/10"
                        value={poolDetails.baseTokenInitialLiquidity || ""}
                        onChange={(e) => setPoolDetails({ ...poolDetails, baseTokenInitialLiquidity: e.target.value })}
                      />
                      <div className="min-w-[80px] px-3 py-2 bg-white/5 rounded-md text-sm">
                        {poolDetails && poolDetails.baseTokenSymbol}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <label className="text-sm text-white/70">Quote Token Initial Liquidity</label>
                      {poolDetails.quoteTokenBalance && (
                        <div className="text-sm text-white/50">
                          Balance: {poolDetails.quoteTokenBalance}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-white/5 border-white/10"
                        value={poolDetails.quoteTokenInitialLiquidity || ""}
                        onChange={(e) => setPoolDetails({ ...poolDetails, quoteTokenInitialLiquidity: e.target.value })}
                      />
                      <div className="min-w-[80px] px-3 py-2 bg-white/5 rounded-md text-sm">
                        {poolDetails && poolDetails.quoteTokenSymbol}

                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white">Schedule/Start Time (UTC) </label>
                    <p className="text-sm text-white/70"> Note : Consider time required to transfer funds to bundler wallets for setting start time.</p>
                    <Input
                      type="datetime-local"
                      className="mt-1.5 bg-white/5 border-white/10"
                      value={poolDetails.startTime}
                      onChange={(e) => setPoolDetails({ ...poolDetails, startTime: e.target.value })}
                    />
                  </div> 

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/70">Total Cost</div>
                        <div className="text-lg font-semibold">{Number(poolDetails.quoteTokenInitialLiquidity) + 0.5} {poolDetails.quoteTokenSymbol}</div>
                        <div className="text-xs text-white/50">Total Rent + Fee Estimate</div>
                      </div>
                      <Button
                        className="bg-purple-500 hover:bg-purple-600"
                        onClick={handleSavePoolInfo}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save PoolInfo"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Step 3 content */}
          <div className={cn(
            "rounded-lg border bg-white/12 p-6",
            step >= 3 ? "border-white/10" : "border-white/5"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full",
                step >= 3 ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white/70"
              )}>
                3
              </div>
              <div>
                <h2 className="text-lg font-semibold">Configure Bundler</h2>
                <p className="text-sm text-white/70">
                  To use Delayed Bundler ensure Shyft API Key is configured in settings
                </p>
                <p className="text-sm text-white/70">
                  To use Private Bundler ensure Jito Fee is configured in settings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="show-private-wallets"
                checked={showPrivateWallets}
                onCheckedChange={setShowPrivateWallets}
              />
              <Label htmlFor="show-delayed-wallets">Enable Private Bundler Wallets (Req JITO)</Label>
            </div>
            {step >= 3 && (
              <>
                {showPrivateWallets &&
                  <div className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Private Bundler Wallets (Max 3)</h3>
                    {privateWallets.map((wallet, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-grow space-y-2">
                          <label className="text-sm text-white/70">Wallet {index + 1} Private Key</label>
                          <Input
                            type="password"
                            placeholder="Enter private key"
                            value={wallet.privateKey}
                            onChange={(e) =>{
                              try {
                                //const privTest = Keypair.fromSecretKey(bs58.decode(e.target.value));
                                updateWallet(index, "privateKey", e.target.value)
                                //updateWallet(index, "address", privTest.publicKey.toBase58())
                              } catch (error) {
                                toast.error('Invalid Privatekey Entered')
                              }
                              }}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="w-1/4 space-y-2">
                          <label className="text-sm text-white/70">Snipe Amount</label>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={wallet.snipeAmount}
                            onChange={(e) => updateWallet(index, "snipeAmount", e.target.value)}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWallet(index)}
                            className="mt-6"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addWallet}
                      className="mt-2"
                      disabled={privateWallets.length >= 3}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Wallet
                    </Button>
                    {privateWallets.length < 3 && (
                      <p className="text-sm text-white/50 mt-1">
                        You can add up to {3 - privateWallets.length} more wallet{3 - privateWallets.length !== 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>
                }
                <div className="space-y-4  mt-4">
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch
                      id="show-delayed-wallets"
                      checked={showDelayedWallets}
                      onCheckedChange={setShowDelayedWallets}
                    />
                    <Label htmlFor="show-delayed-wallets">Enable Delayed Bundler Wallets (Req Shyft.to API Key)</Label>
                  </div>

                  {showDelayedWallets && (
                    <>
                      <h3 className="text-lg font-semibold">Delayed Bundler Wallets</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Delay before Bundle Snipe (ms)</label>
                          <Input
                            type="number"
                            min="0"
                            value={delayBeforeSnipe}
                            onChange={(e) => setDelayBeforeSnipe(Math.max(0, parseInt(e.target.value)))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Number of Wallets (Max 176) </label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={numWallets}
                            onChange={(e) => setNumWallets(Math.min(50, Math.max(1, parseInt(e.target.value))))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Min Amount to Snipe</label>
                          <Input
                            type="number"
                            min="0"
                            value={minSnipeAmount}
                            onChange={(e) => setMinSnipeAmount(Math.max(0, parseFloat(e.target.value)))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Max Amount to Snipe</label>
                          <Input
                            type="number"
                            min="0"
                            value={maxSnipeAmount}
                            onChange={(e) => setMaxSnipeAmount(Math.max(minSnipeAmount, parseFloat(e.target.value)))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                      <Button onClick={generateWallets} className="bg-purple-500 hover:bg-purple-600">
                        Generate Wallets
                      </Button>
                      {generatedWallets.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow className="gap-2">
                              <TableHead>Wallet Address</TableHead>
                              <TableHead>Private Key</TableHead>
                              <TableHead>Snipe Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {generatedWallets.map((wallet, index) => (
                              <TableRow key={index} className="gap-2">
                                <TableCell>{shortenTextWithDots(wallet.address)}</TableCell>
                                <TableCell>{shortenTextWithDots(wallet.privateKey)}</TableCell>
                                <TableCell>
                                  <Input
                                    value={wallet.snipeAmount}
                                    onChange={(e) => {
                                      const newWallets = [...generatedWallets];
                                      newWallets[index].snipeAmount = Number(e.target.value);
                                      setGeneratedWallets(newWallets);
                                    }}
                                    className="w-full"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-between mt-5">
                  <Button
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={handleSaveWallets}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Wallets"}
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Validate Bundler
                  </Button>
                </div>
              </>)}


          </div>
        </div>
      </div>
    </div>
  )
}

