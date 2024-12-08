"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { Card } from "@/components/ui/card"
import {
    ConfirmDialogProvider as BaseConfirmDialogProvider,
    ConfirmOptions,
    useConfirm
  } from '@omit/react-confirm-dialog'
  import { Upload, Loader2, CheckCircle, CopyIcon } from "lucide-react";

const revokeFormSchema = z.object({
    poolId: z.string().min(32, "Pool Id must be at least 32 characters long").max(44, "Pool Id  must be at most 44 characters long"),
})

type RevokeFormValues = z.infer<typeof revokeFormSchema>


export default function ManageLPPage() {
    const [isLoading, setIsLoading] = useState(false)
  const confirm = useConfirm()

    const form = useForm<RevokeFormValues>({
        resolver: zodResolver(revokeFormSchema),
        defaultValues: {
            poolId: "",
        },
    })

    async function removeLP( opsType: 'remove' | 'burn') {
        setIsLoading(true)
        try {

             const {poolId} = form.getValues(); 
             const metadata = {
                poolId: poolId,
                opsType:opsType
             }

             let results: any = '';
             
             if(opsType =='remove'){
                results= await axios.post('/api/removeLP', metadata);
             } else {
                results= await axios.post('/api/burnLP', metadata);


             }

 

             if (results.data.status) {            
            await confirm({
                title: 'Success!',
                description: opsType =='remove' ? "Successully Removed ":"Successfully Burned",
                alertDialogContent: { className: 'w-full' },

                icon: <CheckCircle className="size-4 text-green-500" />,
                confirmText: 'OK/Cancel',
                cancelButton: null, // Hide cancel button
                alertDialogTitle: {
                  className: 'flex items-center gap-2 text-green-500'
                }
              })
            } else {
                await confirm({
                    title: `Failed`,
                    description: ` Ops Failed : ${results.data.message}`,
                    alertDialogContent: { className: 'w-full' },
    
                    icon: <CheckCircle className="size-4 text-red-500" />,
                    confirmText: 'OK/Cancel',
                    cancelButton: null, // Hide cancel button
                    alertDialogTitle: {
                      className: 'flex items-center gap-2 text-red-500'
                    }
                  })
            }

        } catch (error) {
            await confirm({
                title: `Error`,
                description: JSON.stringify(error),
                alertDialogContent: { className: 'w-full' },
        
                icon: <CheckCircle className="size-4 text-red-500" />,
                confirmText: 'OK/Cancel',
                cancelButton: null, // Hide cancel button
                alertDialogTitle: {
                  className: 'flex items-center gap-2 text-red-500'
                }
              })
        
        } finally {
            setIsLoading(false)
        }
    }

    return (

        <main className="flex-1 p-2">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-2xl font-bold">Manage Liquidity Pool</h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Enter Mints Section */}
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">1. Remove LP</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the Pool ID for the LP Pool you want to Remove LP.
                            </p>
                            <Card className="p-4">
                                <Form {...form}>
                                    <form  className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="poolId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pool ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter Pool AMM Id" {...field} className="bg-white/5 border-white/10" />
                                                    </FormControl>
                                                    <FormDescription>
                                                     </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="outline"  size={'md'}
                                            onClick={()=>removeLP('remove')}
                                            className="bg-purple-500 hover:bg-purple-600" disabled={isLoading}>
                                            {isLoading ? "Removing..." : "Remove LP"}
                                        </Button>
                                    </form>
                                </Form>
                            </Card>

                        </section>


                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Tickers Section */}
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">2. Burn Liquidity Pool</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the Pool ID for the token you want to Burn LP for.

                            </p>
                            <Card className="p-4">
                                <Form {...form}>
                                    <form  className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="poolId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pool ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter Pool AMM Id" {...field} className="bg-white/5 border-white/10" />
                                                    </FormControl>
                                                    <FormDescription>
                                                     </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="outline"  size={'md'}
                                            onClick={()=>removeLP('burn')}
                                            className="bg-purple-500 hover:bg-purple-600" disabled={isLoading}>
                                            {isLoading ? "Burning..." : "Burn LP"}
                                        </Button>
                                    </form>
                                </Form>
                            </Card>
                        </section>
                    </div>
                </div>
            </div>
            
        </main>

    )
}

