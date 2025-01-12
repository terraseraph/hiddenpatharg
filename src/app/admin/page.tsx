import { prisma } from "~/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GamepadIcon, Users, Trophy } from "lucide-react";

export default async function AdminDashboard() {
    const [gamesCount, teamsCount, usersCount] = await Promise.all([
        prisma.game.count(),
        prisma.team.count(),
        prisma.user.count(),
    ]);

    const stats = [
        {
            title: "Total Games",
            value: gamesCount,
            icon: GamepadIcon,
            color: "text-blue-500",
            trend: "+2 this week",
        },
        {
            title: "Active Teams",
            value: teamsCount,
            icon: Users,
            color: "text-green-500",
            trend: "+5 this week",
        },
        {
            title: "Total Players",
            value: usersCount,
            icon: Trophy,
            color: "text-purple-500",
            trend: "+12 this week",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-400">Welcome to your ARG game admin panel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="border-slate-800 bg-slate-900/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-slate-400">{stat.trend}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* We can add real activity feed here later */}
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div className="flex-1">Team Alpha completed Game #1</div>
                                <div className="text-sm">2m ago</div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="flex-1">New game &quot;City Quest&quot; created</div>
                                <div className="text-sm">1h ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-slate-400">
                                <span>Average completion time</span>
                                <span className="font-medium text-white">1h 23m</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Most active game</span>
                                <span className="font-medium text-white">City Quest</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Success rate</span>
                                <span className="font-medium text-white">87%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 