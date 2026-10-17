import { seedPlansIfEmpty } from "@/modules/plan";
import { seedCategoriesIfEmpty } from "@/modules/category";
import { seedOffersIfEmpty } from "@/modules/offer";

export async function seed(): Promise<void> {
    try {
        await seedPlansIfEmpty();
    } catch (seedError) {
        console.error("⚠️ Failed to verify or seed standard plans on startup:", seedError);
    }
    try {
        await seedOffersIfEmpty();
    } catch (seedError) {
        console.error("⚠️ Failed to verify or seed promotional offers on startup:", seedError);
    }
    try {
        await seedCategoriesIfEmpty();
    } catch (seedError) {
        console.error("⚠️ Failed to verify or seed standard categories on startup:", seedError);
    }
}

export { seed as seedDatabase };
export default seed;
