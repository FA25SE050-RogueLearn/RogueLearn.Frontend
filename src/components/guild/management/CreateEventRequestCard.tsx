"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Trophy,
  Plus,
  Minus,
  Loader2,
  Calendar,
  Users,
  Code
} from "lucide-react";
import { toast } from "sonner";
import eventServiceApi from "@/api/eventServiceApi";
import type { CreateEventRequestPayload, ProblemDistribution, Tag } from "@/types/event-service";

interface CreateEventRequestCardProps {
  guildId: string;
  onRequestCreated?: () => void;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function CreateEventRequestCard({ guildId, onRequestCreated }: CreateEventRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"code_battle" | "hackathon">("code_battle");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [maxGuilds, setMaxGuilds] = useState(8);
  const [maxPlayersPerGuild, setMaxPlayersPerGuild] = useState(5);
  const [topics, setTopics] = useState<string[]>([]); // Tag IDs
  const [distributions, setDistributions] = useState<ProblemDistribution[]>([
    { difficulty: 1, number_of_problems: 3, score: 100 },
    { difficulty: 2, number_of_problems: 2, score: 200 },
    { difficulty: 3, number_of_problems: 1, score: 300 }
  ]);
  const [notes, setNotes] = useState("");

  // Calculate minimum dates for calendar (start of today)
  const minStartDateForCalendar = new Date();
  minStartDateForCalendar.setHours(0, 0, 0, 0); // Start of today

  const minEndDateForCalendar = startDate ? (() => {
    const minEnd = new Date(startDate);
    minEnd.setHours(0, 0, 0, 0);
    return minEnd;
  })() : undefined;

  // Fetch available tags when expanded
  useEffect(() => {
    if (!isExpanded) return;

    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await eventServiceApi.getAllTags();
        console.log('📦 Tags API response:', response);
        if (response.success && response.data) {
          // Ensure data is an array
          const tagsData = Array.isArray(response.data) ? response.data : [];
          console.log('✅ Parsed tags:', tagsData);
          setAvailableTags(tagsData);
        } else {
          console.error('❌ Failed to load tags:', response.error);
          setAvailableTags([]);
          toast.error("Failed to load topics", {
            description: "Could not fetch available topics for code battles"
          });
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setAvailableTags([]);
      } finally {
        setLoadingTags(false);
      }
    };

    // Only fetch if we don't have tags yet
    if (availableTags.length === 0) {
      fetchTags();
    }
  }, [isExpanded]);

