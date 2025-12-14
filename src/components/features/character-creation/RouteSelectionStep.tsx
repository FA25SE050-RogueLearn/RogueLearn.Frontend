// roguelearn-web/src/components/features/character-creation/RouteSelectionStep.tsx
'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookMarked, Info, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AcademicRoute } from '@/types/onboarding';
// Updated import to use student DTO
import { StudentSubjectDto } from '@/types/student-curriculum';
// Updated import to use student API
import studentCurriculumApi from '@/api/studentCurriculumApi';
import { toast } from 'sonner';

interface RouteSelectionStepProps {
    routes: AcademicRoute[];
    selectedRoute: AcademicRoute | null;
    onSelectRoute: (route: AcademicRoute) => void;
    onNext: () => void;
    isDisabled?: boolean;
}

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
    const [subjectsRoute, setSubjectsRoute] = useState<AcademicRoute | null>(null);
    // Updated state type
    const [subjects, setSubjects] = useState<StudentSubjectDto[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 340;
            const newScrollLeft =
                scrollRef.current.scrollLeft +
                (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    const handleCardClick = (route: AcademicRoute) => {
        if (!isDisabled) {
            onSelectRoute(route);
        }
    };

    const handleViewSubjects = async (route: AcademicRoute) => {
        setSubjectsRoute(route);
        setLoadingSubjects(true);
        setSubjects([]);
        try {
            // Updated API call to use student endpoint
            const res = await studentCurriculumApi.getProgramSubjects(route.id);
            if (res.isSuccess && res.data) {
                setSubjects(res.data);
            } else {
                toast.error(res.message || 'Failed to load subjects');
            }
        } catch {
            toast.error('Failed to load subjects');
        } finally {
            setLoadingSubjects(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col px-6 py-4">
            {/* Compact Header */}
            <div className="text-center mb-6 flex-shrink-0">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 mb-2"
                >
                    <BookMarked className="w-5 h-5 text-accent" />
                </motion.div>
                <motion.h1
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-2xl font-bold text-white mb-1"
                >
                    Choose Your Academic Route
                </motion.h1>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-foreground/60 text-xs"
                >
                    Select a route to begin your journey
                </motion.p>
            </div>

            {/* Horizontal Scrollable Cards */}
            <div className="relative group flex-1 min-h-0 flex items-center mb-4">
                {/* Left Scroll Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center
                     w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-white/10
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
                    aria-label="Scroll left"
                    disabled={isDisabled}
                >
                    <ChevronRight className="w-4 h-4 text-accent rotate-180" />
                </button>

                {/* Cards Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto overflow-y-hidden pb-1 snap-x snap-mandatory scroll-smooth
                     scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent
                     [-webkit-overflow-scrolling:touch] px-8 md:px-10 w-full h-full items-center"
                >
                    {routes.map((route, index) => (
                        <motion.div
                            key={route.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.4 }}
                            className="flex-shrink-0 w-72 snap-start h-full max-h-[280px]"
                            onMouseEnter={() => setHoveredId(route.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                aria-disabled={isDisabled || undefined}
                                onKeyDown={(e) => {
                                    if (isDisabled) return;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleCardClick(route);
                                    }
                                }}
                                onClick={() => handleCardClick(route)}
                                className={cn(
                                    'w-full h-full relative rounded-lg overflow-hidden',
                                    'transition-all duration-300 border-2',
                                    'bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm',
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                    selectedRoute?.id === route.id
                                        ? 'border-accent shadow-lg shadow-accent/20'
                                        : 'border-white/10 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10'
                                )}
                            >
                                {/* Hover Gradient Overlay */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5",
                                    "opacity-0 transition-opacity duration-300",
                                    hoveredId === route.id && "opacity-100"
                                )} />

                                {/* Content */}
                                <div className="relative p-4 flex flex-col h-full">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="inline-block px-2 py-0.5 bg-accent/15 text-accent text-[10px] font-bold rounded mb-2">
                                                {route.programCode || 'Program'}
                                            </span>
                                            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                                                {route.programName}
                                            </h3>
                                        </div>
                                        {selectedRoute?.id === route.id && (
                                            <motion.div
                                                layoutId="selectedBadge"
                                                className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            >
                                                <span className="text-accent-foreground text-[10px] font-bold">✓</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-foreground/70 line-clamp-4 leading-relaxed flex-1">
                                        {route.description || 'No description available.'}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            {selectedRoute?.id === route.id ? (
                                                <span className="text-[10px] font-semibold text-accent">Selected</span>
                                            ) : (
                                                <span className="text-[10px] text-foreground/40">Click to select</span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedRoute(route);
                                                }}
                                                className="flex items-center gap-1 text-[10px] text-foreground/50 hover:text-accent transition-colors font-medium"
                                            >
                                                <Info className="w-3 h-3" />
                                                Details
                                            </button>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewSubjects(route);
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md 
                                                bg-accent/10 border border-accent/30 text-accent text-xs font-medium
                                                hover:bg-accent/20 hover:border-accent/50 transition-all"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            View Program Subjects
                                        </button>
                                    </div>
                                </div>

                                {/* Selection Border Accent */}
                                {selectedRoute?.id === route.id && (
                                    <motion.div
                                        layoutId="selectedAccent"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Scroll Button */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center
                     w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-white/10
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
                    aria-label="Scroll right"
                    disabled={isDisabled}
                >
                    <ChevronRight className="w-4 h-4 text-accent" />
                </button>
            </div>

            {/* Next Button - Always Visible */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center flex-shrink-0"
            >
                <Button
                    onClick={onNext}
                    disabled={!selectedRoute || isDisabled}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 h-9 text-sm font-semibold rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Continue to Class Selection
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {expandedRoute && !isDisabled && (
                    <Dialog open={!!expandedRoute} onOpenChange={() => setExpandedRoute(null)}>
                        <DialogContent className="max-w-2xl max-h-[80vh] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <DialogHeader className="space-y-2 pb-3 border-b border-white/10">
                                <div className="inline-block px-2.5 py-0.5 bg-accent/15 text-accent text-xs font-bold rounded w-fit">
                                    {expandedRoute.programCode}
                                </div>
                                <DialogTitle className="text-xl font-bold text-white leading-tight">
                                    {expandedRoute.programName}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/40">
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {expandedRoute.description || 'No description available.'}
                                </p>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-white/10">
                                <Button
                                    onClick={() => {
                                        onSelectRoute(expandedRoute);
                                        setExpandedRoute(null);
                                    }}
                                    disabled={selectedRoute?.id === expandedRoute.id}
                                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm"
                                >
                                    {selectedRoute?.id === expandedRoute.id ? 'Selected' : 'Select This Route'}
                                </Button>
                                <Button
                                    onClick={() => setExpandedRoute(null)}
                                    variant="outline"
                                    className="px-5 h-9 text-sm border-white/10 hover:bg-white/5"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Subjects Modal */}
            <AnimatePresence>
                {subjectsRoute && !isDisabled && (
                    <Dialog open={!!subjectsRoute} onOpenChange={() => setSubjectsRoute(null)}>
                        <DialogContent className="w-[95vw] max-w-4xl h-[85vh] max-h-[700px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col">
                            <DialogHeader className="space-y-3 pb-4 border-b border-white/10 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <div className="inline-block px-3 py-1 bg-accent/15 text-accent text-sm font-bold rounded mb-1">
                                            {subjectsRoute.programCode}
                                        </div>
                                        <DialogTitle className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            Program Subjects
                                        </DialogTitle>
                                    </div>
                                </div>
                                <p className="text-sm md:text-base text-foreground/60">
                                    Subjects included in <span className="text-white font-medium">{subjectsRoute.programName}</span>
                                </p>
                            </DialogHeader>
                            <div className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/40 min-h-0">
                                {loadingSubjects ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                                        <span className="text-sm text-foreground/60">Loading subjects...</span>
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                                        <p className="text-base text-foreground/50">No subjects found for this program.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {subjects.map((subject, index) => (
                                            <motion.div
                                                key={subject.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 hover:bg-white/[0.07] transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-5 h-5 text-accent/70" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                                            <span className="px-2.5 py-1 bg-accent/15 text-accent text-xs font-bold rounded">
                                                                {subject.subjectCode}
                                                            </span>
                                                            {subject.credits > 0 && (
                                                                <span className="px-2 py-0.5 bg-white/10 text-foreground/60 text-xs rounded">
                                                                    {subject.credits} credits
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm md:text-base font-medium text-white leading-snug">
                                                            {subject.subjectName}
                                                        </h4>
                                                        {subject.description && (
                                                            <p className="text-xs md:text-sm text-foreground/50 mt-1.5 line-clamp-2">
                                                                {subject.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                                <Button
                                    onClick={() => {
                                        onSelectRoute(subjectsRoute);
                                        setSubjectsRoute(null);
                                    }}
                                    disabled={selectedRoute?.id === subjectsRoute.id}
                                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-11 text-sm md:text-base font-semibold"
                                >
                                    {selectedRoute?.id === subjectsRoute.id ? 'Already Selected' : 'Select This Route'}
                                </Button>
                                <Button
                                    onClick={() => setSubjectsRoute(null)}
                                    variant="outline"
                                    className="sm:w-auto w-full px-6 h-11 text-sm md:text-base border-white/10 hover:bg-white/5"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}