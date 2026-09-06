import { geoNaturalEarth1, geoPath } from "d3-geo";
import worldRaw from "@/data/world.json";
import countriesRaw from "@/data/countries.json";

export type CountryMeta = {
  id: string;
  name: string;
  en: string;
  region: string;
  subregion: string;
  languages: string[];
  independent: boolean;
  area: number;
};

type RawFeature = { id: string; name: string; geometry: GeoJSON.Geometry };

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

const features = worldRaw as unknown as RawFeature[];
export const countries = countriesRaw as unknown as CountryMeta[];
export const countryById = new Map(countries.map((c) => [c.id, c]));

const collection = {
  type: "FeatureCollection" as const,
  features: features.map((f) => ({
    type: "Feature" as const,
    id: f.id,
    properties: {},
    geometry: f.geometry,
  })),
};

const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [MAP_WIDTH - 8, MAP_HEIGHT - 8],
  ],
  collection,
);
const path = geoPath(projection);

export type Shape = {
  id: string;
  d: string;
  bounds: [[number, number], [number, number]];
};

export const shapes: Shape[] = collection.features
  .map((f) => ({
    id: f.id as string,
    d: path(f) ?? "",
    bounds: path.bounds(f) as [[number, number], [number, number]],
  }))
  .filter((s) => s.d.length > 0);

const shapeById = new Map(shapes.map((s) => [s.id, s]));

/** Ellipse (in map coordinates) enclosing every country of a group. */
export function groupEllipse(ids: string[]) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const id of ids) {
    const s = shapeById.get(id);
    if (!s) continue;
    // Skip far-flung overseas territories that would blow up the ellipse.
    const [[bx0, by0], [bx1, by1]] = s.bounds;
    x0 = Math.min(x0, bx0);
    y0 = Math.min(y0, by0);
    x1 = Math.max(x1, bx1);
    y1 = Math.max(y1, by1);
  }
  if (!isFinite(x0)) return null;
  return {
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    rx: Math.max((x1 - x0) / 2 + 14, 20),
    ry: Math.max((y1 - y0) / 2 + 14, 20),
  };
}

export function idsInRegion(region: string) {
  return countries.filter((c) => c.region === region).map((c) => c.id);
}

export function idsInSubregion(subregion: string) {
  return countries.filter((c) => c.subregion === subregion).map((c) => c.id);
}

/** Countries used as quiz answers: independent and big enough to click. */
export const quizPool = countries.filter(
  (c) => c.independent && c.area > 2500 && shapeById.has(c.id),
);
