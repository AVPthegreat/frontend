"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What is Codebase and who can use it?",
    answer:
      "Codebase is a coding practice and competition platform for programmers of all levels. Beginners, students, and professionals can solve problems, participate in contests, and track their growth.",
  },
  {
    question: "Can I try Codebase before opting for a premium plan?",
    answer:
      "Yes! Most features are free. Premium plans unlock advanced analytics, AI-based recommendations, and early contest access.",
  },
  {
    question: "What programming languages and problems are supported?",
    answer:
      "Codebase supports C, C++, Java, Python, and JavaScript. Problems range from basic algorithms and data structures to competitive programming, system design, and interview-style challenges.",
  },
  {
    question: "How does Codebase evaluate code and track progress?",
    answer:
      "Submissions run in secure Docker containers and are tested against multiple public and hidden test cases. Users can view their submission history, verdicts, execution time, and memory usage.",
  },
  {
    question: "Can I participate in contests and interact with the community?",
    answer:
      "Yes! Codebase hosts weekly and monthly contests and provides discussion forums to ask questions, share solutions, and connect with other programmers.",
  },
  {
    question: "How is my data and code secured?",
    answer:
      "All user data and code submissions are encrypted, and every code execution occurs in an isolated environment to ensure complete security.",
  },
  {
    question: "Can I customize my profile and track my performance?",
    answer:
      "Yes, you can personalize your profile, track solved problems, earn badges, and view your leaderboard rankings.",
  },
  {
    question: "Can I manage my account and subscription easily?",
    answer:
      "You can reset your password, delete your account, and upgrade or change your plan anytime. Refunds for premium subscriptions are also available under policy guidelines.",
  },
];


export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            className="text-8xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to know about CodeBase. Can't find what you're looking for? Contact our support team.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-border/20 rounded-lg bg-card/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          
          
        </motion.div>
      </div>
    </section>
  )
}
