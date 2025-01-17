"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "DO YOU DO WEB DESIGN OR WEB DEVELOPMENT?",
    answer: "We offer comprehensive real estate CRM solutions that include both web design and development services. Our team specializes in creating custom, user-friendly interfaces specifically tailored for real estate professionals, ensuring your CRM system is both visually appealing and functionally robust."
  },
  {
    question: "I'M AN AGENCY, DO YOU DEVELOP FIGMA DESIGNS?",
    answer: "Yes, we specialize in turning Figma designs into fully functional real estate CRM systems. Our development team is experienced in translating design specifications into responsive, interactive web applications while maintaining design fidelity and ensuring optimal performance."
  },
  {
    question: "WHY DO I DEVELOP SOLELY USING YOUR CRM?",
    answer: "Our CRM is specifically designed for real estate professionals, offering specialized features like property listing management, client tracking, and automated marketing tools. By focusing solely on our platform, you benefit from integrated workflows, consistent updates, and dedicated support tailored to the real estate industry."
  },
  {
    question: "HOW MUCH DOES IT COST?",
    answer: "We offer flexible pricing plans starting from $99/month, with options for both individual agents and large agencies. Each plan is customizable to your specific needs, and we provide transparent pricing with no hidden fees. Contact our sales team for a detailed quote based on your requirements."
  },
  {
    question: "DO I NEED A DEVELOPER TO MAKE FUTURE UPDATES ON MY WEBSITE?",
    answer: "No, our CRM platform is designed with user-friendly interfaces that allow you to make common updates without technical expertise. However, for more complex customizations, our support team and developers are available to assist you as needed."
  }
]

export function FaqSection() {
  return (
    <section className="py-24 px-4 bg-[#ffffff]">
      <div className="max-3xl md:max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-medium text-[#141414] leading-tight max-w-2xl"
          >
            <div className="flex gap-4 items-end">
            COMMON
            <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex text-lg text-[#2e2e2e] mt-4 md:mt-0"
          >
            SOME QUESTIONS
            <br />
            PEOPLE USUALLY ASK
          </motion.p>
          </div>
            QUESTIONS
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-[#e5e5e5] px-0"
              >
                <AccordionTrigger className="text-lg font-medium text-[#141414] hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#3e3e3e] pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

