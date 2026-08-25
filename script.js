let cart = [];
let currentServiceData = null;
let selectedPackage = null;

const ADMIN_EMAIL = "edvinasnesukaitis17@gmail.com";

let users = JSON.parse(localStorage.getItem('registered_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('active_user')) || null;

const servicesConfig = {
  tiktok: {
    title: "TikTok Paslaugos",
    types: {
      "Peržiūros": [{ name: "1,000 Peržiūrų", price: 0.99 }, { name: "5,000 Peržiūrų", price: 2.99 }, { name: "10,000 Peržiūrų", price: 4.99 }],
      "Sekėjai": [{ name: "100 Sekėjų", price: 1.49 }, { name: "500 Sekėjų", price: 4.99 }, { name: "1,000 Sekėjų", price: 8.99 }],
      "Patiktukai": [{ name: "500 Patiktukų", price: 1.99 }, { name: "1,000 Patiktukų", price: 3.49 }]
    }
  },
  instagram: {
    title: "Instagram Paslaugos",
    types: {
      "Sekėjai": [{ name: "250 Sekėjų", price: 1.99 }, { name: "500 Sekėjų", price: 3.49 }, { name: "1,000 Sekėjų", price: 5.99 }],
      "Patiktukai": [{ name: "250 Patiktukų", price: 0.99 }, { name: "500 Patiktukų", price: 1.99 }]
    }
  },
  spotify: {
    title: "Spotify Premium",
    types: {
      "Prenumerata": [{ name: "1 Mėnesis", price: 3.99 }, { name: "3 Mėnesiai", price: 9.99 }, { name: "12 Mėnesių", price: 24.99 }]
    }
  },
  scripts: {
    title: "Unikalūs Skriptai ir Taisymas",
    types: {
      "Paslaugos": [{ name: "Klaidų Taisymas (Bug Fix)", price: 10.00 }, { name: "Unikalus Skriptas", price: 25.00 }]
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
});

function updateUserUI() {
  const loginBtn = document.querySelector('.login-link');
  const registerBtn = document.querySelector('.register-btn');
  let userBadge = document.getElementById('user-profile-badge');

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';

    if (!userBadge) {
      userBadge = document.createElement('div');
      userBadge.id = 'user-profile-badge';
      userBadge.style.cssText = 'color:#a78bfa; font-weight:600; font-size:0.85rem; display:flex; align-items:center; gap:6px; background:rgba(124,58,237,0.15); padding:6px 12px; border-radius:8px; border:1px solid #7c3aed;';
      const actions = document.querySelector('.nav-actions');
      actions.insertBefore(userBadge, actions.firstChild);
    }
    userBadge.innerHTML = `<i class="fa-solid fa-user"></i> ${currentUser.username} <i class="fa-solid fa-right-from-bracket" onclick="logoutUser()" style="margin-left:8px; cursor:pointer; color:#ef4444;" title="Atsijungti"></i>`;
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (userBadge) userBadge.remove();
  }
}

// ADMIN TIKRINIMAS
function checkAdminAccess() {
  if (currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    openAdminModal();
  } else {
    const enteredEmail = prompt("Ši zona skirta tik administratoriui. Įveskite savo el. paštą:");
    if (enteredEmail && enteredEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      currentUser = { username: "Admin", email: ADMIN_EMAIL };
      localStorage.setItem('active_user', JSON.stringify(currentUser));
      updateUserUI();
      openAdminModal();
    } else if (enteredEmail) {
      alert("Neteisingas el. paštas! Prieiga atmesta.");
    }
  }
}

function openAdminModal() {
  const list = document.getElementById('admin-users-list');
  if (users.length === 0) {
    list.innerHTML = '<p style="color:#6b7280; font-size:0.85rem;">Registruotų vartotojų kol kas nėra.</p>';
  } else {
    list.innerHTML = users.map((u, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
        <span><strong>${u.username}</strong> (${u.email})</span>
        <button onclick="deleteUser(${i})" style="background:#ef4444; border:none; color:#fff; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:0.75rem;">Ištrinti</button>
      </div>
    `).join('');
  }
  document.getElementById('admin-modal').style.display = 'flex';
}

function deleteUser(index) {
  users.splice(index, 1);
  localStorage.setItem('registered_users', JSON.stringify(users));
  openAdminModal();
  showNotification('Vartotojas pašalintas.');
}

function closeAdminModal() { document.getElementById('admin-modal').style.display = 'none'; }

// PIRKIMO LANGAS (MODAL)
function openProductModal(key, defaultType = null) {
  currentServiceData = servicesConfig[key];
  if (!currentServiceData) return;

  document.getElementById('modal-title').innerText = currentServiceData.title;

  const select = document.getElementById('service-type-select');
  select.innerHTML = '';

  const types = Object.keys(currentServiceData.types);
  types.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.innerText = t;
    select.appendChild(opt);
  });

  if (defaultType && types.includes(defaultType)) {
    select.value = defaultType;
  }

  updateOptions();
  document.getElementById('product-modal').style.display = 'flex';
}

function updateOptions() {
  const selectedType = document.getElementById('service-type-select').value;
  const packages = currentServiceData.types[selectedType] || [];
  const container = document.getElementById('package-options');
  container.innerHTML = '';

  packages.forEach((pkg, index) => {
    const card = document.createElement('div');
    card.className = `pkg-card ${index === 0 ? 'active' : ''}`;
    card.innerHTML = `<div style="font-weight:600; font-size:0.9rem;">${pkg.name}</div><div style="color:#10b981; font-weight:bold; margin-top:4px;">${pkg.price.toFixed(2)} €</div>`;
    card.onclick = () => {
      document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedPackage = pkg;
      document.getElementById('selected-price').innerText = pkg.price.toFixed(2) + ' €';
    };
    container.appendChild(card);
  });

  if (packages.length > 0) {
    selectedPackage = packages[0];
    document.getElementById('selected-price').innerText = packages[0].price.toFixed(2) + ' €';
  }
}

function closeProductModal() { document.getElementById('product-modal').style.display = 'none'; }

// KREPŠELIS
function addSelectedToCart() {
  const linkInput = document.getElementById('target-link').value.trim();
  if (!linkInput) {
    alert('Prašome įvesti nuorodą arba vartotojo vardą!');
    return;
  }

  cart.push({
    title: currentServiceData.title,
    package: selectedPackage.name,
    price: selectedPackage.price,
    link: linkInput
  });

  updateCartUI();
  closeProductModal();
  document.getElementById('target-link').value = '';
  showNotification('Įdėta į krepšelį!');
}

function updateCartUI() {
  document.getElementById('cart-count').innerText = cart.length;
  const container = document.getElementById('cart-items');
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color:#6b7280; text-align:center; margin-top:20px;">Krepšelis tuščias</p>';
  } else {
    container.innerHTML = cart.map((item, i) => {
      total += item.price;
      return `
        <div style="background:#040814; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.05);">
          <div style="font-weight:600; font-size:0.85rem; color:#fff;">${item.title} - ${item.package}</div>
          <div style="font-size:0.75rem; color:#9ca3af; margin:4px 0;">Nuoroda: ${item.link}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="color:#10b981; font-weight:bold; font-size:0.85rem;">${item.price.toFixed(2)} €</span>
            <button onclick="removeFromCart(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.8rem;"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('cart-total').innerText = total.toFixed(2) + ' €';
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cart-drawer').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

// PRISIJUNGIMAS
function handleAuthSubmit(e, type) {
  e.preventDefault();
  if (type === 'register') {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    currentUser = { username, email };
    localStorage.setItem('active_user', JSON.stringify(currentUser));

    showNotification('Paskyra sukurta!');
    closeAuthModal();
    updateUserUI();
  } else if (type === 'login') {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user || email === ADMIN_EMAIL) {
      currentUser = user ? { username: user.username, email: user.email } : { username: "Admin", email: ADMIN_EMAIL };
      localStorage.setItem('active_user', JSON.stringify(currentUser));
      showNotification('Prisijungta sėkmingai!');
      closeAuthModal();
      updateUserUI();
    } else {
      showNotification('Neteisingas el. paštas arba slaptažodis!', true);
    }
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('active_user');
  updateUserUI();
  showNotification('Atsijungta.');
}

function openAuthModal(t) { 
  document.getElementById('login-form-box').style.display = t === 'login' ? 'block' : 'none';
  document.getElementById('register-form-box').style.display = t === 'register' ? 'block' : 'none';
  document.getElementById('auth-modal').style.display = 'flex'; 
}
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }
function switchAuthTab(t) { openAuthModal(t); }

function openContactModal(e) { if(e) e.preventDefault(); document.getElementById('contact-modal').style.display = 'flex'; }
function closeContactModal() { document.getElementById('contact-modal').style.display = 'none'; }

function openPaymentModal() {
  if (cart.length === 0) {
    alert('Jūsų krepšelis tuščias!');
    return;
  }
  document.getElementById('pay-modal').style.display = 'flex';
}
function closePaymentModal() { document.getElementById('pay-modal').style.display = 'none'; }

function showNotification(m) {
  const toast = document.getElementById('toast-notification');
  document.getElementById('toast-message').innerText = m;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}