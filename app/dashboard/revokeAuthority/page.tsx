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
    tokenMint: z.string().min(32, "Token mint must be at least 32 characters long").max(44, "Token mint must be at most 44 characters long"),
})

type RevokeFormValues = z.infer<typeof revokeFormSchema>


export default function RevokeAuthorityPage() {
    const [isLoading, setIsLoading] = useState(false)
  const confirm = useConfirm()

    const form = useForm<RevokeFormValues>({
        resolver: zodResolver(revokeFormSchema),
        defaultValues: {
            tokenMint: "",
        },
    })

    async function revokeAuthority( authorityType: 'mint' | 'freeze') {
        setIsLoading(true)
        try {

             const {tokenMint} = form.getValues();

             alert(tokenMint+":"+authorityType)

             const metadata = {
                tokenAddress: tokenMint,
                authType:authorityType
             }

             const results: any = await axios.post('/api/revokeAuth', metadata);

 

             if (results.data.status) {            
            await confirm({
                title: 'Success!',
                description: "Authority Revoked",
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
                    description: ` Revoke Failed : ${results.data.message}`,
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
                <h1 className="mb-8 text-2xl font-bold">Revoke Authorities</h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Enter Mints Section */}
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">1. Revoke Mint Authority</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the token address for the token you want to revoke mint authority for.
                            </p>
                            <Card className="p-4">
                                <Form {...form}>
                                    <form  className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="tokenMint"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Token Mint Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter token mint address" {...field} className="bg-white/5 border-white/10" />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter the mint address of the token you want to revoke mint authority for.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="outline"  size={'md'}
                                            onClick={()=>revokeAuthority('mint')}
                                            className="bg-purple-500 hover:bg-purple-600" disabled={isLoading}>
                                            {isLoading ? "Revoking..." : "Revoke Mint Authority"}
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
                            <h2 className="mb-2 text-xl font-semibold">2. Revoke Freeze Authority</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the token address for the token you want to revoke freeze authority for.

                            </p>
                            <Card className="p-4">
                                <Form {...form}>
                                    <form  className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="tokenMint"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Token Mint Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter token mint address" {...field} className="bg-white/5 border-white/10" />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter the mint address of the token you want to revoke freeze authority for.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="outline"  size={'md'}
                                            onClick={()=>revokeAuthority('freeze')}
                                            className="bg-purple-500 hover:bg-purple-600" disabled={isLoading}>
                                            {isLoading ? "Revoking..." : "Revoke Freeze Authority"}
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

