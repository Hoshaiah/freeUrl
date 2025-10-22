import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard before rendering
  if (session) {
    redirect('/dashboard')
  }

  return <HomeClient />
}
