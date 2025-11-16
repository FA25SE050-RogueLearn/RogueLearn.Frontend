"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Plus,
  Minus,
  Loader2,
  Calendar,
  Users,
  LayoutGrid,
  Code
} from "lucide-react";
import { toast } from "sonner";
import eventServiceApi from "@/api/eventServiceApi";
import type { CreateEventRequestPayload, ProblemDistribution } from "@/types/event-service";

interface CreateEventRequestCardProps {
  guildId: string;
  onRequestCreated?: () => void;
}

export function CreateEventRequestCard({ guildId, onRequestCreated }: CreateEventRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"code_battle" | "hackathon">("code_battle");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxGuilds, setMaxGuilds] = useState(8);
  const [maxPlayersPerGuild, setMaxPlayersPerGuild] = useState(5);
  const [numberOfRooms, setNumberOfRooms] = useState(4);
  const [guildsPerRoom, setGuildsPerRoom] = useState(2);
  const [roomPrefix, setRoomPrefix] = useState("ROOM");
  const [topics, setTopics] = useState<string[]>(["algorithms"]);
  const [distributions, setDistributions] = useState<ProblemDistribution[]>([
    { difficulty: "easy", count: 3 },
    { difficulty: "medium", count: 2 },
    { difficulty: "hard", count: 1 }
  ]);
  const [notes, setNotes] = useState("");

  const handleAddTopic = () => {
    setTopics([...topics, ""]);
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleDistributionChange = (difficulty: string, count: number) => {
    setDistributions(distributions.map(dist =>
      dist.difficulty === difficulty ? { ...dist, count } : dist
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
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    if (maxGuilds < 2) {
      toast.error("At least 2 guilds are required");
      return;
    }
    if (numberOfRooms < 1) {
      toast.error("At least 1 room is required");
      return;
    }
    if (topics.some(t => !t.trim())) {
      toast.error("All topics must be filled in");
      return;
    }

    const payload: CreateEventRequestPayload = {
      requester_guild_id: guildId,
      event_type: eventType,
      title: title.trim(),
      description: description.trim(),
      proposed_start_date: new Date(startDate).toISOString(),
      proposed_end_date: new Date(endDate).toISOString(),
      participation: {
        max_guilds: maxGuilds,
        max_players_per_guild: maxPlayersPerGuild
      },
      room_configuration: {
        number_of_rooms: numberOfRooms,
        guilds_per_room: guildsPerRoom,
        room_naming_prefix: roomPrefix
      },
      event_specifics: {
        code_battle: eventType === "code_battle" ? {
          topics: topics.filter(t => t.trim()),
          distribution: distributions.filter(d => d.count > 0)
        } : undefined
      },
      notes: notes.trim() || undefined
    };

    setSubmitting(true);
    try {
      const response = await eventServiceApi.createEventRequest(payload);

      if (response.success) {
        toast.success("Event request submitted successfully", {
          description: "Your event request has been sent to the admin for approval."
        });

        // Reset form
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setNotes("");
        setIsExpanded(false);

        onRequestCreated?.();
      } else {
        toast.error("Failed to create event request", {
          description: response.error?.message || "An error occurred"
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "An unexpected error occurred"
      });
      console.error("Error creating event request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
                Request New Event
              </CardTitle>
              <CardDescription className="text-amber-700">
                Submit a request to host a guild event
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50"
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
    <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
      <CardHeader className="border-b border-amber-900/20">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <Trophy className="h-5 w-5 text-amber-600" />
          Create Event Request
        </CardTitle>
        <CardDescription className="text-amber-700">
          Fill out the details for your event request. The admin will review and approve it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-300">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-amber-200">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spring Java Championship 2025"
              className="border-amber-900/30 bg-amber-950/20 text-amber-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-200">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
              className="min-h-[100px] border-amber-900/30 bg-amber-950/20 text-amber-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2 text-amber-200">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2 text-amber-200">
                <Calendar className="h-4 w-4" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Participation */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Users className="h-4 w-4" />
            Participation
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxGuilds" className="text-amber-200">Max Guilds *</Label>
              <Input
                id="maxGuilds"
                type="number"
                min="2"
                value={maxGuilds}
                onChange={(e) => setMaxGuilds(parseInt(e.target.value))}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-amber-200">Max Players per Guild *</Label>
              <Input
                id="maxPlayers"
                type="number"
                min="1"
                value={maxPlayersPerGuild}
                onChange={(e) => setMaxPlayersPerGuild(parseInt(e.target.value))}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Room Configuration */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <LayoutGrid className="h-4 w-4" />
            Room Configuration
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rooms" className="text-amber-200">Number of Rooms *</Label>
              <Input
                id="rooms"
                type="number"
                min="1"
                value={numberOfRooms}
                onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guildsPerRoom" className="text-amber-200">Guilds per Room *</Label>
              <Input
                id="guildsPerRoom"
                type="number"
                min="1"
                value={guildsPerRoom}
                onChange={(e) => setGuildsPerRoom(parseInt(e.target.value))}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomPrefix" className="text-amber-200">Room Prefix *</Label>
              <Input
                id="roomPrefix"
                value={roomPrefix}
                onChange={(e) => setRoomPrefix(e.target.value)}
                className="border-amber-900/30 bg-amber-950/20 text-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Problem Configuration (Code Battle only) */}
        {eventType === "code_battle" && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Code className="h-4 w-4" />
              Problem Configuration
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-amber-200">Topics *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTopic}
                  className="border-amber-700/50 bg-amber-900/20 text-amber-300"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      placeholder="e.g., algorithms, data-structures"
                      className="border-amber-900/30 bg-amber-950/20 text-amber-100"
                    />
                    {topics.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTopic(index)}
                        className="border-rose-700/50 bg-rose-900/20 text-rose-300"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200">Difficulty Distribution *</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {distributions.map((dist) => (
                  <div key={dist.difficulty} className="space-y-1">
                    <Label className="text-xs capitalize text-amber-300">{dist.difficulty}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={dist.count}
                      onChange={(e) => handleDistributionChange(dist.difficulty, parseInt(e.target.value))}
                      className="border-amber-900/30 bg-amber-950/20 text-amber-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-amber-200">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information for the admin..."
            className="min-h-[80px] border-amber-900/30 bg-amber-950/20 text-amber-100"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-emerald-50"
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
            className="border-amber-700/50 bg-amber-900/20 text-amber-300"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
