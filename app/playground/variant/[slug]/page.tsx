import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EmailRow } from "@/components/EmailRow";
import { FIGMA_VARIANTS } from "@/lib/figma-variants";

// One Figma variant on its own at 412 px, with nothing around it.
// Used by scripts/compare-figma.mjs to screenshot the code and diff it against Figma.
export function generateStaticParams() {
  return FIGMA_VARIANTS.map((v) => ({ slug: v.slug }));
}

export default function VariantPage({ params }: PageProps<"/playground/variant/[slug]">) {
  return (
    <Suspense>
      <Variant params={params} />
    </Suspense>
  );
}

async function Variant({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = FIGMA_VARIANTS.find((v) => v.slug === slug);
  if (!variant) notFound();

  return (
    <div style={{ width: 412 }}>
      <EmailRow {...variant.props} />
    </div>
  );
}
