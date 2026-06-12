import { Children, cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Variant = "default" | "list" | "grid" | "detail" | "form" | "table";

interface PageSkeletonProps {
  /** Optional explicit variant. If omitted and `children` is provided, the
   *  skeleton auto-detects which blocks to render by scanning the children. */
  variant?: Variant;
  /** Pass the real page (or a representative tree) to auto-detect layout
   *  blocks: <table>, grids, lists, forms, detail layouts. */
  children?: ReactNode;
  /** Force-include extra blocks regardless of detection. */
  include?: Variant[];
  /** When `children` is provided, mirror the actual JSX tree structure
   *  instead of rendering predefined blocks. Defaults to true. */
  mirror?: boolean;
  className?: string;
}

/* ---------- Detection ---------- */

const GRID_RE = /\bgrid-cols-|\bgrid\b/;
const LIST_RE = /\bspace-y-|\bdivide-y\b/;
const DETAIL_RE = /\bmd:grid-cols-2\b|\blg:grid-cols-2\b/;

function detectBlocks(node: ReactNode, found: Set<Variant>) {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as any;
    const tag = typeof type === "string" ? type.toLowerCase() : "";
    const className: string = child.props?.className ?? "";

    if (tag === "table" || type?.displayName === "Table") found.add("table");
    if (tag === "form") found.add("form");
    if (tag === "input" || tag === "textarea" || tag === "select") found.add("form");
    if (DETAIL_RE.test(className)) found.add("detail");
    else if (GRID_RE.test(className)) found.add("grid");
    if (LIST_RE.test(className) && !found.has("grid")) found.add("list");

    if (child.props?.children) detectBlocks(child.props.children, found);
  });
}

/* ---------- Block renderers ---------- */

const Header = () => (
  <div className="mb-10 space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-10 w-2/3 md:w-1/2" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const GridBlock = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ))}
  </div>
);

const ListBlock = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

const DetailBlock = () => (
  <div className="grid md:grid-cols-2 gap-10">
    <Skeleton className="aspect-square w-full rounded-xl" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  </div>
);

const FormBlock = () => (
  <div className="max-w-xl mx-auto space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    ))}
    <Skeleton className="h-12 w-full rounded-lg mt-6" />
  </div>
);

