const { createClient } = require('@sanity/client');
const axios = require('axios');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '75mn0cw2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

const foodItems = [
  { id: 'food-1', name: 'Classic Beef Burger', price: 180, category: 'Burger', desc: 'Juicy beef patty with fresh lettuce, cheese, and special sauce', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
  { id: 'food-2', name: 'Chicken Cheese Burger', price: 210, category: 'Burger', desc: 'Crispy fried chicken breast topped with melted cheddar and mayo', url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=800' },
  { id: 'food-3', name: 'Margherita Pizza', price: 320, category: 'Pizza', desc: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil', url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=800' },
  { id: 'food-4', name: 'Spicy Chicken Pizza', price: 380, category: 'Pizza', desc: 'Loaded with spicy chicken chunks, jalapeños, and extra cheese', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800' },
  { id: 'food-5', name: 'Malabar Chicken Biryani', price: 220, category: 'Biryani', desc: 'Traditional aromatic kaima rice cooked with tender chicken and spices', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800' },
  { id: 'food-6', name: 'Mutton Dum Biryani', price: 300, category: 'Biryani', desc: 'Rich and flavorful slow-cooked biryani with succulent mutton pieces', url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800' },
  { id: 'food-7', name: 'Peri Peri Fries', price: 120, category: 'Burger', desc: 'Crispy golden French fries tossed in spicy peri peri seasoning', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800' },
  { id: 'food-8', name: 'BBQ Chicken Wings', price: 240, category: 'Burger', desc: 'Juicy chicken wings glazed in smoky barbecue sauce', url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=800' },
  { id: 'food-9', name: 'Fresh Lime Juice', price: 50, category: 'Drinks', desc: 'Refreshing squeezed lime with a hint of mint', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800' },
  { id: 'food-10', name: 'Chocolate Milkshake', price: 160, category: 'Drinks', desc: 'Thick and creamy milkshake blended with rich chocolate syrup', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800' },
  { id: 'food-11', name: 'Mojito Mint', price: 130, category: 'Drinks', desc: 'Cooling mocktail with mint leaves, lime, and club soda', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800' },
  { id: 'food-12', name: 'Veg Supreme Pizza', price: 340, category: 'Pizza', desc: 'Loaded with bell peppers, olives, mushrooms, corn, and cheese', url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=800' }
];

async function fixAll12() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('Error: SANITY_WRITE_TOKEN is missing.');
    return;
  }

  try {
    const transaction = client.transaction();

    for (const item of foodItems) {
      console.log(`Uploading correct image for ${item.name}...`);
      const imgRes = await axios.get(item.url, { responseType: 'arraybuffer' });
      const imgBuffer = Buffer.from(imgRes.data, 'binary');

      const asset = await client.assets.upload('image', imgBuffer, {
        filename: `${item.id}.jpg`
      });

      transaction.createOrReplace({
        _id: item.id,
        _type: 'food',
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.desc,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      });
    }

    await transaction.commit();
    console.log('All 12 items successfully fixed with exact matching images!');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixAll12();
