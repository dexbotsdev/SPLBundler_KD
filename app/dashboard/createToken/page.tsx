'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {tokenFee,marketFee,pbFee,dbFee} from '@/app/lib/constants'

import {
  useConfirm
} from '@omit/react-confirm-dialog'
import { Card } from "@/components/ui/card";
import { TokenMetadata } from "@/app/model/TokenMetadata";
import TokenPreview from "./TokenPreview";



const tokenFormSchema = z.object({
  name: z.string().min(1, "Token name is required"),
  symbol: z.string().min(1, "Token symbol is required").max(10, "Symbol must be 10 characters or less"),
  decimals: z.number().int().min(0).max(9),
  supply: z.string(),
  image: z.string().url(),
  imagePreview: z.string().url(),
  description: z.string(),
  enableSocials: z.boolean(),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  modifyAuthorities: z.boolean(),
  revokeUpdate: z.boolean(),
  revokeFreeze: z.boolean(),
  revokeMint: z.boolean(),
})

type TokenFormValues = z.infer<typeof tokenFormSchema>
const tokenCreationFee = tokenFee;
export default function CreateTokenPage() {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 9,
      supply: '1000000',
      image: '',
      description: "",
      enableSocials: false,
      modifyAuthorities: false,
      revokeUpdate: false,
      revokeFreeze: false,
      revokeMint: false,
      imagePreview: ''
    },
  })

  const enableSocials = form.watch("enableSocials")
  const modifyAuthorities = form.watch("modifyAuthorities")
  const watchedValues = form.watch()



  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "6",
    supply: "1000000000",
    image: '',
    description: "",
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
    addSocialLinks: false,
    revokeUpdate: false,
    revokeFreeze: false,
    revokeMint: false,
    imagePreview: '',
    metaHash: '',
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [tokenMint, setTokenMint] = useState<string | null>(null)
  const [tnxId, setTnxId] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const confirm = useConfirm()



  const handleImageUpload = () => {
    fileInputRef.current?.click();
  }



  const uploadImagePinata = async (file: string | Blob) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        setIsSubmitting(true)
        const response = await axios({
          method: 'post',
          url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
          data: formData,
          headers: {
            pinata_api_key: 'bd5b7d7f2e82280a1a28',
            pinata_secret_api_key:
              '671fd49cf6670be070955cf563f747df9197234f9454cfd7818d1a5ce0219027',
            'Content-Type': 'multipart/form-data',
          },
        });
        setIsSubmitting(false)
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.log(error);
        setIsSubmitting(false)

      }
    }
  };

  const handleFileChange = async (event: any) => {

    try {
      const file = event.target.files[0];
      console.log('file', file);
      if (file) {
        const imgUrl: any = await uploadImagePinata(file);
        setImagePreview(imgUrl);
        form.setValue("imagePreview", imgUrl);
        form.setValue("image", imgUrl);

        console.log(form.getValues())


      }

    } catch (error) {

    }

  }


  const validateTokenMetadata = (metadata: TokenMetadata): string[] => {
    const errors: string[] = []

    if (!metadata.name) errors.push("Name is required")
    if (!metadata.symbol) errors.push("Symbol is required")
    if (metadata.decimals < 0 || metadata.decimals > 9) errors.push("Decimals must be between 0 and 9")
    if (metadata.supply <= 0) errors.push("Supply must be greater than 0")
    if (!metadata.image) errors.push("Image is required")
    if (!metadata.description) errors.push("Description is required")

    if (formData.addSocialLinks) {
      if (metadata.website && !isValidUrl(metadata.website)) errors.push("Invalid website URL")
      if (metadata.twitter && !isValidUrl(metadata.twitter)) errors.push("Invalid Twitter URL")
      if (metadata.telegram && !isValidUrl(metadata.telegram)) errors.push("Invalid Telegram URL")
      if (metadata.discord && !isValidUrl(metadata.discord)) errors.push("Invalid Discord URL")
    }

    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const createTokenMetadata = async () => {

    setIsSubmitting(true)

    var formData = form.getValues();

    const tokenMetadata: TokenMetadata = {
      name: formData.name,
      symbol: formData.symbol,
      decimals: parseInt('' + formData.decimals),
      supply: parseFloat('' + formData.supply),
      image: imagePreview,
      description: formData.description,
      website: formData.enableSocials ? formData.website : undefined,
      twitter: formData.enableSocials ? formData.twitter : undefined,
      telegram: formData.enableSocials ? formData.telegram : undefined,
      discord: formData.enableSocials ? formData.discord : undefined,
      revokeUpdate: formData.revokeUpdate,
      revokeFreeze: formData.revokeFreeze,
      revokeMint: formData.revokeMint,
      imageHash: null,
      metaHash: null,
      baseTokenInitialLiquidity: 0,
      quoteTokenInitialLiquidity: 0,
      startTime: 0
    }

    const errors = validateTokenMetadata(tokenMetadata)

    setIsSubmitting(true)


    if (errors && errors.length > 0) {

      await confirm({
        title: `Error`,
        description: JSON.stringify(errors),
        alertDialogContent: { className: 'w-full' },

        icon: <CheckCircle className="size-4 text-red-500" />,
        confirmText: 'OK/Cancel',
        cancelButton: null, // Hide cancel button
        alertDialogTitle: {
          className: 'flex items-center gap-2 text-red-500'
        }
      })

      setIsSubmitting(false)


    } else {
      console.log("Token metadata: ", tokenMetadata)

      if (tokenMetadata.image && imagePreview) {
        try {

          let metadata = {
            name: formData.name,
            symbol: formData.symbol,
            decimals: parseInt('' + formData.decimals),
            supply: parseFloat('' + formData.supply),
            image: imagePreview,
            description: formData.description,
            website: formData.enableSocials ? formData.website : null,
            twitter: formData.enableSocials ? formData.twitter : null,
            telegram: formData.enableSocials ? formData.telegram : null,
            discord: formData.enableSocials ? formData.discord : null,
            revokeUpdate: formData.revokeUpdate,
            revokeFreeze: formData.revokeFreeze,
            revokeMint: formData.revokeMint,
            imageHash: null,
            metaHash: null,
            creators: ['']
          }


          try {

            const results: any = await axios.post('/api/createToken', metadata);


            if (results.data.status) {

              setTokenMint(results.data.tokenMint);
              setTnxId(results.data.tnxId);

              await confirm({
                title: `${results.data.status ? 'Success!' : 'Failed'}`,
                description: `Token Created ${results.data.tokenMint}`,
                alertDialogContent: { className: 'w-full' },

                icon: <CheckCircle className="size-4 text-green-500" />,
                confirmText: 'OK/Cancel',
                cancelButton: null, // Hide cancel button
                alertDialogTitle: {
                  className: 'flex items-center gap-2 text-green-500'
                }
              })
              setIsSubmitting(false)

            } else {
                await confirm({
                  title: `Failed`,
                  description: `Token Created Failed : ${results.data.message}`,
                  alertDialogContent: { className: 'w-full' },

                  icon: <CheckCircle className="size-4 text-red-500" />,
                  confirmText: 'OK/Cancel',
                  cancelButton: null, // Hide cancel button
                  alertDialogTitle: {
                    className: 'flex items-center gap-2 text-red-500'
                  }
                })

              setIsSubmitting(false)

            }



          } catch (error) {

            toast({
              title: "Token Creation",
              description: new String(error),
              variant: "destructive",
            })

          }
        } catch (error) {
          console.log(error);
        }


      }
      setIsSubmitting(false)


    }
  }

  useEffect(() => {
    if (isSubmitting) {
      document.body.style.cursor = 'wait'
    } else {
      document.body.style.cursor = 'default'
    }

    return () => {
      document.body.style.cursor = 'default'
    }
  }, [isSubmitting])


  return (
    <main className="flex-1 p-2">
      {/* Enter Mints Section */}

      {isSubmitting && (
              <div className="absolute h-full inset-0 bg-background backdrop-blur-sm z-150 flex items-center justify-center">
                <div className="text-2xl font-bold">Loading...</div>
              </div>
            )}
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Create Token </h1>

        <div className="grid gap-2  grid-cols-2">
          {/* Left Column */}
             
            <section>
              <Form {...form}> 
                  <h2 className="mb-2 text-xl font-semibold">1. Enter Details</h2>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Enter the token metadata.
                  </p>
                  <Card className="p-4">
                    <div className="rounded-lg p-3">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="BOOK OF MEME"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value)}

                                    className="bg-white/5 border-white/10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Symbol</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="BOME"
                                    {...field}
                                    onChange={e => field.onChange(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="decimals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Decimals</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="9"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                    className="bg-white/5 border-white/10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="supply"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Supply</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1000000"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                    className="bg-white/5 border-white/10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://ipfs.io/ipfs/Qmcu..."
                                  {...field}
                                  className="bg-white/5 border-white/10"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                  value={imagePreview}
                                />
                              </FormControl>
                              <div className="flex items-center justify-between mt-1">
                                <FormDescription>
                                  Enter image URL or
                                </FormDescription>
                                <Button
                                  type="button"
                                  variant="link"
                                  className="text-purple-400 h-auto p-0"
                                  onClick={handleImageUpload}
                                >
                                  upload image
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <input
                          type="file"
                          ref={fileInputRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Project description (optional)"
                                  className="min-h-[100px] bg-white/5 border-white/10"
                                  {...field}
                                  onChange={e => field.onChange(e.target.value)}

                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enableSocials"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Enable Socials
                                </FormLabel>
                                <FormDescription>
                                  Display fields for social media links
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {form.watch("enableSocials") && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://kdtool.org"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value)}

                                      className="bg-white/5 border-white/10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="twitter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter / X URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://twitter.com/kdtool"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value)}

                                      className="bg-white/5 border-white/10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="telegram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telegram URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://t.me/kdTool"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value)}

                                      className="bg-white/5 border-white/10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="discord"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discord URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://discord.com/kdtool"
                                      {...field}
                                      onChange={e => field.onChange(e.target.value)}

                                      className="bg-white/5 border-white/10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="modifyAuthorities"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Authorities (Optional)</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {modifyAuthorities && (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="revokeUpdate"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Revoke Update Authority
                                    </FormLabel>
                                    <FormDescription>
                                      If checked, you won't be able to update the token's metadata after creation.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="revokeFreeze"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Revoke Freeze Authority
                                    </FormLabel>
                                    <FormDescription>
                                      If checked, you won't be able to freeze token accounts after creation.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="revokeMint"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Revoke Mint Authority
                                    </FormLabel>
                                    <FormDescription>
                                      If checked, you won't be able to mint new tokens after the initial supply.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                       variant="outline"  size={'md'}
                        className="bg-purple-500 hover:bg-purple-600"
                        disabled={isLoading}
                        onClick={() => createTokenMetadata()}
                      >
                        {isLoading ? "Uploading..." : "Create Token "}
                      </Button>
                      <Button
                        variant="outline"  size={'md'}
                         onClick={() => form.reset()}
                        className="border-white/10"
                      >
                        Clear Form
                      </Button>
                    </div>
                    <p className='text-sm mt-2 pl-2'>Fee: 0.1 sol</p> 
                  </Card>

                 
              </Form>
            </section>
            <section>
              <TokenPreview formData={watchedValues} />
            </section> 
        </div>
      </div>
    </main>
  )
}