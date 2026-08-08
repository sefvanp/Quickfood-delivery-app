import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

export default defineConfig({
  name: "default",
  title: "QuickFood Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "75mn0cw2",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: [
      {
        name: "food",
        title: "Food Items",
        type: "document",
        fields: [
          { name: "name", title: "Food Name", type: "string" },
          { name: "price", title: "Price", type: "number" },
          {
            name: "category",
            title: "Category",
            type: "string",
            options: {
              list: [
                { title: "Burger", value: "Burger" },
                { title: "Pizza", value: "Pizza" },
                { title: "Biryani", value: "Biryani" },
                { title: "Drinks", value: "Drinks" },
              ],
            },
          },
          { name: "description", title: "Description", type: "text" },
          { name: "image", title: "Image", type: "image", options: { hotspot: true } },
        ],
      },
    ],
  },
});
