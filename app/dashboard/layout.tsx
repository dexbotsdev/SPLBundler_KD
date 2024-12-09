import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import Header from "./_components/Header"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { redirect } from "next/dist/server/api-utils"
import { currentUser } from "@clerk/nextjs/server"
import Footer from "./_components/Footer"
  
export default async function DashboardLayout({ children }: { children: ReactNode }) {

  const user = await currentUser()
  const { authorized, message } = await isAuthorized(user?.id!)
  if (!authorized) {
    console.log('authorized check fired')
  }
  return (
    <div className="flex flex-col h-screen overflow-visible">
      <Header />
       <div className="flex flex-1">

        <DashboardSideBar />
        <main className="flex flex-col gap-4 p-4 lg:gap-6 w-full">
          {children}
        </main>
       </div>
      <Footer />

    </div>
  )
}
