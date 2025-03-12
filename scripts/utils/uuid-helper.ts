/**
 * UUID Helper that provides deterministic UUIDs for seeding
 * This helps with creating predictable IDs for testing and integration
 */

// Define namespace UUIDs for different entity types
export const UUID_NAMESPACES = {
    USER: '00000000-0000-4000-a000-000000000000',
    SCALE: '11111111-1111-4111-a111-111111111111',
    MOOD_ENTRY: '22222222-2222-4222-a222-222222222222',
    STABILITY_FORMULA: '33333333-3333-4333-a333-333333333333',
};

/**
 * Generate a deterministic UUID based on a namespace and name
 *
 * @param namespace The namespace UUID
 * @param index A unique index or identifier within this namespace
 * @returns A consistent UUID for the given namespace and index
 */
export function generateDeterministicUUID(namespace: string, index: number): string {
    // Simple implementation that creates predictable UUIDs by modifying the namespace
    const parts = namespace.split('-');

    // Convert index to hex and pad it
    const indexHex = index.toString(16).padStart(12, '0');

    // Modify the last part with our index
    parts[4] = indexHex.substring(0, 12);

    return parts.join('-');
}

/**
 * Generate user UUIDs
 */
export function getUserUUID(index: number): string {
    return generateDeterministicUUID(UUID_NAMESPACES.USER, index);
}

/**
 * Generate scale UUIDs
 */
export function getScaleUUID(index: number): string {
    return generateDeterministicUUID(UUID_NAMESPACES.SCALE, index);
}

/**
 * Generate mood entry UUIDs
 */
export function getMoodEntryUUID(index: number): string {
    return generateDeterministicUUID(UUID_NAMESPACES.MOOD_ENTRY, index);
}

/**
 * Generate stability formula UUIDs
 */
export function getStabilityFormulaUUID(index: number): string {
    return generateDeterministicUUID(UUID_NAMESPACES.STABILITY_FORMULA, index);
}

// Export known UUIDs for specific entities
export const KNOWN_UUIDS = {
    ADMIN_USER: getUserUUID(1),
    TEST_USER: getUserUUID(2),

    // Default scales
    MOOD_SCALE: getScaleUUID(1),
    ANXIETY_SCALE: getScaleUUID(2),
    ENERGY_SCALE: getScaleUUID(3),
    SLEEP_QUALITY_SCALE: getScaleUUID(4),

    // Default stability formula
    DEFAULT_FORMULA: getStabilityFormulaUUID(1),

    // Sample mood entries
    SAMPLE_ENTRY_1: getMoodEntryUUID(1),
    SAMPLE_ENTRY_2: getMoodEntryUUID(2),
    SAMPLE_ENTRY_3: getMoodEntryUUID(3),
};