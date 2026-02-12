export const calculateEstimatedPrice = (bloodGroup, quantity, type) => {
    const basePrice = 1200; // Base price per unit
    let multiplier = 1;

    // Rarity Multipliers
    switch (bloodGroup) {
        case "O-": multiplier = 2.5; break; // Rare
        case "AB-": multiplier = 2.0; break;
        case "B-": multiplier = 1.5; break;
        case "A-": multiplier = 1.5; break;
        default: multiplier = 1.0; // Positive groups are common
    }

    // Component Adjustments
    if (type === "Plasma") multiplier *= 1.2;
    if (type === "Platelets") multiplier *= 1.5;

    const finalPrice = Math.round(basePrice * multiplier * quantity);
    return finalPrice;
};