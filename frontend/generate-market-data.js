const fs = require('fs');
const path = require('path');

// Read the existing data
const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'market-prices.json'), 'utf8'));

// Extract unique combinations of crop and market
const combinations = [];
const seen = new Set();

existingData.forEach(item => {
  const key = `${item.crop}|${item.market}`;
  if (!seen.has(key)) {
    seen.add(key);
    combinations.push({
      crop: item.crop,
      market: item.market,
      unit: item.unit,
      basePrice: item.price
    });
  }
});

console.log('Found combinations:', combinations);

// Generate 30 days of data for each combination
const generateExtendedData = () => {
  const data = [];
  const today = new Date('2025-08-18');
  
  combinations.forEach(combo => {
    let currentPrice = combo.basePrice;
    
    // Generate 30 days of data (going backwards from today)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Add some realistic price variation (±2-5%)
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const dailyChange = 1 + (variation * 0.5); // Reduce variation for daily changes
      currentPrice = Math.round(currentPrice * dailyChange);
      
      // Ensure price doesn't go too far from base price
      const maxPrice = combo.basePrice * 1.15;
      const minPrice = combo.basePrice * 0.85;
      currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
      
      data.push({
        crop: combo.crop,
        market: combo.market,
        date: date.toISOString().split('T')[0],
        price: currentPrice,
        unit: combo.unit
      });
    }
  });
  
  // Sort by crop, market, then date (newest first)
  data.sort((a, b) => {
    if (a.crop !== b.crop) return a.crop.localeCompare(b.crop);
    if (a.market !== b.market) return a.market.localeCompare(b.market);
    return new Date(b.date) - new Date(a.date);
  });
  
  return data;
};

// Generate the new data
const newData = generateExtendedData();

// Write the new data to file
fs.writeFileSync(
  path.join(__dirname, 'data', 'market-prices.json'),
  JSON.stringify(newData, null, 2),
  'utf8'
);

console.log(`Generated ${newData.length} entries with 30 days of data for ${combinations.length} crop-market combinations`);
console.log('Updated market-prices.json with extended data');
