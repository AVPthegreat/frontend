"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Check, ArrowRight } from "lucide-react"

// const pricingPlans = [
//   {
//     name: "Starter",
//     price: "$29",
//     period: "/month",
//     description: "Perfect for small teams getting started",
//     features: ["Up to 5 team members", "10GB storage", "Basic analytics", "Email support", "Standard integrations"],
//     popular: false,
//   },
//   {
//     name: "Professional",
//     price: "$79",
//     period: "/month",
//     description: "Best for growing businesses",
//     features: [
//       "Up to 25 team members",
//       "100GB storage",
//       "Advanced analytics",
//       "Priority support",
//       "All integrations",
//       "Custom workflows",
//       "API access",
//     ],
//     popular: true,
//   },
//   {
//     name: "Enterprise",
//     price: "Custom",
//     period: "",
//     description: "For large organizations",
//     features: [
//       "Unlimited team members",
//       "Unlimited storage",
//       "Enterprise analytics",
//       "24/7 dedicated support",
//       "Custom integrations",
//       "Advanced security",
//       "SLA guarantee",
//       "On-premise deployment",
//     ],
//     popular: false,
//   },
// ]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-8xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Choose the perfect plan for your business needs. <br /> No hidden fees, no surprises.
          </motion.p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card border rounded-lg p-8 ${
                plan.popular ? "border-white/30 bg-white/5" : "border-border/20 bg-background/50"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul> 

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-transparent border border-white/20 text-white hover:bg-white/10"
                } group`}
                size="lg"
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div> */}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-4">All plans include 14-day free trial • No credit card required</p>
          <p className="text-sm text-gray-500">
            Need a custom solution?{" "}
            <a href="#" className="text-white hover:underline">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
