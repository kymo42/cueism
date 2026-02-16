import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Returns Policy',
    description: 'cueism Returns & Refunds Policy — learn about our return process for 3D-printed products.',
};

export default function ReturnsPolicyPage() {
    return (
        <>
            <div className="page-header">
                <h1>Returns Policy</h1>
            </div>

            <div className="prose">
                <p><strong>Last updated:</strong> January 2025</p>

                <h2>1. 3D-Printed Products</h2>
                <p>
                    As all our products are individually 3D printed to order, slight variations in
                    finish, texture, and appearance are normal and expected. These are not considered
                    defects and do not qualify for a return.
                </p>

                <h2>2. Defective Products</h2>
                <p>
                    If you receive a product that is genuinely defective (e.g., significant structural
                    flaws that affect functionality), please contact us within 14 days of receiving
                    your order with photos of the defect. We will arrange a replacement at no cost.
                </p>

                <h2>3. Wrong Item</h2>
                <p>
                    If we send you the wrong item, please contact us immediately and we will arrange
                    the correct product to be sent at no additional cost.
                </p>

                <h2>4. Change of Mind</h2>
                <p>
                    As products are made to order, we do not accept change-of-mind returns. Please
                    review your order carefully before completing your purchase.
                </p>

                <h2>5. Shipping Damage</h2>
                <p>
                    If your product arrives damaged due to shipping, please contact us within 7 days
                    of delivery with photos. We will work with Australia Post to resolve the issue
                    and arrange a replacement.
                </p>

                <h2>6. Refund Process</h2>
                <p>
                    Approved refunds will be processed to the original payment method within 5-10
                    business days. Shipping costs are non-refundable unless the return is due to our error.
                </p>

                <h2>7. Contact</h2>
                <p>
                    To initiate a return or discuss any issues with your order, please contact us
                    through our <a href="/contact">contact page</a>.
                </p>

                <h2>8. Australian Consumer Law</h2>
                <p>
                    Our goods come with guarantees that cannot be excluded under the Australian
                    Consumer Law. You are entitled to a replacement or refund for a major failure
                    and compensation for any other reasonably foreseeable loss or damage.
                </p>
            </div>
        </>
    );
}
