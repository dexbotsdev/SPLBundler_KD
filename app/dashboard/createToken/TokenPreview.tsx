import Image from "next/image"
import { Copy } from 'lucide-react'
import { Card } from "@/components/ui/card"

interface TokenPreviewProps {
  formData: {
    name?: string
    symbol?: string
    supply?:string
    decimals?:number
    imagePreview?: string  
    creatorName?: string
    creatorSite?: string
  }
}

export default function TokenPreview({ formData }: TokenPreviewProps) {
  return (
    <div className="space-y-2">
      <h2 className="mb-4 text-xl font-semibold">2. Token Details</h2>
      <p className="mb-4 text-sm text-muted-foreground">
                      &nbsp;
                  </p>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {formData.imagePreview ? (
              <Image
                src={formData.imagePreview}
                alt="Token Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/30">
                logo
              </div>
            )}
            <div>
              <div className="text-sm text-white/50 mb-1">{formData.name || "BOME"}</div>
              <div className="text-xl font-semibold">{formData.symbol || "BOME"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-1">TOTAL SUPPLY</div>
              <div className="font-medium">{formData.supply ||'1,000,000'}</div>
            </div>
            <div>
              <div className="text-sm text-white/50 mb-1">DECIMALS</div>
              <div className="font-medium">{formData.decimals || 9}</div>
            </div>
          </div>

          <div className="my-6 border-t border-white/10" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-1">PROGRAM</div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">SPL Token</span>
                {/* <Button variant="ghost" size="icon" className="h-4 w-4 text-white/50">
                  <Copy className="h-3 w-3" />
                </Button> */}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/50 mb-1">FREEZE AUTHORITY</div>
              <div className="font-medium">-</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-1">MINT AUTHORITY</div>
              <div className="font-medium">-</div>
            </div>
            <div>
              <div className="text-sm text-white/50 mb-1">UPDATE AUTHORITY</div>
              <div className="font-medium">-</div>
            </div>
          </div>

          <div className="my-6 border-t border-white/10" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-1">CREATOR NAME</div>
              <div className="font-medium">{formData.creatorName || "KD Tools"}</div>
            </div>
            <div>
              <div className="text-sm text-white/50 mb-1">CREATOR SITE</div>
              <div className="font-medium">{formData.creatorSite || "https://kd.org"}</div>
            </div>
          </div>
        </Card> 
    </div>
  )
}