const TableBlock = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: 6 }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
        {Array.from({ length: 4 }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const DefaultBlock = () => (
  <div className="space-y-4">
    <Skeleton className="h-64 w-full rounded-xl" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);

const blockMap: Record<Variant, () => JSX.Element> = {
  default: DefaultBlock,
  list: ListBlock,
  grid: GridBlock,
  detail: DetailBlock,
  form: FormBlock,
  table: TableBlock,
};

/* ---------- Mirror mode: clone the real tree, replace leaves with skeletons ---------- */

const LEAF_TAGS = new Set([
  "img", "input", "textarea", "select", "button", "a",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label", "li",
]);

const SKELETON_NAMES = new Set([
  "Button", "Input", "Textarea", "Label", "Badge", "Avatar", "AvatarImage", "AvatarFallback",
]);

function getName(el: ReactElement): string {
  const t: any = el.type;
  if (typeof t === "string") return t;
  return t?.displayName || t?.name || "";
}

function leafSkeleton(el: ReactElement, key?: React.Key): ReactNode {
  const tag = typeof el.type === "string" ? el.type.toLowerCase() : "";
  const name = getName(el);
  const className: string = el.props?.className ?? "";

  // Images / avatars / icons inside circles
  if (tag === "img" || name === "AvatarImage") {
    return <Skeleton key={key} className={cn("h-full w-full rounded-md", className)} />;
  }
  if (name === "Avatar" || /\brounded-full\b/.test(className)) {
    const sized = /\bw-\d+|\bh-\d+/.test(className) ? className : cn(className, "h-12 w-12");
    return <Skeleton key={key} className={cn("rounded-full", sized)} />;
  }
  // Inputs / form controls
  if (tag === "input" || tag === "textarea" || tag === "select" || ["Input", "Textarea", "Select"].includes(name)) {
    return <Skeleton key={key} className="h-10 w-full rounded-md" />;
  }
  if (tag === "button" || name === "Button") {
    return <Skeleton key={key} className={cn("h-10 rounded-md", /\bw-full\b/.test(className) ? "w-full" : "w-28")} />;
  }
  if (name === "Badge") {
    return <Skeleton key={key} className="h-5 w-16 rounded-full" />;
  }
  // Headings
  if (/^h[1-3]$/.test(tag)) {
    return <Skeleton key={key} className="h-7 w-2/3" />;
  }
  if (/^h[4-6]$/.test(tag)) {
    return <Skeleton key={key} className="h-5 w-1/3" />;
  }
  // Text-ish
  if (tag === "p" || tag === "span" || tag === "label" || name === "Label") {
    return <Skeleton key={key} className="h-4 w-1/2" />;
  }
  if (tag === "li") {
    return <Skeleton key={key} className="h-4 w-full" />;
  }
  return null;
}

function mirrorTree(node: ReactNode, depth = 0, key?: React.Key): ReactNode {
  if (node == null || typeof node === "boolean") return null;
  if (typeof node === "string" || typeof node === "number") {
    // Standalone text node — render a small line
    const text = String(node).trim();
    if (!text) return null;
    const w = Math.min(96, Math.max(16, text.length * 6));
    return <Skeleton key={key} className="h-4 inline-block align-middle" style={{ width: w }} />;
  }
  if (Array.isArray(node)) {
    return node.map((c, i) => mirrorTree(c, depth, i));
  }
  if (!isValidElement(node)) return null;

  const el = node as ReactElement;
  const tag = typeof el.type === "string" ? el.type.toLowerCase() : "";
  const name = getName(el);

  // Leaf replacement
  if (LEAF_TAGS.has(tag) || SKELETON_NAMES.has(name)) {
    return leafSkeleton(el, key);
  }

  // Skip portals / heavy non-layout components but keep their structure shell
  if (tag === "svg" || name === "Icon") {
    return <Skeleton key={key} className="h-5 w-5 rounded" />;
  }

  // Container: clone, preserve className, recurse into children
  const children = el.props?.children;
  const mirrored = mirrorTree(children, depth + 1);

  // Strip event handlers / refs that don't matter for layout
  const safeProps: any = { key };
  if (el.props?.className) safeProps.className = el.props.className;
  if (el.props?.style) safeProps.style = el.props.style;

  // For known shadcn primitives that render layout, keep them
  if (typeof el.type !== "string" && !["Card", "CardContent", "CardHeader", "CardFooter", "CardTitle", "CardDescription"].includes(name)) {
    // For arbitrary components we can't safely render, fall back to a plain div with same className
    return (
      <div {...safeProps}>{mirrored}</div>
    );
  }

  return cloneElement(el, safeProps, mirrored);
}

/**
 * Reusable page-level skeleton loader.
 * Use across pages to show a consistent loading state:
 *
 *   if (loading) return <PageSkeleton variant="grid" />;
 */
/**
 * Page-level skeleton loader.
 *
 * Three ways to use it:
 *
 * 1. Explicit variant:
 *      <PageSkeleton variant="table" />
 *
 * 2. Auto-detect from a representative tree (recommended for reuse):
 *      <PageSkeleton>
 *        <MyPage />
 *      </PageSkeleton>
 *    The component inspects the React tree for tables, grids, lists, forms,
 *    or detail layouts and renders matching skeleton blocks — so the same
 *    component reacts to whatever the page actually contains.
 *
 * 3. Force-include extra blocks:
 *      <PageSkeleton include={["table", "grid"]} />
 */
export const PageSkeleton = ({ variant, children, include, mirror = true, className }: PageSkeletonProps) => {
  // Mirror mode: when children are provided and no explicit variant/include,
  // clone the real tree and replace leaves with skeletons. This adapts to ANY
  // layout (profile cards, mixed grid+form+detail, etc.) automatically.
  if (children && mirror && !variant && !include?.length) {
    return (
      <div className={cn("min-h-screen bg-background animate-pulse-soft", className)} aria-busy="true">
        <div className="pointer-events-none select-none [&_*]:!text-transparent">
          {mirrorTree(children)}
        </div>
      </div>
    );
  }

  const blocks = new Set<Variant>();
  if (variant) blocks.add(variant);
  if (children) detectBlocks(children, blocks);
  include?.forEach((b) => blocks.add(b));
  if (blocks.size === 0) blocks.add("default");

  const order: Variant[] = ["detail", "form", "table", "grid", "list", "default"];
  const ordered = order.filter((b) => blocks.has(b));

  return (
    <div className={cn("min-h-screen bg-background pt-24 pb-16", className)}>
      <div className="container mx-auto px-4 md:px-6 space-y-10">
        <Header />
        {ordered.map((b) => {
          const Block = blockMap[b];
          return <Block key={b} />;
        })}
      </div>
    </div>
  );
};

export default PageSkeleton;