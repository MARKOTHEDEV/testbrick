import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { LogOut, ChevronDown, Settings, User } from "lucide-react";

// Fun pixel art style avatars - each is a simple SVG pattern
const funAvatars = [
  // Bear
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="14" fill={color} />
      <circle cx="6" cy="8" r="4" fill={color} />
      <circle cx="26" cy="8" r="4" fill={color} />
      <circle cx="11" cy="14" r="2" fill="#1f2937" />
      <circle cx="21" cy="14" r="2" fill="#1f2937" />
      <ellipse cx="16" cy="20" rx="4" ry="3" fill="#fcd34d" />
      <circle cx="16" cy="19" r="1.5" fill="#1f2937" />
    </svg>
  ),
  // Cat
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="18" r="12" fill={color} />
      <polygon points="6,12 4,2 12,10" fill={color} />
      <polygon points="26,12 28,2 20,10" fill={color} />
      <circle cx="11" cy="16" r="2" fill="#1f2937" />
      <circle cx="21" cy="16" r="2" fill="#1f2937" />
      <ellipse cx="16" cy="21" rx="2" ry="1" fill="#f472b6" />
      <path d="M14 23 Q16 25 18 23" stroke="#1f2937" strokeWidth="1" fill="none" />
    </svg>
  ),
  // Fox
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="18" r="12" fill={color} />
      <polygon points="4,14 2,2 12,12" fill={color} />
      <polygon points="28,14 30,2 20,12" fill={color} />
      <polygon points="16,28 10,20 22,20" fill="white" />
      <circle cx="11" cy="16" r="1.5" fill="#1f2937" />
      <circle cx="21" cy="16" r="1.5" fill="#1f2937" />
      <circle cx="16" cy="20" r="1.5" fill="#1f2937" />
    </svg>
  ),
  // Panda
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="14" fill="white" />
      <circle cx="6" cy="8" r="4" fill={color} />
      <circle cx="26" cy="8" r="4" fill={color} />
      <ellipse cx="10" cy="14" rx="4" ry="5" fill={color} />
      <ellipse cx="22" cy="14" rx="4" ry="5" fill={color} />
      <circle cx="10" cy="14" r="1.5" fill="white" />
      <circle cx="22" cy="14" r="1.5" fill="white" />
      <ellipse cx="16" cy="21" rx="3" ry="2" fill={color} />
    </svg>
  ),
  // Bunny
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="20" r="10" fill={color} />
      <ellipse cx="11" cy="6" rx="3" ry="10" fill={color} />
      <ellipse cx="21" cy="6" rx="3" ry="10" fill={color} />
      <ellipse cx="11" cy="6" rx="1.5" ry="6" fill="#fce7f3" />
      <ellipse cx="21" cy="6" rx="1.5" ry="6" fill="#fce7f3" />
      <circle cx="12" cy="18" r="1.5" fill="#1f2937" />
      <circle cx="20" cy="18" r="1.5" fill="#1f2937" />
      <ellipse cx="16" cy="22" rx="2" ry="1.5" fill="#f472b6" />
    </svg>
  ),
  // Owl
  (color: string) => (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <ellipse cx="16" cy="18" rx="12" ry="14" fill={color} />
      <polygon points="4,10 8,4 12,10" fill={color} />
      <polygon points="28,10 24,4 20,10" fill={color} />
      <circle cx="11" cy="14" r="5" fill="white" />
      <circle cx="21" cy="14" r="5" fill="white" />
      <circle cx="11" cy="14" r="2" fill="#1f2937" />
      <circle cx="21" cy="14" r="2" fill="#1f2937" />
      <polygon points="16,18 14,22 18,22" fill="#fbbf24" />
    </svg>
  ),
];

const avatarColors = [
  "#a855f7", // purple
  "#3b82f6", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#ef4444", // red
];

// Generate a consistent avatar based on user ID
const getAvatarForUser = (userId: string) => {
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarIndex = hash % funAvatars.length;
  const colorIndex = (hash * 7) % avatarColors.length;
  return {
    Avatar: funAvatars[avatarIndex],
    color: avatarColors[colorIndex],
  };
};

export const UserMenu = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const { Avatar, color } = getAvatarForUser(user.id);
  const displayName = user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
  const fullName = user.fullName || displayName;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-[#f9f9f9] rounded-lg px-2 py-1.5 transition-colors"
      >
        {/* Fun Avatar */}
        <div className="size-[46px] rounded-full border border-[#e5e5e5] overflow-hidden bg-white p-1">
          {Avatar(color)}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start text-[#667085]">
          <span className="text-base capitalize">{displayName}</span>
          <span className="text-xs">Free account</span>
        </div>

        <ChevronDown
          className={`size-4 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-[#1f2937] truncate">{fullName}</p>
            <p className="text-xs text-[#667085] truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#667085] hover:bg-[#f9f9f9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="size-4" />
              <span>Profile</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#667085] hover:bg-[#f9f9f9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
