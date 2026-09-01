import { createClient } from "@supabase/supabase-js";

// Reads your keys from environment variables (set in .env locally and in
// Cloudflare Pages settings). If they're missing, the app still runs with
// demo data so you can preview it before wiring the database.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const dbReady = !!supabase;

/* ---------- BOOKINGS ---------- */

// Load all bookings (newest first) as job objects for the driver/owner views.
export async function fetchJobs() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("removal_bookings")
    .select("data")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchJobs", error); return null; }
  return (data || []).map((r) => r.data);
}

// Save a brand-new booking (called at customer checkout).
export async function saveBooking(job) {
  if (!supabase) return;
  const { error } = await supabase.from("removal_bookings").insert({
    ref: job.ref,
    pkg: job.pkg,
    price: job.price,
    status: "scheduled",
    customer_name: job.details?.name || null,
    customer_email: job.details?.email || null,
    customer_phone: job.details?.phone || null,
    data: job,
  });
  if (error) console.error("saveBooking", error);
}

// Update an existing booking after the driver works it (proof, extras, status).
export async function persistJob(job) {
  if (!supabase) return;
  const status = job.dropoff?.done
    ? "completed"
    : job.pickup?.done
    ? "in_transit"
    : job.pickup?.started
    ? "at_pickup"
    : "scheduled";
  const { error } = await supabase
    .from("removal_bookings")
    .update({ price: job.price, status, data: job })
    .eq("ref", job.ref);
  if (error) console.error("persistJob", error);
}

/* ---------- LEADS (marketing list) ---------- */

export async function fetchLeads() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("removal_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchLeads", error); return null; }
  return (data || []).map((r) => ({
    id: r.id, email: r.email, phone: r.phone,
    total: r.quote_total, route: r.route, volume: r.volume, at: r.created_at,
  }));
}

// Save a captured email/phone at the "reveal price" step.
export async function saveLead(lead) {
  if (!supabase) return;
  const { error } = await supabase.from("removal_leads").insert({
    email: lead.email,
    phone: lead.phone,
    quote_total: lead.total,
    route: lead.route,
    volume: lead.volume,
  });
  if (error) console.error("saveLead", error);
}
