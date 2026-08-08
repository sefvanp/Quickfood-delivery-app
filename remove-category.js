const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '75mn0cw2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

async function removeCat() {
  try {
    await client.patch('food-7').unset(['category']).commit();
    await client.patch('food-8').unset(['category']).commit();
    console.log('Category removed successfully from both items!');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeCat();
