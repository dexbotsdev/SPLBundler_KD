import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="p-10 grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5">
            {Array.from({length: 12},(_, i) => i + 1).map((id) => (
                <div key={id} className="grid-flow-col auto-cols-max gap-12">
                    <Skeleton className="object-none w-32 h-32 rounded-full custom-position bg-gray-200" />
                    <Skeleton className="h-10 w-full p-6 mb-4 bg-slate-100" />
                    <Skeleton className="h-10 w-full p-8 mb-4 bg-slate-100" />
                    <Skeleton className='h-10 w-full p-10 mb-4 bg-slate-100' />
                </div>
                )
            )}
        </main>
    )
}
