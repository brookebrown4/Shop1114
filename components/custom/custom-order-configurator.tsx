"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CheckIcon, UploadIcon } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitCustomOrderRequest, uploadCustomOrderLogo } from "@/app/custom/actions";
import {
  PLACEMENTS,
  fontFamilyFor,
  isLightColor,
  placementPoint,
  placementTextSizeClass,
  type PlacementValue,
} from "@/lib/custom-order-preview";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/products";
import type { ReferenceCatalogSection } from "@/lib/reference-catalog";

function sectionItems(sections: ReferenceCatalogSection[], slug: string) {
  return sections.find((section) => section.catalog.slug === slug)?.items ?? [];
}

export function CustomOrderConfigurator({
  products,
  referenceSections,
}: {
  products: ProductWithRelations[];
  referenceSections: ReferenceCatalogSection[];
}) {
  const fonts = sectionItems(referenceSections, "fonts");
  const monogramStyles = sectionItems(referenceSections, "monogram-styles");
  const designs = sectionItems(referenceSections, "designs");
  const threadColors = sectionItems(referenceSections, "thread-colors");

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;

  const sizes = useMemo(
    () =>
      selectedProduct
        ? Array.from(new Set(selectedProduct.variants.map((v) => v.size)))
        : [],
    [selectedProduct],
  );
  const colorSwatches = useMemo(() => {
    if (!selectedProduct) return [];
    const map = new Map<string, string | null>();
    for (const variant of selectedProduct.variants) {
      if (!map.has(variant.color)) map.set(variant.color, variant.colorHex);
    }
    return Array.from(map.entries());
  }, [selectedProduct]);
  const colors = useMemo(
    () => colorSwatches.map(([color]) => color),
    [colorSwatches],
  );

  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [placement, setPlacement] = useState<PlacementValue>("left-chest");
  const [mode, setMode] = useState<"text" | "design" | "logo">("text");
  const [monogramText, setMonogramText] = useState("");
  const [fontId, setFontId] = useState("");
  const [monogramStyleId, setMonogramStyleId] = useState("");
  const [designId, setDesignId] = useState("");
  const [threadColorId, setThreadColorId] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function selectProduct(product: ProductWithRelations) {
    setSelectedProductId(product.id);
    const nextSizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const nextColors = Array.from(new Set(product.variants.map((v) => v.color)));
    setSelectedSize(nextSizes[0] ?? "");
    setSelectedColor(nextColors[0] ?? "");
  }

  async function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadCustomOrderLogo(formData);
    setIsUploadingLogo(false);
    if ("error" in result) {
      toast.error(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setLogoUrl(result.url);
  }

  const selectedFont = fonts.find((font) => font.id === fontId);
  const selectedMonogramStyle = monogramStyles.find((s) => s.id === monogramStyleId);
  const selectedDesign = designs.find((d) => d.id === designId);
  const selectedThreadColor = threadColors.find((c) => c.id === threadColorId);
  const selectedGarmentHex =
    colorSwatches.find(([color]) => color === selectedColor)?.[1] ?? null;
  const previewImage = selectedProduct?.images[0];

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    const result = await submitCustomOrderRequest({
      name,
      email,
      phone,
      productName: selectedProduct?.name,
      productSlug: selectedProduct?.slug,
      variantLabel:
        selectedSize && selectedColor ? `${selectedSize} / ${selectedColor}` : undefined,
      placement,
      mode,
      monogramText,
      fontName: selectedFont?.name,
      monogramStyleName: selectedMonogramStyle?.name,
      designName: selectedDesign?.name,
      logoUrl: logoUrl ?? undefined,
      threadColorName: selectedThreadColor?.name,
      basePriceCents: selectedProduct?.priceCents,
      notes,
    });
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Request submitted");
  }

  if (submitted) {
    return (
      <div className="max-w-lg rounded-xl border border-dashed border-border py-16 text-center">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Thanks — we&apos;ve got your request!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll review your custom embroidery request and follow up at{" "}
          {email} with a quote.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr_380px]">
      {/* Product picker */}
      <div className="space-y-3">
        <p className="text-sm font-medium">1. Choose a product</p>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => selectProduct(product)}
              className={cn(
                "rounded-lg border p-1.5 text-left ring-1 ring-transparent transition-colors",
                selectedProductId === product.id
                  ? "border-primary ring-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs font-medium">{product.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-3">
        <p className="text-sm font-medium">2. Preview</p>
        {selectedProduct && previewImage ? (
          <AspectRatio
            ratio={4 / 5}
            className="overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border"
          >
            <Image
              src={previewImage.url}
              alt={selectedProduct.name}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            {selectedGarmentHex ? (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundColor: selectedGarmentHex,
                  mixBlendMode: "color",
                  opacity: 0.85,
                }}
              />
            ) : null}
            {(() => {
              const point = placementPoint(placement, previewImage?.url);
              return (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: `${point.top}%`,
                    left: `${point.left}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {mode === "text" && monogramText ? (
                    <span
                      style={{
                        fontFamily: fontFamilyFor(selectedFont?.name),
                        color: selectedThreadColor?.swatchHex ?? "#1e2a3a",
                      }}
                      className={cn(
                        "block rounded-md bg-white/85 px-3 py-1 font-semibold whitespace-nowrap shadow-sm",
                        placementTextSizeClass(placement),
                      )}
                    >
                      {monogramText}
                    </span>
                  ) : null}
                  {mode === "design" && selectedDesign?.imageUrl ? (
                    <div className="relative size-20 rounded-md bg-white/85 p-2 shadow-sm sm:size-24">
                      <Image
                        src={selectedDesign.imageUrl}
                        alt={selectedDesign.name}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </div>
                  ) : null}
                  {mode === "logo" && logoUrl ? (
                    <div className="rounded-md bg-white/85 p-2 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded file (incl. SVG), not run through the image optimizer */}
                      <img src={logoUrl} alt="Your uploaded logo" className="size-20 object-contain sm:size-24" />
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </AspectRatio>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a product to preview.
          </p>
        )}
        {selectedProduct ? (
          <p className="text-sm">
            <span className="font-medium">{formatPrice(selectedProduct.priceCents)}</span>
            <span className="text-muted-foreground">
              {" "}
              base price + embroidery — final price quoted after we review
              your design
            </span>
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          This preview approximates placement, garment color, and thread
          color on the photo we have on file — not the final stitched
          result.
        </p>
      </div>

      {/* Customization + contact form */}
      <div className="space-y-5">
        <p className="text-sm font-medium">3. Customize &amp; submit</p>

        {sizes.length > 1 || (sizes[0] && sizes[0] !== "One Size") ? (
          <FormField label="Size" htmlFor="custom-size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-md border border-input px-2 text-xs font-medium",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </FormField>
        ) : null}

        <FormField label="Color" htmlFor="custom-color">
          <div className="flex flex-wrap gap-2">
            {colorSwatches.map(([color, hex]) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-full border-2 transition-transform",
                  selectedColor === color
                    ? "border-foreground scale-110"
                    : "border-transparent ring-1 ring-border hover:scale-105",
                )}
                style={{ backgroundColor: hex ?? undefined }}
              >
                {selectedColor === color ? (
                  <CheckIcon
                    className={cn(
                      "size-4",
                      isLightColor(hex) ? "text-black" : "text-white",
                    )}
                  />
                ) : null}
                <span className="sr-only">{color}</span>
              </button>
            ))}
          </div>
          {selectedColor ? (
            <p className="text-xs text-muted-foreground">{selectedColor}</p>
          ) : null}
        </FormField>

        <FormField label="Placement" htmlFor="custom-placement">
          <div className="flex flex-wrap gap-2">
            {PLACEMENTS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlacement(option.value)}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md border border-input px-2.5 text-xs font-medium",
                  placement === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Thread color" htmlFor="custom-thread">
          {threadColors.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No thread colors uploaded yet — mention your preference in the
              notes below.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {threadColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    onClick={() => setThreadColorId(color.id)}
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full border-2 transition-transform",
                      threadColorId === color.id
                        ? "border-foreground scale-110"
                        : "border-transparent ring-1 ring-border hover:scale-105",
                    )}
                    style={{ backgroundColor: color.swatchHex ?? undefined }}
                  >
                    {threadColorId === color.id ? (
                      <CheckIcon
                        className={cn(
                          "size-4",
                          isLightColor(color.swatchHex) ? "text-black" : "text-white",
                        )}
                      />
                    ) : null}
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              {selectedThreadColor ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selectedThreadColor.name}
                </p>
              ) : null}
            </>
          )}
        </FormField>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "text" ? "default" : "outline"}
            onClick={() => setMode("text")}
          >
            Add text
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "design" ? "default" : "outline"}
            onClick={() => setMode("design")}
          >
            Use a design
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "logo" ? "default" : "outline"}
            onClick={() => setMode("logo")}
          >
            Upload your logo
          </Button>
        </div>

        {mode === "text" ? (
          <>
            <FormField label="Monogram / text" htmlFor="custom-text">
              <Input
                id="custom-text"
                value={monogramText}
                onChange={(e) => setMonogramText(e.target.value)}
                placeholder="e.g. JDM or Smith Family"
                maxLength={30}
              />
            </FormField>
            <FormField label="Font" htmlFor="custom-font">
              {fonts.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No fonts uploaded yet — describe a style in the notes below.
                </p>
              ) : (
                <Select value={fontId} onValueChange={(value) => setFontId(value ?? "")}>
                  <SelectTrigger id="custom-font" className="w-full">
                    <SelectValue>
                      {(value: string) => fonts.find((f) => f.id === value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Monogram style" htmlFor="custom-monogram-style">
              {monogramStyles.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No monogram styles uploaded yet — describe your preference
                  in the notes below.
                </p>
              ) : (
                <Select
                  value={monogramStyleId}
                  onValueChange={(value) => setMonogramStyleId(value ?? "")}
                >
                  <SelectTrigger id="custom-monogram-style" className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        monogramStyles.find((s) => s.id === value)?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {monogramStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </>
        ) : mode === "design" ? (
          <FormField label="Design" htmlFor="custom-design">
            {designs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No designs uploaded yet — describe what you have in mind in
                the notes below.
              </p>
            ) : (
              <Select value={designId} onValueChange={(value) => setDesignId(value ?? "")}>
                <SelectTrigger id="custom-design" className="w-full">
                  <SelectValue>
                    {(value: string) => designs.find((d) => d.id === value)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {designs.map((design) => (
                    <SelectItem key={design.id} value={design.id}>
                      {design.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        ) : (
          <FormField label="Your logo or artwork" htmlFor="custom-logo">
            <input
              ref={fileInputRef}
              id="custom-logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoFileChange}
              disabled={isUploadingLogo}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              PNG, JPG, WEBP, or SVG, up to 5MB.
            </p>
            {isUploadingLogo ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <UploadIcon className="size-3.5 animate-pulse" /> Uploading...
              </p>
            ) : logoUrl ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Uploaded — see it on the preview.
              </p>
            ) : null}
          </FormField>
        )}

        <div className="space-y-4 border-t border-border pt-4">
          <FormField label="Your name" htmlFor="custom-name">
            <Input
              id="custom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </FormField>
          <FormField label="Email" htmlFor="custom-email">
            <Input
              id="custom-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FormField>
          <FormField label="Phone (optional)" htmlFor="custom-phone">
            <Input
              id="custom-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="custom-notes">
            <Textarea
              id="custom-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </FormField>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          size="lg"
          className="w-full"
          disabled={isSubmitting || isUploadingLogo || !selectedProduct || !name || !email}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit custom order request"}
        </Button>
      </div>
    </div>
  );
}
