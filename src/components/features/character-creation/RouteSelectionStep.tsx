'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AcademicRoute } from '@/types/onboarding';

interface RouteSelectionStepProps {
    routes: AcademicRoute[];
    selectedRoute: AcademicRoute | null;
    onSelectRoute: (route: AcademicRoute) => void;
    onNext: () => void;
    isDisabled?: boolean;
}

/**
 * First step in character creation: selecting an academic route.
 * Uses horizontal scrollable cards with direct selection.
 */
export function RouteSelectionStep({
    routes,
    selectedRoute,
    onSelectRoute,
    onNext,
    isDisabled = false,
}: RouteSelectionStepProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [expandedRoute, setExpandedRoute] = useState<AcademicRoute | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 420;
            const newScrollLeft =
                scrollRef.current.scrollLeft +
                (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    // Click card to SELECT (not to view details)
    const handleCardClick = (route: AcademicRoute) => {
        if (!isDisabled) {
            onSelectRoute(route);
        }
    };

    return (
        <div className="space-y-4 flex flex-col h-full">
            {/* Header Section - Ultra Compact */}
            <div className="text-center space-y-2 shrink-0">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <BookMarked className="mx-auto h-10 w-10 text-accent" />
                </motion.div>
                <motion.div className="space-y-1">
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-2xl font-bold font-heading text-white"
                    >
                        Choose Your Route
                    </motion.h1>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-foreground/70 font-body text-xs"
                    >
                        Select a route to proceed. Click &quot;Info&quot; to learn more.
                    </motion.p>
                </motion.div>
            </div>

            {/* Scrollable Cards Container - Flexible Height */}
            <div className="relative group flex-1 py-2">
                {/* Left Arrow Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                     bg-gradient-to-r from-background via-background/50 to-transparent
                     p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll left"
                    disabled={isDisabled}
                >
                    <ChevronRight className="w-4 h-4 text-accent rotate-180" />
                </motion.button>

                {/* Cards Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth
                     scrollbar-thin scrollbar-thumb-accent/60 scrollbar-track-background/50
                     [-webkit-overflow-scrolling:touch] px-1 md:px-6 h-full items-center"
                >
                    <AnimatePresence>
                        {routes.map((route, index) => (
                            <motion.div
                                key={route.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="flex-shrink-0 w-72 snap-start"
                                onMouseEnter={() => setHoveredId(route.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <motion.button
                                    onClick={() => handleCardClick(route)}
                                    whileHover={!isDisabled ? { y: -4, scale: 1.02 } : {}}
                                    disabled={isDisabled}
                                    className={cn(
                                        'w-full h-64 relative group/card cursor-pointer rounded-lg overflow-hidden',
                                        'transition-all duration-300 border-2',
                                        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                                        selectedRoute?.id === route.id
                                            ? 'border-accent shadow-[0_0_20px_rgba(210,195,95,0.4)]'
                                            : 'border-white/10 hover:border-accent/50 hover:shadow-[0_0_15px_rgba(210,195,95,0.15)]'
                                    )}
                                >
                                    {/* Background Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                                    {/* Content Container */}
                                    <div className="relative p-4 h-full flex flex-col bg-gradient-to-b from-card/85 to-card/70 backdrop-blur-sm justify-between">
                                        {/* Top Section */}
                                        <div className="space-y-2">
                                            {/* Badge and Selection Indicator */}
                                            <div className="flex items-center justify-between">
                                                <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                                                    {route.programCode || 'Program'}
                                                </span>
                                                {selectedRoute?.id === route.id && (
                                                    <motion.div
                                                        layoutId="selectedIndicator"
                                                        className="w-2.5 h-2.5 bg-accent rounded-full"
                                                        transition={{ type: 'spring', stiffness: 500 }}
                                                    />
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-base font-bold text-white text-left line-clamp-2 group-hover/card:text-accent transition-colors duration-200 leading-tight">
                                                {route.programName}
                                            </h3>

                                            {/* Preview of Description */}
                                            <p className="text-xs text-foreground/60 line-clamp-2 text-left leading-relaxed">
                                                {route.description || 'No description available.'}
                                            </p>
                                        </div>

                                        {/* Bottom Section - Info Button */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                            {selectedRoute?.id === route.id && (
                                                <span className="text-xs font-semibold text-accent">✓ Selected</span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedRoute(route);
                                                }}
                                                className="ml-auto text-xs text-foreground/50 hover:text-accent transition-colors font-medium flex items-center gap-1"
                                            >
                                                Info
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Selection Indicator Bar */}
                                    {selectedRoute?.id === route.id && (
                                        <motion.div
                                            layoutId="selectedBar"
                                            className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent/60"
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        />
                                    )}
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Right Arrow Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                     bg-gradient-to-l from-background via-background/50 to-transparent
                     p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll right"
                    disabled={isDisabled}
                >
                    <ChevronRight className="w-4 h-4 text-accent" />
                </motion.button>
            </div>

            {/* Mobile Scroll Hint */}
            <p className="text-xs text-foreground/50 text-center md:hidden shrink-0">
                💡 Scroll to see more • Click &quot;Info&quot; for details
            </p>

            {/* Detail Modal Dialog - Optional Viewing */}
            <AnimatePresence>
                {expandedRoute && !isDisabled && (
                    <Dialog open={!!expandedRoute} onOpenChange={() => setExpandedRoute(null)}>
                        <DialogContent className="w-full max-w-2xl max-h-[85vh] gap-0 p-0 bg-gradient-to-b from-card to-card/80 border border-white/10 rounded-2xl overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col h-full"
                            >
                                {/* Modal Header */}
                                <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent px-6 py-4">
                                    <DialogTitle className="text-xl font-bold text-white mb-2">
                                        {expandedRoute.programCode}
                                    </DialogTitle>
                                    <h2 className="text-2xl font-bold text-white leading-tight">
                                        {expandedRoute.programName}
                                    </h2>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-background/30">
                                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                                        {expandedRoute.description || 'No description available.'}
                                    </p>
                                </div>

                                {/* Modal Actions */}
                                <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent px-6 py-4">
                                    <Button
                                        onClick={() => setExpandedRoute(null)}
                                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-semibold"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Bottom Action - Next Button */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end pt-2 shrink-0"
            >
                <Button
                    size="sm"
                    onClick={onNext}
                    disabled={!selectedRoute || isDisabled}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 h-9 text-xs font-semibold"
                >
                    Next: Choose Class →
                </Button>
            </motion.div>
        </div>
    );
}
