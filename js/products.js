const products = [];

for (let i = 1; i <= 40; i++) {
  products.push({
    id: i,
    name: "Oversized Tee " + i,
    price: 799,
    oldPrice: 999,
    image: "https://picsum.photos/300/400?random=" + i
  });
}
