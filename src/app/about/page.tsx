import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'About',
    description: 'Crafting custom 3D-printed billiard gear for every player. Made by humans in Australia with the smallest carbon footprint possible.',
};

export default function AboutPage() {
    return (
        <>
            <div className="page-header">
                <h1>About</h1>
            </div>

            <div className="prose">
                <h2 style={{ marginTop: 0 }}>Crafting Custom 3D-Printed Billiard Gear for Every Player of any species</h2>

                <p>
                    We are committed to providing robust and good-quality billiard accessories,
                    always striving to both innovate for and service the needs of the average but
                    discerning cue-based enthusiasts. All our products are created and made by
                    humans in Australia with the smallest carbon footprint possible.
                </p>

                <p>
                    Recycled hard plastics are used when strength is required which will now avoid
                    landfills or turtle murder and organic-based thermoplastics that are biodegradable
                    once discarded.
                </p>

                <p>
                    All products are individually 3D printed to order and not mass-produced from a
                    single mould, this means variation in perceived aesthetic quality and no single
                    version of a product will look the same.
                </p>

                <h2>Our Materials</h2>

                <ul>
                    <li><strong>Recycled PET:</strong> Hard plastics diverted from landfill, used where strength and durability are paramount.</li>
                    <li><strong>PLA (Polylactic Acid):</strong> Organic-based, biodegradable thermoplastic made from renewable resources like corn starch.</li>
                    <li><strong>PETG:</strong> For products requiring extra chemical resistance and flexibility.</li>
                </ul>

                <h2>Our Process</h2>

                <p>
                    Each product is printed individually using FDM (Fused Deposition Modeling) 3D printing technology.
                    This means every piece has its own character — slight variations in layer lines, texture, and finish
                    that make each item unique. We don&apos;t see this as imperfection; we see it as craftsmanship.
                </p>

                <h2>Why 3D Printing?</h2>

                <ul>
                    <li>Zero minimum order quantities — we can make one at a time</li>
                    <li>Rapid prototyping and iteration on designs</li>
                    <li>No expensive moulds or tooling</li>
                    <li>On-demand production means zero waste inventory</li>
                    <li>Ability to customise per customer</li>
                </ul>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                    <Link href="/contact" className="btn btn--primary btn--lg">
                        Get in Touch
                    </Link>
                </div>
            </div>
        </>
    );
}
