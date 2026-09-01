import React, { useState, useRef, useEffect } from "react";
import {
  Truck, MapPin, Plus, Minus, ChevronRight, ChevronLeft, Settings2,
  Check, CreditCard, Lock, Trash2, Inbox, Sliders, Boxes, Search,
  ArrowRight, Camera, PenLine, RotateCcw, X, Phone, MessageSquare,
  Navigation, PackagePlus, ClipboardList, User, Star
} from "lucide-react";
import { fetchJobs, fetchLeads, saveBooking, persistJob, saveLead } from "./lib/supabase";

/* ============================================================
   Approved Removals — booking + driver + owner (prototype)
   Single-file React. In-memory only (refresh clears data).
   3 portals: Book (customer) · Driver · Owner.
   ============================================================ */

const theme = {
  ink: "#14161A", paper: "#F6F4EE", card: "#FFFFFF",
  amber: "#F2A81D", amberDk: "#C98708",
  teal: "#14584C", tealSoft: "#E4EEEA",
  muted: "#6B7280", line: "#E6E2D8", danger: "#C0392B",
  blue: "#2563EB",
};
const font = {
  display: "'Space Grotesk','Inter',system-ui,sans-serif",
  body: "'Inter',system-ui,sans-serif",
};

/* ---- catalogue: name, category, volume m³, weight kg ---- */
const defaultCatalogue = [
  // ---- Sofas & Armchairs ----
  { id: "two-seater-sofa", name: "Two Seater Sofa", cat: "Sofas & Armchairs", m3: 1.2, kg: 40 },
  { id: "three-seater-sofa", name: "Three Seater Sofa", cat: "Sofas & Armchairs", m3: 1.6, kg: 55 },
  { id: "four-seater-sofa", name: "Four Seater Sofa", cat: "Sofas & Armchairs", m3: 2.0, kg: 70 },
  { id: "l-shaped-sofa", name: "L Shaped Sofa", cat: "Sofas & Armchairs", m3: 2.4, kg: 90 },
  { id: "corner-sofa", name: "Corner Sofa", cat: "Sofas & Armchairs", m3: 2.4, kg: 95 },
  { id: "sofa-bed", name: "Sofa Bed", cat: "Sofas & Armchairs", m3: 1.6, kg: 75 },
  { id: "recliner", name: "Recliner Chair", cat: "Sofas & Armchairs", m3: 0.9, kg: 45 },
  { id: "armchair", name: "Armchair", cat: "Sofas & Armchairs", m3: 0.6, kg: 25 },
  { id: "footstool", name: "Footstool / Pouffe", cat: "Sofas & Armchairs", m3: 0.15, kg: 6 },
  { id: "beanbag", name: "Beanbag", cat: "Sofas & Armchairs", m3: 0.3, kg: 5 },

  // ---- Beds & Mattresses ----
  { id: "single-bed", name: "Single Bed & Mattress", cat: "Beds & Mattresses", m3: 1.0, kg: 45 },
  { id: "double-bed", name: "Double Bed & Mattress", cat: "Beds & Mattresses", m3: 1.5, kg: 60 },
  { id: "kingsize-bed", name: "Kingsize Bed & Mattress", cat: "Beds & Mattresses", m3: 1.8, kg: 75 },
  { id: "superking-bed", name: "Super King Bed & Mattress", cat: "Beds & Mattresses", m3: 2.1, kg: 85 },
  { id: "bunk-bed", name: "Bunk Bed", cat: "Beds & Mattresses", m3: 1.6, kg: 70 },
  { id: "cot", name: "Cot / Toddler Bed", cat: "Beds & Mattresses", m3: 0.6, kg: 20 },
  { id: "single-mattress", name: "Single Mattress", cat: "Beds & Mattresses", m3: 0.4, kg: 15 },
  { id: "double-mattress", name: "Double Mattress", cat: "Beds & Mattresses", m3: 0.6, kg: 25 },
  { id: "king-mattress", name: "Kingsize Mattress", cat: "Beds & Mattresses", m3: 0.75, kg: 30 },
  { id: "headboard", name: "Headboard", cat: "Beds & Mattresses", m3: 0.3, kg: 12 },
  { id: "divan-base", name: "Divan Base", cat: "Beds & Mattresses", m3: 0.9, kg: 35 },

  // ---- Wardrobes & Storage ----
  { id: "single-wardrobe", name: "Single Wardrobe", cat: "Wardrobes & Storage", m3: 0.8, kg: 40 },
  { id: "double-wardrobe", name: "Double Wardrobe", cat: "Wardrobes & Storage", m3: 1.4, kg: 65 },
  { id: "triple-wardrobe", name: "Triple Wardrobe", cat: "Wardrobes & Storage", m3: 2.0, kg: 95 },
  { id: "chest-drawers", name: "Chest Of Drawers", cat: "Wardrobes & Storage", m3: 0.7, kg: 35 },
  { id: "tallboy", name: "Tallboy", cat: "Wardrobes & Storage", m3: 0.9, kg: 45 },
  { id: "bookcase", name: "Bookcase", cat: "Wardrobes & Storage", m3: 0.6, kg: 30 },
  { id: "shelf", name: "Shelf / Shelving Unit", cat: "Wardrobes & Storage", m3: 0.4, kg: 20 },
  { id: "sideboard", name: "Sideboard", cat: "Wardrobes & Storage", m3: 1.0, kg: 50 },
  { id: "display-cabinet", name: "Display Cabinet", cat: "Wardrobes & Storage", m3: 1.0, kg: 55 },
  { id: "corner-cabinet", name: "Corner Cabinet", cat: "Wardrobes & Storage", m3: 0.8, kg: 45 },
  { id: "cd-cabinet", name: "CD / DVD Cabinet", cat: "Wardrobes & Storage", m3: 0.3, kg: 15 },
  { id: "bathroom-cabinet", name: "Bathroom Cabinet", cat: "Wardrobes & Storage", m3: 0.2, kg: 12 },
  { id: "storage-unit", name: "Storage Unit", cat: "Wardrobes & Storage", m3: 0.8, kg: 35 },
  { id: "filing-cabinet", name: "Filing Cabinet", cat: "Wardrobes & Storage", m3: 0.4, kg: 30 },
  { id: "ottoman", name: "Ottoman / Storage Bench", cat: "Wardrobes & Storage", m3: 0.4, kg: 20 },
  { id: "coat-stand", name: "Coat Stand", cat: "Wardrobes & Storage", m3: 0.2, kg: 8 },
  { id: "shoe-rack", name: "Shoe Rack", cat: "Wardrobes & Storage", m3: 0.2, kg: 8 },

  // ---- Tables ----
  { id: "coffee-table", name: "Coffee Table", cat: "Tables", m3: 0.4, kg: 15 },
  { id: "dining-table-4", name: "4 Seater Dining Table", cat: "Tables", m3: 0.9, kg: 30 },
  { id: "dining-table-6", name: "6 Seater Dining Table", cat: "Tables", m3: 1.3, kg: 45 },
  { id: "dining-4", name: "4 Seater Dining Table & Chairs", cat: "Tables", m3: 1.2, kg: 45 },
  { id: "dining-6", name: "6 Seater Dining Table & Chairs", cat: "Tables", m3: 1.6, kg: 60 },
  { id: "office-desk", name: "Office Desk", cat: "Tables", m3: 0.8, kg: 35 },
  { id: "computer-desk", name: "Computer Desk", cat: "Tables", m3: 0.6, kg: 28 },
  { id: "dressing-table", name: "Dressing Table", cat: "Tables", m3: 0.7, kg: 30 },
  { id: "bedside-table", name: "Bedside Table", cat: "Tables", m3: 0.2, kg: 10 },
  { id: "side-table", name: "Side Table", cat: "Tables", m3: 0.2, kg: 10 },
  { id: "nest-tables", name: "Nest Of Tables", cat: "Tables", m3: 0.3, kg: 15 },
  { id: "console-table", name: "Console / Hall Table", cat: "Tables", m3: 0.4, kg: 18 },
  { id: "bureau", name: "Bureau / Writing Desk", cat: "Tables", m3: 0.7, kg: 40 },

  // ---- Chairs & Seating ----
  { id: "dining-chair", name: "Dining Chair", cat: "Chairs & Seating", m3: 0.2, kg: 6 },
  { id: "office-chair", name: "Office Chair", cat: "Chairs & Seating", m3: 0.4, kg: 12 },
  { id: "folding-chair", name: "Folding Chair", cat: "Chairs & Seating", m3: 0.1, kg: 4 },
  { id: "stool", name: "Stool / Bar Stool", cat: "Chairs & Seating", m3: 0.15, kg: 6 },
  { id: "rocking-chair", name: "Rocking Chair", cat: "Chairs & Seating", m3: 0.5, kg: 18 },
  { id: "bench", name: "Bench", cat: "Chairs & Seating", m3: 0.4, kg: 20 },
  { id: "high-chair", name: "High Chair", cat: "Chairs & Seating", m3: 0.2, kg: 6 },

  // ---- Appliances & Kitchen ----
  { id: "fridge", name: "Fridge", cat: "Appliances & Kitchen", m3: 0.8, kg: 45 },
  { id: "fridge-freezer", name: "Fridge Freezer", cat: "Appliances & Kitchen", m3: 1.0, kg: 70 },
  { id: "american-fridge", name: "American Fridge Freezer", cat: "Appliances & Kitchen", m3: 1.4, kg: 110 },
  { id: "chest-freezer", name: "Chest Freezer", cat: "Appliances & Kitchen", m3: 0.9, kg: 60 },
  { id: "washing-machine", name: "Washing Machine", cat: "Appliances & Kitchen", m3: 0.5, kg: 70 },
  { id: "tumble-dryer", name: "Tumble Dryer", cat: "Appliances & Kitchen", m3: 0.5, kg: 35 },
  { id: "washer-dryer", name: "Washer Dryer", cat: "Appliances & Kitchen", m3: 0.55, kg: 75 },
  { id: "dishwasher", name: "Dishwasher", cat: "Appliances & Kitchen", m3: 0.5, kg: 45 },
  { id: "cooker", name: "Cooker / Oven", cat: "Appliances & Kitchen", m3: 0.6, kg: 55 },
  { id: "range-cooker", name: "Range Cooker", cat: "Appliances & Kitchen", m3: 1.0, kg: 90 },
  { id: "microwave", name: "Microwave Oven", cat: "Appliances & Kitchen", m3: 0.1, kg: 15 },
  { id: "small-appliance", name: "Small Kitchen Appliance", cat: "Appliances & Kitchen", m3: 0.05, kg: 5 },

  // ---- Electronics ----
  { id: "large-tv", name: 'Large TV (over 40")', cat: "Electronics", m3: 0.3, kg: 20 },
  { id: "medium-tv", name: 'Medium TV (30-40")', cat: "Electronics", m3: 0.2, kg: 12 },
  { id: "small-tv", name: 'Small TV (under 30")', cat: "Electronics", m3: 0.1, kg: 7 },
  { id: "tv-stand", name: "TV Stand", cat: "Electronics", m3: 0.5, kg: 25 },
  { id: "computer", name: "Computer / PC Tower", cat: "Electronics", m3: 0.15, kg: 12 },
  { id: "monitor", name: "Monitor", cat: "Electronics", m3: 0.1, kg: 6 },
  { id: "printer", name: "Printer", cat: "Electronics", m3: 0.1, kg: 8 },
  { id: "speakers", name: "HiFi / Speakers", cat: "Electronics", m3: 0.2, kg: 12 },
  { id: "console", name: "Games Console", cat: "Electronics", m3: 0.05, kg: 4 },
  { id: "piano-keyboard", name: "Piano Keyboard", cat: "Electronics", m3: 0.3, kg: 20 },
  { id: "digital-piano", name: "Digital Piano", cat: "Electronics", m3: 0.4, kg: 40 },
  { id: "upright-piano", name: "Upright Piano", cat: "Electronics", m3: 1.2, kg: 200 },

  // ---- Mirrors, Art & Decor ----
  { id: "full-length-mirror", name: "Full Length Mirror", cat: "Mirrors, Art & Decor", m3: 0.15, kg: 10 },
  { id: "large-mirror", name: "Large Mirror", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 8 },
  { id: "small-mirror", name: "Small Mirror", cat: "Mirrors, Art & Decor", m3: 0.05, kg: 4 },
  { id: "large-picture", name: "Large Picture Frame", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 6 },
  { id: "small-picture", name: "Small Picture Frame", cat: "Mirrors, Art & Decor", m3: 0.03, kg: 2 },
  { id: "painting", name: "Painting / Canvas", cat: "Mirrors, Art & Decor", m3: 0.05, kg: 3 },
  { id: "wall-clock", name: "Wall Clock", cat: "Mirrors, Art & Decor", m3: 0.03, kg: 2 },
  { id: "grandfather-clock", name: "Grandfather Clock", cat: "Mirrors, Art & Decor", m3: 0.4, kg: 40 },
  { id: "floor-lamp", name: "Floor Lamp", cat: "Mirrors, Art & Decor", m3: 0.15, kg: 6 },
  { id: "table-lamp", name: "Table Lamp", cat: "Mirrors, Art & Decor", m3: 0.05, kg: 3 },
  { id: "rug", name: "Rug (rolled)", cat: "Mirrors, Art & Decor", m3: 0.15, kg: 12 },
  { id: "curtains", name: "Curtains / Blinds", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 6 },
  { id: "vase", name: "Vase / Ornament", cat: "Mirrors, Art & Decor", m3: 0.03, kg: 3 },
  { id: "ironing-board", name: "Ironing Board", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 6 },
  { id: "clothes-airer", name: "Clothes Airer / Drying Rack", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 5 },
  { id: "bin", name: "Bin", cat: "Mirrors, Art & Decor", m3: 0.1, kg: 4 },

  // ---- Garden & Outdoor ----
  { id: "garden-table", name: "Garden Table", cat: "Garden & Outdoor", m3: 0.6, kg: 20 },
  { id: "garden-chair", name: "Garden Chair", cat: "Garden & Outdoor", m3: 0.2, kg: 5 },
  { id: "garden-bench", name: "Garden Bench", cat: "Garden & Outdoor", m3: 0.5, kg: 25 },
  { id: "parasol", name: "Parasol", cat: "Garden & Outdoor", m3: 0.15, kg: 8 },
  { id: "bbq", name: "BBQ", cat: "Garden & Outdoor", m3: 0.4, kg: 25 },
  { id: "plant-small", name: "Small Potted Plant", cat: "Garden & Outdoor", m3: 0.06, kg: 6 },
  { id: "plant-large", name: "Large Potted Plant", cat: "Garden & Outdoor", m3: 0.2, kg: 25 },
  { id: "plant-flowers", name: "Plant / Flowers", cat: "Garden & Outdoor", m3: 0.05, kg: 4 },
  { id: "bird-table", name: "Bird Table", cat: "Garden & Outdoor", m3: 0.2, kg: 8 },
  { id: "lawn-mower", name: "Lawn Mower", cat: "Garden & Outdoor", m3: 0.3, kg: 25 },
  { id: "wheelbarrow", name: "Wheelbarrow", cat: "Garden & Outdoor", m3: 0.4, kg: 18 },
  { id: "water-butt", name: "Water Butt", cat: "Garden & Outdoor", m3: 0.4, kg: 12 },
  { id: "bicycle", name: "Bicycle", cat: "Garden & Outdoor", m3: 0.4, kg: 12 },
  { id: "kids-bike", name: "Kids' Bike", cat: "Garden & Outdoor", m3: 0.2, kg: 8 },

  // ---- Tools & DIY ----
  { id: "tool-box", name: "Tool Box", cat: "Tools & DIY", m3: 0.05, kg: 20 },
  { id: "tools", name: "Tools (box of)", cat: "Tools & DIY", m3: 0.06, kg: 22 },
  { id: "step-ladder", name: "Step Ladder", cat: "Tools & DIY", m3: 0.15, kg: 8 },
  { id: "extension-ladder", name: "Extension Ladder", cat: "Tools & DIY", m3: 0.2, kg: 15 },
  { id: "garden-spade", name: "Garden Spade / Fork", cat: "Tools & DIY", m3: 0.05, kg: 3 },
  { id: "workbench", name: "Workbench", cat: "Tools & DIY", m3: 0.4, kg: 30 },
  { id: "power-tools", name: "Drill / Power Tools", cat: "Tools & DIY", m3: 0.03, kg: 6 },

  // ---- Fitness ----
  { id: "treadmill", name: "Treadmill", cat: "Fitness", m3: 1.2, kg: 85 },
  { id: "exercise-bike", name: "Exercise Bike", cat: "Fitness", m3: 0.4, kg: 45 },
  { id: "cross-trainer", name: "Cross Trainer", cat: "Fitness", m3: 0.6, kg: 60 },
  { id: "rowing-machine", name: "Rowing Machine", cat: "Fitness", m3: 0.4, kg: 35 },
  { id: "weights-bench", name: "Weights Bench", cat: "Fitness", m3: 0.4, kg: 30 },
  { id: "weights-set", name: "Set Of Weights", cat: "Fitness", m3: 0.1, kg: 40 },

  // ---- Boxes & Bags ----
  { id: "small-box", name: "Small Box", cat: "Boxes & Bags", m3: 0.036, kg: 7 },
  { id: "medium-box", name: "Medium Box", cat: "Boxes & Bags", m3: 0.07, kg: 10 },
  { id: "large-box", name: "Large Box", cat: "Boxes & Bags", m3: 0.125, kg: 15 },
  { id: "xl-box", name: "Extra Large Box", cat: "Boxes & Bags", m3: 0.216, kg: 20 },
  { id: "box-books", name: "Box Of Books", cat: "Boxes & Bags", m3: 0.06, kg: 18 },
  { id: "box-clothes", name: "Box Of Clothes", cat: "Boxes & Bags", m3: 0.07, kg: 10 },
  { id: "small-bag", name: "Small Bag", cat: "Boxes & Bags", m3: 0.05, kg: 5 },
  { id: "large-bag", name: "Large Bag", cat: "Boxes & Bags", m3: 0.1, kg: 8 },
  { id: "xl-bag", name: "Extra Large Bag", cat: "Boxes & Bags", m3: 0.15, kg: 12 },
  { id: "bin-bag", name: "Bin Bag", cat: "Boxes & Bags", m3: 0.08, kg: 6 },
  { id: "holdall", name: "Holdall", cat: "Boxes & Bags", m3: 0.06, kg: 8 },
  { id: "suitcase-small", name: "Small Suitcase", cat: "Boxes & Bags", m3: 0.044, kg: 8 },
  { id: "suitcase", name: "Medium Suitcase", cat: "Boxes & Bags", m3: 0.073, kg: 12 },
  { id: "suitcase-large", name: "Large Suitcase", cat: "Boxes & Bags", m3: 0.113, kg: 16 },
  { id: "suitcase-xl", name: "Extra Large Suitcase", cat: "Boxes & Bags", m3: 0.154, kg: 20 },
  { id: "trunk", name: "Trunk / Storage Chest", cat: "Boxes & Bags", m3: 0.2, kg: 15 },
];
const categoryOrder = ["Sofas & Armchairs", "Beds & Mattresses", "Wardrobes & Storage", "Tables", "Chairs & Seating", "Appliances & Kitchen", "Electronics", "Mirrors, Art & Decor", "Garden & Outdoor", "Tools & DIY", "Fitness", "Boxes & Bags"];
const floors = [
  { label: "Basement", above: 1 }, { label: "Ground floor", above: 0 },
  { label: "1st floor", above: 1 }, { label: "2nd floor", above: 2 },
  { label: "3rd floor", above: 3 }, { label: "4th floor", above: 4 },
  { label: "5th floor", above: 5 }, { label: "6th floor", above: 6 },
  { label: "Above 6th floor", above: 7 },
];