  const handleAddTopic = () => {
    // Check if all topics are already selected
    const selectedCount = topics.filter(t => t.trim()).length;
    if (selectedCount >= availableTags.length) {
      toast.error("All topics selected", {
        description: "You have already selected all available topics."
      });
      return;
    }

    setTopics([...topics, ""]);
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index: number, value: string) => {
    // Check if topic is already selected
    if (topics.includes(value) && topics[index] !== value) {
      toast.error("Topic already selected", {
        description: "You cannot select the same topic twice. Please choose a different topic."
      });
      return;
    }

    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  // Calculate maximum problems available for a specific difficulty across selected topics
  const getMaxProblemsForDifficulty = (difficulty: number): number => {
    if (topics.length === 0 || availableTags.length === 0) return 0;

    // Get selected tag objects
    const selectedTags = topics
      .filter(topicId => topicId.trim())
      .map(topicId => availableTags.find(tag => tag.id === topicId))
      .filter((tag): tag is Tag => tag !== undefined);

    if (selectedTags.length === 0) return 0;

    // Sum up problem counts for this difficulty across all selected topics
    return selectedTags.reduce((total, tag) => {
      const diffCount = tag.difficulty_count?.find(dc => dc.difficulty === difficulty);
      return total + (diffCount?.problem_count || 0);
    }, 0);
  };

  const handleDistributionChange = (difficulty: number, number_of_problems: number) => {
    // Calculate max available problems for this difficulty across selected topics
    const maxAvailable = getMaxProblemsForDifficulty(difficulty);

    // Clamp to max available
    const clampedValue = Math.min(number_of_problems, maxAvailable);

    setDistributions(distributions.map(dist =>
      dist.difficulty === difficulty ? { ...dist, number_of_problems: clampedValue } : dist
    ));
  };

  const handleScoreChange = (difficulty: number, score: number) => {
    setDistributions(distributions.map(dist =>
      dist.difficulty === difficulty ? { ...dist, score } : dist
    ));
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required");
      return;
    }

    // Check minimum time constraints
    const now = new Date();
    const minStartTime = new Date(now.getTime() + 2 * 60 * 1000);
    if (startDate < minStartTime) {
      toast.error("Start date must be at least 2 minutes from now");
      return;
    }

    const minEndTime = new Date(startDate.getTime() + 1 * 60 * 1000);
    if (endDate < minEndTime) {
      toast.error("End date must be at least 1 minute after start date");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    // Validate max guilds (3-100)
    if (maxGuilds < 3 || maxGuilds > 100) {
      toast.error("Max guilds must be between 3 and 100");
      return;
    }
    
    // Validate max players per guild (1-10)
    if (maxPlayersPerGuild < 1 || maxPlayersPerGuild > 10) {
      toast.error("Max players per guild must be between 1 and 10");
      return;
    }
    
    if (topics.length === 0) {
      toast.error("At least one topic is required");
      return;
    }
    if (topics.some(t => !t.trim())) {
      toast.error("All topics must be selected");
      return;
    }

    // Validate total questions across all difficulties (must be at least 3)
    const totalQuestions = distributions.reduce((sum, dist) => sum + dist.number_of_problems, 0);
    if (totalQuestions < 3) {
      toast.error("Total questions must be at least 3", {
        description: "Please add more problems across all difficulty levels."
      });
      return;
    }

    // Validate score range (1-1000 per problem)
    for (const dist of distributions) {
      if (dist.number_of_problems > 0) {
        if (dist.score < 1 || dist.score > 1000) {
          const diffLabel = dist.difficulty === 1 ? 'Easy' : dist.difficulty === 2 ? 'Medium' : 'Hard';
          toast.error("Score must be between 1 and 1000", {
            description: `${diffLabel} difficulty: Score per problem must be between 1 and 1000.`
          });
          return;
        }
      }
    }

    // Validate problem distribution against available problems
    for (const dist of distributions) {
      if (dist.number_of_problems > 0) {
        const maxAvailable = getMaxProblemsForDifficulty(dist.difficulty);
        if (dist.number_of_problems > maxAvailable) {
          const diffLabel = dist.difficulty === 1 ? 'Easy' : dist.difficulty === 2 ? 'Medium' : 'Hard';
          toast.error(`Not enough problems available`, {
            description: `${diffLabel} difficulty: You requested ${dist.number_of_problems} problems but only ${maxAvailable} are available for the selected topics.`
          });
          return;
        }
      }
    }

    // Format dates with timezone offset
    const formatDateWithTimezone = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offset / 60));
      const offsetMinutes = Math.abs(offset % 60);
      const offsetSign = offset <= 0 ? '+' : '-';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
    };

    const payload: CreateEventRequestPayload = {
      requester_guild_id: guildId,
      event_type: eventType,
      title: title.trim(),
      description: description.trim(),
      proposed_start_date: formatDateWithTimezone(startDate),
      proposed_end_date: formatDateWithTimezone(endDate),
      participation: {
        max_guilds: maxGuilds,
        max_players_per_guild: maxPlayersPerGuild
      },
      event_specifics: {
        code_battle: eventType === "code_battle" ? {
          topics: topics.filter(t => t.trim()),
          distribution: distributions.filter(d => d.number_of_problems > 0)
        } : undefined
      },
      notes: notes.trim() || undefined
    };

    setSubmitting(true);
    try {
      console.log('📤 Submitting event request payload:', JSON.stringify(payload, null, 2));
      const response = await eventServiceApi.createEventRequest(payload);

      if (response.success) {
        toast.success("Event request submitted successfully", {
          description: "Your event request has been sent to the admin for approval."
        });

        // Reset form
        setTitle("");
        setDescription("");
        setStartDate(undefined);
        setEndDate(undefined);
        setNotes("");
        setIsExpanded(false);

        onRequestCreated?.();
      } else {
        console.error('❌ Event request failed:', response.error);
        toast.error("Failed to create event request", {
          description: response.error?.message || "An error occurred"
        });
      }
    } catch (err) {
      console.error("❌ Unexpected error creating event request:", err);
      toast.error("Error", {
        description: "An unexpected error occurred"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className={CARD_CLASS}>
        {/* Texture overlay */}
        <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#f5c16c]">
                <Trophy className="h-5 w-5 text-[#f5c16c]" />
                Request New Event
              </CardTitle>
              <CardDescription className="text-white/60">
                Submit a request to host a guild event
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c]"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <CardTitle className="flex items-center gap-2 text-[#f5c16c]">
          <Trophy className="h-5 w-5 text-[#f5c16c]" />
          Create Event Request
        </CardTitle>
        <CardDescription className="text-white/60">
          Fill out the details for your event request. The admin will review and approve it.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6 pt-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#f5c16c]">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#f5c16c]/80">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spring Java Championship 2025"
              className="border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#f5c16c]/80">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
              className="min-h-[100px] border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#f5c16c]/80">
                <Calendar className="h-4 w-4" />
                Start Date & Time *
              </Label>
              <DateTimePicker
                date={startDate}
                setDate={setStartDate}
                minDate={minStartDateForCalendar}
                placeholder="Select start date and time"
              />
              <p className="text-xs text-[#f5c16c]/50">Must be at least 2 minutes from now</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#f5c16c]/80">
                <Calendar className="h-4 w-4" />
                End Date & Time *
              </Label>
              <DateTimePicker
                date={endDate}
                setDate={setEndDate}
                minDate={minEndDateForCalendar}
                placeholder="Select end date and time"
              />
              <p className="text-xs text-[#f5c16c]/50">Must be at least 1 minute after start date</p>
            </div>
          </div>
        </div>

        {/* Participation */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c]">
            <Users className="h-4 w-4" />
            Participation
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxGuilds" className="text-[#f5c16c]/80">Max Guilds *</Label>
              <Input
                id="maxGuilds"
                type="number"
                min="3"
                max="100"
                value={maxGuilds}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 3;
                  setMaxGuilds(Math.min(100, Math.max(3, val)));
                }}
                className="border-[#f5c16c]/20 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
              />
              <p className="text-xs text-[#f5c16c]/50">Range: 3-100 guilds</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-[#f5c16c]/80">Max Players per Guild *</Label>
              <Input
                id="maxPlayers"
                type="number"
                min="1"
                max="10"
                value={maxPlayersPerGuild}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setMaxPlayersPerGuild(Math.min(10, Math.max(1, val)));
                }}
                className="border-[#f5c16c]/20 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
              />
              <p className="text-xs text-[#f5c16c]/50">Range: 1-10 players</p>
            </div>
          </div>
        </div>

        {/* Problem Configuration (Code Battle only) */}
        {eventType === "code_battle" && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c]">
              <Code className="h-4 w-4" />
              Problem Configuration
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[#f5c16c]/80">Topics * {loadingTags && <span className="text-xs text-white/50">(Loading...)</span>}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTopic}
                  disabled={loadingTags || availableTags.length === 0}
                  className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {topics.map((topicId, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={topicId}
                      onValueChange={(value) => handleTopicChange(index, value)}
                    >
                      <SelectTrigger className="border-[#f5c16c]/20 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent className="border-[#f5c16c]/30 bg-[#1a0a08]">
                        {Array.isArray(availableTags) && availableTags.map((tag) => {
                          const hasDifficultyCounts = tag.difficulty_count && tag.difficulty_count.length > 0;
                          const isAlreadySelected = topics.includes(tag.id) && topics[index] !== tag.id;

                          // Don't show already selected topics in other dropdowns
                          if (isAlreadySelected) return null;

                          return (
                            <SelectItem
                              key={tag.id}
                              value={tag.id}
                              className="text-white hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span>{tag.name}</span>
                                {hasDifficultyCounts && (
                                  <span className="text-[10px] text-[#f5c16c]/60">
                                    ({tag.difficulty_count!.map(dc => `${dc.difficulty === 1 ? 'E' : dc.difficulty === 2 ? 'M' : 'H'}:${dc.problem_count}`).join(' ')})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {topics.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTopic(index)}
                        className="border-rose-500/30 bg-transparent text-rose-400 hover:bg-rose-500/10"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {topics.length === 0 && (
                  <p className="text-xs italic text-white/50">Click + to add topics</p>
                )}
              </div>
            </div>

            {/* Available Problems Summary */}
            {topics.some(t => t.trim()) && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">Available Problems for Selected Topics</h4>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-300">Easy:</span>
                    <span className="font-bold text-white">{getMaxProblemsForDifficulty(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-300">Medium:</span>
                    <span className="font-bold text-white">{getMaxProblemsForDifficulty(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-rose-300">Hard:</span>
                    <span className="font-bold text-white">{getMaxProblemsForDifficulty(3)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[#f5c16c]/80">Difficulty Distribution *</Label>
                {(() => {
                  const totalQuestions = distributions.reduce((sum, dist) => sum + dist.number_of_problems, 0);
                  const isValid = totalQuestions >= 3;
                  return (
                    <span className={`text-xs font-semibold ${isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Total: {totalQuestions} {isValid ? '✓' : '(min: 3)'}
                    </span>
                  );
                })()}
              </div>
              <div className="grid gap-3">
                {distributions.map((dist) => {
                  const difficultyLabel = dist.difficulty === 1 ? 'Easy' : dist.difficulty === 2 ? 'Medium' : 'Hard';
                  const maxAvailable = getMaxProblemsForDifficulty(dist.difficulty);
                  const hasExceeded = dist.number_of_problems > maxAvailable;
                  const scoreOutOfRange = dist.number_of_problems > 0 && (dist.score < 1 || dist.score > 1000);

                  return (
                    <div key={dist.difficulty} className="grid grid-cols-3 gap-3 rounded-lg border border-[#f5c16c]/20 bg-black/20 p-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-[#f5c16c]/70">Difficulty</Label>
                        <div className="flex h-9 items-center rounded border border-[#f5c16c]/20 bg-black/40 px-3 text-sm text-white">
                          {difficultyLabel}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#f5c16c]/70">
                          Problems
                          {topics.length > 0 && (
                            <span className={`ml-1 ${hasExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                              (max: {maxAvailable})
                            </span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={maxAvailable}
                          value={dist.number_of_problems}
                          onChange={(e) => handleDistributionChange(dist.difficulty, parseInt(e.target.value) || 0)}
                          className={`border-[#f5c16c]/20 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30 ${
                            hasExceeded ? 'border-rose-500/50 focus:border-rose-500' : ''
                          }`}
                        />
                        {hasExceeded && (
                          <p className="text-[10px] text-rose-400">
                            Only {maxAvailable} available
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#f5c16c]/70">
                          Score Each
                          <span className="ml-1 text-[10px] text-[#f5c16c]/50">(1-1000)</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          step="50"
                          value={dist.score}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            handleScoreChange(dist.difficulty, Math.min(1000, Math.max(1, val)));
                          }}
                          className={`border-[#f5c16c]/20 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30 ${
                            scoreOutOfRange ? 'border-rose-500/50 focus:border-rose-500' : ''
                          }`}
                        />
                        {scoreOutOfRange && (
                          <p className="text-[10px] text-rose-400">
                            Score must be 1-1000
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-[#f5c16c]/80">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information for the admin..."
            className="min-h-20 border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsExpanded(false)}
            disabled={submitting}
            variant="outline"
            className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
