// File: app/api/cron/check-monitors/route.ts
import { createServiceClient } from "@/lib/supabase/server";
import { checkWebsite } from "@/lib/monitor-checker";

export const GET = async () => {
    const supabase = createServiceClient();
    const { data: monitors } = await supabase.from("monitors").select("*").eq("is_active", true);
    const now = new Date();
    console.log(`[${now.toISOString()}] Checking ${monitors?.length || 0} active monitors`);
    for (const monitor of monitors || []) {
        // Fetch the last check for this monitor
        const { data: lastCheck, error: lastCheckError } = await supabase
            .from("monitor_checks")
            .select("checked_at")
            .eq("monitor_id", monitor.id)
            .order("checked_at", { ascending: false })
            .limit(1)
            .single();

        const intervalMinutes = monitor.check_interval || 5; // default to 5 if not set
        const intervalMs = intervalMinutes * 60 * 1000;
        const lastChecked = lastCheck?.checked_at ? new Date(lastCheck.checked_at) : null;

        // Calculate time since last check
        const timeSinceLastCheck = lastChecked ? now.getTime() - lastChecked.getTime() : Infinity;
        const shouldCheck = !lastChecked || timeSinceLastCheck >= intervalMs;
        
        console.log(`Monitor ${monitor.id} (${monitor.name}): interval=${intervalMinutes}min, last check=${lastChecked?.toISOString() || 'never'}, time since=${timeSinceLastCheck/1000}s, should check=${shouldCheck}`);
        
        if (shouldCheck) {
            console.log(`Checking ${monitor.url}...`);
            const check = await checkWebsite(monitor.url);
            const result = await supabase.from("monitor_checks").insert({
                monitor_id: monitor.id,
                status: check.status,
                response_time: check.responseTime,
                status_code: check.statusCode,
                checked_at: now.toISOString(),
                error_message: check.errorMessage
            });
            console.log(`Check complete: ${check.status}, ${check.responseTime}ms`);
        }
    }
    console.log(`[${now.toISOString()}] Cron job completed`);
    return new Response(JSON.stringify({
        timestamp: now.toISOString(),
        monitorsChecked: monitors?.length || 0
    }));
};