const defaultSettings = {
  businessName: "Approved Removals", phone: "01234 567 890",
  ownerPin: "1234", driverPin: "0000",
  baseCallout: 120, perMile: 1.2, perM3: 45, perKg: 0.1,
  perFloor: 15, liftFactor: 0.25, premiumMultiplier: 1.5,
  packingMaterials: 90, minPrice: 150, vatEnabled: false,
  vanCapacity: 20, extraMinCharge: 15, extraPerFloorM3: 6, extraFloorFlat: 15,
  rating: 4.94, reviewsText: "based on 200+ completed moves",
};

/* ================= pricing ================= */
function priceBreakdown(s, distance, volume, weight, floorFrom, floorTo, liftFrom, liftTo) {
  const lines = [];
  lines.push({ label: "Call-out & handling", amount: s.baseCallout });
  lines.push({ label: `Distance — ${distance} mi @ £${s.perMile}/mi`, amount: distance * s.perMile });
  lines.push({ label: `Volume — ${volume.toFixed(2)} m³ @ £${s.perM3}/m³`, amount: volume * s.perM3 });
  if (s.perKg > 0) lines.push({ label: `Weight — ${Math.round(weight)} kg @ £${s.perKg}/kg`, amount: weight * s.perKg });
  const fc = (a, lift) => a * s.perFloor * (lift ? s.liftFactor : 1);
  const f = fc(floorFrom, liftFrom) + fc(floorTo, liftTo);
  if (f > 0) lines.push({ label: "Stairs / floor access", amount: f });
  let standard = lines.reduce((a, l) => a + l.amount, 0);
  if (standard < s.minPrice) standard = s.minPrice;
  let premium = standard * s.premiumMultiplier + s.packingMaterials;
  const vat = (n) => (s.vatEnabled ? n * 1.2 : n);
  return { lines, standard: Math.round(vat(standard)), premium: Math.round(vat(premium)), vat: s.vatEnabled };
}
function extraItemCharge(s, vol, kg, floorUnits = 0, extraFloors = 0) {
  const items = vol * s.perM3 + (s.perKg > 0 ? kg * s.perKg : 0);
  const floor = floorUnits * s.extraPerFloorM3 * vol;
  const extra = extraFloors * (s.extraFloorFlat || 0);
  let c = items + floor + extra;
  c = Math.max(c, s.extraMinCharge || 0);
  if (s.vatEnabled) c *= 1.2;
  return Math.round(c);
}
const aboveFromLabel = (label) => { const f = floors.find((x) => x.label === label); return f ? f.above : 0; };
const effectiveFloors = (s, job) =>
  aboveFromLabel(job.pickup.floor) * (job.pickup.lift ? s.liftFactor : 1) +
  aboveFromLabel(job.dropoff.floor) * (job.dropoff.lift ? s.liftFactor : 1);
const personCount = (v, w) => (v > 3 || w > 150 ? 2 : 1);

