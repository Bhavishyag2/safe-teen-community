"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, UserPlus, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "./UserAvatar";
import { UserBadges, type BadgeType } from "./UserBadges";
import { KarmaDisplay } from "./KarmaDisplay";
import { cn, formatTimeAgo } from "@/lib/utils";

interface UserProfileCardProps {
  user: {
    id: string;
    pseudo_name: string;
    avatar_url?: string | null;
    created_at: string;
    karma?: number;
    postKarma?: number;
    commentKarma?: number;
    badges?: BadgeType[];
    isOnline?: boolean;
    bio?: string;
  };
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  compact?: boolean;
  className?: string;
}

export function UserProfileCard({
  user,
  isFollowing = false,
  onFollowToggle,
  compact = false,
  className,
}: UserProfileCardProps) {
  const [following, setFollowing] = React.useState(isFollowing);

  const handleFollowClick = () => {
    setFollowing(!following);
    onFollowToggle?.();
  };

  if (compact) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={user}
              size="lg"
              showOnlineStatus
              isOnline={user.isOnline}
            />
            <div className="flex-1 min-w-0">
              <Link
                href={`/u/${user.pseudo_name}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {user.pseudo_name}
              </Link>
              <KarmaDisplay
                karma={user.karma || 0}
                size="sm"
                className="mt-0.5"
              />
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Joined {formatTimeAgo(user.created_at)}
              </div>
            </div>
          </div>

          {user.badges && user.badges.length > 0 && (
            <>
              <Separator className="my-3" />
              <UserBadges badgeTypes={user.badges} size="sm" max={4} />
            </>
          )}

          <Button
            variant={following ? "outline" : "default"}
            size="sm"
            className="w-full mt-3"
            onClick={handleFollowClick}
          >
            {following ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Follow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      {/* Banner gradient */}
      <div className="h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-t-lg" />

      <CardContent className="pt-0 -mt-10 relative">
        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <div className="p-1 bg-background rounded-full">
            <UserAvatar
              user={user}
              size="xl"
              showOnlineStatus
              isOnline={user.isOnline}
            />
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <Link
            href={`/u/${user.pseudo_name}`}
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            {user.pseudo_name}
          </Link>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
          )}
        </div>

        {/* Karma */}
        <div className="flex justify-center mt-4">
          <KarmaDisplay
            karma={user.karma || 0}
            showBreakdown
            postKarma={user.postKarma}
            commentKarma={user.commentKarma}
          />
        </div>

        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-medium mb-2 text-center">Badges</h4>
              <div className="flex justify-center">
                <UserBadges badgeTypes={user.badges} max={5} />
              </div>
            </div>
          </>
        )}

        {/* Join date */}
        <Separator className="my-4" />
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Joined {formatTimeAgo(user.created_at)}
        </div>

        {/* Follow button */}
        <Button
          variant={following ? "outline" : "default"}
          className="w-full mt-4"
          onClick={handleFollowClick}
        >
          {following ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
