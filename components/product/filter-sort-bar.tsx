"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isLightColor } from "@/lib/custom-order-preview"
import { cn } from "@/lib/utils"
import type { ProductFilterOptions } from "@/lib/products"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const

const ALL_VALUE = "__all__"

export function FilterSortBar({
  total,
  filterOptions,
}: {
  total: number
  filterOptions: ProductFilterOptions
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeSize = searchParams.get("size") ?? ""
  const activeColor = searchParams.get("color") ?? ""
  const activeMinPrice = searchParams.get("minPrice") ?? ""
  const activeMaxPrice = searchParams.get("maxPrice") ?? ""
  const hasActiveFilters =
    !!searchParams.get("q") ||
    !!activeSize ||
    !!activeColor ||
    !!activeMinPrice ||
    !!activeMaxPrice

  return (
    <div className="space-y-3 rounded-xl bg-primary/8 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            key={searchParams.get("q") ?? ""}
            type="search"
            placeholder="Search"
            defaultValue={searchParams.get("q") ?? ""}
            className="w-40 sm:w-56"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParams({ q: event.currentTarget.value || null })
              }
            }}
          />
          <Select
            value={searchParams.get("sort") ?? "newest"}
            onValueChange={(value) => updateParams({ sort: value as string })}
          >
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value: string) =>
                  SORT_OPTIONS.find((option) => option.value === value)?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.sizes.length > 0 ? (
          <Select
            value={activeSize || ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ size: value === ALL_VALUE ? null : (value as string) })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue>
                {(value: string) =>
                  value === ALL_VALUE || !value ? "All sizes" : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All sizes</SelectItem>
              {filterOptions.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {filterOptions.colors.length > 0 ? (
          <Select
            value={activeColor || ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ color: value === ALL_VALUE ? null : (value as string) })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue>
                {(value: string) =>
                  value === ALL_VALUE || !value ? "All colors" : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All colors</SelectItem>
              {filterOptions.colors.map((color) => (
                <SelectItem key={color.name} value={color.name}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-3 shrink-0 rounded-full border",
                        isLightColor(color.hex) ? "border-border" : "border-transparent",
                      )}
                      style={{ backgroundColor: color.hex ?? undefined }}
                    />
                    {color.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="flex items-center gap-1.5">
          <Input
            key={`min-${activeMinPrice}`}
            type="number"
            inputMode="decimal"
            placeholder="Min $"
            defaultValue={activeMinPrice}
            className="w-20"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParams({ minPrice: event.currentTarget.value || null })
              }
            }}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            key={`max-${activeMaxPrice}`}
            type="number"
            inputMode="decimal"
            placeholder="Max $"
            defaultValue={activeMaxPrice}
            className="w-20"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParams({ maxPrice: event.currentTarget.value || null })
              }
            }}
          />
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
          >
            <XIcon /> Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