/* ---- real distance from UK postcodes (free, no key: postcodes.io) ---- */
async function geocodeUK(text) {
  const up = (text || "").toUpperCase();
  const full = up.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/);
  const out = up.match(/\b[A-Z]{1,2}\d[A-Z\d]?\b/);
  const base = "https://api.postcodes.io";
  try {
    if (full) {
      const r = await fetch(`${base}/postcodes/${encodeURIComponent(full[0].replace(/\s+/g, ""))}`);
      const j = await r.json();
      if (j.result) return { lat: j.result.latitude, lng: j.result.longitude };
    }
    if (out) {
      const r = await fetch(`${base}/outcodes/${encodeURIComponent(out[0])}`);
      const j = await r.json();
      if (j.result) return { lat: j.result.latitude, lng: j.result.longitude };
    }
  } catch (e) { return null; }
  return null;
}
function haversineMiles(a, b) {
  const R = 3958.8, rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
async function estimateMiles(from, to) {
  const a = await geocodeUK(from), b = await geocodeUK(to);
  if (!a || !b) return null;
  return Math.max(1, Math.round(haversineMiles(a, b) * 1.3)); // ×1.3 ≈ road distance
}

/* ================= job helpers ================= */
const lookup = (id) => defaultCatalogue.find((x) => x.id === id);
function invLine(id, qty) {
  const it = lookup(id);
  return { id, name: it.name, qty, m3: it.m3, kg: it.kg, loaded: 0, added: false };
}
function jobTotals(inv) {
  return inv.reduce((a, x) => ({
    volume: a.volume + x.qty * x.m3, weight: a.weight + x.qty * x.kg, count: a.count + x.qty,
  }), { volume: 0, weight: 0, count: 0 });
}
function makeJob(booking) {
  const { ref, route, cart, catalogue, pkg, price, details } = booking;
  const inv = catalogue.filter((it) => cart[it.id]).map((it) => ({
    id: it.id, name: it.name, qty: cart[it.id], m3: it.m3, kg: it.kg, loaded: 0, added: false,
  }));
  const t = jobTotals(inv);
  return {
    id: booking.id || Date.now(), ref, price, pkg, details,
    distance: route.distance, inventory: inv, extras: [],
    volume: t.volume, weight: t.weight, itemCount: t.count, crew: personCount(t.volume, t.weight),
    pickup: { address: route.from, floor: floors[route.floorFrom].label, lift: route.liftFrom, time: details.date || "TBC", started: false, done: false, proof: null },
    dropoff: { address: route.to, floor: floors[route.floorTo].label, lift: route.liftTo, time: details.date || "TBC", started: false, done: false, proof: null },
  };
}
function seedJobs() {
  const a = [invLine("medium-box", 5), invLine("suitcase", 1), invLine("small-box", 10), invLine("large-box", 1), invLine("armchair", 1)];
  const at = jobTotals(a);
  const b = [invLine("three-seater-sofa", 1), invLine("double-bed", 1), invLine("double-wardrobe", 1), invLine("washing-machine", 1), invLine("large-box", 6)];
  const bt = jobTotals(b);
  return [
    {
      id: 9609006, ref: "9609006", price: 189, pkg: "standard",
      details: { name: "Hawraa Alsalem", phone: "07700 900123", email: "hawraa@email.com", date: "2026-09-01" },
      distance: 6, inventory: a, extras: [], volume: at.volume, weight: at.weight, itemCount: at.count, crew: 2,
      pickup: { address: "Flat 104, 3 Buckingham House, Glovers Court, Preston, PR1 3LS", floor: "1st floor", lift: true, time: "11:20", started: false, done: false, proof: null },
      dropoff: { address: "28 Acrefield, Clayton Brook, Preston, PR5 8ET", floor: "Ground floor", lift: false, time: "13:27", started: false, done: false, proof: null },
    },
    {
      id: 9592239, ref: "9592239", price: 372, pkg: "premium",
      details: { name: "James Okoro", phone: "07700 900456", email: "james@email.com", date: "2026-09-01" },
      distance: 92, inventory: b, extras: [], volume: bt.volume, weight: bt.weight, itemCount: bt.count, crew: 2,
      pickup: { address: "58 Princes Reach, Preston, PR2 2GA", floor: "2nd floor", lift: false, time: "12:20", started: false, done: false, proof: null },
      dropoff: { address: "150 The Mill, Enderley Street, Newcastle, ST5 2AN", floor: "1st floor", lift: true, time: "15:31", started: false, done: false, proof: null },
    },
  ];
}

/* ================= reusable fields ================= */
function NumberField({ value, onChange, prefix, suffix, step = 1, style }) {
  const [txt, setTxt] = useState(String(value ?? ""));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setTxt(String(value ?? "")); }, [value]);
  return (
    <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: theme.line, background: "#fff", ...style }}>
      {prefix && <span className="pl-3 text-sm" style={{ color: theme.muted }}>{prefix}</span>}
      <input inputMode="decimal" value={txt}
        onFocus={() => (focused.current = true)}
        onBlur={() => { focused.current = false; setTxt(String(value ?? "")); }}
        onChange={(e) => { setTxt(e.target.value); const n = parseFloat(e.target.value); onChange(isNaN(n) ? 0 : n); }}
        step={step} className="w-full px-3 py-2 text-sm outline-none" />
      {suffix && <span className="pr-3 text-sm whitespace-nowrap" style={{ color: theme.muted }}>{suffix}</span>}
    </div>
  );
}
function TextField({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 text-sm rounded-lg border outline-none" style={{ borderColor: theme.line, background: "#fff" }} />;
}
function Pill({ children, tone = "amber" }) {
  const map = { amber: ["#FBF0D6", theme.amberDk], teal: [theme.tealSoft, theme.teal], blue: ["#DCE7FF", theme.blue], grey: ["#EEE", theme.muted] };
  const [bg, fg] = map[tone] || map.amber;
  return <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: bg, color: fg }}>{children}</span>;
}
function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border p-5 ${className}`} style={{ background: theme.card, borderColor: theme.line }}>{children}</div>;
}
function Stat({ label, value }) {
  return <div className="flex justify-between py-1.5 text-sm border-b last:border-0" style={{ borderColor: theme.line }}>
    <span style={{ color: theme.muted }}>{label}</span><span className="font-semibold">{value}</span></div>;
}

/* ================= signature pad ================= */
function SignaturePad({ onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pos = (e) => {
    const c = ref.current, r = c.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * (c.width / r.width), y: (cy - r.top) * (c.height / r.height) };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return; e.preventDefault();
    const ctx = ref.current.getContext("2d"), p = pos(e);
    ctx.strokeStyle = theme.ink; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const end = () => { if (drawing.current) { drawing.current = false; onChange(ref.current.toDataURL()); } };
  const clear = () => { const c = ref.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); onChange(""); };
  return (
    <div>
      <div className="rounded-xl border relative" style={{ borderColor: theme.line, background: "#fff" }}>
        <button onClick={clear} className="absolute top-2 right-2 p-1.5 rounded-lg z-10" style={{ background: theme.paper }}><RotateCcw size={15} /></button>
        <canvas ref={ref} width={600} height={220} className="w-full" style={{ height: 160, touchAction: "none" }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>
      <div className="text-xs mt-1" style={{ color: theme.muted }}>Ask the customer to sign above.</div>
    </div>
  );
}

/* ================= photo uploader ================= */
function PhotoUploader({ photos, onAdd, onRemove }) {
  const input = useRef(null);
  const pick = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => onAdd(r.result);
    r.readAsDataURL(f);
    e.target.value = "";
  };
  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => input.current?.click()}
        className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
        style={{ borderColor: theme.line, color: theme.muted }}>
        <Camera size={20} /><span className="text-xs">Add</span>
      </button>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
      {photos.map((p, i) => (
        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: theme.line }}>
          <img src={p} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onRemove(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.6)" }}>
            <X size={12} color="#fff" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ItemRow({ it, qty, add }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-2">
      <div><div className="text-sm">{it.name}</div>
        <div className="text-xs" style={{ color: theme.muted }}>{it.m3} m³ · {it.kg} kg</div></div>
      <div className="flex items-center gap-2">
        <button onClick={() => add(it.id, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: theme.line }}><Minus size={14} /></button>
        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
        <button onClick={() => add(it.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.amber }}><Plus size={14} color={theme.ink} /></button>
      </div>
    </div>
  );
}

/* ============================================================ */
export default function App() {
  const [view, setView] = useState("customer");
  const [settings, setSettings] = useState(defaultSettings);
  const [catalogue, setCatalogue] = useState(defaultCatalogue);
  const [jobs, setJobs] = useState(seedJobs);
  const [leads, setLeads] = useState([]);
  const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    fetchJobs().then((js) => { if (js) setJobs(js); });
    fetchLeads().then((ls) => { if (ls) setLeads(ls); });
  }, []);

  const roles = [{ id: "customer", label: "Book" }, { id: "driver", label: "Driver" }, { id: "owner", label: "Owner" }];

  return (
    <div style={{ background: theme.paper, minHeight: "100vh", fontFamily: font.body, color: theme.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');`}</style>
      <header className="sticky top-0 z-20 border-b" style={{ background: theme.ink }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: theme.amber }}><Truck size={20} color={theme.ink} /></div>
            <div className="leading-tight truncate">
              <div style={{ fontFamily: font.display, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{settings.businessName}</div>
              <div className="text-xs" style={{ color: "#9AA0A6" }}>Home & office removals</div>
            </div>
          </div>
          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid #2B2F36" }}>
            {roles.map((r) => (
              <button key={r.id} onClick={() => setView(r.id)} className="text-xs px-2.5 py-1.5 font-semibold"
                style={{ background: view === r.id ? theme.amber : "transparent", color: view === r.id ? theme.ink : "#C7CBD1" }}>{r.label}</button>
            ))}
          </div>
        </div>
      </header>

      {view === "customer" && <CustomerFlow settings={settings} catalogue={catalogue}
        onBook={(b) => { const job = makeJob({ ...b, id: Date.now() }); setJobs((prev) => [job, ...prev]); saveBooking(job); }}
        onLead={(l) => { const lead = { ...l, id: Date.now(), at: new Date() }; setLeads((prev) => [lead, ...prev]); saveLead(l); }} />}
      {view === "driver" && <DriverArea settings={settings} catalogue={catalogue} jobs={jobs} setJobs={setJobs} />}
      {view === "owner" && <OwnerArea settings={settings} setSetting={setSetting} catalogue={catalogue} setCatalogue={setCatalogue} jobs={jobs} leads={leads} />}
    </div>
  );
}

