'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (data: any) => void
  isSearching:boolean
}

export default function SearchBar({ onSearch ,isSearching}: SearchBarProps) {
  const [tokenAddress, setTokenAddress] = useState('')

  const handleSearch = () => {
     onSearch(tokenAddress)
   }

  return (
    <div className="flex space-x-2 " >
      <Input 
        className="flex-grow bg-[#2C2D32] border-1 radius-full"
        placeholder="Token Address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)} 
            disabled={isSearching}
          />
          <Button onClick={handleSearch} disabled={isSearching} variant="outline"  size={'md'}>
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
 
    </div>
  )
}

