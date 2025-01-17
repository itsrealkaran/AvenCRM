"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "../logo"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter();

  return (
    <motion.header 
      className="z-50 bg-white border-2"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      <div className="flex justify-between py-4 px-2 md:px-8 sm:px-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex item-center justify-center"
        >
        <Link href="/" className="flex items-center gap-[2px]">
          <div className='text-[1.6rem] md:text-[2rem]'>
            <Logo />
          </div>
          <div
          className='text-[1rem] md:text-[1.3rem] text-[#5932ea] flex gap-[2px] items-end font-bold'
            >
            <h1>AvenCRM</h1>
          </div>
        </Link>
        </motion.div>
        
        <nav className="flex items-center md:gap-4">
        <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
          >
        <Button 
          variant="ghost" 
          className="text-violet-500 text-[0.8rem] md:text-[1rem] hover:text-violet-600 hover:bg-violet-50 rounded-full px-4 md:px-6 md:py-2 border border-violet-200"
        >
          Contact Sales
        </Button>
          </motion.div>
          <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
          >
        <Button 
          onClick={() => router.push("/sign-in")}
          className="bg-violet-500 hidden md:flex  text-[1rem] hover:bg-voilet-600 text-white rounded-full px-6 py-2"
        >
          Sign in 
        </Button>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  )
}

