import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CachedValue = {
  data: unknown;
  timestamp: number;
};

type PresetResult = {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: [string, string, string, string];
};

const CACHE_TTL_MS = 1000 * 60 * 30;
const memoryCache = new Map<string, CachedValue>();

let lastRequestTime = 0;

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function makePreset(
  lat: number,
  lon: number,
  displayName: string,
  south: number,
  north: number,
  west: number,
  east: number
): PresetResult {
  return {
    lat: String(lat),
    lon: String(lon),
    display_name: displayName,
    boundingbox: [String(south), String(north), String(west), String(east)],
  };
}

const PRESET_LOCATIONS: Record<string, PresetResult[]> = {
  pasig: [
    makePreset(
      14.5764,
      121.0851,
      "Pasig, Metro Manila, Philippines",
      14.535,
      14.615,
      121.04,
      121.12
    ),
  ],
  "quezon city": [
    makePreset(
      14.676,
      121.0437,
      "Quezon City, Metro Manila, Philippines",
      14.61,
      14.77,
      121.0,
      121.12
    ),
  ],
  qc: [
    makePreset(
      14.676,
      121.0437,
      "Quezon City, Metro Manila, Philippines",
      14.61,
      14.77,
      121.0,
      121.12
    ),
  ],
  manila: [
    makePreset(
      14.5995,
      120.9842,
      "Manila, Metro Manila, Philippines",
      14.56,
      14.66,
      120.95,
      121.03
    ),
  ],
  makati: [
    makePreset(
      14.5547,
      121.0244,
      "Makati, Metro Manila, Philippines",
      14.52,
      14.58,
      121.0,
      121.06
    ),
  ],
  taguig: [
    makePreset(
      14.5176,
      121.0509,
      "Taguig, Metro Manila, Philippines",
      14.47,
      14.56,
      121.01,
      121.09
    ),
  ],
  bgc: [
    makePreset(
      14.5508,
      121.0501,
      "Bonifacio Global City, Taguig, Metro Manila, Philippines",
      14.54,
      14.56,
      121.04,
      121.06
    ),
  ],
  "bonifacio global city": [
    makePreset(
      14.5508,
      121.0501,
      "Bonifacio Global City, Taguig, Metro Manila, Philippines",
      14.54,
      14.56,
      121.04,
      121.06
    ),
  ],
  pasay: [
    makePreset(
      14.5378,
      121.0014,
      "Pasay, Metro Manila, Philippines",
      14.50,
      14.56,
      120.97,
      121.03
    ),
  ],
  parañaque: [
    makePreset(
      14.4793,
      121.0198,
      "Parañaque, Metro Manila, Philippines",
      14.44,
      14.52,
      120.98,
      121.05
    ),
  ],
  paranaque: [
    makePreset(
      14.4793,
      121.0198,
      "Parañaque, Metro Manila, Philippines",
      14.44,
      14.52,
      120.98,
      121.05
    ),
  ],
  caloocan: [
    makePreset(
      14.6577,
      120.9831,
      "Caloocan, Metro Manila, Philippines",
      14.61,
      14.75,
      120.95,
      121.02
    ),
  ],
  marikina: [
    makePreset(
      14.6507,
      121.1029,
      "Marikina, Metro Manila, Philippines",
      14.61,
      14.69,
      121.07,
      121.14
    ),
  ],
  mandaluyong: [
    makePreset(
      14.5795,
      121.0353,
      "Mandaluyong, Metro Manila, Philippines",
      14.56,
      14.60,
      121.02,
      121.05
    ),
  ],
  "san juan": [
    makePreset(
      14.6019,
      121.0355,
      "San Juan, Metro Manila, Philippines",
      14.59,
      14.62,
      121.02,
      121.05
    ),
  ],
  sampaloc: [
    makePreset(
      14.6122,
      120.9896,
      "Sampaloc, Manila, Metro Manila, Philippines",
      14.595,
      14.625,
      120.975,
      121.005
    ),
  ],
  tondo: [
    makePreset(
      14.6206,
      120.967,
      "Tondo, Manila, Metro Manila, Philippines",
      14.60,
      14.65,
      120.95,
      120.99
    ),
  ],
  ust: [
    makePreset(
      14.6091,
      120.9897,
      "University of Santo Tomas, Sampaloc, Manila, Philippines",
      14.603,
      14.614,
      120.983,
      120.996
    ),
  ],
  "españa boulevard": [
    makePreset(
      14.611,
      120.991,
      "España Boulevard, Sampaloc, Manila, Philippines",
      14.602,
      14.622,
      120.981,
      121.002
    ),
  ],
  "espana boulevard": [
    makePreset(
      14.611,
      120.991,
      "España Boulevard, Sampaloc, Manila, Philippines",
      14.602,
      14.622,
      120.981,
      121.002
    ),
  ],
  "aurora boulevard": [
    makePreset(
      14.6048,
      121.002,
      "Aurora Boulevard, Metro Manila, Philippines",
      14.59,
      14.62,
      120.98,
      121.04
    ),
  ],
  "guirayan street": [
    makePreset(
      14.6035,
      121.0345,
      "Guirayan Street, San Juan, Metro Manila, Philippines",
      14.598,
      14.608,
      121.029,
      121.04
    ),
  ],
};

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSearch(query: string) {
  const cacheKey = normalizeQuery(query);
  const now = Date.now();

  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const elapsed = now - lastRequestTime;
  if (elapsed < 1500) {
    await wait(1500 - elapsed);
  }

  lastRequestTime = Date.now();

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      format: "jsonv2",
      q: query,
      countrycodes: "ph",
      addressdetails: "1",
      limit: "5",
    }).toString();

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": "Frontend-Tribe-master/1.0",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Too many searches too quickly. Please wait a few seconds and try again.");
    }
    throw new Error(`Nominatim failed: ${response.status}`);
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid geocoding response.");
  }

  memoryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q")?.trim();

  if (!rawQuery) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  if (rawQuery.length < 3) {
    return NextResponse.json({ error: "Type at least 3 characters." }, { status: 400 });
  }

  const normalized = normalizeQuery(rawQuery);

  if (PRESET_LOCATIONS[normalized]) {
    return NextResponse.json(PRESET_LOCATIONS[normalized], { status: 200 });
  }

  try {
    const attempts = [
      `${rawQuery}, Metro Manila, Philippines`,
      `${rawQuery}, NCR, Philippines`,
      `${rawQuery}, Philippines`,
      rawQuery,
    ];

    const parts = rawQuery.split(',').map(p => p.trim());
    if (parts.length > 1) {
       attempts.push(`${parts.slice(-2).join(', ')}, Philippines`);
       attempts.push(`${parts[parts.length - 1]}, Philippines`);
    }

    for (const query of attempts) {
      const data = await runSearch(query);

      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data, { status: 200 });
      }
    }

    // If all geocoding fails, check if the string contains a known preset
    for (const key of Object.keys(PRESET_LOCATIONS)) {
       if (normalized.includes(key)) {
           return NextResponse.json(PRESET_LOCATIONS[key], { status: 200 });
       }
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search location.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}