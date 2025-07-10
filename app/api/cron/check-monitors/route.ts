// File: app/api/cron/check-monitors/route.ts
import { createServiceClient } from "@/lib/supabase/server";
import { checkWebsite } from "@/lib/monitor-checker";

export const GET = async () => {
    const supabase = createServiceClient();
    const { data: monitors } = await supabase.from("monitors").select("*");
    for (const monitor of monitors || []) {
        const check = await checkWebsite(monitor.url);
        await supabase.from("monitor_checks").insert({
            monitor_id: monitor.id,
            status: check.status,
        });
    }
    return new Response("Cron job completed");
};
