import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-6xl font-bold text-center">
          It is Main Page
        </h1>
      </div>
      <div>
        <Link href="/posts/my-test-post">
          haha
        </Link>
      </div>
    </main>
  )
}
