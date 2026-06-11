"use client";

import * as React from "react";
import { Image as ImageIcon, BarChart3, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostModal } from "./CreatePostModal";
import type { ContentSection } from "@shared/types/database";

interface QuickPostComposerProps {
  section?: ContentSection;
  userAvatar?: string;
  userName?: string;
}

export function QuickPostComposer({
  section,
  userAvatar,
  userName = "User",
}: QuickPostComposerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 px-4 py-2.5 text-left text-muted-foreground bg-muted/50 rounded-full hover:bg-muted transition-colors"
            >
              What's on your mind?
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Poll
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreatePostModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultSection={section}
      />
    </>
  );
}