/* ============================================================ CUSTOMER */
function CustomerFlow({ settings, catalogue, onBook, onLead }) {
  const [step, setStep] = useState(0);
  const [route, setRoute] = useState({ from: "S64 9BJ, Mexborough", floorFrom: 2, liftFrom: false, to: "B73 6TR, Sutton Coldfield", floorTo: 2, liftTo: false, distance: 78 });
  const [cart, setCart] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [pkg, setPkg] = useState(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", date: "" });
  const [ref, setRef] = useState("");
  const fullCat = [...catalogue, ...customItems];
  const volume = fullCat.reduce((a, it) => a + (cart[it.id] || 0) * it.m3, 0);
  const weight = fullCat.reduce((a, it) => a + (cart[it.id] || 0) * it.kg, 0);
  const itemCount = Object.values(cart).reduce((a, n) => a + n, 0);
  const quote = priceBreakdown(settings, route.distance, volume, weight, floors[route.floorFrom].above, floors[route.floorTo].above, route.liftFrom, route.liftTo);
  const steps = ["Route", "Your items", "Your price", "Book & pay"];

  const addCustomItem = (item) => {
    const id = "cust-" + Date.now();
    setCustomItems((c) => [...c, { id, name: item.name, cat: "Custom", m3: item.m3, kg: item.kg }]);
    setCart((c) => ({ ...c, [id]: item.qty || 1 }));
  };
  const removeCustomItem = (id) => {
    setCustomItems((c) => c.filter((x) => x.id !== id));
    setCart((c) => { const n = { ...c }; delete n[id]; return n; });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24">
      {step === 0 && <Hero settings={settings} onStart={() => setStep(1)} />}
      {step > 0 && step < 5 && <>
        <Stepper steps={steps} current={step - 1} />
        {step === 1 && <RouteStep route={route} setRoute={setRoute} onNext={() => setStep(2)} />}
        {step === 2 && <ItemsStep catalogue={fullCat} customItems={customItems} addCustomItem={addCustomItem} removeCustomItem={removeCustomItem} cart={cart} setCart={setCart} volume={volume} weight={weight} itemCount={itemCount} vanCapacity={settings.vanCapacity} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && (unlocked
          ? <QuoteStep quote={quote} route={route} volume={volume} weight={weight} itemCount={itemCount} onPick={(p) => { setPkg(p); setStep(4); }} onBack={() => setStep(2)} />
          : <LeadGate onBack={() => setStep(2)} onUnlock={(email, phone) => { setDetails((d) => ({ ...d, email, phone })); setUnlocked(true); onLead({ email, phone, total: quote.standard, route: `${route.from} → ${route.to}`, volume }); }} />)}
        {step === 4 && <PayStep pkg={pkg} quote={quote} details={details} setDetails={setDetails} onBack={() => setStep(3)}
          onPaid={() => {
            const r = "AR-" + Math.floor(100000 + Math.random() * 899999);
            setRef(r); onBook({ ref: r, route, cart, catalogue: fullCat, volume, weight, itemCount, pkg, price: pkg === "premium" ? quote.premium : quote.standard, details }); setStep(5);
          }} />}
      </>}
      {step === 5 && <DoneStep settings={settings} ref_={ref} pkg={pkg} price={pkg === "premium" ? quote.premium : quote.standard} details={details} route={route} />}
    </main>
  );
}
function Hero({ settings, onStart }) {
  const rating = settings.rating || 4.9;
  return (
    <section className="pt-10 pb-6"><div className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <Pill tone="teal">Fully insured · DBS-checked crews</Pill>
        </div>
        <div className="mb-3 flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} color={theme.amber} fill={i < Math.round(rating) ? theme.amber : "none"} />)}
          <span className="text-sm font-bold ml-1">{Number(rating).toFixed(2)}</span>
          <span className="text-xs" style={{ color: theme.muted }}>· {settings.reviewsText}</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: "2.6rem", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
          Tell us what you're<br />moving. Get a price<br /><span style={{ color: theme.amberDk }}>in 60 seconds.</span></h1>
        <p className="mt-4 text-base" style={{ color: theme.muted, maxWidth: 420 }}>Add your items, pick your pickup and drop-off, and we'll build an instant fixed quote. Book now, our team does the lifting.</p>
        <button onClick={onStart} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base" style={{ background: theme.amber, color: theme.ink }}>Get my price <ArrowRight size={18} /></button>
      </div>
      <div className="rounded-2xl border p-5" style={{ background: theme.card, borderColor: theme.line }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center pt-1"><MapPin size={16} color={theme.amberDk} /><div style={{ width: 2, height: 34, background: theme.teal }} /><MapPin size={16} color={theme.teal} /></div>
          <div className="flex-1"><div className="text-sm font-semibold">Mexborough</div><div className="text-xs mb-3" style={{ color: theme.muted }}>S64 9BJ</div>
            <div className="text-sm font-semibold">Sutton Coldfield</div><div className="text-xs" style={{ color: theme.muted }}>B73 6TR</div></div>
          <div className="text-right"><div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.4rem" }}>78 mi</div><div className="text-xs" style={{ color: theme.muted }}>~1h 51m</div></div>
        </div>
        <div className="mt-5"><div className="flex justify-between text-xs mb-1" style={{ color: theme.muted }}><span>Van load</span><span>19.24 m³ · 1 Luton van</span></div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: theme.paper }}><div style={{ width: "96%", height: "100%", background: theme.amber }} /></div></div>
      </div>
    </div></section>
  );
}
function Stepper({ steps, current }) {
  return <div className="flex items-center gap-2 py-5 overflow-x-auto">{steps.map((s, i) => (
    <React.Fragment key={s}><div className="flex items-center gap-2 whitespace-nowrap">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i <= current ? theme.ink : "#fff", color: i <= current ? "#fff" : theme.muted, border: `1px solid ${i <= current ? theme.ink : theme.line}` }}>{i < current ? <Check size={13} /> : i + 1}</div>
      <span className="text-sm font-medium" style={{ color: i === current ? theme.ink : theme.muted }}>{s}</span></div>
      {i < steps.length - 1 && <div className="flex-1 h-px min-w-4" style={{ background: theme.line }} />}</React.Fragment>))}</div>;
}
function RouteStep({ route, setRoute, onNext }) {
  const set = (k, v) => setRoute((r) => ({ ...r, [k]: v }));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("Enter a full UK postcode at each end and the miles fill in automatically.");
  const calc = async () => {
    setBusy(true); setNote("Looking up postcodes…");
    const mi = await estimateMiles(route.from, route.to);
    setBusy(false);
    if (mi) { set("distance", mi); setNote(`≈ ${mi} miles by road, estimated from the postcodes.`); }
    else setNote("Couldn't read a UK postcode at both ends — type the miles in manually, or check the postcodes.");
  };
  useEffect(() => {
    const t = setTimeout(async () => {
      const mi = await estimateMiles(route.from, route.to);
      if (mi) { setRoute((r) => ({ ...r, distance: mi })); setNote(`≈ ${mi} miles by road, estimated from the postcodes.`); }
    }, 900);
    return () => clearTimeout(t);
  }, [route.from, route.to]);
  const FloorSelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border outline-none" style={{ borderColor: theme.line, background: "#fff" }}>
      {floors.map((f, i) => <option key={f.label} value={i}>{f.label}</option>)}</select>);
  return (
    <Card><h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.25rem" }}>Where are you moving?</h2>
      <div className="grid md:grid-cols-2 gap-5 mt-4">
        <div><div className="text-sm font-semibold mb-2 flex items-center gap-1.5"><MapPin size={15} color={theme.amberDk} /> Pickup</div>
          <TextField value={route.from} onChange={(v) => set("from", v)} placeholder="Pickup postcode, e.g. S1 2HH" />
          <div className="grid grid-cols-2 gap-2 mt-2"><FloorSelect value={route.floorFrom} onChange={(v) => set("floorFrom", v)} />
            <label className="flex items-center gap-2 text-sm px-2"><input type="checkbox" checked={route.liftFrom} onChange={(e) => set("liftFrom", e.target.checked)} /> Lift available</label></div></div>
        <div><div className="text-sm font-semibold mb-2 flex items-center gap-1.5"><MapPin size={15} color={theme.teal} /> Drop-off</div>
          <TextField value={route.to} onChange={(v) => set("to", v)} placeholder="Drop-off postcode, e.g. NE1 4ST" />
          <div className="grid grid-cols-2 gap-2 mt-2"><FloorSelect value={route.floorTo} onChange={(v) => set("floorTo", v)} />
            <label className="flex items-center gap-2 text-sm px-2"><input type="checkbox" checked={route.liftTo} onChange={(e) => set("liftTo", e.target.checked)} /> Lift available</label></div></div>
      </div>
      <div className="mt-5 pt-4 border-t" style={{ borderColor: theme.line }}>
        <div className="text-sm font-semibold mb-2">Distance</div>
        <div className="flex items-center gap-2 flex-wrap">
          <NumberField value={route.distance} onChange={(v) => set("distance", v)} suffix="miles" style={{ width: 150 }} />
          <button onClick={calc} disabled={busy} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5" style={{ background: theme.ink, color: "#fff", opacity: busy ? .6 : 1 }}><Navigation size={14} /> {busy ? "Checking…" : "Get distance"}</button>
        </div>
        <div className="text-xs mt-2" style={{ color: note.startsWith("Couldn't") ? theme.danger : theme.muted }}>{note}</div>
      </div>
      <button onClick={onNext} className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold" style={{ background: theme.ink, color: "#fff" }}>Continue to items <ChevronRight size={18} /></button>
    </Card>
  );
}
function ItemsStep({ catalogue, customItems, addCustomItem, removeCustomItem, cart, setCart, volume, weight, itemCount, vanCapacity, onBack, onNext }) {
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState(categoryOrder[0]);
  const add = (id, d) => setCart((c) => { const n = Math.max(0, (c[id] || 0) + d); const nx = { ...c }; if (n === 0) delete nx[id]; else nx[id] = n; return nx; });
  const vans = Math.max(1, Math.ceil(volume / vanCapacity || 1));
  const fillPct = Math.min(100, (volume / (vans * vanCapacity)) * 100 || 0);
  const filtered = query.trim() ? catalogue.filter((it) => it.name.toLowerCase().includes(query.toLowerCase())) : null;
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div className="md:col-span-2 space-y-4"><Card>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: theme.line }}><Search size={16} color={theme.muted} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, e.g. sofa" className="w-full text-sm outline-none" /></div>
        {filtered ? <div className="mt-3 divide-y" style={{ borderColor: theme.line }}>{filtered.map((it) => <ItemRow key={it.id} it={it} qty={cart[it.id] || 0} add={add} />)}{filtered.length === 0 && <div className="text-sm py-3" style={{ color: theme.muted }}>No items match — use "Add your own" below.</div>}</div>
          : <div className="mt-4 space-y-2">{categoryOrder.map((cat) => (
            <div key={cat} className="rounded-xl border" style={{ borderColor: theme.line }}>
              <button onClick={() => setOpenCat(openCat === cat ? "" : cat)} className="w-full flex items-center justify-between px-4 py-3"><span className="font-semibold text-sm">{cat}</span><ChevronRight size={16} style={{ transform: openCat === cat ? "rotate(90deg)" : "none", color: theme.muted }} /></button>
              {openCat === cat && <div className="px-2 pb-2 divide-y" style={{ borderColor: theme.line }}>{catalogue.filter((it) => it.cat === cat).map((it) => <ItemRow key={it.id} it={it} qty={cart[it.id] || 0} add={add} />)}</div>}
            </div>))}</div>}
      </Card>
      <CustomItemCard customItems={customItems} cart={cart} add={add} addCustomItem={addCustomItem} removeCustomItem={removeCustomItem} />
      </div>
      <div className="space-y-4"><Card>
        <div className="text-sm font-semibold mb-3">Your load</div>
        <div className="flex justify-between text-xs mb-1" style={{ color: theme.muted }}><span>{vans} van{vans > 1 ? "s" : ""}</span><span>{volume.toFixed(2)} m³</span></div>
        <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: theme.paper }}><div style={{ width: `${fillPct}%`, height: "100%", background: theme.amber, transition: "width .3s" }} /></div>
        <Stat label="Items" value={itemCount} /><Stat label="Volume" value={`${volume.toFixed(2)} m³`} /><Stat label="Weight" value={`${Math.round(weight)} kg`} />
        <button disabled={itemCount === 0} onClick={onNext} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold" style={{ background: itemCount === 0 ? "#ccc" : theme.ink, color: "#fff", opacity: itemCount === 0 ? .7 : 1 }}>See my price <ChevronRight size={18} /></button>
        <button onClick={onBack} className="mt-2 w-full text-sm py-2" style={{ color: theme.muted }}><ChevronLeft size={14} className="inline" /> Back</button>
      </Card></div>
    </div>
  );
}
function CustomItemCard({ customItems, cart, add, addCustomItem, removeCustomItem }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", l: "", w: "", h: "", kg: "" });
  const vol = ((parseFloat(f.l) || 0) * (parseFloat(f.w) || 0) * (parseFloat(f.h) || 0)) / 1e6;
  const valid = f.name && vol > 0;
  const submit = () => { if (!valid) return; addCustomItem({ name: f.name, m3: vol, kg: parseFloat(f.kg) || 0, qty: 1 }); setF({ name: "", l: "", w: "", h: "", kg: "" }); setOpen(false); };
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm">Something not on the list?</div>
        <button onClick={() => setOpen(!open)} className="text-sm font-semibold flex items-center gap-1" style={{ color: theme.teal }}><Plus size={15} /> Add your own</button>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <TextField value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Item name, e.g. Piano, Treadmill, Fish tank" />
          <div className="grid grid-cols-3 gap-2">
            <NumberField value={f.l} onChange={(v) => setF({ ...f, l: v })} suffix="L cm" />
            <NumberField value={f.w} onChange={(v) => setF({ ...f, w: v })} suffix="W cm" />
            <NumberField value={f.h} onChange={(v) => setF({ ...f, h: v })} suffix="H cm" />
          </div>
          <NumberField value={f.kg} onChange={(v) => setF({ ...f, kg: v })} suffix="kg (approx)" />
          <button disabled={!valid} onClick={submit} className="w-full py-2 rounded-lg text-sm font-semibold" style={{ background: valid ? theme.amber : "#ddd", color: theme.ink }}>Add to my list</button>
          <p className="text-xs" style={{ color: theme.muted }}>Give a rough size in cm — we price it at the standard rate. Not sure? Just describe it and our team confirms.</p>
        </div>
      )}
      {customItems.length > 0 && (
        <div className="mt-3 space-y-2">
          {customItems.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: theme.line }}>
              <div className="min-w-0"><div className="text-sm truncate">{it.name}</div><div className="text-xs" style={{ color: theme.muted }}>{it.m3.toFixed(2)} m³ · {Math.round(it.kg)} kg</div></div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => add(it.id, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: theme.line }}><Minus size={13} /></button>
                <span className="w-6 text-center text-sm font-semibold">{cart[it.id] || 0}</span>
                <button onClick={() => add(it.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.amber }}><Plus size={13} color={theme.ink} /></button>
                <button onClick={() => removeCustomItem(it.id)} className="p-1.5" style={{ color: theme.danger }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
function LeadGate({ onBack, onUnlock }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const ok = /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, "").length >= 7;
  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="text-sm mb-3" style={{ color: theme.muted }}><ChevronLeft size={14} className="inline" /> Back to items</button>
      <Card>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: theme.tealSoft }}><Check size={22} color={theme.teal} /></div>
        <h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.25rem" }}>Your price is ready</h2>
        <p className="text-sm mt-1 mb-4" style={{ color: theme.muted }}>Pop in your email and mobile and we'll show your fixed quote — and hold it for you.</p>
        <div className="space-y-3">
          <div><label className="text-sm font-medium">Email</label><TextField value={email} onChange={setEmail} type="email" placeholder="you@email.com" /></div>
          <div><label className="text-sm font-medium">Mobile</label><TextField value={phone} onChange={setPhone} placeholder="07..." /></div>
        </div>
        <button disabled={!ok} onClick={() => onUnlock(email, phone)} className="mt-4 w-full py-3 rounded-xl font-semibold text-white" style={{ background: ok ? theme.teal : "#ccc" }}>Reveal my price</button>
        <p className="text-xs mt-2" style={{ color: theme.muted }}>We'll email your quote and the odd offer. No spam, unsubscribe anytime.</p>
      </Card>
    </div>
  );
}
function QuoteStep({ quote, route, volume, weight, itemCount, onPick, onBack }) {
  const [show, setShow] = useState(false);
  return (<div>
    <button onClick={onBack} className="text-sm mb-3" style={{ color: theme.muted }}><ChevronLeft size={14} className="inline" /> Back to items</button>
    <div className="grid md:grid-cols-2 gap-5">
      <PackageCard title="Standard Removal" blurb="Our team loads, transports and unloads your belongings." price={quote.standard} accent={theme.amber} dark={false} vat={quote.vat}
        features={["Trained crew to load & move", "Goods-in-transit cover", "Free 48-hour cancellation", "Up to 30 mins waiting time"]} onPick={() => onPick("standard")} />
      <PackageCard title="Premium Full Pack & Move" blurb="We pack, dismantle & reassemble, and move you." price={quote.premium} accent={theme.teal} dark vat={quote.vat}
        features={["Full packing service", "All packing materials included", "Furniture dismantle & reassembly", "Extended wait time up to 2 hours", "Enhanced protection cover"]} onPick={() => onPick("premium")} />
    </div>
    <Card className="mt-5"><button onClick={() => setShow(!show)} className="w-full flex items-center justify-between"><span className="text-sm font-semibold">How your price is worked out</span><ChevronRight size={16} style={{ transform: show ? "rotate(90deg)" : "none" }} /></button>
      {show && <div className="mt-3 space-y-1.5"><div className="text-xs mb-2" style={{ color: theme.muted }}>{route.from} → {route.to} · {route.distance} mi · {itemCount} items · {volume.toFixed(2)} m³ · {Math.round(weight)} kg</div>
        {quote.lines.map((l, i) => <div key={i} className="flex justify-between text-sm"><span style={{ color: theme.muted }}>{l.label}</span><span>£{l.amount.toFixed(2)}</span></div>)}
        <div className="flex justify-between text-sm font-semibold pt-2 border-t" style={{ borderColor: theme.line }}><span>Standard total{quote.vat ? " (inc. VAT)" : ""}</span><span>£{quote.standard}</span></div></div>}</Card>
  </div>);
}
function PackageCard({ title, blurb, price, features, accent, dark, onPick, vat }) {
  return (<div className="rounded-2xl overflow-hidden border flex flex-col" style={{ borderColor: theme.line, background: dark ? theme.ink : theme.card }}>
    <div className="p-5" style={{ background: accent, color: dark ? "#fff" : theme.ink }}><div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.15rem" }}>{title}</div><div className="text-sm mt-1 opacity-90">{blurb}</div></div>
    <div className="p-5 flex-1 flex flex-col" style={{ color: dark ? "#fff" : theme.ink }}>
      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "2.2rem", letterSpacing: "-0.02em" }}>£{price.toLocaleString()}</div>
      <div className="text-xs mb-4" style={{ color: dark ? "#9AA0A6" : theme.muted }}>{vat ? "Includes VAT" : "VAT not applied"} · fixed price</div>
      <ul className="space-y-2 flex-1">{features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check size={16} color={accent} className="mt-0.5 shrink-0" /> {f}</li>)}</ul>
      <button onClick={onPick} className="mt-5 w-full py-3 rounded-xl font-semibold" style={{ background: accent, color: dark ? "#fff" : theme.ink }}>Choose this</button>
    </div></div>);
}
function PayStep({ pkg, quote, details, setDetails, onBack, onPaid }) {
  const price = pkg === "premium" ? quote.premium : quote.standard;
  const set = (k, v) => setDetails((d) => ({ ...d, [k]: v }));
  const ready = details.name && details.email && details.phone && details.date;
  return (<div className="grid md:grid-cols-2 gap-5">
    <Card><button onClick={onBack} className="text-sm mb-3" style={{ color: theme.muted }}><ChevronLeft size={14} className="inline" /> Back</button>
      <h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.2rem" }}>Your details</h2>
      <div className="space-y-3 mt-4">
        <div><label className="text-sm font-medium">Full name</label><TextField value={details.name} onChange={(v) => set("name", v)} placeholder="Jane Smith" /></div>
        <div><label className="text-sm font-medium">Email</label><TextField value={details.email} onChange={(v) => set("email", v)} type="email" placeholder="jane@email.com" /></div>
        <div><label className="text-sm font-medium">Phone</label><TextField value={details.phone} onChange={(v) => set("phone", v)} placeholder="07..." /></div>
        <div><label className="text-sm font-medium">Preferred move date</label><TextField value={details.date} onChange={(v) => set("date", v)} type="date" /></div>
      </div></Card>
    <Card><h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.2rem" }}>Payment</h2>
      <div className="rounded-xl p-4 mt-3 mb-4" style={{ background: theme.paper }}>
        <div className="flex justify-between text-sm"><span style={{ color: theme.muted }}>Package</span><span className="font-semibold">{pkg === "premium" ? "Premium Full Pack & Move" : "Standard Removal"}</span></div>
        <div className="flex justify-between mt-2 items-end"><span className="text-sm" style={{ color: theme.muted }}>Total to pay</span><span style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.8rem" }}>£{price.toLocaleString()}</span></div></div>
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: theme.line }}>
        <div className="flex items-center gap-2 text-sm font-medium"><CreditCard size={16} /> Card details</div>
        <div className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: theme.line, color: theme.muted }}>4242 4242 4242 4242</div>
        <div className="grid grid-cols-2 gap-2"><div className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: theme.line, color: theme.muted }}>MM / YY</div><div className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: theme.line, color: theme.muted }}>CVC</div></div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.muted }}><Lock size={12} /> Demo checkout — live site uses Stripe. Card is saved so on-the-day extras can be charged to it.</div>
      </div>
      <button disabled={!ready} onClick={onPaid} className="mt-4 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: ready ? theme.teal : "#ccc", color: "#fff", opacity: ready ? 1 : .7 }}><Lock size={16} /> Pay £{price.toLocaleString()} & book</button>
    </Card></div>);
}
function DoneStep({ settings, ref_, pkg, price, details, route }) {
  return (<div className="pt-10 max-w-lg mx-auto text-center">
    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: theme.tealSoft }}><Check size={32} color={theme.teal} /></div>
    <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.8rem" }}>You're booked in</h1>
    <p className="mt-2" style={{ color: theme.muted }}>Thanks {details.name || "there"} — {settings.businessName} will confirm your crew by email and text.</p>
    <Card className="mt-6 text-left">
      <div className="flex justify-between"><span style={{ color: theme.muted }}>Reference</span><span className="font-semibold">{ref_}</span></div>
      <div className="flex justify-between mt-2"><span style={{ color: theme.muted }}>Package</span><span className="font-semibold">{pkg === "premium" ? "Premium" : "Standard"}</span></div>
      <div className="flex justify-between mt-2"><span style={{ color: theme.muted }}>Paid</span><span className="font-semibold">£{price.toLocaleString()}</span></div>
      <div className="flex justify-between mt-2"><span style={{ color: theme.muted }}>Route</span><span className="font-semibold text-right">{route.from.split(",")[0]} → {route.to.split(",")[0]}</span></div>
    </Card>
    <p className="text-xs mt-4" style={{ color: theme.muted }}>Open the <b>Driver</b> tab to see this job appear for your crew.</p>
  </div>);
}

