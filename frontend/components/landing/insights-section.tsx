'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Article {
  id: number;
  title: string;
  image: string;
  category: string;
  readTime: string;
  excerpt: string;
  link: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'How to add leads?',
    image:
      'https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg',
    category: 'Tutorial',
    readTime: '5 min read',
    excerpt: 'Learn the most effective ways to generate and manage leads in your CRM system.',
    link: '#',
  },
  {
    id: 2,
    title: 'How to optimize your sales pipeline?',
    image:
      'https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg',
    category: 'Guide',
    readTime: '7 min read',
    excerpt: 'Discover proven strategies to streamline your sales process and close more deals.',
    link: '#',
  },
  {
    id: 3,
    title: 'Best practices for customer retention',
    image:
      'https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg',
    category: 'Best Practices',
    readTime: '6 min read',
    excerpt: 'Expert tips on keeping your customers engaged and loyal to your brand.',
    link: '#',
  },
  {
    id: 4,
    title: 'The future of CRM technology',
    image:
      'https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg',
    category: 'Insights',
    readTime: '8 min read',
    excerpt: 'Explore upcoming trends and innovations in CRM software development.',
    link: '#',
  },
];

export function InsightsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className='py-24 px-4 bg-[#ffffff]'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <span className='text-sm font-medium text-[#6f6c90] mb-4 block'>Latest</span>
          <h2 className='text-6xl font-bold text-[#222222] mb-6 tracking-tight'>INSIGHTS</h2>
          <p className='text-lg text-[#6f6c90] max-w-2xl mx-auto'>
            Dive into our latest articles and stay updated with industry trends, expert tips, and
            the newest features of our SaaS solutions.
          </p>
        </motion.div>

        <div className='relative'>
          <div
            ref={scrollContainerRef}
            className='flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8'
            style={{ scrollbarColor: 'transparent transparent', scrollbarWidth: 'thin' }}
          >
            {articles.map((article) => (
              <motion.div
                key={article.id}
                className='flex-none w-[400px] group'
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <a
                  href={article.link}
                  className='block bg-[#ffffff] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col'
                >
                  <div className='relative'>
                    <div className='relative aspect-[4/3] overflow-hidden'>
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className='object-cover transition-transform duration-700 group-hover:scale-105'
                      />
                    </div>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  </div>

                  <div className='p-6 flex flex-col flex-grow'>
                    <div className='flex items-center justify-between mb-4'>
                      <Badge
                        variant='secondary'
                        className='bg-[#4a3aff]/10 text-[#4a3aff] hover:bg-[#4a3aff]/20'
                      >
                        {article.category}
                      </Badge>
                      <div className='flex items-center text-sm text-[#6f6c90]'>
                        <Clock className='w-4 h-4 mr-1' />
                        {article.readTime}
                      </div>
                    </div>

                    <h3 className='text-xl font-semibold text-[#222222] mb-2 group-hover:text-[#4a3aff] transition-colors line-clamp-2'>
                      {article.title}
                    </h3>

                    <p className='text-[#6f6c90] mb-4 line-clamp-2'>{article.excerpt}</p>

                    <div className='flex items-center text-[#4a3aff] font-medium mt-auto'>
                      Read more
                      <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-2' />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>

          <div className='absolute inset-y-0 -left-14 -right-14 flex items-center justify-between pointer-events-none'>
            <Button
              variant='outline'
              size='icon'
              className='h-10 w-10 rounded-full border-[#d9dbe9] hover:bg-[#4a3aff] hover:text-[#ffffff] pointer-events-auto'
              onClick={() => scroll('left')}
            >
              <ChevronRight className='h-5 w-5 rotate-180' />
              <span className='sr-only'>Scroll left</span>
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-10 w-10 rounded-full border-[#d9dbe9] hover:bg-[#4a3aff] hover:text-[#ffffff] pointer-events-auto'
              onClick={() => scroll('right')}
            >
              <ChevronRight className='h-5 w-5' />
              <span className='sr-only'>Scroll right</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
