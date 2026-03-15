"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Navigation,
    Phone,
    Store,
    User,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Distributor } from "@/lib/api";
import { useStore } from "@/store/useStore";

interface DistributorCardProps {
    distributor: Distributor;
}

export function DistributorCard({ distributor }: DistributorCardProps) {
    const { language } = useStore();

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white group">
                {/* Top Gradient Bar */}
                <div className="h-2 bg-gradient-to-r from-primary via-emerald-500 to-primary animate-gradient" />

                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-start gap-4">
                            {/* Store Icon in Gradient Circle */}
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center shadow-inner group-hover:from-primary group-hover:to-emerald-500 transition-colors duration-300">
                                <Store className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
                                    {distributor.name}
                                </h3>
                                <div className="flex items-start gap-1 text-sm text-gray-500">
                                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                                    <p className="line-clamp-2">
                                        {distributor.address}, {distributor.city}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {distributor.is_active && (
                            <Badge className="bg-green-50 text-green-600 border border-green-100 px-2 py-1 flex items-center gap-1 shadow-sm">
                                <CheckCircle className="h-3 w-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {language === "en" ? "Active" : "सक्रिय"}
                                </span>
                            </Badge>
                        )}
                    </div>

                    {/* Distance Badge */}
                    {distributor.distance_km != null && (
                        <div className="flex items-center gap-2 text-sm text-primary mb-5 bg-primary/5 rounded-xl px-4 py-2.5 border border-primary/10">
                            <Navigation className="h-4 w-4 animate-pulse" />
                            <span className="font-bold">
                                {Number(distributor.distance_km).toFixed(1)} {language === "en" ? "km away" : "किमी दूर"}
                            </span>
                        </div>
                    )}

                    {/* Contact Details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <a href={`tel:${distributor.phone}`} className="hover:text-primary font-bold transition-colors">
                                {distributor.phone}
                            </a>
                        </div>

                        {distributor.owner_name && (
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">
                                    <span className="text-gray-400 font-normal mr-1">{language === "en" ? "Owner:" : "मालिक:"}</span>
                                    {distributor.owner_name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button asChild className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold transition-all duration-300">
                            <a href={`tel:${distributor.phone}`}>
                                <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                {language === "en" ? "Call Now" : "कॉल करें"}
                            </a>
                        </Button>

                        {distributor.latitude && distributor.longitude && (
                            <Button variant="outline" asChild className="flex-1 h-12 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white font-bold transition-all duration-300">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${distributor.latitude},${distributor.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Navigation className="h-4 w-4 mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                                    {language === "en" ? "Navigate" : "नेविगेट"}
                                </a>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
