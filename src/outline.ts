export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

const HEADING_TAG_RE = /^h([1-6])$/i;

export function buildOutline(html: string): OutlineItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items: OutlineItem[] = [];
  const seenIds = new Set<string>();

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  let node: Element | null;

  while ((node = walker.nextNode() as Element | null)) {
    const match = node.tagName.match(HEADING_TAG_RE);
    if (!match) continue;

    const level = Number(match[1]);
    const text = node.textContent?.trim() || '';
    if (!text) continue;

    let id = node.getAttribute('id')?.trim();
    if (!id) {
      id = generateId(text, seenIds);
    } else if (seenIds.has(id)) {
      id = generateId(`${id}-${seenIds.size}`, seenIds);
    }
    seenIds.add(id);

    items.push({ id, text, level });
  }

  return items;
}

function generateId(text: string, seen: Set<string>): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\u0400-\u04FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  let id = base || 'section';
  let counter = 1;
  const original = id;
  while (seen.has(id)) {
    id = `${original}-${counter++}`;
  }
  return id;
}
