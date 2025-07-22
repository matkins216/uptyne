// File: app/api/cron/check-monitors/route.ts
import { createServiceClient } from "@/lib/supabase/server";
import { checkWebsite } from "@/lib/monitor-checker";

export const GET = async () => {
    const supabase = createServiceClient();
    const { data: monitors } = await supabase.from("monitors").select("*");
    const now = new Date();
    for (const monitor of monitors || []) {
        // Fetch the last check for this monitor
        const { data: lastCheck, error: lastCheckError } = await supabase
            .from("monitor_checks")
            .select("checked_at")
            .eq("monitor_id", monitor.id)
            .order("checked_at", { ascending: false })
            .limit(1)
            .single();

        const intervalMinutes = monitor.interval || 5; // default to 5 if not set
        const intervalMs = intervalMinutes * 60 * 1000;
        const lastChecked = lastCheck?.checked_at ? new Date(lastCheck.checked_at) : null;

        if (!lastChecked || (now.getTime() - lastChecked.getTime() >= intervalMs)) {
            const check = await checkWebsite(monitor.url);
            await supabase.from("monitor_checks").insert({
                monitor_id: monitor.id,
                status: check.status,
                response_time: check.responseTime,
                status_code: check.statusCode,
                checked_at: now.toISOString(),
                error_message: check.errorMessage
            });
        }
    }
    return new Response("Cron job completed");
};
