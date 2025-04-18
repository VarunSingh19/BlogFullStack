// "use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog-card"
import { SearchFilters } from "@/components/search-filters"
import { getAllBlogs } from "@/lib/data/blog"
import { HeroSection } from "@/components/hero-section"
import { FeaturedSection } from "@/components/featured-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default async function Home() {
  const blogs = await getAllBlogs({ limit: 6 })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />

        <section className="py-16 md:py-24 container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Discover Trending Articles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of expert articles, with AI-powered summaries and premium resources.
            </p>
          </div>

          <SearchFilters />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/blogs">
              <Button size="lg" className="rounded-full px-8">
                View All Articles
              </Button>
            </Link>
          </div>
        </section>

        <FeaturedSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  )
}
