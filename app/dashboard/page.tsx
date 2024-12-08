import Link from "next/link"
import { Card } from "@/components/ui/card"
import { RocketIcon } from "./_components/rocketIcon"
import { PumpIcon } from "./_components/pumpIcon"
import { RaydiumIcon } from "./_components/raydiumIcon"


export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-xl md:text-3xl font-bold text-white text-center mb-4">
          Launch your project now
        </h1>
        <p className="text-sm md:text-xl text-gray-400 text-center mb-12">
          Launch your first project and go to the moon
        </p>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-4xl mb-12">
          {/* <Card className="border-[#1a1f35] p-8 flex flex-col items-center hover:border-[#2a2f45] transition-colors cursor-pointer">
            <div className="w-16 h-16 mb-6">
              <PumpIcon />
            </div>
            <p className="text-gray-400 mb-2">platform</p>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-space)' }}>
              Pump.fun
            </h2>
          </Card> */}
          <Link href="/dashboard/createToken">
            <Card className="border-[#1a1f35] p-8 flex flex-col items-center hover:border-[#2a2f45] transition-colors cursor-pointer">
              <div className="w-16 h-16 mb-6">
                <RaydiumIcon />
              </div>
              <p className="text-gray-400 mb-2">platform</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-space)' }}>
                Raydium (AMM)
              </h2>
            </Card>
          </Link>
        </div>

        <Link
          href="/dashboard/myBundles"
          className="text-[#4F6EF6] hover:text-[#5d7af7] transition-colors text-sm font-medium"
        >
          Explore My Bundles
        </Link>
      </div>
    </div>
  )
}

