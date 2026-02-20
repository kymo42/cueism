export interface PackVariant {
    id: string;
    name: string;
    price: number; // cents
}

export interface ColorOption {
    id: string;
    name: string;
    hex: string;
}

export interface AddOn {
    id: string;
    name: string;
    price: number; // cents
}

export interface ProductInfo {
    stripeId: string;
    name: string;
    description: string;
    features: string[];
    price: number;
    priceDisplay: string;
    category: string;
    images: string[];
    stock?: string;
    packVariants?: PackVariant[];
    colors?: ColorOption[];
    colorNote?: string;
    addOns?: AddOn[];
}

export const PRODUCT_DATA: Record<string, ProductInfo> = {
    chalkable: {
        stripeId: 'prod_TzE3cuqSIEkMdp',
        name: 'Chalkable',
        description:
            'Chalkable is a robust, reliable solution that ensures a piece of chalk will see through its full life span and the player won\'t be kicking around a rubber thing on the floor. Although a rigid format, Chalkable will handle a varied size of chalks — for the small one a little electrical tape works. The design allows for the larger blocks by reducing the overall surface area of contact and the massive opening at the bottom will make removal easy every time.',
        features: [
            'Handles varied chalk sizes — small to large blocks',
            'Massive bottom opening for easy chalk removal',
            'Rigid format for durability and reliability',
            'Printed from recycled PET',
            'Bulk pricing available for quantities of 5+',
        ],
        images: [
            '/images/chalkables/satar.JPG',
            '/images/chalkables/IMG_20260213_131431913.jpg',
            '/images/chalkables/IMG_20260213_131645796.jpg',
            '/images/chalkables/IMG_20260213_131706392.jpg',
        ],
        price: 500,
        priceDisplay: 'From $5.00',
        category: 'Chalk Holders',
        packVariants: [
            { id: 'single', name: 'Single', price: 500 },
            { id: '5pack', name: '5 Pack', price: 2250 },
            { id: '10pack', name: '10 Pack', price: 4000 },
            { id: '20pack', name: '20 Pack', price: 7000 },
        ],
    },
    cheatstick: {
        stripeId: 'prod_TzDsrqMVLdK7qP',
        name: 'cheatStick',
        description:
            'Sick of the nasty shots against the rail, or the dodgy spread that is looking impossible to navigate. This has the angles covered and will fit on a Rack cue as good as a break cue.',
        features: [
            'Intuitive design handles all angles and heights, even off the rail',
            'Fits on various cues, not just your break cue',
            'Have your initials, numbers, or icons printed on it',
            '3 colours available to avoid mixups at the club',
            'Environmentally conscious — printed from recycled PET',
            'Fits snugly into any pool bag',
        ],
        images: [
            '/images/cheatstick/cs.jpg',
            '/images/cheatstick/IMG_20241227_111822288_HDR.jpg',
            '/images/cheatstick/IMG_20241227_111838965.jpg',
            '/images/cheatstick/IMG_20241227_112009724_HDR.jpg',
        ],
        price: 1400,
        priceDisplay: '$14.00',
        category: 'Cueing',
        stock: '42 in stock',
        colors: [
            { id: 'black', name: 'Black', hex: '#1A1A1A' },
            { id: 'white', name: 'White', hex: '#F5F5F5' },
            { id: 'orange', name: 'Orange', hex: '#FF6600' },
        ],
    },
    racksafe9: {
        stripeId: 'prod_TzDi5si4JukLvf',
        name: 'Racksafe9',
        description:
            'Trying to protect your Turtle or Magic Rack from getting nicked, lost, or bent is kinda frustrating. Innovative protective case designed for all serious rotation pool players.',
        features: [
            'Locally made — handcrafted in Sydney',
            'Convenient portability — designed to hang off your bag',
            'Can be equipped with an RFID chip for your digital contact info',
            'Have your name, text, or initials printed on it',
            'Choose an individual icon from Google Material Icons',
            'Treat yourself!',
        ],
        images: [
            '/images/racksafe9/9.jpg',
            '/images/racksafe9/999.jpg',
            '/images/racksafe9/9999.jpg',
            '/images/racksafe9/99999.jpg',
            '/images/racksafe9/999999.jpg',
        ],
        price: 2000,
        priceDisplay: '$20.00',
        category: 'Accessories',
        colorNote: 'This is the TOP colour — bottom is always white. Specific needs? Get in touch!',
        colors: [
            { id: 'black', name: 'Black', hex: '#1A1A1A' },
            { id: 'white', name: 'White', hex: '#F5F5F5' },
            { id: 'orange', name: 'Orange', hex: '#FF6600' },
        ],
        addOns: [
            { id: 'rfid', name: 'Add RFID chip', price: 500 },
            { id: 'text', name: 'Add text/name', price: 300 },
            { id: 'icon', name: 'Add Icon from Google', price: 200 },
            { id: 'rfid-combo', name: 'Add RFID + icon or text', price: 600 },
        ],
    },
    racksafe8: {
        stripeId: 'prod_RackSafe8',
        name: 'RackSafe8',
        description:
            'Precision rack template for 8-ball. Get perfect racks every single time with this precisely engineered template. No more loose racks or unfair breaks.',
        features: [
            'Precision-engineered for perfect 8-ball racks',
            'Durable 3D-printed construction',
            'Lightweight and portable',
            'Made from recycled materials',
            'Made in Australia',
        ],
        images: [
            '/images/racksafe8/888.jpg',
            '/images/racksafe8/8888.jpg',
            '/images/racksafe8/88888.jpg',
            '/images/racksafe8/888888.jpg',
        ],
        price: 2000,
        priceDisplay: '$20.00',
        category: 'Racks',
        colors: [
            { id: 'black', name: 'Black', hex: '#1A1A1A' },
            { id: 'white', name: 'White', hex: '#F5F5F5' },
            { id: 'orange', name: 'Orange', hex: '#FF6600' },
        ],
    },
};
