import type { CollectionEntry } from "astro:content";

export interface ResolvedGroupLink {
    title: string;
    url: string;
}

export function normalizeSlug(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

export function resolveRealityUrl(
    realityName: string | undefined,
    allLoreEntries: CollectionEntry<"lore">[],
): string | null {
    if (!realityName) return null;
    const norm = normalizeSlug(realityName);
    const match = allLoreEntries.find(
        (item) =>
            item.data.category === "localizaciones" &&
            (normalizeSlug(item.data.title) === norm ||
                normalizeSlug(item.id.split("/").pop() || "") === norm),
    );
    if (!match) return null;
    const slug = match.id.split("/").pop() || match.id;
    return `/lore/${match.data.category}/${slug}`;
}

export function resolveCharacterGroups(
    charGroups: string[] | undefined,
    allLoreEntries: CollectionEntry<"lore">[],
): ResolvedGroupLink[] {
    if (!charGroups || charGroups.length === 0) return [];

    const allGroups = allLoreEntries.filter(
        (item) =>
            item.data.category === "grupos" ||
            item.data.category === "organizaciones",
    );

    return charGroups.map((groupName) => {
        const groupEntry = allGroups.find(
            (g) => g.id.split("/").pop() === groupName,
        );
        if (groupEntry) {
            return {
                title: groupEntry.data.title,
                url: `/lore/${groupEntry.data.category}/${groupName}`,
            };
        }
        return {
            title: groupName
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            url: `/lore/grupos/${groupName}`,
        };
    });
}

export function resolveGroupMembers(
    groupSlug: string,
    allCharacters: CollectionEntry<"characters">[],
): CollectionEntry<"characters">[] {
    if (!groupSlug) return [];
    return allCharacters
        .filter((char) => (char.data.groups || []).includes(groupSlug))
        .sort((a, b) =>
            (a.data.alias || a.data.name).localeCompare(
                b.data.alias || b.data.name,
            ),
        );
}

export function buildRpgDataLookup(
    allRpgEntries: CollectionEntry<"rpg">[],
): Map<string, CollectionEntry<"rpg">["data"]> {
    const map = new Map<string, CollectionEntry<"rpg">["data"]>();
    for (const entry of allRpgEntries) {
        map.set(entry.id, entry.data);
        const normalizedId = entry.id.toLowerCase().replace(/[._\s]+/g, "-");
        if (!map.has(normalizedId)) {
            map.set(normalizedId, entry.data);
        }
    }
    return map;
}

export function resolveRpgData(
    rpgId: string | undefined,
    rpgLookup: Map<string, CollectionEntry<"rpg">["data"]>,
): CollectionEntry<"rpg">["data"] | null {
    if (!rpgId) return null;
    const direct = rpgLookup.get(rpgId);
    if (direct) return direct;
    const normalizedId = rpgId.toLowerCase().replace(/[._\s]+/g, "-");
    return rpgLookup.get(normalizedId) || null;
}
