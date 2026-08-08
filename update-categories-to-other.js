const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '75mn0cw2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

async function updateToOther() {
  try {
    console.log('Moving items to Other category...');
    
    // Peri Peri Fries-ഉം BBQ Chicken Wings-ഉം 'Other' കാറ്റഗറിയിലേക്ക് മാറ്റുന്നു
    await client.patch('food-7').set({ category: 'Other' }).commit();
    await client.patch('food-8').set({ category: 'Other' }).commit();
    
    console.log('Successfully moved to Other category. They will now only appear in the "All" section.');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateToOther();
