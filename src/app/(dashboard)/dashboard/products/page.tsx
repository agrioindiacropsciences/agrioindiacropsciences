"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Product, Category } from "@/lib/api";

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export default function DashboardProductsPage() {
  const { language } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ limit: 50 }),
          api.getCategories(),
        ]);

        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data.products || []);
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name_hi.includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const categoryFilters = [
    { id: "all", name: "All", name_hi: "सभी" },
    ...categories,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {language === "en" ? "Products" : "उत्पाद"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Browse our complete range of agricultural products."
            : "हमारे कृषि उत्पादों की पूरी श्रृंखला देखें।"}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={language === "en" ? "Search products..." : "उत्पाद खोजें..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categoryFilters.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="shrink-0"
          >
            {language === "en" ? cat.name : cat.name_hi}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              
              
              
            >
              <Card className="group overflow-hidden card-hover h-full">
                <div className="relative h-40 bg-gradient-to-br from-green-100 to-green-50 overflow-hidden">
                  {product.image_url ||
                  (product.images && product.images.length > 0) ? (
                    <Image
                      src={
                        product.image_url ||
                        (product.images && product.images[0]) ||
                        "/logo.svg"
                      }
                      alt={language === "en" ? product.name : product.name_hi}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-12 w-12 text-primary/40" />
                      </div>
                    </div>
                  )}
                  {product.is_best_seller && (
                    <Badge className="absolute top-2 left-2 bg-accent text-white text-xs">
                      {language === "en" ? "Best Seller" : "बेस्ट सेलर"}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="absolute top-2 right-2 capitalize text-xs">
                    {product.category?.name || "Product"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {language === "en" ? product.name : product.name_hi}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {language === "en" ? product.description : product.description_hi}
                  </p>
                  {product.dosage && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium">{language === "en" ? "Dosage:" : "खुराक:"}</span> {product.dosage}
                    </p>
                  )}
                  {product.pack_sizes && product.pack_sizes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                      <span className="font-medium">{language === "en" ? "Pack / Rate:" : "पैक / दर:"}</span>
                      {product.pack_sizes.slice(0, 3).map((p: { size?: string; mrp?: number; selling_price?: number }, i: number) => (
                        <span key={i}>
                          {p.size} — ₹{p.selling_price ?? p.mrp ?? "—"}
                        </span>
                      ))}
                      {product.pack_sizes.length > 3 && <span>+{product.pack_sizes.length - 3} more</span>}
                    </div>
                  )}
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={`/products/${product.slug}`}>
                      {language === "en" ? "View Details" : "विवरण देखें"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === "en" ? "No products found" : "कोई उत्पाद नहीं मिला"}
          </h3>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Try adjusting your search or filter."
              : "अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें।"}
          </p>
        </Card>
      )}
    </div>
  );
}
