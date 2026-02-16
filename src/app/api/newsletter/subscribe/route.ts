import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        const sheetId = process.env.GOOGLE_SHEET_ID;
        const apiKey = process.env.GOOGLE_API_KEY;

        if (sheetId && apiKey) {
            // Append to Google Sheets
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:B:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    values: [[email, new Date().toISOString()]],
                }),
            });
        } else {
            // Fallback: just log the email
            console.log('Newsletter signup:', email);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}
