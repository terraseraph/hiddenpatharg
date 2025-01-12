import { prisma } from "~/server/db";

// Characters to use for generating codes (excluding similar looking characters)
export const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 6;

/**
 * Generates a unique booking code for a team's game session
 * Format: XXXXXX (6 characters total)
 */
export async function generateUniqueBookingCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        // Generate a random code
        let code = "";
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
        }

        // Check if code exists
        const existing = await prisma.booking.findUnique({
            where: { code },
        });

        if (!existing) {
            return code;
        }

        attempts++;
    }

    throw new Error("Could not generate unique booking code after multiple attempts");
}

/**
 * Validates a booking code format.
 * Booking codes are uppercase alphanumeric strings of 6 characters.
 * Input is converted to uppercase before validation.
 */
export function isValidBookingCode(code: string): boolean {
    const upperCode = code.toUpperCase();
    return /^[A-Z0-9]{6}$/.test(upperCode);
}

/**
 * Formats a raw code string into the standard format (XXXXXX)
 * @throws Error if code contains invalid characters or length
 */
export function formatBookingCode(code: string): string {
    // Convert to uppercase and remove any non-alphanumeric characters
    const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Check if all characters are valid
    const validChars = new RegExp(`^[${CODE_CHARS}]{${CODE_LENGTH}}$`);
    if (!validChars.test(cleaned)) {
        throw new Error("Code contains invalid characters or incorrect length");
    }

    return cleaned;
} 