import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // ---- Super MoodMin ----
  await prisma.user.upsert({
    where: { email: 'akashmishrap@icloud.com' }, update: { password: 'Admin@123', name: 'Super MoodMin', role: 'ADMIN', status: 'VERIFIED' },
    create: { email: 'akashmishrap@icloud.com', password: 'Admin@123', name: 'Super MoodMin', role: 'ADMIN', status: 'VERIFIED' },
  })

  // ---- Users ----
  await prisma.user.upsert({
    where: { email: 'hungry.user@moodbite.com' }, update: { password: 'User@123', name: 'Hungry User', role: 'USER', status: 'VERIFIED' },
    create: { email: 'hungry.user@moodbite.com', password: 'User@123', name: 'Hungry User', role: 'USER', status: 'VERIFIED' },
  })

  // ---- Delivery Partners ----
  await prisma.user.upsert({
    where: { email: 'john.doe@moodbite.com' }, update: { password: 'Deliv@123', name: 'John Doe', role: 'DELIVERY', status: 'VERIFIED' },
    create: { email: 'john.doe@moodbite.com', password: 'Deliv@123', name: 'John Doe', role: 'DELIVERY', status: 'VERIFIED' },
  })
  await prisma.user.upsert({
    where: { email: 'priya.sharma@moodbite.com' }, update: { password: 'Deliv@456', name: 'Priya Sharma', role: 'DELIVERY', status: 'PENDING' },
    create: { email: 'priya.sharma@moodbite.com', password: 'Deliv@456', name: 'Priya Sharma', role: 'DELIVERY', status: 'PENDING' },
  })

  // ---- Restaurants ----
  const restaurants = [
    { email: 'pizza.hut@moodbite.com', name: 'Pizza Hut', pass: 'Rest@123', rating: 4.8, address: '123 Pizza St, Mumbai' },
    { email: 'burger.barn@moodbite.com', name: 'Burger Barn', pass: 'Rest@456', rating: 4.5, address: '45 Grill Lane, Delhi' },
    { email: 'sushi.zen@moodbite.com', name: 'Sushi Zen', pass: 'Rest@789', rating: 4.9, address: '8 Ocean Drive, Bangalore', status: 'PENDING' },
    { email: 'authentic.italian@moodbite.com', name: 'Mamma Mia Italian', pass: 'Rest@Ital', rating: 4.7, address: '12 Pasta Blvd, Pune' },
    { email: 'spicy.indian@moodbite.com', name: 'Curry Heights', pass: 'Rest@Ind', rating: 4.9, address: '77 Spice Way, Jaipur' },
    { email: 'fresh.mexican@moodbite.com', name: 'El Camino', pass: 'Rest@Mex', rating: 4.6, address: '22 Taco St, Hyderabad' },
    { email: 'late.diner@moodbite.com', name: 'Midnight Munchies', pass: 'Rest@Late', rating: 4.3, address: '1 Moon Ave, Mumbai' },
    { email: 'vegan.oasis@moodbite.com', name: 'Green Haven', pass: 'Rest@Veg', rating: 4.8, address: '9 Earth Lane, Delhi' },
  ]

  const createdRestaurants: Record<string, string> = {}
  for (const r of restaurants) {
    const res = await prisma.user.upsert({
      where: { email: r.email }, update: { password: r.pass, name: r.name, role: 'RESTAURANT', status: r.status || 'VERIFIED', rating: r.rating, address: r.address },
      create: { email: r.email, password: r.pass, name: r.name, role: 'RESTAURANT', status: r.status || 'VERIFIED', rating: r.rating, address: r.address },
    })
    createdRestaurants[r.name] = res.id
  }

  // ---- Menu Items ----
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.menuItem.deleteMany({}) // Clean slate for menu
  
  const menuItems = [
    // Pizza Hut (Comfort, Celebratory)
    { name: 'Classic Cheese Pizza', desc: 'Stone-baked with three-cheese blend and basil.', price: 299, tags: 'Comfort,Happy', r: 'Pizza Hut', img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&q=80' },
    { name: 'Pepperoni Inferno', desc: 'Spicy pepperoni with jalapeños and hot sauce drizzle.', price: 399, tags: 'Energetic,Stressed', r: 'Pizza Hut', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80' },
    { name: 'Truffle Mushroom Pizza', desc: 'Wild mushrooms, truffle oil, mozzarella, arugula.', price: 549, tags: 'Celebratory,Comfort', r: 'Pizza Hut', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80' },
    // Burger Barn (Comfort, Late Night)
    { name: 'Smash Burger', desc: 'Double-smashed beef patties, special sauce, pickles.', price: 249, tags: 'Happy,Late Night', r: 'Burger Barn', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
    { name: 'Mac & Cheese Burger', desc: 'Loaded with creamy mac n cheese and crispy bacon.', price: 349, tags: 'Comfort,Stressed', r: 'Burger Barn', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80' },
    // Sushi Zen (Happy, Celebratory)
    { name: 'Rainbow Roll', desc: 'Avocado, crab, topped with fresh sashimi slices.', price: 599, tags: 'Celebratory,Happy', r: 'Sushi Zen', img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80' },
    { name: 'Spicy Tuna Crunch', desc: 'Spicy tuna, tempura flakes, sriracha mayo.', price: 499, tags: 'Energetic,Stressed', r: 'Sushi Zen', img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80' },
    // Mamma Mia Italian (Comfort, Celebratory)
    { name: 'Penne Arrabbiata', desc: 'Spicy tomato sauce, garlic, red chili flakes.', price: 350, tags: 'Energetic,Stressed', r: 'Mamma Mia Italian', img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80' },
    { name: 'Creamy Carbonara', desc: 'Pancetta, egg yolk, pecorino cheese, black pepper.', price: 420, tags: 'Comfort,Happy', r: 'Mamma Mia Italian', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80' },
    // Curry Heights (Energetic, Stressed, Comfort)
    { name: 'Butter Chicken', desc: 'Tender chicken in a rich, creamy tomato gravy.', price: 380, tags: 'Comfort,Happy', r: 'Curry Heights', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80' },
    { name: 'Lamb Vindaloo', desc: 'Extremely spicy Goan lamb curry. Feel the burn.', price: 450, tags: 'Energetic,Stressed', r: 'Curry Heights', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
    { name: 'Garlic Naan', desc: 'Soft bread loaded with butter and garlic.', price: 90, tags: 'Comfort', r: 'Curry Heights', img: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&q=80' },
    // El Camino (Happy, Energetic, Late Night)
    { name: 'Beef Birria Tacos', desc: 'Crispy tacos dipped in rich consommé with cheese.', price: 320, tags: 'Happy,Late Night', r: 'El Camino', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80' },
    { name: 'Loaded Nachos', desc: 'Guacamole, pico de gallo, sour cream, jalapeños.', price: 280, tags: 'Celebratory,Comfort', r: 'El Camino', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80' },
    // Midnight Munchies (Late Night, Stressed)
    { name: '2AM Philly Cheesesteak', desc: 'Thinly sliced steak with melted cheese on a hoagie.', price: 300, tags: 'Late Night,Comfort', r: 'Midnight Munchies', img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80' },
    { name: 'Crispy Fries Bucket', desc: 'A literal bucket of seasoned shoestring fries.', price: 150, tags: 'Stressed,Late Night', r: 'Midnight Munchies', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80' },
    // Green Haven (Happy, Energetic)
    { name: 'Açaí Energy Bowl', desc: 'Açaí puree topped with fresh berries, coconut bowl.', price: 290, tags: 'Happy,Energetic', r: 'Green Haven', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    { name: 'Avocado Toast Deluxe', desc: 'Sourdough, smashed avocado, cherry tomatoes, balsamic.', price: 250, tags: 'Happy,Comfort', r: 'Green Haven', img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80' },
  ]

  await prisma.menuItem.createMany({
    data: menuItems.map(m => ({
      name: m.name, description: m.desc, price: m.price, tags: m.tags, imageUrl: m.img,
      restaurantId: createdRestaurants[m.r]
    }))
  })

  console.log('✅ Database seeded successfully with expanded menu!')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
