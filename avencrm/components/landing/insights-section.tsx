"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Article {
  id: number
  title: string
  image: string
  category: string
  readTime: string
  excerpt: string
  link: string
  color: string
}

const articles: Article[] = [
  {
    id: 1,
    title: "How to add leads?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
    category: "Tutorial",
    readTime: "5 min read",
    excerpt: "Learn the most effective ways to generate and manage leads in your CRM system.",
    link: "#",
    color: "#00a0a0"
  },
  {
    id: 2,
    title: "How to optimize your sales pipeline?",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "Guide",
    readTime: "7 min read",
    excerpt: "Discover proven strategies to streamline your sales process and close more deals.",
    link: "#",
    color: "#ff6b6b"
  },
  {
    id: 3,
    title: "Best practices for customer retention",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2031&q=80",
    category: "Best Practices",
    readTime: "6 min read",
    excerpt: "Expert tips on keeping your customers engaged and loyal to your brand.",
    link: "#",
    color: "#4ecdc4"
  },
  {
    id: 4,
    title: "The future of CRM technology",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    category: "Insights",
    readTime: "8 min read",
    excerpt: "Explore upcoming trends and innovations in CRM software development.",
    link: "#",
    color: "#feca57"
  }
]

export function InsightsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === "right" ? scrollAmount : -scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth"
      })
    }
  }

  return (
    <section className="py-16 px-4 bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-[#6f6c90] mb-4 block">
            Latest
          </span>
          <h2 className="text-6xl font-bold text-[#222222] mb-6 tracking-tight">
            INSIGHTS
          </h2>
          <p className="text-lg text-[#5a6c7d] max-w-2xl mx-auto">
            Dive into our latest articles and stay updated with industry trends,
            expert tips, and the newest features of our SaaS solutions.
          </p>
        </motion.div>

        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                className="flex-none w-[300px] md:w-[400px] group"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <a 
                  href={article.link}
                  className="block bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl h-full flex flex-col transform hover:-translate-y-2 border border-[#e1ecf4]"
                >
                  <div className="relative">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        style={{ 
                          background: `linear-gradient(to top, ${article.color}99, ${article.color}4D, transparent)`
                        }} 
                      />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ 
                          backgroundColor: `${article.color}88`,
                          color: "#eeeeee"
                        }}
                      >
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 
                      className="text-xl font-bold mb-3 transition-colors line-clamp-2"
                      style={{ color: '#2c3e50' }}
                    >
                      {article.title}
                    </h3>
                    
                    <p className="text-[#5a6c7d] mb-4 line-clamp-3 flex-grow text-sm">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e1ecf4]">
                      <div className="flex items-center text-sm text-[#5a6c7d]">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                      <div 
                        className="flex items-center font-medium group"
                        style={{ color: article.color }}
                      >
                        Read more
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-[#e1ecf4] bg-white/90 hover:bg-[#2c3e50] hover:text-white pointer-events-auto transition-colors duration-300 shadow-lg"
              onClick={() => scroll("left")}
            >
              <ChevronRight className="h-6 w-6 rotate-180" />
              <span className="sr-only">Scroll left</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-[#e1ecf4] bg-white/90 hover:bg-[#2c3e50] hover:text-white pointer-events-auto transition-colors duration-300 shadow-lg"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Scroll right</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

