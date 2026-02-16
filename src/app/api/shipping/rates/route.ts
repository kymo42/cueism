import { NextRequest, NextResponse } from 'next/server';
import { getShippingRates, calculatePackage } from '@/lib/auspost';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, toPostcode, toCountry = 'AU', options = {} } = body;

        if (!toPostcode) {
            return NextResponse.json(
                { error: 'Destination postcode is required' },
                { status: 400 }
            );
        }

        const fromPostcode = process.env.SENDER_POSTCODE || '3000';

        // Calculate package dimensions from items
        const pkg = calculatePackage(
            items?.map((item: { weight?: number; packageSize?: string; quantity: number }) => ({
                weight: item.weight || 0.1,
                packageSize: item.packageSize,
                quantity: item.quantity || 1,
            })) || [{ weight: 0.1, quantity: 1 }]
        );

        const rates = await getShippingRates(
            pkg,
            fromPostcode,
            toPostcode,
            toCountry,
            {
                signature: options.signature || false,
                extraCover: options.extraCover || undefined,
            }
        );

        return NextResponse.json({ rates });
    } catch (error) {
        console.error('Shipping rates error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping rates' },
            { status: 500 }
        );
    }
}
