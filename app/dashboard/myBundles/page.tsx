'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from 'react'
import { getMyTokens } from "./_actions"
import { shortenTextWithDots, Wallet } from "@/app/lib/global"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Minus, Plus } from 'lucide-react'
import { toast } from "sonner"



export default function DashboardPage() {

  const [tokenMeta,setTokenMeta]= useState([]); 
  const fetchMyTokens = async()=>{

    console.log('Inside fetchMyTokens ')

    return await getMyTokens();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Info Copied -' + text)


  }

  useEffect(()=>{ 
    console.log('Inside useEffect ')

    fetchMyTokens().then((result:any)=>{

      const json = JSON.parse(JSON.stringify(result))
      if(json &&  json.length>0)
        setTokenMeta(json)
    }) 
  },[1])
  
  return (
    <div className='flex flex-row  items-start flex-wrap px-4 pt-4 gap-4'>
      <Card className='w-[40rem]'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Welcome to SPL bundler
          </CardTitle>
           
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            The Token Creation Platform every solana dev deserves
          </p>
        </CardContent>
      </Card>  
      <div className='w-full gap-3'>
        <Card className="">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle className='text-sm'>Latest Projects</CardTitle>
              <CardDescription>
                Recent Tokens created
              </CardDescription>
            </div>
            {/* <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/projects">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button> */}
          </CardHeader>
          <CardContent>
          <Table>
      <TableCaption>A list of your recent Tokens.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Token Address</TableHead>
          <TableHead>Market Id</TableHead>
          <TableHead>Pool Id</TableHead>
         </TableRow>
      </TableHeader>
      <TableBody>
        {tokenMeta.map((meta:any) => (
          <TableRow key={meta.tokenAddress}>
            <TableCell className="font-medium">
            <div className="flex items-center gap-2"> 
            <span className="text-sm font-mono">{meta.tokenAddress ? shortenTextWithDots(meta.tokenAddress) : ' Not Created'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(meta.tokenAddress)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
            </TableCell>
            <TableCell> 
            <div className="flex items-center gap-2"> 
            <span className="text-sm font-mono">{meta.marketId ? shortenTextWithDots(meta.marketId) : ' Not Created'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(meta.marketId)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
            </TableCell>
            <TableCell>
            <div className="flex items-center gap-2"> 
            <span className="text-sm font-mono">{meta.poolId ? shortenTextWithDots(meta.poolId) : ' Not Created'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(meta.poolId)}
                        className="h-6 w-6 text-white/70 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    </TableCell>
           </TableRow>
        ))}
      </TableBody> 
    </Table>
             
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
