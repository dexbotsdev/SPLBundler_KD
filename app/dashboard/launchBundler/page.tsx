'use client'

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import SearchBar from './_components/SearchBar'
import RightSidebar from './_components/RightSidebar'
import PrivateWallets from './_components/PrivateWallets'
import GeneratedWallets from './_components/GeneratedWallets'
 import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { shortenTextWithDots, Wallet } from "@/app/lib/global"

import { Card, CardContent } from "@/components/ui/card"
import { getMarketInfoById } from './_actions'
import axios from 'axios'
import { Keypair } from '@solana/web3.js'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'

import AirdropSolForm from './_components/AirdropSolForm'
import TransferTokensForm from './_components/TransferTokensForm'
import AggregateTokensForm from './_components/AggregateTokensForm'
import SellAllTokensForm from './_components/SellAllTokensForm'
import { RecoverSolModal } from './_components/RecoverSolModal'


export default function LaunchBundlerPage() {

  const [searchData, setSearchData] = useState<any | null>(null)
  const [isAirdropModalOpen, setIsAirdropModalOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [isAggregateModalOpen, setIsAggregateModalOpen] = useState(false)
 

  const handleSearch = async (tokenAddress: any) => { 
    try {
      setIsSearching(true)
       const data = await getMarketInfoById(tokenAddress.trim());
      setSearchData(data)
    } catch (error) {
      toast.error("Failed to get Token information "+error) 

    } finally{
      setIsSearching(false)

    }
  }


  const handleRecoverSol = async (walletType: 'private' | 'generated', percentage: '50' | '100') => {
    console.log(`Recovering ${percentage}% of Sol from ${walletType} wallets`)
    // Simulate API call
    const recoverData = {walletType, percentage};
    console.log(recoverData)

    const results = await axios.post('/api/recoverAllWalletsSol',recoverData);

 
    if(results.status){
      handleSearch(searchData.tokenAddress)
      toast.success("Sol Recovered from Wallets ."+walletType) 

    } else {
      toast.error("Failed to recover wallet sols") 
 
    }
  }

  const handleWalletRecover = async (address: string, percentage:Number) => {
    console.log(`Recovering ${percentage}% of Sol from wallet ${address}`)
    // Simulate API call
 
    const recoverData = {
      address,
      percentage
    }
    console.log(recoverData)

    const results = await axios.post('/api/recoverSol',recoverData);

 
    if(results.status){
      handleSearch(searchData.tokenAddress)
      toast.success("Sol Recovered from Wallet ."+address) 

    } else {
      toast.error("Failed to recover wallet sols") 
 
    }
    // Here you would implement the actual Sol recovery logic for a single wallet
  }
  
  const handleSellWalletTokens = async(wallet : Wallet, sellPercentage: string)=>{


    const sellData = { 
      tokenAddress:searchData.tokenAddress,
      address:wallet.address, 
      percentage:sellPercentage 
    };
 
    const results = await axios.post('/api/sellWallet',sellData);

 
    if(results.status){
       toast.success("Sold   from Wallet ."+wallet.address) 

    } else {
      toast.error("Failed to sell wallet tokens") 
 
    }

  }
  const handleRecoveWalletSol = async(wallet : Wallet)=>{

  }

  const handleAddPrivateWallet = (privateKey: string,address:string,snipeAmount:number) => {
    if (searchData && searchData.privateWallets.length < 3) {
      setSearchData({
        ...searchData,
        privateWallets: [...searchData.privateWallets, { address: 'NEW',privateKey:privateKey, snipeAmount: snipeAmount ,solbalance:0,tokenbalance:0}]
      })
    }
  }

  const handleGenerateWallets = (count: number, minSol: number, maxSol: number) => {

    let newWallets=[];
    for(var i=0;i<count;i++){
      var addPK =   Keypair.generate();

      newWallets.push({
        address: addPK.publicKey.toBase58(),
        privateKey: bs58.encode(addPK.secretKey), 
        snipeAmount: (Math.random() * (maxSol - minSol) + minSol).toFixed(2) ,
        solbalance:0,
        tokenbalance:0
      })
    } 
    setSearchData({
      ...searchData,
      generatedWallets: [...(searchData?.generatedWallets || []), ...newWallets]
    })
  }

  const handleSavePrivateWallets=async (wallets:any)=>{

    if(searchData.tokenAddress && wallets.length >0){
      const saveData={
        baseTokenMint:searchData.tokenAddress,
        privateWallets:wallets
      }
      const results = await axios.post('/api/wallets/savePrivateWallets',saveData)
      if(results.status){
        toast.success("Your wallet information has been saved successfully.") 
        handleSearch(searchData.tokenAddress)
      } else {
        toast.error("Failed to save wallet information") 
   
      }
    }

  }
  const handleDeletePrivateWallets=async ()=>{
    
    if(searchData.tokenAddress){
      const saveData={
        baseTokenMint:searchData.tokenAddress 
      }
      const results = await axios.post('/api/wallets/deletePrivateWallets',saveData)
      if(results.status){
        setSearchData({
          ...searchData,
          privateWallets: []
        })
        toast.success("Your wallet information has been deleted successfully.") 
      } else {
        toast.error("Failed to delete wallet information") 
   
      }
    }
  }
  const handleSaveGeneratedWallets=async (wallets:any)=>{
    if(searchData.tokenAddress && wallets.length >0){
      const saveData={
        baseTokenMint:searchData.tokenAddress,
        generatedWallets:wallets
      }
      const results = await axios.post('/api/wallets/saveGeneratedWallets',saveData)
      if(results.status){
        toast.success("Your wallet information has been saved successfully.") 
        handleSearch(searchData.tokenAddress)

      } else {
        toast.error("Failed to save wallet information") 
   
      }
    }
  }
  const handleDeleteGeneratedWallets=async ()=>{
    if(searchData.tokenAddress){
      const saveData={
        baseTokenMint:searchData.tokenAddress 
      }
      const results = await axios.post('/api/wallets/deleteGenWallets',saveData)
      if(results.status){
        setSearchData({
          ...searchData,
          generatedWallets: []
        })
        toast.success("Your wallet information has been deleted successfully.") 
      } else {
        toast.error("Failed to delete wallet information") 
   
      }
    }
  }

  return (
    <main className="flex flex-col gap-2 lg:gap-2 min-h-[90vh]">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">Launch Bundle</h2>

          <div className="mx-auto space-y-4">
            <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            {searchData && (
              <div className="mx-auto space-y-4">
                {/* Removed code block */}
                <Card className=" border-gray-800 mt-4 relative">
                  <CardContent className="flex p-2 justify-between">
                    <div className="flex  gap-2  m-2">
                      <h2>Token Address:</h2> <div className='text-sm text-green-200'>{shortenTextWithDots(searchData.tokenAddress)}</div>
                    </div>
                    <div className="gap-2">
                       <Dialog open={isAirdropModalOpen} onOpenChange={setIsAirdropModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-[10px] rounded-lg px-2 py-1 h-6 m-2">Airdrop Sol</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Airdrop Sol</DialogTitle>
                  </DialogHeader>
                  <AirdropSolForm privateWallets={searchData.privateWallets} generatedWallets={searchData.generatedWallets} />
                </DialogContent>
              </Dialog>
              {/* <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                  <DialogTrigger asChild>
                  <Button size="sm" className="text-[10px] rounded-lg px-2 py-1 h-6 m-2">Transfer Tokens</Button> 
                   </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transfer Tokens</DialogTitle>
                    </DialogHeader>
                    <TransferTokensForm privateWallets={searchData.privateWallets} generatedWallets={searchData.generatedWallets} />
                  </DialogContent>
                </Dialog>  */}
                <Dialog open={isSellModalOpen} onOpenChange={setIsSellModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="text-[10px] rounded-lg px-2 py-1 h-6 m-2">Sell All Tokens</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sell All Tokens</DialogTitle>
                    </DialogHeader>
                    <SellAllTokensForm privateWallets={searchData.privateWallets} generatedWallets={searchData.generatedWallets} tokenAddress={searchData.tokenAddress}/>
                  </DialogContent>
                </Dialog>
                <RecoverSolModal onRecover={handleRecoverSol}>
                  <Button className="text-[10px] rounded-lg px-2 py-1 h-6 m-2">Recover Sol</Button>
                </RecoverSolModal>
                {/* <Dialog open={isAggregateModalOpen} onOpenChange={setIsAggregateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="text-[10px] rounded-lg px-2 py-1 h-6 m-2">Aggregate Tokens</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aggregate Tokens</DialogTitle>
                    </DialogHeader>
                    <AggregateTokensForm privateWallets={searchData.privateWallets} generatedWallets={searchData.generatedWallets} />
                  </DialogContent>
                </Dialog> */}
                    </div>
                  </CardContent>
                </Card>
                 <PrivateWallets
                  wallets={searchData.privateWallets}
                  onAddWallet={handleAddPrivateWallet}
                  onSave={handleSavePrivateWallets}
                  onDelete={handleDeletePrivateWallets}
                  onSell={handleSellWalletTokens}
                  onRecover={handleWalletRecover}

                />
                <GeneratedWallets
                  wallets={searchData.generatedWallets} 
                  onGenerateWallets={handleGenerateWallets} 
                  onSave={handleSaveGeneratedWallets}
                  onDelete={handleDeleteGeneratedWallets} 
                  onSell={handleSellWalletTokens}
                  onRecover={handleWalletRecover}

                />
              </div>
            )}
          </div>
        </main>
        {searchData && <RightSidebar tokenData={searchData.tokenData} poolData={searchData.poolData} />}
      </div>
    </main>
  )
}
