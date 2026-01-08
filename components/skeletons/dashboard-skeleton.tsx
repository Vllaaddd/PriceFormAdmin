import { SkeletonItem } from "./skeleton-item"
import { Card, CardContent } from "../ui/card"

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen w-full bg-gray-100 p-8">
            <SkeletonItem className="h-10 w-64 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="shadow-sm border-none">
                        <CardContent className="p-6">
                            <SkeletonItem className="h-4 w-1/2 mb-2" />
                            <SkeletonItem className="h-8 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {[...Array(2)].map((_, i) => (
                    <Card key={i} className="shadow-lg border-none">
                        <CardContent className="p-6">
                            <SkeletonItem className="h-6 w-1/3 mb-4" />
                            <SkeletonItem className="h-[280px] w-full rounded-xl" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-lg border-none">
                <CardContent className="p-6">
                    <SkeletonItem className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                        <SkeletonItem className="h-10 w-full" />
                        {[...Array(5)].map((_, i) => (
                            <SkeletonItem key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}