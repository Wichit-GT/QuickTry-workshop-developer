let allHotels = [];

async function loadHotels() {
  const res = await fetch('hotels.json');
  allHotels = await res.json();
  renderHotels(allHotels);
}

function renderHotels(list) {
  const grid = document.getElementById('hotel-grid');
  grid.innerHTML = list.map(cardHTML).join('');

  const resultCount = document.getElementById('result-count');
  resultCount.textContent = `พบ ${list.length} ที่พัก`;
}

// แปลงคะแนนเป็นดาว เช่น 4 → ★★★★☆
function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// โครงหน้าตาของการ์ดโรงแรม 1 ใบ
function cardHTML(hotel) {
  // แท็กสิ่งอำนวยความสะดวก (WiFi, สระว่ายน้ำ, ...)
  const tags = hotel.amenities
    .map((a) => `<span class="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">${a}</span>`)
    .join('');

  return `
    <article class="reveal bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">

      <!-- รูปโรงแรม: ถ้ารูปโหลดไม่ขึ้น จะโชว์อีโมจิแทน (onerror) -->
      <div class="relative aspect-[4/3] overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center text-7xl">${hotel.emoji}</div>
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy"
          class="relative w-full h-full object-cover" onerror="this.remove()" />
        ${hotel.rating === 5 ? `<span class="absolute top-3 left-3 bg-amber-400 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full">ยอดนิยม</span>` : ''}
        <span class="absolute top-3 right-3 bg-white/90 text-teal-700 text-xs font-semibold px-2 py-1 rounded-full">ยกเลิกฟรี</span>
      </div>

      <div class="p-5">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-semibold text-lg">${hotel.name}</h4>
          <span class="shrink-0 bg-teal-50 text-teal-700 text-sm font-bold px-2 py-1 rounded-lg">${hotel.rating}.0</span>
        </div>

        <!-- เมือง + ดาว + จำนวนรีวิว (ไอคอนหมุดตำแหน่ง ไม่ต้องแก้) -->
        <p class="flex items-center gap-1 text-stone-500 text-sm mt-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
          ${hotel.city} · <span class="text-amber-500">${stars(hotel.rating)}</span> <span class="text-stone-400">(${hotel.reviews})</span>
        </p>

        <!-- สิ่งอำนวยความสะดวก -->
        <div class="flex flex-wrap gap-1.5 mt-3">${tags}</div>

        <div class="flex items-end justify-between mt-4">
          <p>
            ${hotel.oldPrice ? `<span class="text-stone-400 line-through text-sm">฿${hotel.oldPrice}</span> ` : ''}
            <span class="text-teal-600 font-bold text-lg">฿${hotel.price}</span>
            <span class="text-stone-400 text-sm">/ คืน</span>
          </p>
          <a href="hotel.html?id=${encodeURIComponent(hotel.id)}" class="text-teal-600 font-medium text-sm hover:underline">ดูรายละเอียด</a>
        </div>
      </div>
    </article>
  `;
}

function filterHotels(city) {
  const filteredHotels = city === 'ทั้งหมด'
    ? allHotels
    : allHotels.filter((hotel) => hotel.city === city);

  renderHotels(filteredHotels);
}

function initHotelListing() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach((button) => {
        button.classList.remove('bg-teal-600', 'text-white', 'border-teal-600');
        button.classList.add('bg-white');
      });
      btn.classList.remove('bg-white');
      btn.classList.add('bg-teal-600', 'text-white', 'border-teal-600');
      filterHotels(btn.dataset.city);
    };
  });

  loadHotels();
}

function initAuthPage() {
  const tabs = {
    login: document.getElementById('login-tab'),
    signup: document.getElementById('signup-tab'),
  };
  const panels = {
    login: document.getElementById('login-panel'),
    signup: document.getElementById('signup-panel'),
  };
  const message = document.getElementById('form-message');

  function showPanel(activePanel) {
    Object.entries(tabs).forEach(([name, tab]) => {
      const selected = name === activePanel;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('bg-white', selected);
      tab.classList.toggle('text-teal-700', selected);
      tab.classList.toggle('shadow-sm', selected);
      tab.classList.toggle('text-stone-500', !selected);
      panels[name].classList.toggle('hidden', !selected);
    });
    message.textContent = '';
    message.classList.add('hidden');
  }

  tabs.login.addEventListener('click', () => showPanel('login'));
  tabs.signup.addEventListener('click', () => showPanel('signup'));

  Object.values(panels).forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (form === panels.signup) {
        const password = form.elements.password.value;
        const confirmation = form.elements['confirm-password'].value;
        if (password !== confirmation) {
          form.elements['confirm-password'].setCustomValidity('รหัสผ่านไม่ตรงกัน');
          form.elements['confirm-password'].reportValidity();
          form.elements['confirm-password'].setCustomValidity('');
          return;
        }
      }
      message.textContent = 'รับข้อมูลตัวอย่างแล้ว แต่ระบบนี้ยังไม่มีบริการเข้าสู่ระบบหรือสมัครสมาชิก กรุณากลับหน้าแรกเพื่อเลือกดูที่พัก';
      message.classList.remove('hidden');
    });
  });
}

