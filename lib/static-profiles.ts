// lib/static-profiles.ts
import fs from 'node:fs/promises'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'data', 'profiles')

export async function getAllSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(DIR)
    return files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/,''))
  } catch {
    return []
  }
}

export async function getProfileFromDisk(slug: string): Promise<any | null> {
  try {
    const file = path.join(DIR, `${slug}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function listRelatedByTags(tags: string[] = [], excludeSlug?: string) {
  const slugs = await getAllSlugs()
  const items: any[] = []
  for (const s of slugs) {
    if (s === excludeSlug) continue
    const p = await getProfileFromDisk(s)
    if (!p) continue
    const ptags = Array.isArray(p.tags) ? p.tags : []
    if (tags.some(t => ptags.includes(t))) items.push(p)
  }
  return items.slice(0, 6)
}