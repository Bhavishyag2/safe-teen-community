"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Menu,
  Settings,
  LogOut,
  User,
  Bookmark,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ onMenuClick, showMobileMenu = true }: HeaderProps) {
  const [isDark, setIsDark] = React.useState(false);
  const [notificationCount] = React.useState(3);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile menu button */}
        {showMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
            <span className="text-white text-sm font-bold">TP</span>
          </div>
          <span className="hidden sm:inline-block">Teen Portal</span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts, topics..."
              className="pl-8 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Create Post Button */}
          <Link href="/create">
            <Button size="sm" className="hidden sm:flex gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
            <Button size="icon" className="sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <NotificationItem
                  title="New comment on your post"
                  description="StarGirl23 replied to your post"
                  time="2m ago"
                />
                <NotificationItem
                  title="Your post was upvoted"
                  description="Your post received 10 upvotes!"
                  time="1h ago"
                />
                <NotificationItem
                  title="New badge earned"
                  description="You earned the 'First Post' badge"
                  time="3h ago"
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/default.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                    SG
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">StarGirl23</p>
                  <p className="text-xs text-muted-foreground">156 karma</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/saved" className="cursor-pointer">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Posts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-posts" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  My Posts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
      <div className="flex items-center justify-between w-full">
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </DropdownMenuItem>
  );
}