async function initHotelDetails() {
  const error = document.getElementById('hotel-error');
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') ?? '1';
  if (!/^\d+$/.test(requestedId)) {
    error.textContent = 'ไม่พบโรงแรมที่ต้องการ กรุณากลับไปเลือกโรงแรมจากหน้าแรก';
    error.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('hotels.json');
    if (!response.ok) throw new Error(`โหลดข้อมูลโรงแรมไม่สำเร็จ (${response.status})`);
    const hotels = await response.json();
    const hotel = hotels.find((item) => String(item.id) === requestedId);
    if (!hotel) throw new Error('ไม่พบโรงแรมที่ต้องการ');

    document.title = `${hotel.name} — Docker Hotel`;
    document.getElementById('hotel-name').textContent = hotel.name;
    document.getElementById('hotel-city').textContent = hotel.city;
    const stars = '★'.repeat(hotel.rating) + '☆'.repeat(5 - hotel.rating);
    document.getElementById('hotel-stars').textContent = stars;
    document.getElementById('hotel-stars').setAttribute('aria-label', `คะแนน ${hotel.rating} จาก 5`);
    document.getElementById('hotel-rating').textContent = `${hotel.rating}.0`;
    document.getElementById('hotel-reviews').textContent = hotel.reviews.toLocaleString('th-TH');
    document.getElementById('hotel-image').src = hotel.image;
    document.getElementById('hotel-image').alt = `ภาพที่พัก ${hotel.name}`;
    document.getElementById('hotel-intro-title').textContent = `พักผ่อนสบาย ๆ ที่${hotel.city}`;
    document.getElementById('hotel-description').textContent = `${hotel.name} คือที่พักใน${hotel.city} พร้อมสิ่งอำนวยความสะดวกที่ช่วยให้ทริปของคุณสะดวกสบาย เลือกวันที่เข้าพักและวางแผนการเดินทางครั้งต่อไปได้ที่นี่`;
    document.getElementById('hotel-rating-score').textContent = `${hotel.rating}.0`;
    document.getElementById('hotel-review-stars').textContent = stars;
    document.getElementById('hotel-review-count').textContent = hotel.reviews.toLocaleString('th-TH');
    document.getElementById('hotel-price').textContent = `฿${hotel.price.toLocaleString('th-TH')}`;
    const oldPrice = document.getElementById('hotel-old-price');
    if (hotel.oldPrice) {
      oldPrice.textContent = `ราคาปกติ ฿${hotel.oldPrice.toLocaleString('th-TH')}`;
    } else {
      oldPrice.classList.add('hidden');
    }
    document.getElementById('popular-badge').classList.toggle('hidden', hotel.rating !== 5);
    document.getElementById('booking-link').href = `booking.html?id=${encodeURIComponent(hotel.id)}`;

    const amenities = document.getElementById('hotel-amenities');
    amenities.replaceChildren(...hotel.amenities.map((amenity) => {
      const item = document.createElement('li');
      item.className = 'flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm';
      const icon = document.createElement('span');
      icon.className = 'flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-lg text-teal-700';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✓';
      const label = document.createElement('span');
      label.className = 'font-medium';
      label.textContent = amenity;
      item.append(icon, label);
      return item;
    }));
  } catch (loadError) {
    error.textContent = `${loadError.message} กรุณากลับไปหน้าแรกแล้วลองอีกครั้ง`;
    error.classList.remove('hidden');
  }
}

