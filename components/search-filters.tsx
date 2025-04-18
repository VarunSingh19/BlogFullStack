"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [tag, setTag] = useState(searchParams.get("tag") || "")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
  )
  const [showPremiumOnly, setShowPremiumOnly] = useState(searchParams.get("premium") === "true")
  const [readingTime, setReadingTime] = useState<number[]>([Number.parseInt(searchParams.get("readingTime") || "10")])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (tag) params.set("tag", tag)
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString().split("T")[0])
    if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0])
    if (showPremiumOnly) params.set("premium", "true")
    params.set("readingTime", readingTime[0].toString())

    router.push(`/blogs?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch("")
    setTag("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setShowPremiumOnly(false)
    setReadingTime([10])
    setShowAdvanced(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-2 rounded-xl p-6 shadow-sm"
    >
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                  !dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                  !dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" className="gap-2" onClick={() => setShowAdvanced(!showAdvanced)}>
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSearch}>Apply Filters</Button>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-sm font-medium">Reading Time</h3>
                    <div className="pt-2">
                      <Slider value={readingTime} onValueChange={setReadingTime} max={30} step={1} className="w-full" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>{readingTime[0]} min</span>
                        <span>30 min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="premium-content" checked={showPremiumOnly} onCheckedChange={setShowPremiumOnly} />
                    <Label htmlFor="premium-content">Show premium content only</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="has-audio" />
                    <Label htmlFor="has-audio">Has audio version</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="has-pdf" />
                    <Label htmlFor="has-pdf">Has PDF attachment</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="most-commented" />
                    <Label htmlFor="most-commented">Most commented</Label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
