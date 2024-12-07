import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-primary flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Image
            src="/logo.png"
            width={240}
            height={80}
            alt="Dubai Real Estate CRM"
            className="mb-8"
          />
          <h1 className="text-3xl font-bold text-white mb-4">
            Dubai Real Estate CRM
          </h1>
          <p className="text-xl text-gray-300">
            Manage your real estate business with ease and efficiency.
          </p>
        </div>
      </div>
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">{children}</div>
      </div>
    </div>
  )
}

