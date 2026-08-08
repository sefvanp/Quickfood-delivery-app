const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '75mn0cw2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

async function fixCategories() {
  try {
    console.log('Updating categories...');
    
    // Peri Peri Fries-നെ 'Sides' അല്ലെങ്കിൽ 'Snacks' ആക്കാം
    await client.patch('food-7').set({ category: 'Snacks' }).commit();
    
    // BBQ Chicken Wings-നെയും 'Snacks' ആക്കാം
    await client.patch('food-8').set({ category: 'Snacks' }).commit();
    
    console.log('Categories updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCategories();