/* ============================================================ DRIVER */
function DriverArea({ settings, catalogue, jobs, setJobs }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [open, setOpen] = useState(null); // {jobId, leg}
  const updateJob = (id, fn) => setJobs((js) => js.map((j) => { if (j.id !== id) return j; const nj = fn(j); persistJob(nj); return nj; }));

  if (!unlocked) {
    return (<div className="max-w-sm mx-auto pt-20 px-4 text-center">
      <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: theme.ink }}><Truck size={24} color={theme.amber} /></div>
      <h2 style={{ fontFamily: font.display, fontWeight: 600 }}>Driver sign-in</h2>
      <p className="text-sm mt-1 mb-4" style={{ color: theme.muted }}>Enter your PIN (demo: {settings.driverPin})</p>
      <TextField value={pin} onChange={setPin} placeholder="PIN" type="password" />
      <button onClick={() => setUnlocked(pin === settings.driverPin)} className="mt-3 w-full py-3 rounded-xl font-semibold" style={{ background: theme.ink, color: "#fff" }}>Start shift</button>
      {pin && pin !== settings.driverPin && <p className="text-xs mt-2" style={{ color: theme.danger }}>Wrong PIN.</p>}
    </div>);
  }
  if (open) {
    const job = jobs.find((j) => j.id === open.jobId);
    if (!job) { setOpen(null); return null; }
    return <JobDetail job={job} leg={open.leg} settings={settings} catalogue={catalogue} onBack={() => setOpen(null)} updateJob={updateJob} />;
  }
  return <OrdersList jobs={jobs} onOpen={setOpen} />;
}

