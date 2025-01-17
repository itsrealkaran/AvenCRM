"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Logo from "../logo"
import { Menu, X } from 'lucide-react'

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 ease-in-out ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <header className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-300 ease-in-out border border-white/30">
        <div className="px-4 sm:px-6 lg:px-8 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <motion.div
                className='text-[1.6rem] md:text-[1.8rem]'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Logo />
              </motion.div>
              <motion.div
                className='text-[#5932ea] text-[1rem] md:text-[1.2rem] flex gap-[2px] items-end font-bold'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1>AvenCRM</h1>
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Link 
                    href={item.href}
                    className="text-sm font-medium text-gray-800 hover:text-black transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  href="/sign-in" 
                  className="text-sm font-medium text-gray-800 hover:text-black transition-colors"
                >
                  Sign in
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  asChild 
                  className="bg-[#9BF3F0] hover:bg-[#9BF3F0]/80 text-gray-800 rounded-full px-6"
                >
                  <Link href="/sign-up">
                    Request a Demo
                  </Link>
                </Button>
              </motion.div>
            </nav>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/90 backdrop-blur-md rounded-b-2xl shadow-lg overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    <Link 
                      href={item.href}
                      className="block text-sm font-medium text-gray-800 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    href="/sign-in" 
                    className="block text-sm font-medium text-gray-800 hover:text-black transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    asChild 
                    className="w-full bg-[#9BF3F0] hover:bg-[#9BF3F0]/80 text-gray-800 rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/sign-up">
                      Request a Demo
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </motion.div>
  )
}