function initBookingPage() {
  let currentHotel = null;
  let pricePerNight = 0;
  const form = document.getElementById('booking-form');
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  const nightCount = document.getElementById('night-count');
  const subtotal = document.getElementById('subtotal');
  const total = document.getElementById('total');
  const confirmButton = document.getElementById('confirm-booking');
  const error = document.getElementById('booking-error');

  function dateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function updatePrice() {
    if (!checkin.value || !checkout.value || !pricePerNight) return;

    const start = Date.parse(`${checkin.value}T00:00:00Z`);
    const end = Date.parse(`${checkout.value}T00:00:00Z`);
    const nights = Math.max(1, Math.round((end - start) / 86400000));
    const amount = nights * pricePerNight;

    nightCount.textContent = `${nights} คืน`;
    subtotal.textContent = `฿${amount.toLocaleString('th-TH')}`;
    total.textContent = `฿${amount.toLocaleString('th-TH')}`;
  }

  function updateCheckoutMinimum() {
    if (!checkin.value) return;
    const nextDay = new Date(`${checkin.value}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    const minimumCheckout = dateString(nextDay);
    checkout.min = minimumCheckout;
    if (checkout.value && checkout.value < minimumCheckout) {
      checkout.value = minimumCheckout;
    }
    updatePrice();
  }

  async function loadBookingHotel() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id') ?? '1';
    if (!/^\d+$/.test(requestedId)) {
      error.textContent = 'ไม่พบโรงแรมที่ต้องการ กรุณากลับไปเลือกโรงแรมจากหน้าแรก';
      error.classList.remove('hidden');
      return;
    }

    try {
      const response = await fetch('hotels.json');
      if (!response.ok) throw new Error(`โหลดข้อมูลโรงแรมไม่สำเร็จ (${response.status})`);
      const hotels = await response.json();
      currentHotel = hotels.find((item) => String(item.id) === requestedId);
      if (!currentHotel) throw new Error('ไม่พบโรงแรมที่ต้องการ');

      pricePerNight = currentHotel.price;
      document.title = `จอง${currentHotel.name} — Docker Hotel`;
      document.getElementById('back-to-hotel').href = `hotel.html?id=${encodeURIComponent(currentHotel.id)}`;
      const breadcrumb = document.getElementById('breadcrumb-hotel');
      breadcrumb.href = `hotel.html?id=${encodeURIComponent(currentHotel.id)}`;
      breadcrumb.textContent = currentHotel.name;
      const image = document.getElementById('booking-hotel-image');
      image.src = currentHotel.image;
      image.alt = `${currentHotel.name} ${currentHotel.city}`;
      document.getElementById('booking-hotel-city').textContent = currentHotel.city;
      document.getElementById('booking-hotel-stars').textContent = '★'.repeat(currentHotel.rating) + '☆'.repeat(5 - currentHotel.rating);
      document.getElementById('booking-hotel-rating').textContent = `${currentHotel.rating}.0`;
      document.getElementById('booking-hotel-name').textContent = currentHotel.name;
      document.getElementById('booking-nightly-rate').textContent = `฿${pricePerNight.toLocaleString('th-TH')}`;
      document.getElementById('summary-hotel-name').textContent = currentHotel.name;

      const amenities = document.getElementById('booking-amenities');
      amenities.replaceChildren(...currentHotel.amenities.map((amenity) => {
        const item = document.createElement('li');
        item.className = 'rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600';
        item.textContent = amenity;
        return item;
      }));
      confirmButton.textContent = 'ไปหน้าชำระเงิน';
      confirmButton.disabled = false;
      updatePrice();
    } catch (loadError) {
      error.textContent = `${loadError.message} กรุณากลับไปหน้าแรกแล้วลองอีกครั้ง`;
      error.classList.remove('hidden');
    }
  }

  const today = new Date();
  checkin.min = dateString(today);
  const defaultCheckin = new Date(today);
  defaultCheckin.setDate(defaultCheckin.getDate() + 1);
  checkin.value = dateString(defaultCheckin);
  const defaultCheckout = new Date(defaultCheckin);
  defaultCheckout.setDate(defaultCheckout.getDate() + 1);
  checkout.value = dateString(defaultCheckout);
  updateCheckoutMinimum();

  checkin.addEventListener('change', updateCheckoutMinimum);
  checkout.addEventListener('change', updatePrice);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateCheckoutMinimum();
    if (!form.reportValidity() || !currentHotel) return;

    const nights = Math.round(
      (Date.parse(`${checkout.value}T00:00:00Z`) - Date.parse(`${checkin.value}T00:00:00Z`)) / 86400000
    );
    if (nights < 1) {
      checkout.setCustomValidity('วันเช็กเอาต์ต้องอยู่หลังวันเช็กอินอย่างน้อย 1 วัน');
      checkout.reportValidity();
      checkout.setCustomValidity('');
      return;
    }

    const bookingDetails = {
      hotelId: currentHotel.id,
      checkin: checkin.value,
      checkout: checkout.value,
      guests: form.elements.guests.value,
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
    };
    try {
      sessionStorage.setItem('dockerHotelBooking', JSON.stringify(bookingDetails));
    } catch (storageError) {
      error.textContent = `บันทึกรายละเอียดชั่วคราวไม่สำเร็จ: ${storageError.message}`;
      error.classList.remove('hidden');
      return;
    }
    window.location.href = `payment.html?id=${encodeURIComponent(currentHotel.id)}`;
  });

  loadBookingHotel();
}

function initPaymentPage() {
  const error = document.getElementById('payment-error');
  const methods = document.querySelectorAll('input[name="payment-method"]');
  const methodDetails = document.getElementById('payment-method-details');
  const qrPanel = document.getElementById('youtube-qr-panel');
  const cardDetails = document.getElementById('card-details');
  const paymentForm = document.getElementById('payment-form');
  const confirmation = document.getElementById('payment-dialog');
  const closeConfirmation = document.getElementById('close-payment-dialog');
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') ?? '1';

  function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    paymentForm.classList.add('hidden');
  }

  if (!/^\d+$/.test(requestedId)) {
    showError('ไม่พบโรงแรมที่ต้องการ กรุณากลับไปเลือกโรงแรมจากหน้าแรก');
    return;
  }

  let booking;
  try {
    const storedBooking = sessionStorage.getItem('dockerHotelBooking');
    if (!storedBooking) {
      showError('ไม่พบรายละเอียดการจอง กรุณากลับไปกรอกข้อมูลการเข้าพักอีกครั้ง');
      return;
    }
    booking = JSON.parse(storedBooking);
  } catch (storageError) {
    showError(`อ่านรายละเอียดการจองไม่สำเร็จ: ${storageError.message}`);
    return;
  }

  if (
    Number(booking.hotelId) !== Number(requestedId)
    || typeof booking.name !== 'string'
    || typeof booking.email !== 'string'
    || !booking.name.trim()
    || !booking.email.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(booking.checkin)
    || !/^\d{4}-\d{2}-\d{2}$/.test(booking.checkout)
    || !Number.isInteger(Number(booking.guests))
    || Number(booking.guests) < 1
    || Number(booking.guests) > 6
    || Date.parse(`${booking.checkout}T00:00:00Z`) <= Date.parse(`${booking.checkin}T00:00:00Z`)
  ) {
    sessionStorage.removeItem('dockerHotelBooking');
    showError('รายละเอียดการจองไม่ถูกต้อง กรุณากลับไปกรอกข้อมูลใหม่');
    return;
  }

  let hotel;
  try {
    fetch('hotels.json')
      .then((response) => {
        if (!response.ok) throw new Error(`โหลดข้อมูลโรงแรมไม่สำเร็จ (${response.status})`);
        return response.json();
      })
      .then((hotels) => {
        hotel = hotels.find((item) => item.id === booking.hotelId);
        if (!hotel) throw new Error('ไม่พบข้อมูลโรงแรม');
        const nights = Math.round((Date.parse(`${booking.checkout}T00:00:00Z`) - Date.parse(`${booking.checkin}T00:00:00Z`)) / 86400000);
        document.title = `ชำระเงิน — ${hotel.name} — Docker Hotel`;
        const hotelLink = document.getElementById('payment-hotel-link');
        hotelLink.href = `hotel.html?id=${encodeURIComponent(hotel.id)}`;
        hotelLink.textContent = hotel.name;
        document.getElementById('back-to-booking').href = `booking.html?id=${encodeURIComponent(hotel.id)}`;
        document.getElementById('payment-hotel-name').textContent = hotel.name;
        document.getElementById('payment-hotel-rating').textContent = `${hotel.rating}.0 ★`;
        document.getElementById('payment-hotel-city').textContent = hotel.city;
        document.getElementById('payment-hotel-image').src = hotel.image;
        document.getElementById('payment-hotel-image').alt = hotel.name;
        document.getElementById('payment-guest-name').textContent = booking.name;
        document.getElementById('payment-guest-email').textContent = booking.email;
        document.getElementById('payment-stay-dates').textContent = `${formatPaymentDate(booking.checkin)} – ${formatPaymentDate(booking.checkout)}`;
        document.getElementById('payment-guest-count').textContent = `${booking.guests} คน`;
        document.getElementById('payment-night-count').textContent = `${nights} คืน`;
        document.getElementById('payment-total').textContent = `฿${(nights * hotel.price).toLocaleString('th-TH')}`;
      })
      .catch((loadError) => showError(`${loadError.message} กรุณากลับไปหน้าแรกแล้วลองอีกครั้ง`));
  } catch (loadError) {
    showError(`${loadError.message} กรุณากลับไปหน้าแรกแล้วลองอีกครั้ง`);
    return;
  }

  methods.forEach((method) => {
    method.addEventListener('change', () => {
      const details = {
        qr: 'QR นี้เปิดวิดีโอ YouTube “เจ้าชายคลองตัน” ตามลิงก์ที่คุณส่งมา ไม่ใช่ QR สำหรับชำระเงิน',
        'pay-at-hotel': 'เลือกชำระเมื่อเข้าพัก โดยชำระกับที่พักเมื่อเช็กอิน ไม่ต้องกรอกข้อมูลการเงินที่นี่',
        card: 'กรอกข้อมูลทดสอบเท่านั้น ฟอร์มนี้ไม่เชื่อมต่อระบบรับชำระเงินจริง และห้ามใช้ข้อมูลบัตรจริง',
      };
      methodDetails.textContent = details[method.value];
      const isQr = method.value === 'qr';
      qrPanel.classList.toggle('hidden', !isQr);
      if (isQr) {
        const videoUrl = 'https://www.youtube.com/watch?v=gppmxR0sDz8';
        document.getElementById('youtube-qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(videoUrl)}`;
      }
      const isCard = method.value === 'card';
      cardDetails.classList.toggle('hidden', !isCard);
      cardDetails.querySelectorAll('input').forEach((input) => {
        input.disabled = !isCard;
        input.required = isCard;
      });
      document.getElementById('payment-confirm-button').disabled = false;
    });
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedMethod = paymentForm.elements['payment-method'].value;
    if (!selectedMethod) return;
    let cardEnding = '';
    if (selectedMethod === 'card') {
      const cardNumber = paymentForm.elements.cardNumber.value.replace(/\s/g, '');
      const expiry = paymentForm.elements.cardExpiry.value;
      const cvv = paymentForm.elements.cardCvv.value;
      if (!/^\d{16}$/.test(cardNumber) || !/^4242424242424242$/.test(cardNumber)) {
        paymentForm.elements.cardNumber.setCustomValidity('ใช้หมายเลขบัตรทดสอบ 4242 4242 4242 4242 เท่านั้น');
        paymentForm.elements.cardNumber.reportValidity();
        paymentForm.elements.cardNumber.setCustomValidity('');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        paymentForm.elements.cardExpiry.setCustomValidity('กรอกวันหมดอายุรูปแบบ MM/YY เช่น 12/30');
        paymentForm.elements.cardExpiry.reportValidity();
        paymentForm.elements.cardExpiry.setCustomValidity('');
        return;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        paymentForm.elements.cardCvv.setCustomValidity('กรอก CVV ตัวอย่าง 3 หรือ 4 หลัก');
        paymentForm.elements.cardCvv.reportValidity();
        paymentForm.elements.cardCvv.setCustomValidity('');
        return;
      }
      cardEnding = cardNumber.slice(-4);
    }
    const labels = {
      qr: 'QR Code ไปยัง YouTube (ไม่ใช่การชำระเงิน)',
      'pay-at-hotel': 'ชำระตอนเข้าพัก',
      card: 'บัตรเครดิต/เดบิต (ตัวอย่าง)',
    };
    document.getElementById('confirmed-payment-method').textContent = labels[selectedMethod];
    const cardEndingMessage = document.getElementById('confirmed-card-ending');
    cardEndingMessage.textContent = cardEnding ? `บัตรทดสอบลงท้ายด้วย ${cardEnding}` : '';
    cardEndingMessage.classList.toggle('hidden', !cardEnding);
    if (selectedMethod === 'card') {
      ['cardholder', 'cardNumber', 'cardExpiry', 'cardCvv'].forEach((name) => {
        paymentForm.elements[name].value = '';
      });
    }
    confirmation.showModal();
  });

  closeConfirmation.addEventListener('click', () => {
    confirmation.close();
    sessionStorage.removeItem('dockerHotelBooking');
    window.location.href = 'index.html';
  });
}

function formatPaymentDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

if (document.getElementById('hotel-grid')) initHotelListing();
if (document.getElementById('login-tab')) initAuthPage();
if (document.getElementById('hotel-name')) initHotelDetails();
if (document.getElementById('booking-form')) initBookingPage();
if (document.getElementById('payment-form')) initPaymentPage();