function OrdersList({ jobs, onOpen }) {
  // one row per leg, ordered by time
  const legs = [];
  jobs.forEach((j) => { legs.push({ job: j, leg: "pickup" }); legs.push({ job: j, leg: "dropoff" }); });
  legs.sort((a, b) => (a.job[a.leg].time || "").localeCompare(b.job[b.leg].time || ""));
  return (
    <main className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-baseline justify-between mb-1"><h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.5rem" }}>My Orders <span style={{ color: theme.muted }}>({legs.length})</span></h1></div>
      <p className="text-sm mb-4" style={{ color: theme.muted }}>Ordered by scheduled time. Each stop has its own reference.</p>
      <div className="space-y-3">
        {legs.map(({ job, leg }, i) => {
          const s = job[leg]; const isPickup = leg === "pickup";
          return (
            <button key={i} onClick={() => onOpen({ jobId: job.id, leg })} className="w-full text-left rounded-2xl border p-4" style={{ background: theme.card, borderColor: theme.line, opacity: s.done ? .6 : 1 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono" style={{ color: theme.muted }}>#{job.ref}-{isPickup ? "P" : "D"}</span>
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">{s.time}</span>
                  {s.done ? <Pill tone="teal">Done</Pill> : <Pill tone={isPickup ? "amber" : "blue"}>{isPickup ? "PICKUP" : "DROPOFF"}</Pill>}</div>
              </div>
              <div className="text-sm font-semibold leading-snug">{s.address}</div>
              <div className="text-xs mt-1" style={{ color: theme.muted }}>Furniture & General (est. {job.volume.toFixed(2)} m³, {job.crew} person) · {job.details.name}</div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function MapBox({ label }) {
  return (
    <div className="rounded-xl overflow-hidden border relative" style={{ borderColor: theme.line, height: 150, background: "#DCE6E3" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
        <rect width="400" height="150" fill="#DCE6E3" />
        <path d="M0 40 L400 60" stroke="#B9C9C4" strokeWidth="6" fill="none" />
        <path d="M60 0 L120 150" stroke="#B9C9C4" strokeWidth="5" fill="none" />
        <path d="M0 110 L400 95" stroke="#B9C9C4" strokeWidth="8" fill="none" />
        <path d="M280 0 L250 150" stroke="#B9C9C4" strokeWidth="4" fill="none" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center"><MapPin size={30} color={theme.teal} fill={theme.teal} /><span className="text-xs mt-1 px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fff", color: theme.teal }}>{label}</span></div>
      </div>
    </div>
  );
}

function JobDetail({ job, leg, settings, catalogue, onBack, updateJob }) {
  const s = job[leg];
  const isPickup = leg === "pickup";
  const [showProof, setShowProof] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showInv, setShowInv] = useState(true);

  const setLeg = (fn) => updateJob(job.id, (j) => ({ ...j, [leg]: fn(j[leg]) }));
  const loaded = job.inventory.reduce((a, x) => a + x.loaded, 0);
  const totalUnits = job.inventory.reduce((a, x) => a + x.qty, 0);

  const bump = (id, d) => updateJob(job.id, (j) => ({
    ...j, inventory: j.inventory.map((x) => x.id === id ? { ...x, loaded: Math.max(0, Math.min(x.qty, x.loaded + d)) } : x),
  }));

  const dropoffLocked = leg === "dropoff" && !job.pickup.done;

  return (
    <main className="max-w-2xl mx-auto px-4 py-4 pb-28">
      <button onClick={onBack} className="text-sm mb-3 flex items-center gap-1" style={{ color: theme.muted }}><ChevronLeft size={16} /> My Orders</button>
      <div className="flex items-center justify-between mb-3">
        <div><div className="text-xs font-mono" style={{ color: theme.muted }}>#{job.ref}-{isPickup ? "P" : "D"}</div>
          <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.3rem" }}>{isPickup ? "Pickup" : "Drop-off"}</h1></div>
        <Pill tone={isPickup ? "amber" : "blue"}>{isPickup ? "PICKUP" : "DROPOFF"}</Pill>
      </div>

      <MapBox label={isPickup ? "PICKUP" : "DROPOFF"} />

      <Card className="mt-3">
        <div className="text-sm font-semibold">{s.address}</div>
        <div className="text-xs mt-0.5" style={{ color: theme.muted }}>{s.floor}{s.lift ? " (Lift available)" : ""}</div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div><div className="text-xs" style={{ color: theme.muted }}>Scheduled</div><div className="font-semibold">{s.time}</div></div>
          <div><div className="text-xs" style={{ color: theme.muted }}>Order</div><div className="font-semibold">{job.volume.toFixed(2)} m³ · {job.crew} person</div></div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: theme.line }}>
          <div><div className="text-xs" style={{ color: theme.muted }}>Contact</div><div className="font-semibold text-sm">{job.details.name}</div></div>
          <div className="flex gap-2">
            <a href={`sms:${job.details.phone}`} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.paper }}><MessageSquare size={16} /></a>
            <a href={`tel:${job.details.phone}`} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.teal }}><Phone size={16} color="#fff" /></a>
          </div>
        </div>
      </Card>

      {/* inventory */}
      <Card className="mt-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2"><Boxes size={16} /> Inventory</div>
          <button onClick={() => setShowInv(!showInv)} className="text-sm" style={{ color: theme.teal }}>{showInv ? "Hide" : "Show"}</button>
        </div>
        <div className="text-xs mt-1" style={{ color: theme.muted }}>{isPickup ? "Loaded" : "Unloaded"} {loaded}/{totalUnits}</div>
        {showInv && <div className="mt-3 space-y-2">
          {job.inventory.map((x) => {
            const full = x.loaded >= x.qty;
            return (
              <div key={x.id} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: theme.line }}>
                <div className="flex items-center gap-2"><span className="text-sm">{x.name}</span>{x.added && <Pill tone="grey">added</Pill>}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => bump(x.id, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: theme.line }}><Minus size={13} /></button>
                  <span className="text-sm font-semibold w-10 text-center" style={{ color: full ? theme.teal : theme.ink }}>{x.loaded}/{x.qty}</span>
                  <button onClick={() => bump(x.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: full ? theme.teal : theme.amber }}>{full ? <Check size={13} color="#fff" /> : <Plus size={13} color={theme.ink} />}</button>
                </div>
              </div>
            );
          })}
        </div>}
      </Card>

      {/* extra-item tickets */}
      {job.extras.length > 0 && (
        <Card className="mt-3"><div className="font-semibold flex items-center gap-2 mb-2"><ClipboardList size={16} /> Extra-item tickets</div>
          <div className="space-y-2">{job.extras.map((ex) => (
            <div key={ex.id} className="rounded-xl border p-3" style={{ borderColor: theme.line }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{ex.items.length ? `${ex.items.reduce((a, x) => a + x.qty, 0)} item${ex.items.length > 1 ? "s" : ""}` : "Access charge"}{ex.extraFloors ? ` · +${ex.extraFloors} floor${ex.extraFloors > 1 ? "s" : ""}` : ""}</div>
                <div className="text-sm font-semibold">£{ex.charge}</div>
              </div>
              {ex.items.length > 0 && <ul className="text-xs mt-1" style={{ color: theme.muted }}>
                {ex.items.map((it, ix) => <li key={ix}>{it.qty}× {it.name}</li>)}
              </ul>}
              {ex.vol > 0 && <div className="text-xs mt-1" style={{ color: theme.muted }}>{ex.vol.toFixed(2)} m³ · {Math.round(ex.kg)} kg total</div>}
              <div className="mt-2">
                {ex.status === "sent" && <button onClick={() => approveExtra(job, ex, updateJob)} className="w-full py-2 rounded-lg text-sm font-semibold" style={{ background: theme.teal, color: "#fff" }}>Simulate customer approve & charge card ••4242</button>}
                {ex.status === "paid" && <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: theme.teal }}><Check size={15} /> Paid — added to inventory, ok to load</div>}
              </div>
            </div>
          ))}</div>
        </Card>
      )}

      {/* action bar */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button onClick={() => setShowAdd(true)} className="flex flex-col items-center gap-1 py-3 rounded-xl border" style={{ borderColor: theme.line, background: theme.card }}><PackagePlus size={18} color={theme.amberDk} /><span className="text-xs font-medium">Add item</span></button>
        <button onClick={() => setShowProof(true)} disabled={!s.started} className="flex flex-col items-center gap-1 py-3 rounded-xl border" style={{ borderColor: theme.line, background: theme.card, opacity: s.started ? 1 : .5 }}><Camera size={18} color={theme.teal} /><span className="text-xs font-medium">Photos</span></button>
        <button onClick={() => setShowProof(true)} disabled={!s.started} className="flex flex-col items-center gap-1 py-3 rounded-xl border" style={{ borderColor: theme.line, background: theme.card, opacity: s.started ? 1 : .5 }}><PenLine size={18} color={theme.teal} /><span className="text-xs font-medium">Signature</span></button>
      </div>

      {/* primary action */}
      <div className="fixed bottom-0 left-0 right-0 p-3 border-t" style={{ background: theme.paper, borderColor: theme.line }}>
        <div className="max-w-2xl mx-auto">
          {dropoffLocked ? (
            <div className="text-center text-sm py-2" style={{ color: theme.muted }}>Complete the pickup before starting drop-off.</div>
          ) : s.done ? (
            <div className="text-center text-sm py-3 font-semibold flex items-center justify-center gap-2" style={{ color: theme.teal }}><Check size={18} /> {isPickup ? "Pickup" : "Drop-off"} completed</div>
          ) : !s.started ? (
            <button onClick={() => setLeg((L) => ({ ...L, started: true }))} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{ background: theme.blue }}>{isPickup ? "Start Pickup" : "Start Drop-off"}</button>
          ) : (
            <button onClick={() => setShowProof(true)} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{ background: theme.teal }}>{isPickup ? "Complete pickup — proof" : "Complete drop-off — proof"}</button>
          )}
        </div>
      </div>

      {showAdd && <AddItemSheet settings={settings} catalogue={catalogue} job={job} onClose={() => setShowAdd(false)}
        onCreate={(ticket) => { updateJob(job.id, (j) => ({ ...j, extras: [...j.extras, ticket] })); setShowAdd(false); }} />}
      {showProof && <ProofSheet leg={leg} existing={s.proof} onClose={() => setShowProof(false)}
        onSubmit={(proof) => { setLeg((L) => ({ ...L, proof, done: true })); setShowProof(false); }} />}
    </main>
  );
}

function approveExtra(job, ex, updateJob) {
  updateJob(job.id, (j) => {
    const extras = j.extras.map((e) => e.id === ex.id ? { ...e, status: "paid" } : e);
    let inventory = [...j.inventory];
    ex.items.forEach((item) => {
      const existing = inventory.find((x) => x.id === item.id);
      if (existing && !item.custom) {
        inventory = inventory.map((x) => x.id === item.id ? { ...x, qty: x.qty + item.qty } : x);
      } else {
        inventory.push({ id: item.id, name: item.name, qty: item.qty, m3: item.m3, kg: item.kg, loaded: 0, added: true });
      }
    });
    const t = jobTotals(inventory);
    return { ...j, extras, inventory, volume: t.volume, weight: t.weight, itemCount: t.count, price: j.price + ex.charge };
  });
}

