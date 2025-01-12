import { type ReactNode } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
    LayoutDashboard,
    GamepadIcon,
    Users,
    LogOut,
    Menu,
    Ticket,
    FolderOpen
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "~/components/ui/sheet";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const menuItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/games", label: "Games", icon: GamepadIcon },
        { href: "/admin/teams", label: "Teams", icon: Users },
        { href: "/admin/bookings", label: "Bookings", icon: Ticket },
        { href: "/admin/assets", label: "Assets", icon: FolderOpen },
    ];

    const NavContent = () => (
        <div className="space-y-4">
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className="w-full justify-start gap-2"
                                asChild
                            >
                                <Link href={item.href}>
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Mobile Nav */}
            <div className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/50 px-4 backdrop-blur-sm sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-slate-950 p-0">
                        <NavContent />
                    </SheetContent>
                </Sheet>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">ARG Game</h1>
                </div>
            </div>

            <div className="flex">
                {/* Desktop Nav */}
                <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/50 sm:block">
                    <div className="sticky top-0 h-screen overflow-y-auto p-4 pt-8">
                        <NavContent />
                        <div className="absolute bottom-4 left-4 right-4">
                            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                                <Link href="/">
                                    <LogOut className="h-4 w-4" />
                                    Exit Admin
                                </Link>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="container mx-auto p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 