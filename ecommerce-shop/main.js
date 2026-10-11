// ============================================================
//  main.js — สมองของหน้าเว็บ (ส่วน JavaScript)
//  หน้าที่: ดึงข้อมูลสินค้า → สร้างการ์ด → จัดการตะกร้า
// ============================================================

// เก็บรายการสินค้าที่โหลดมาไว้ใช้ทีหลัง (เช่น ตอนหยิบใส่ตะกร้า)
let allProducts = [];

// ตะกร้า = รายการสินค้าที่ผู้ใช้เลือก
let cart = [];

// ------------------------------------------------------------
// 1) โหลดข้อมูลสินค้าจากไฟล์ products.json
//    fetch() = "ขอข้อมูลจากหลังบ้าน" — นี่คือภาพของ backend
// ------------------------------------------------------------
async function loadProducts() {
  const res = await fetch('products.json');
  allProducts = await res.json();
  renderProducts(allProducts);
}

// ------------------------------------------------------------
// 2) สร้างการ์ดสินค้าทั้งหมดลงในหน้าเว็บ
// ------------------------------------------------------------
function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list.map(cardHTML).join('');
}

// แปลงคะแนนดาวเป็นรูปดาว เช่น 4 → ★★★★☆
function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// โครงหน้าตาของการ์ด 1 ใบ (เขียนด้วย JavaScript)
function cardHTML(product) {
  // คิด % ส่วนลด ถ้ามีราคาเดิม (oldPrice)
  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return `
    <article class="reveal bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">

      <!-- รูปสินค้า: ถ้ารูปโหลดไม่ขึ้น จะโชว์อีโมจิบนพื้นสีอ่อนแทน (onerror) -->
      <div class="relative aspect-square overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center text-6xl">${product.emoji}</div>
        <img src="${product.image}" alt="${product.name}" loading="lazy"
          class="relative w-full h-full object-cover" onerror="this.remove()" />
        ${product.badge ? `<span class="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">${product.badge}</span>` : ''}
      </div>

      <div class="p-4">
        <h4 class="text-orange-600 font-bold truncate">${product.name}</h4>

        <!-- ดาวรีวิว + จำนวนรีวิว -->
        <div class="flex items-center gap-1.5 text-amber-500 text-sm mt-1">
          ${stars(product.rating)} <span class="text-stone-400">(${product.reviews})</span>
        </div>

        <!-- 👇 โจทย์ 3: ราคาปัจจุบัน (฿${product.price}) ยังจืด ลองทำให้เด่นขึ้น (เช่น สีส้ม ตัวหนา) -->
        <p class="mt-2 flex items-center gap-2">
          ${product.oldPrice ? `<span class="text-stone-400 line-through text-sm">฿${product.oldPrice}</span>` : ''}
          <span class="text-stone-500">฿${product.price}</span>
          ${off ? `<span class="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">-${off}%</span>` : ''}
        </p>

        <p class="text-stone-400 text-xs mt-1">ขายแล้ว ${product.sold}</p>

        <button onclick="addToCart(${product.id})"
          class="mt-3 w-full bg-orange-600 text-white py-2 rounded-full font-semibold hover:bg-orange-700 transition">
          หยิบใส่ตะกร้า
        </button>
      </div>
    </article>
  `;
}

// ------------------------------------------------------------
// 3) หยิบสินค้าใส่ตะกร้า
//    👇 โจทย์ 5: ตอนนี้ปุ่ม "หยิบใส่ตะกร้า" ยังไม่ทำงาน
//       ทำให้มันทำงาน โดย:
//         (1) หาสินค้าจาก id ใน allProducts
//         (2) เพิ่มสินค้านั้นเข้า cart
//         (3) อัปเดตตัวเลขบนตะกร้า + รายการในตะกร้า
// ------------------------------------------------------------
function addToCart(id) {
  const product = allProducts.find((item) => item.id === id);

  cart.push(product);
  updateCartCount();
  renderCart();
}

// ------------------------------------------------------------
//  ฟังก์ชันช่วยเหลือ (ทำงานได้แล้ว ไม่ต้องแก้)
// ------------------------------------------------------------

// อัปเดตตัวเลขจำนวนสินค้าบนไอคอนตะกร้า
function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
}

// แสดงรายการสินค้าในตะกร้า
function renderCart() {
  const listEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');

  emptyEl.classList.toggle('hidden', cart.length > 0);
  const groupedCart = cart.reduce((items, product) => {
    const item = items.get(product.id);

    if (item) {
      item.quantity += 1;
    } else {
      items.set(product.id, { product, quantity: 1 });
    }

    return items;
  }, new Map());

  listEl.innerHTML = [...groupedCart.values()]
    .map(({ product, quantity }) => `<li class="flex justify-between"><span>${product.emoji} ${product.name} x${quantity}</span><span>฿${product.price * quantity}</span></li>`)
    .join('');

  const total = cart.reduce((sum, product) => sum + product.price, 0);
  document.getElementById('cart-total').textContent = '฿' + total;
}

// เปิด/ปิด แผงตะกร้า
function openCart() {
  document.getElementById('cart-panel').classList.remove('hidden');
  document.getElementById('cart-overlay').classList.remove('hidden');
}
function closeCart() {
  document.getElementById('cart-panel').classList.add('hidden');
  document.getElementById('cart-overlay').classList.add('hidden');
}
document.getElementById('cart-button').onclick = openCart;
document.getElementById('cart-close').onclick = closeCart;
document.getElementById('cart-overlay').onclick = closeCart;

// เริ่มทำงาน: โหลดสินค้าเมื่อเปิดหน้าเว็บ
loadProducts();
