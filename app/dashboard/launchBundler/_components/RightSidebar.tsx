'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image'
import { Terminal } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { LaunchModal } from './LaunchModal'
import { LaunchData, TokenData } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'


interface PoolData {
  poolId: string
  lpBalance: string
}

interface RightSidebarProps {
  tokenData: TokenData
  poolData: PoolData
}

interface Log {
  timestamp: Date;
  message: string;
}



export default function RightSidebar({ tokenData, poolData }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('token')
  const [logs, setLogs] = useState<Log[]>([])
  const [isLaunching, setIsLaunching] = useState(false)

  const handleLaunch = async (data: LaunchData) => {
    setIsLaunching(true);
    setLogs([]);


    const response = await fetch("/api/launchBundler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value);
        addLog(chunk);
      }
    }

    // // Simulate launch process
    // addLog("Initializing launch process...");
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // addLog(`Setting start time to: ${data.startTime}`);
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // if (data.primaryBundlerEnabled) {
    //   addLog("Enabling primary bundler...");
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // }

    // if (data.delayEnabled) {
    //   addLog(`Setting up delayed bundler for ${data.delaySeconds} seconds...`);
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // }

    // addLog(`Adding base liquidity: ${data.baseLiquidity}`);
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // addLog(`Adding quote liquidity: ${data.quoteLiquidity}`);
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // addLog("Finalizing launch...");
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // addLog("Launch successful!");
    setIsLaunching(false);
  };

  const addLog = (message: string) => {
    const newLog: Log = {
      timestamp: new Date(),
      message: message
    }
    setLogs(prevLogs => [...prevLogs, newLog])
  }


  const shortenAddress = (address: string) => {

    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const [text, setText] = useState('')

  

  return (
    <div className="w-[40%] border-l border-gray-800 p-3 space-y-4 overflow-y-auto">
      <Card className=" border-gray-800">
        <Tabs defaultValue="token" onValueChange={setActiveTab}> 
          <TabsContent value="token">
            <CardContent className="p-4 text-center space-y-3">
              <Image
                src={tokenData.image}
                alt={tokenData.name}
                width={60}
                height={60}
                className="mx-auto rounded-lg"
              />
              <h3 className="text-sm font-semibold">{tokenData.name}</h3>
              <p className="text-xs text-gray-400">
                Total Supply: {tokenData.supply}
              </p>
             {tokenData.poolId? "": <LaunchModal
                tokenData={tokenData}
                onLaunch={handleLaunch}
              />}

            </CardContent>
          </TabsContent>
          <TabsContent value="pool">
            <CardContent className="p-4 text-center space-y-3">
              <p className="text-xs text-gray-400">
                Pool ID: {tokenData.poolId && shortenAddress(poolData.poolId)}
              </p>
              <p className="text-xs text-gray-400">
                LP Balance: {poolData.lpBalance}
              </p>
              <div className="flex space-x-2"> 
                <Button size="sm" className="w-full h-8 text-xs" disabled={!tokenData.poolId}
                >Remove</Button>
                <Button size="sm" className="w-full h-8 text-xs" disabled={!tokenData.poolId}
                >Burn</Button>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <h2 className="font-semibold text-sm">Logs</h2>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Logs</div>
          <Card >
            <ScrollArea className="h-[400px] overflow-auto">
              <div className="space-y-2 p-4">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

