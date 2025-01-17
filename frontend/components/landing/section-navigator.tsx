"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from "react"

interface Section {
  id: string
  name: string
}

const sections: Section[] = [
  { id: "hero", name: "Top" },
  { id: "video-section", name: "Features" },
  { id: "pricing", name: "Pricing" },
  { id: "insights", name: "Insights" },
  { id: "brands", name: "Brands" },
  { id: "faq", name: "FAQ" }
]

export function SectionNavigator() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      const sectionElements = sections.map(section => document.getElementById(section.id))
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section && scrollPosition >= section.offsetTop) {
          setCurrentSection(i)
          break
        }
      }

      // Hide button when reaching the last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToNextSection = () => {
    const nextIndex = (currentSection + 1) % sections.length
    const nextSection = document.getElementById(sections[nextIndex].id)
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="md:flex fixed bottom-6 right-6 z-50 hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <Button
            onClick={scrollToNextSection}
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm hover:shadow transition-all duration-300 rounded-full group px-4 py-2 text-sm font-medium"
            size="sm"
          >
            <span className="mr-2">
              {sections[(currentSection + 1) % sections.length].name}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform group-hover:translate-y-0.5 ${
              currentSection === sections.length - 1 ? 'rotate-180' : ''
            }`} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

