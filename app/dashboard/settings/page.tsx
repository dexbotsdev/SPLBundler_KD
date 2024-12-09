'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
 import { useAuth } from '@clerk/nextjs'
import { getSettings, saveSettings } from "./_actions"
import { UserSetting } from "@/app/model/UserSettings"
import { toast } from "sonner"

export default function SettingsPage() {
    

  const [settings, setSettings] = useState({
    launchPK: '',
    enableDevnet: false,
    rpcURL: '',
    priorityFee: '0.001',
    jitoTips: '0.001',
    shyftApiKey: '', 
    maxRetries: 5,

  })

  const handleSubmit = async (e: React.FormEvent) => {
     
    e.preventDefault()

     try {

      const settingsData :any = {
        launchPK: settings.launchPK,
        enableDevnet: settings.enableDevnet,
        rpcURL: settings.rpcURL,
        priorityFee: settings.priorityFee,
        jitoTips: settings.jitoTips, 
        shyftApiKey: settings.shyftApiKey, 
        maxRetries:settings.maxRetries
      }

 
     const message =  await saveSettings(settingsData)
        
     if(message)
      toast( message.message)
    } catch (error) {
      toast(  "Failed to save settings. Please try again.")
 
    }
  }

  const fetchSettings = async()=>{
    return await getSettings();
  }

  useEffect(()=>{ 
    fetchSettings().then((result:any)=>{ 
      if(result){
        setSettings(result)
    }}) 
  },[1])

  return ( 

      <div className="container max-w-4xl py-8 text-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
           
            <div className="flex space-y-2">
              <Label htmlFor="launchPK" className="w-[30%] mt-4">MainWallet Private Key</Label>
              <Input
                id="launchPK"
                placeholder="Token Launcher Private Key not set"
                value={settings.launchPK}
                onChange={(e) => setSettings(prev => ({ ...prev, launchPK: e.target.value }))}
              />
            </div>

            
            <div className="flex space-y-2">
              <Label htmlFor="customRpcUrl" className="w-[30%] mt-4">Custom RPC URL</Label>
              <Input
                id="customRpcUrl"
                placeholder="Custom RPC URL not set"
                value={settings.rpcURL}
                onChange={(e) => setSettings(prev => ({ ...prev, rpcURL: e.target.value }))}
              />
            </div> 
 
            <div className="flex items-center justify-between">
              <Label htmlFor="enableDevnetMode">Enable Devnet Mode</Label>
              <Switch
                id="enableDevnetMode"
                checked={settings.enableDevnet}
                onCheckedChange={(checked: any) => setSettings(prev => ({ ...prev, enableDevnet: checked }))}
              />
            </div>
            <div className="flex space-y-2">
            <Label htmlFor="priorityFees" className=" w-[30%] mt-4">Priority Fees</Label>
              <Input
                id="priorityFees"
                type="number"
                step="0.001"
                value={settings.priorityFee}
                onChange={(e) => setSettings(prev => ({ ...prev, priorityFee: e.target.value }))}
              />
            </div>

            <div className="flex space-y-2">
              <Label htmlFor="jitoTips" className=" w-[30%] mt-4">Jito Tips</Label>
              <Input
                id="jitoTips"
                type="number"
                step="0.001"
                value={settings.jitoTips}
                onChange={(e) => setSettings(prev => ({ ...prev, jitoTips: e.target.value }))}
              />
            </div>
            <div className="flex space-y-2">
            <Label htmlFor="shyftApiKey" className=" w-[30%] mt-4">Shyft API Key</Label>
              <Input
                id="shyftApiKey"
                 value={settings.shyftApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, shyftApiKey: e.target.value }))}
              />
            </div>
            <div className="flex space-y-2">
            <Label htmlFor="maxRetries" className=" w-[30%] mt-4">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                step="1"
                value={settings.maxRetries}
                onChange={(e) => setSettings(prev => ({ ...prev, maxRetries: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    className="rounded-lg p-2"
                                >
                                  Submit
                                  </Button>
                            </div>
                        </div>
        </form>
      </div> 
  )
}