function AddItemSheet({ settings, catalogue, job, onClose, onCreate }) {
  const [mode, setMode] = useState("list");
  const [sel, setSel] = useState(catalogue[0].id);
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState({ name: "", l: "", w: "", h: "", kg: "" });
  const [basket, setBasket] = useState([]);
  const [extraFloors, setExtraFloors] = useState(0);

  const addFromList = () => {
    const it = catalogue.find((x) => x.id === sel);
    setBasket((b) => {
      const ex = b.find((x) => x.id === it.id && !x.custom);
      if (ex) return b.map((x) => x === ex ? { ...x, qty: x.qty + qty } : x);
      return [...b, { id: it.id, name: it.name, qty, m3: it.m3, kg: it.kg, custom: false }];
    });
    setQty(1);
  };
  const addCustom = () => {
    const l = parseFloat(custom.l) || 0, w = parseFloat(custom.w) || 0, h = parseFloat(custom.h) || 0;
    const one = (l * w * h) / 1e6;
    if (!custom.name || one <= 0) return;
    setBasket((b) => [...b, { id: "x" + Date.now(), name: custom.name, qty: 1, m3: one, kg: parseFloat(custom.kg) || 0, custom: true }]);
    setCustom({ name: "", l: "", w: "", h: "", kg: "" });
  };
  const changeQty = (i, d) => setBasket((b) => b.map((x, k) => k === i ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const removeLine = (i) => setBasket((b) => b.filter((_, k) => k !== i));

  const totalVol = basket.reduce((a, x) => a + x.m3 * x.qty, 0);
  const totalKg = basket.reduce((a, x) => a + x.kg * x.qty, 0);
  const totalUnits = basket.reduce((a, x) => a + x.qty, 0);
  const floorUnits = effectiveFloors(settings, job);
  const itemsPart = Math.round(totalVol * settings.perM3 + (settings.perKg > 0 ? totalKg * settings.perKg : 0));
  const floorPart = Math.round(floorUnits * settings.extraPerFloorM3 * totalVol);
  const extraFloorPart = Math.round(extraFloors * (settings.extraFloorFlat || 0));
  const charge = extraItemCharge(settings, totalVol, totalKg, floorUnits, extraFloors);
  const canSend = basket.length > 0 || extraFloors > 0;
  const minApplied = canSend && itemsPart + floorPart + extraFloorPart < settings.extraMinCharge;
  const customValid = custom.name && (parseFloat(custom.l) || 0) * (parseFloat(custom.w) || 0) * (parseFloat(custom.h) || 0) > 0;

  const send = () => {
    if (!canSend) return;
    onCreate({ id: "t" + Date.now(), items: basket, extraFloors, vol: totalVol, kg: totalKg, charge, status: "sent" });
  };

  return (
    <Sheet title="Add items on-site" onClose={onClose}>
      <div className="flex rounded-lg overflow-hidden border mb-3" style={{ borderColor: theme.line }}>
        {["list", "custom"].map((m) => <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 text-sm font-semibold" style={{ background: mode === m ? theme.ink : "#fff", color: mode === m ? "#fff" : theme.ink }}>{m === "list" ? "From list" : "Custom size"}</button>)}
      </div>

      {mode === "list" ? (
        <div className="space-y-3">
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: theme.line }}>
            {categoryOrder.map((c) => <optgroup key={c} label={c}>{catalogue.filter((it) => it.cat === c).map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}</optgroup>)}
          </select>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-sm">Qty</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full border" style={{ borderColor: theme.line }}>-</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-full" style={{ background: theme.amber }}>+</button></div>
            <button onClick={addFromList} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: theme.amber, color: theme.ink }}><Plus size={14} className="inline" /> Add to list</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <TextField value={custom.name} onChange={(v) => setCustom({ ...custom, name: v })} placeholder="Item name, e.g. Treadmill" />
          <div className="grid grid-cols-3 gap-2">
            <NumberField value={custom.l} onChange={(v) => setCustom({ ...custom, l: v })} suffix="L cm" />
            <NumberField value={custom.w} onChange={(v) => setCustom({ ...custom, w: v })} suffix="W cm" />
            <NumberField value={custom.h} onChange={(v) => setCustom({ ...custom, h: v })} suffix="H cm" />
          </div>
          <NumberField value={custom.kg} onChange={(v) => setCustom({ ...custom, kg: v })} suffix="kg" />
          <button disabled={!customValid} onClick={addCustom} className="w-full py-2 rounded-lg text-sm font-semibold" style={{ background: customValid ? theme.amber : "#ddd", color: theme.ink }}><Plus size={14} className="inline" /> Add to list</button>
        </div>
      )}

      {/* basket */}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Items to add {basket.length > 0 && <span style={{ color: theme.muted }}>({totalUnits})</span>}</div>
        {basket.length === 0 ? (
          <div className="text-sm rounded-xl border border-dashed px-3 py-4 text-center" style={{ borderColor: theme.line, color: theme.muted }}>Add one or more items, then send a single quote.</div>
        ) : (
          <div className="space-y-2">
            {basket.map((x, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: theme.line }}>
                <div className="min-w-0"><div className="text-sm truncate">{x.name}</div><div className="text-xs" style={{ color: theme.muted }}>{(x.m3 * x.qty).toFixed(2)} m³ · {Math.round(x.kg * x.qty)} kg</div></div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => changeQty(i, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: theme.line }}><Minus size={13} /></button>
                  <span className="w-6 text-center text-sm font-semibold">{x.qty}</span>
                  <button onClick={() => changeQty(i, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.amber }}><Plus size={13} color={theme.ink} /></button>
                  <button onClick={() => removeLine(i)} className="p-1.5" style={{ color: theme.danger }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* extra floors */}
      <div className="mt-4">
        <div className="text-sm font-semibold">Extra floors (access)</div>
        <div className="text-xs mb-2" style={{ color: theme.muted }}>Charge floors the booking didn't cover — no lift, carried by hand.</div>
        <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: theme.line }}>
          <div className="text-sm">Extra floors <span style={{ color: theme.muted }}>· £{settings.extraFloorFlat}/floor</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setExtraFloors(Math.max(0, extraFloors - 1))} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: theme.line }}><Minus size={13} /></button>
            <span className="w-6 text-center text-sm font-semibold">{extraFloors}</span>
            <button onClick={() => setExtraFloors(extraFloors + 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.amber }}><Plus size={13} color={theme.ink} /></button>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 mt-4" style={{ background: theme.paper }}>
        {basket.length > 0 && <>
          <div className="flex justify-between text-sm"><span style={{ color: theme.muted }}>Added size</span><span>{totalVol.toFixed(2)} m³ · {Math.round(totalKg)} kg</span></div>
          <div className="flex justify-between text-sm mt-1"><span style={{ color: theme.muted }}>Items @ £{settings.perM3}/m³{settings.perKg > 0 ? ` + £${settings.perKg}/kg` : ""}</span><span>£{itemsPart}</span></div>
          <div className="flex justify-between text-sm mt-1"><span style={{ color: theme.muted }}>Floor access ({job.pickup.floor}{job.pickup.lift ? ", lift" : ""} → {job.dropoff.floor}{job.dropoff.lift ? ", lift" : ""})</span><span>£{floorPart}</span></div>
        </>}
        {extraFloors > 0 && <div className="flex justify-between text-sm mt-1"><span style={{ color: theme.muted }}>Extra floors ({extraFloors} × £{settings.extraFloorFlat}, no lift)</span><span>£{extraFloorPart}</span></div>}
        {minApplied && <div className="flex justify-between text-xs mt-1" style={{ color: theme.amberDk }}><span>Minimum charge applied</span><span>£{settings.extraMinCharge}</span></div>}
        <div className="flex justify-between items-end mt-2 pt-2 border-t" style={{ borderColor: theme.line }}><span className="text-sm" style={{ color: theme.muted }}>Total extra to charge{settings.vatEnabled ? " (inc. VAT)" : ""}</span><span style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.5rem" }}>£{canSend ? charge : 0}</span></div>
        <div className="text-xs mt-1" style={{ color: theme.muted }}>Floor access comes from the original booking; extra floors are your on-site correction. One payment for the whole lot.</div>
      </div>

      <button disabled={!canSend} onClick={send} className="mt-4 w-full py-3 rounded-xl font-semibold text-white" style={{ background: canSend ? theme.blue : "#ccc" }}>
        Send quote to customer{canSend ? ` — £${charge}` : ""}
      </button>
      <div className="text-xs text-center mt-2" style={{ color: theme.muted }}>Customer approves once and pays with their saved card. Then load everything.</div>
    </Sheet>
  );
}

function ProofSheet({ leg, existing, onClose, onSubmit }) {
  const [photos, setPhotos] = useState(existing?.photos || []);
  const [name, setName] = useState(existing?.name || "");
  const [sig, setSig] = useState(existing?.signature || "");
  const title = leg === "pickup" ? "Proof of Pickup" : "Proof of Delivery";
  const ready = photos.length > 0 && name.trim() && sig;
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="text-sm font-semibold mb-2">Photos <span style={{ color: theme.danger }}>*</span></div>
      <PhotoUploader photos={photos} onAdd={(p) => setPhotos([...photos, p])} onRemove={(i) => setPhotos(photos.filter((_, k) => k !== i))} />
      <div className="text-sm font-semibold mt-4 mb-1">Name of person confirming <span style={{ color: theme.danger }}>*</span></div>
      <TextField value={name} onChange={setName} placeholder="Full name" />
      <div className="text-sm font-semibold mt-4 mb-2">Signature <span style={{ color: theme.danger }}>*</span></div>
      <div className="text-xs mb-2" style={{ color: theme.muted }}>Please sign to acknowledge {leg === "pickup" ? "collection" : "delivery"} of the items on the booking.</div>
      <SignaturePad onChange={setSig} />
      <button disabled={!ready} onClick={() => onSubmit({ photos, name, signature: sig, at: new Date().toISOString() })}
        className="mt-4 w-full py-3 rounded-xl font-semibold text-white" style={{ background: ready ? theme.blue : "#ccc" }}>Submit</button>
      {!ready && <div className="text-xs text-center mt-2" style={{ color: theme.muted }}>Add at least one photo, a name and a signature.</div>}
    </Sheet>
  );
}

