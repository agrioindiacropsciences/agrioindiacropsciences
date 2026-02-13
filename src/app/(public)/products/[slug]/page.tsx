"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Package,
  Beaker,
  Droplets,
  Shield,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TractorLoader } from "@/components/ui/tractor-loader";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Product } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const { language } = useStore();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.getProductBySlug(slug);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response.error?.message || "Product not found");
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      }
      
      setIsLoading(false);
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <TractorLoader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Card className="p-12 text-center max-w-md">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "en" ? "Product Not Found" : "उत्पाद नहीं मिला"}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === "en"
              ? "The product you're looking for doesn't exist."
              : "जिस उत्पाद की आप तलाश कर रहे हैं वह मौजूद नहीं है।"}
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "en" ? "Back to Products" : "उत्पादों पर वापस जाएं"}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const relatedProducts = product.related_products || [];
  const mainImage =
    product.image_url ||
    (product.images && product.images.length > 0 ? product.images[0] : null);

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              {language === "en" ? "Home" : "होम"}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/products" className="hover:text-primary">
              {language === "en" ? "Products" : "उत्पाद"}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-primary font-medium">
              {language === "en" ? product.name : product.name_hi}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back to Products" : "उत्पादों पर वापस जाएं"}
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div
            
            
            
          >
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={language === "en" ? product.name : product.name_hi}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-24 w-24 text-primary/40" />
                  </div>
                )}
                {product.is_best_seller && (
                  <Badge className="absolute top-4 left-4 bg-accent text-white px-4 py-1">
                    {language === "en" ? "Best Seller" : "बेस्ट सेलर"}
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div
            
            
            
            className="space-y-6"
          >
            <div>
              <Badge variant="outline" className="mb-3 capitalize text-primary border-primary">
                {product.category?.name || "Product"}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {language === "en" ? product.name : product.name_hi}
              </h1>
              {language === "en" && (
                <p className="text-lg text-gray-600 font-hindi">{product.name_hi}</p>
              )}
            </div>

            {/* Technical Composition */}
            {product.composition && (
              <div>
                <h3 className="text-sm font-medium text-primary mb-1">
                  {language === "en" ? "Technical Composition" : "तकनीकी संरचना"}
                </h3>
                <p className="text-gray-700">{product.composition}</p>
              </div>
            )}

            {/* Dosage (required field - always show if present) */}
            {product.dosage && (
              <div>
                <h3 className="text-sm font-medium text-primary mb-1">
                  {language === "en" ? "Dosage" : "खुराक"}
                </h3>
                <p className="text-gray-700">{product.dosage}</p>
              </div>
            )}

            {/* Uses / Application */}
            <div>
              <h3 className="text-sm font-medium text-primary mb-1">
                {language === "en" ? "Uses / Application" : "उपयोग / अनुप्रयोग"}
              </h3>
              <p className="text-gray-700">
                {language === "en" ? product.description : product.description_hi}
              </p>
            </div>

            {/* Suitable Crops */}
            {product.suitable_crops && product.suitable_crops.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary mb-2">
                  {language === "en" ? "Suitable Crops" : "उपयुक्त फसलें"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.suitable_crops.map((crop) => (
                    <Badge key={crop} variant="secondary" className="px-3 py-1">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pack Sizes with MRP & Rate */}
            {product.pack_sizes && product.pack_sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary mb-2">
                  {language === "en" ? "Pack Sizes & Rate" : "पैक आकार और दर"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.pack_sizes.map((pack, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-2 text-sm">
                      <span className="font-medium">{pack.size}</span>
                      {pack.mrp != null && pack.mrp > 0 && (
                        <span className="ml-2 text-muted-foreground">{language === "en" ? "MRP" : "MRP"} ₹{pack.mrp}</span>
                      )}
                      {(pack.selling_price != null && pack.selling_price > 0) && (
                        <span className="ml-2 text-primary font-semibold">₹{pack.selling_price}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button asChild size="lg" className="w-full sm:w-auto mt-4">
              <Link href="/buy-nearby">
                <MapPin className="mr-2 h-5 w-5" />
                {language === "en" ? "Find Nearby Distributor" : "नजदीकी वितरक खोजें"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Product Specifications */}
        <div
          
          
          
          className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {product.composition && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Beaker className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">
                    {language === "en" ? "Composition" : "संरचना"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{product.composition}</p>
              </CardContent>
            </Card>
          )}

          {product.dosage && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">
                    {language === "en" ? "Dosage" : "खुराक"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{product.dosage}</p>
              </CardContent>
            </Card>
          )}

          {product.application_method && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">
                    {language === "en" ? "Application" : "अनुप्रयोग"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{product.application_method}</p>
              </CardContent>
            </Card>
          )}

          {product.pack_sizes && product.pack_sizes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">
                    {language === "en" ? "Pack Sizes" : "पैक आकार"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {product.pack_sizes.map(p => p.size).join(", ")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Target Pests */}
        {product.target_pests && product.target_pests.length > 0 && (
          <div
            
            
            
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "Target Pests / Diseases" : "लक्षित कीट / रोग"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.target_pests.map((pest, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {pest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Safety Precautions */}
        {product.safety_precautions && product.safety_precautions.length > 0 && (
          <div
            
            
            
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle>
                    {language === "en" ? "Safety Precautions" : "सुरक्षा सावधानियां"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.safety_precautions.map((precaution, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      {precaution}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div
            
            
            
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === "en" ? "Related Products" : "संबंधित उत्पाद"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group overflow-hidden card-hover"
                >
                  <div className="relative h-40 bg-gradient-to-br from-green-100 to-green-50 overflow-hidden">
                    {relatedProduct.image_url ||
                    (relatedProduct.images && relatedProduct.images.length > 0) ? (
                      <Image
                        src={
                          relatedProduct.image_url ||
                          (relatedProduct.images && relatedProduct.images[0]) ||
                          "/logo.svg"
                        }
                        alt={language === "en" ? relatedProduct.name : relatedProduct.name_hi}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-10 w-10 text-primary/40" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {language === "en" ? relatedProduct.name : relatedProduct.name_hi}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {language === "en"
                        ? relatedProduct.description
                        : relatedProduct.description_hi}
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/products/${relatedProduct.slug}`}>
                        {language === "en" ? "View Details" : "विवरण देखें"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
