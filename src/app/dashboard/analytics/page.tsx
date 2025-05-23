import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 /> Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin analytics page (camera uptime, alert stats, user activity) will be displayed here.</p>
          {/* TODO: Implement charts and stats using ShadCN charts */}
        </CardContent>
      </Card>
    </div>
  );
}
