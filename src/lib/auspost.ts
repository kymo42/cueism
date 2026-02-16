/**
 * Australia Post PAC API Client
 * Ported from the WordPress plugin class-auspost-api.php
 */

const AUSPOST_API_URL = 'https://digitalapi.auspost.com.au';

export interface ShippingRate {
    serviceCode: string;
    serviceName: string;
    price: number;
    estimatedDays?: string;
}

export interface PackageDimensions {
    length: number; // cm
    width: number;  // cm
    height: number; // cm
    weight: number; // kg
}

export interface ShippingOptions {
    signature?: boolean;
    extraCover?: number; // value to cover in dollars
}

// Standard package sizes (L x W x H in cm) — matching WooCommerce plugin
export const PACKAGE_SIZES: Record<string, [number, number, number]> = {
    small: [22, 16, 7.7],
    medium: [24, 19, 12],
    large: [39, 28, 14],
    xlarge: [44, 29.7, 17.5],
    satchel: [35.5, 22, 1],
};

async function fetchRate(
    apiKey: string,
    endpoint: string,
    params: Record<string, string | number>,
    serviceCode: string,
    serviceName: string,
    extraOptions: string[] = []
): Promise<ShippingRate | null> {
    const url = new URL(AUSPOST_API_URL + endpoint);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
    }

    // Append multiple option_code params
    for (const opt of extraOptions) {
        url.searchParams.append('option_code', opt);
    }

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'AUTH-KEY': apiKey,
            },
        });

        if (!response.ok) {
            console.error(`AusPost API error for ${serviceCode}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data?.postage_result?.total_cost) {
            return {
                serviceCode,
                serviceName,
                price: parseFloat(data.postage_result.total_cost),
            };
        }

        if (data?.error) {
            console.error(`AusPost API error for ${serviceCode}:`, data.error);
        }

        return null;
    } catch (error) {
        console.error(`AusPost fetch error for ${serviceCode}:`, error);
        return null;
    }
}

export async function getShippingRates(
    pkg: PackageDimensions,
    fromPostcode: string,
    toPostcode: string,
    toCountry: string,
    options: ShippingOptions = {}
): Promise<ShippingRate[]> {
    const apiKey = process.env.AUSPOST_API_KEY;
    if (!apiKey) {
        console.error('AUSPOST_API_KEY not set');
        return [];
    }

    const rates: ShippingRate[] = [];

    if (toCountry === 'AU') {
        // DOMESTIC
        const endpoint = '/postage/parcel/domestic/calculate.json';
        const services: Record<string, string> = {
            AUS_PARCEL_REGULAR: 'Regular Post',
            AUS_PARCEL_EXPRESS: 'Express Post',
        };

        for (const [serviceCode, serviceName] of Object.entries(services)) {
            const params: Record<string, string | number> = {
                from_postcode: fromPostcode,
                to_postcode: toPostcode,
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                weight: pkg.weight,
                service_code: serviceCode,
            };

            // Extras
            if (options.signature) {
                params.option_code = 'AUS_SERVICE_OPTION_SIGNATURE_ON_DELIVERY';
            }
            if (options.extraCover) {
                params.extra_cover = Math.ceil(options.extraCover);
                params.option_code = 'AUS_SERVICE_OPTION_EXTRA_COVER';
            }

            const rate = await fetchRate(apiKey, endpoint, params, serviceCode, serviceName);
            if (rate) {
                // Add label modifiers
                if (options.signature) rate.serviceName += ' + Signature';
                if (options.extraCover) rate.serviceName += ' + Cover';
                rates.push(rate);
            }
        }
    } else {
        // INTERNATIONAL
        const endpoint = '/postage/parcel/international/calculate.json';
        const services: Record<string, string> = {
            INT_PARCEL_STD_OWN_PACKAGING: 'International Standard',
            INT_PARCEL_EXP_OWN_PACKAGING: 'International Express',
            INT_PARCEL_COR_OWN_PACKAGING: 'International Courier',
            INT_PARCEL_AIR_OWN_PACKAGING: 'International Economy Air',
        };

        for (const [serviceCode, serviceName] of Object.entries(services)) {
            const params: Record<string, string | number> = {
                country_code: toCountry,
                weight: pkg.weight,
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                service_code: serviceCode,
            };

            const extraOptions: string[] = [];
            if (options.signature) {
                extraOptions.push('INT_SIGNATURE_ON_DELIVERY');
            }
            if (options.extraCover) {
                params.extra_cover = Math.ceil(options.extraCover);
                extraOptions.push('INT_EXTRA_COVER');
            }

            const rate = await fetchRate(apiKey, endpoint, params, serviceCode, serviceName, extraOptions);
            if (rate) {
                if (options.signature) rate.serviceName += ' + Signature';
                if (options.extraCover) rate.serviceName += ' + Cover';
                rates.push(rate);
            }
        }
    }

    return rates;
}

/**
 * Calculate package dimensions from cart items
 * Picks the largest box needed and sums weights
 */
export function calculatePackage(
    items: Array<{
        weight?: number;      // kg per unit
        packageSize?: string; // small | medium | large | xlarge | satchel
        length?: number;      // cm
        width?: number;       // cm
        height?: number;      // cm
        quantity: number;
    }>
): PackageDimensions {
    let totalWeight = 0;
    let maxVolume = 0;
    let finalL = 20, finalW = 20, finalH = 20;

    for (const item of items) {
        totalWeight += (item.weight || 0.1) * item.quantity;

        let l: number, w: number, h: number;

        if (item.packageSize && PACKAGE_SIZES[item.packageSize]) {
            [l, w, h] = PACKAGE_SIZES[item.packageSize];
        } else {
            l = item.length || 10;
            w = item.width || 10;
            h = item.height || 10;
        }

        const vol = l * w * h;
        if (vol > maxVolume) {
            maxVolume = vol;
            finalL = l;
            finalW = w;
            finalH = h;
        }
    }

    return {
        length: finalL,
        width: finalW,
        height: finalH,
        weight: Math.max(0.001, totalWeight),
    };
}