function Sheet({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,.4)" }} onClick={onClose}>
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: theme.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3"><h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.15rem" }}>{title}</h3><button onClick={onClose}><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================ OWNER */
function OwnerArea({ settings, setSetting, catalogue, setCatalogue, jobs, leads }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState("inbox");
  if (!unlocked) {
    return (<div className="max-w-sm mx-auto pt-20 px-4 text-center">
      <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: theme.ink }}><Lock size={24} color={theme.amber} /></div>
      <h2 style={{ fontFamily: font.display, fontWeight: 600 }}>Owner access</h2>
      <p className="text-sm mt-1 mb-4" style={{ color: theme.muted }}>Enter your PIN (demo: {settings.ownerPin})</p>
      <TextField value={pin} onChange={setPin} placeholder="PIN" type="password" />
      <button onClick={() => setUnlocked(pin === settings.ownerPin)} className="mt-3 w-full py-3 rounded-xl font-semibold" style={{ background: theme.ink, color: "#fff" }}>Unlock</button>
      {pin && pin !== settings.ownerPin && <p className="text-xs mt-2" style={{ color: theme.danger }}>Wrong PIN.</p>}
    </div>);
  }
  const tabs = [{ id: "inbox", label: "Jobs", icon: Inbox }, { id: "leads", label: "Leads", icon: User }, { id: "pricing", label: "Pricing", icon: Sliders }, { id: "catalogue", label: "Catalogue", icon: Boxes }, { id: "brand", label: "Business", icon: Truck }];
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-5 overflow-x-auto">{tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap" style={{ background: tab === t.id ? theme.ink : "#fff", color: tab === t.id ? "#fff" : theme.ink, border: `1px solid ${theme.line}` }}>
          <t.icon size={15} /> {t.label}
          {t.id === "inbox" && jobs.length > 0 && <span className="ml-1 text-xs px-1.5 rounded-full" style={{ background: theme.amber, color: theme.ink }}>{jobs.length}</span>}
          {t.id === "leads" && leads.length > 0 && <span className="ml-1 text-xs px-1.5 rounded-full" style={{ background: theme.amber, color: theme.ink }}>{leads.length}</span>}</button>))}</div>
      {tab === "inbox" && <InboxTab jobs={jobs} />}
      {tab === "leads" && <LeadsTab leads={leads} />}
      {tab === "pricing" && <PricingTab settings={settings} setSetting={setSetting} />}
      {tab === "catalogue" && <CatalogueTab catalogue={catalogue} setCatalogue={setCatalogue} />}
      {tab === "brand" && <BrandTab settings={settings} setSetting={setSetting} />}
    </div>
  );
}
function LeadsTab({ leads }) {
  if (!leads.length) return <Card><div className="text-center py-8" style={{ color: theme.muted }}><User size={32} className="mx-auto mb-2" />No leads yet. Every email captured at the quote step lands here — even if they don't book — for your marketing list.</div></Card>;
  const copyAll = () => { try { navigator.clipboard.writeText(leads.map((l) => l.email).join(", ")); } catch (e) { } };
  return (<div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-sm" style={{ color: theme.muted }}>{leads.length} captured email(s) — your marketing list.</div>
      <button onClick={copyAll} className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ background: theme.ink, color: "#fff" }}>Copy emails</button>
    </div>
    {leads.map((l) => (
      <Card key={l.id}>
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">{l.email}</div>
          <div className="text-sm" style={{ color: theme.muted }}>~£{l.total}</div>
        </div>
        <div className="text-xs mt-1" style={{ color: theme.muted }}>{l.phone} · {l.route} · {typeof l.volume === "number" ? l.volume.toFixed(2) + " m³" : ""}</div>
      </Card>
    ))}
  </div>);
}
function InboxTab({ jobs }) {
  if (jobs.length === 0) return <Card><div className="text-center py-8" style={{ color: theme.muted }}><Inbox size={32} className="mx-auto mb-2" />No jobs yet.</div></Card>;
  const statusOf = (j) => j.dropoff.done ? "Completed" : j.pickup.done ? "In transit" : j.pickup.started ? "At pickup" : "Scheduled";
  return (<div className="space-y-3">{jobs.map((b) => (
    <Card key={b.id}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Pill tone="teal">#{b.ref}</Pill><Pill>{b.pkg === "premium" ? "Premium" : "Standard"}</Pill><Pill tone="grey">{statusOf(b)}</Pill></div>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: "1.2rem" }}>£{b.price.toLocaleString()}</div>
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <div><span style={{ color: theme.muted }}>Customer: </span>{b.details.name}</div>
        <div><span style={{ color: theme.muted }}>Phone: </span>{b.details.phone}</div>
        <div className="md:col-span-2"><span style={{ color: theme.muted }}>Pickup: </span>{b.pickup.address}</div>
        <div className="md:col-span-2"><span style={{ color: theme.muted }}>Drop-off: </span>{b.dropoff.address}</div>
        <div className="md:col-span-2"><span style={{ color: theme.muted }}>Load: </span>{b.itemCount} items · {b.volume.toFixed(2)} m³ · {Math.round(b.weight)} kg</div>
      </div>
      {b.extras.filter((e) => e.status === "paid").length > 0 && <div className="mt-2 text-sm" style={{ color: theme.teal }}>+ {b.extras.filter((e) => e.status === "paid").length} paid extra(s) added on-site</div>}
      <div className="mt-3 flex gap-4 text-xs" style={{ color: theme.muted }}>
        <span>Pickup proof: {b.pickup.proof ? `${b.pickup.proof.photos.length} photo(s), signed` : "—"}</span>
        <span>Delivery proof: {b.dropoff.proof ? `${b.dropoff.proof.photos.length} photo(s), signed` : "—"}</span>
      </div>
      {(b.pickup.proof || b.dropoff.proof) && <div className="mt-2 flex gap-2 flex-wrap">
        {[b.pickup.proof, b.dropoff.proof].filter(Boolean).flatMap((pf, gi) => [
          ...pf.photos.map((p, i) => <img key={gi + "-" + i} src={p} alt="" className="w-14 h-14 rounded-lg object-cover border" style={{ borderColor: theme.line }} />),
          pf.signature ? <img key={gi + "-sig"} src={pf.signature} alt="signature" className="w-20 h-14 rounded-lg object-contain border bg-white" style={{ borderColor: theme.line }} /> : null,
        ])}
      </div>}
    </Card>))}</div>);
}
function PricingTab({ settings, setSetting }) {
  const Row = ({ label, hint, k, prefix, suffix, step }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b" style={{ borderColor: theme.line }}>
      <div><div className="text-sm font-medium">{label}</div><div className="text-xs" style={{ color: theme.muted }}>{hint}</div></div>
      <NumberField value={settings[k]} onChange={(v) => setSetting(k, v)} prefix={prefix} suffix={suffix} step={step} style={{ width: 150 }} /></div>);
  return (<Card>
    <h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.2rem" }}>Pricing factors</h2>
    <p className="text-sm mb-2" style={{ color: theme.muted }}>Drives both the online quote and on-site extra items.</p>
    <Row label="Call-out & handling" hint="Fixed on every job" k="baseCallout" prefix="£" />
    <Row label="Price per mile" hint="Distance charge" k="perMile" prefix="£" step={0.1} />
    <Row label="Price per m³" hint="Main size charge" k="perM3" prefix="£" />
    <Row label="Price per kg" hint="Heavy-item charge — feeds quotes & extras (0 = size only)" k="perKg" prefix="£" step={0.05} />
    <Row label="Per floor (no lift)" hint="Per floor above ground, each address" k="perFloor" prefix="£" />
    <Row label="Lift factor" hint="Floors cost this fraction with a lift" k="liftFactor" step={0.05} />
    <Row label="Premium multiplier" hint="Premium = Standard × this" k="premiumMultiplier" step={0.1} />
    <Row label="Packing materials" hint="Added to Premium only" k="packingMaterials" prefix="£" />
    <Row label="Minimum price" hint="Never quote below this" k="minPrice" prefix="£" />
    <Row label="Extra-item minimum" hint="Floor for on-site add-ons" k="extraMinCharge" prefix="£" />
    <Row label="Extra floor rate" hint="On-site add-ons: £ per floor above ground per m³ (lift-adjusted)" k="extraPerFloorM3" prefix="£" step={0.5} />
    <Row label="Extra floor (correction)" hint="Driver-added floors: flat £ per floor (no lift, carried by hand)" k="extraFloorFlat" prefix="£" />
    <Row label="Luton van capacity" hint="For the van-fill gauge" k="vanCapacity" suffix="m³" />
    <div className="flex items-center justify-between py-3"><div><div className="text-sm font-medium">Add 20% VAT</div><div className="text-xs" style={{ color: theme.muted }}>Turn on once VAT registered</div></div>
      <button onClick={() => setSetting("vatEnabled", !settings.vatEnabled)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: settings.vatEnabled ? theme.teal : "#fff", color: settings.vatEnabled ? "#fff" : theme.ink, border: `1px solid ${theme.line}` }}>{settings.vatEnabled ? "On" : "Off"}</button></div>
  </Card>);
}
function CatalogueTab({ catalogue, setCatalogue }) {
  const [nn, setNn] = useState({ name: "", cat: categoryOrder[0], m3: "", kg: "" });
  const update = (id, k, v) => setCatalogue((c) => c.map((it) => it.id === id ? { ...it, [k]: v } : it));
  const remove = (id) => setCatalogue((c) => c.filter((it) => it.id !== id));
  const addItem = () => { if (!nn.name) return; setCatalogue((c) => [...c, { id: "c" + Date.now(), name: nn.name, cat: nn.cat, m3: parseFloat(nn.m3) || 0, kg: parseFloat(nn.kg) || 0 }]); setNn({ name: "", cat: categoryOrder[0], m3: "", kg: "" }); };
  return (<Card>
    <h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.2rem" }}>Item catalogue</h2>
    <p className="text-sm mb-3" style={{ color: theme.muted }}>Set each item's size and weight — this drives the auto-calculation.</p>
    <div className="rounded-xl border p-3 mb-4" style={{ borderColor: theme.line, background: theme.paper }}>
      <div className="text-sm font-medium mb-2">Add a new item</div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <input value={nn.name} onChange={(e) => setNn({ ...nn, name: e.target.value })} placeholder="Name" className="px-3 py-2 text-sm rounded-lg border outline-none col-span-2" style={{ borderColor: theme.line }} />
        <select value={nn.cat} onChange={(e) => setNn({ ...nn, cat: e.target.value })} className="px-2 py-2 text-sm rounded-lg border" style={{ borderColor: theme.line }}>{categoryOrder.map((c) => <option key={c}>{c}</option>)}</select>
        <input value={nn.m3} onChange={(e) => setNn({ ...nn, m3: e.target.value })} placeholder="m³" className="px-3 py-2 text-sm rounded-lg border outline-none" style={{ borderColor: theme.line }} />
        <input value={nn.kg} onChange={(e) => setNn({ ...nn, kg: e.target.value })} placeholder="kg" className="px-3 py-2 text-sm rounded-lg border outline-none" style={{ borderColor: theme.line }} />
      </div>
      <button onClick={addItem} className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: theme.amber, color: theme.ink }}><Plus size={14} className="inline" /> Add item</button>
    </div>
    <div className="space-y-1">{categoryOrder.map((cat) => (
      <div key={cat}><div className="text-xs font-semibold uppercase mt-3 mb-1" style={{ color: theme.muted, letterSpacing: ".05em" }}>{cat}</div>
        {catalogue.filter((it) => it.cat === cat).map((it) => (
          <div key={it.id} className="flex items-center gap-2 py-1.5"><div className="flex-1 text-sm">{it.name}</div>
            <NumberField value={it.m3} onChange={(v) => update(it.id, "m3", v)} suffix="m³" step={0.1} style={{ width: 96 }} />
            <NumberField value={it.kg} onChange={(v) => update(it.id, "kg", v)} suffix="kg" style={{ width: 96 }} />
            <button onClick={() => remove(it.id)} className="p-2" style={{ color: theme.danger }}><Trash2 size={15} /></button></div>))}</div>))}</div>
  </Card>);
}
function BrandTab({ settings, setSetting }) {
  return (<Card><h2 style={{ fontFamily: font.display, fontWeight: 600, fontSize: "1.2rem" }}>Business details</h2>
    <div className="space-y-3 mt-3 max-w-md">
      <div><label className="text-sm font-medium">Business name</label><TextField value={settings.businessName} onChange={(v) => setSetting("businessName", v)} /></div>
      <div><label className="text-sm font-medium">Phone number</label><TextField value={settings.phone} onChange={(v) => setSetting("phone", v)} /></div>
      <div><label className="text-sm font-medium">Owner PIN</label><TextField value={settings.ownerPin} onChange={(v) => setSetting("ownerPin", v)} /></div>
      <div><label className="text-sm font-medium">Driver PIN</label><TextField value={settings.driverPin} onChange={(v) => setSetting("driverPin", v)} /></div>
      <div><label className="text-sm font-medium">Review score (shown on site)</label><NumberField value={settings.rating} onChange={(v) => setSetting("rating", v)} step={0.01} style={{ width: 150 }} /></div>
      <div><label className="text-sm font-medium">Reviews caption</label><TextField value={settings.reviewsText} onChange={(v) => setSetting("reviewsText", v)} /></div>
    </div></Card>);
}
