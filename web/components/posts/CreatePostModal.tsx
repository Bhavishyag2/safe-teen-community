"use client";

import * as React from "react";
import {
  FileText,
  HelpCircle,
  BarChart3,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Eye,
  Save,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SECTIONS, SECTION_ORDER } from "@shared/constants/sections";
import type { ContentSection, ContentType } from "@shared/types/database";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: ContentSection;
}

const postTypes: { value: ContentType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "forum_post",
    label: "Discussion",
    icon: <FileText className="h-5 w-5" />,
    description: "Start a conversation",
  },
  {
    value: "question",
    label: "Question",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Ask for advice",
  },
  {
    value: "poll",
    label: "Poll",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Get opinions",
  },
];

export function CreatePostModal({
  open,
  onOpenChange,
  defaultSection,
}: CreatePostModalProps) {
  const [postType, setPostType] = React.useState<ContentType>("forum_post");
  const [section, setSection] = React.useState<ContentSection | null>(defaultSection || null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);
  const [pollOptions, setPollOptions] = React.useState(["", ""]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    // Submit logic would go here
    console.log({
      type: postType,
      section,
      title,
      body,
      tags,
      isAnonymous,
      pollOptions: postType === "poll" ? pollOptions.filter(Boolean) : undefined,
    });
    onOpenChange(false);
  };

  const canSubmit = section && title.trim().length >= 5 && body.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a discussion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose a section *</label>
            <div className="flex flex-wrap gap-2">
              {SECTION_ORDER.map((sectionId) => {
                const sectionConfig = SECTIONS[sectionId];
                return (
                  <Badge
                    key={sectionId}
                    variant={section === sectionId ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    style={
                      section === sectionId
                        ? { backgroundColor: sectionConfig.color }
                        : { borderColor: sectionConfig.color, color: sectionConfig.color }
                    }
                    onClick={() => setSection(sectionId)}
                  >
                    {sectionConfig.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Post type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post type</label>
            <div className="grid grid-cols-3 gap-3">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPostType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                    postType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200
            </p>
          </div>

          {/* Body / Preview toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Content *</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreview ? "Edit" : "Preview"}
              </Button>
            </div>

            {!isPreview ? (
              <>
                {/* Formatting toolbar */}
                <div className="flex items-center gap-1 p-1 border rounded-t-md bg-muted/50">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[200px] rounded-t-none border-t-0"
                />
              </>
            ) : (
              <div className="min-h-[200px] p-4 border rounded-md bg-muted/30">
                {body ? (
                  <div className="prose prose-sm dark:prose-invert">
                    {body.split("\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nothing to preview yet...</p>
                )}
              </div>
            )}
          </div>

          {/* Poll options */}
          {postType === "poll" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Poll Options</label>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePollOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPollOption}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (optional)</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{tags.length}/5 tags</p>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Post anonymously</p>
              <p className="text-xs text-muted-foreground">
                Your username won't be shown
              </p>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                isAnonymous ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  isAnonymous ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Post rules reminder */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Community Guidelines
              </p>
              <p className="text-muted-foreground">
                Be kind and respectful. No bullying, hate speech, or inappropriate content.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2"
            style={
              section
                ? { backgroundColor: SECTIONS[section].color }
                : undefined
            }
          >
            <Send className="h-4 w-4" />
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
