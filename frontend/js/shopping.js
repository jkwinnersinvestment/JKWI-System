/* =========================================================
   JKWI SHOPPING & RENTING
   MARKETPLACE JAVASCRIPT
   Shop • Rent • Cart • Search • Filters • Animations
========================================================= */
/* =========================================================
   PRODUCT DATA
========================================================= */
const products = [
    {
        id: 1,
        name: "Excavator",
        category: "equipment",
        description: "Heavy-duty excavator suitable for construction and mining operations.",
        image: "images/equipment/excavator.jpg",
        salePrice: 850000,
        rentPrice: 4500,
        availability: "Available",
        featured: true
    },
    {
        id: 2,
        name: "Dump Truck",
        category: "vehicles",
        description: "Heavy transport vehicle designed for demanding construction and mining work.",
        image: "images/equipment/dump-truck.jpg",
        salePrice: 1200000,
        rentPrice: 6500,
        availability: "Available",
        featured: true
    },
    {
        id: 3,
        name: "Bulldozer",
        category: "construction",
        description: "Powerful earthmoving machine for grading, clearing and site preparation.",
        image: "images/equipment/bulldozer.jpg",
        salePrice: 1450000,
        rentPrice: 7200,
        availability: "Available",
        featured: true
    },
    {
        id: 4,
        name: "Front-End Loader",
        category: "equipment",
        description: "Versatile loader for material handling and construction operations.",
        image: "images/equipment/front-loader.jpg",
        salePrice: 980000,
        rentPrice: 5200,
        availability: "Available",
        featured: false
    },
    {
        id: 5,
        name: "Drilling Rig",
        category: "mining",
        description: "Industrial drilling equipment for exploration and mining applications.",
        image: "images/equipment/drilling-rig.jpg",
        salePrice: 2400000,
        rentPrice: 12500,
        availability: "Available",
        featured: true
    },
    {
        id: 6,
        name: "Crusher",
        category: "mining",
        description: "Industrial crushing equipment for processing and aggregate operations.",
        image: "images/equipment/crusher.jpg",
        salePrice: 1800000,
        rentPrice: 9000,
        availability: "Available",
        featured: false
    },
    {
        id: 7,
        name: "Motor Grader",
        category: "construction",
        description: "Precision grading machine for roads, infrastructure and construction sites.",
        image: "images/equipment/grader.jpg",
        salePrice: 1350000,
        rentPrice: 6800,
        availability: "Available",
        featured: false
    },
    {
        id: 8,
        name: "Mining Truck",
        category: "mining",
        description: "High-capacity haul truck designed for demanding mining environments.",
        image: "images/equipment/mining-truck.jpg",
        salePrice: 3200000,
        rentPrice: 18000,
        availability: "Available",
        featured: true
    }
];
/* =========================================================
   STATE
========================================================= */
let currentMode = "shop";
let currentCategory = "all";
let currentSearch = "";
let currentSort = "featured";
let rentalProduct = null;
let rentalDays = 1;
/* =========================================================
   DOM
========================================================= */
const productGrid =
    document.getElementById("productGrid");
const productCount =
    document.getElementById("productCount");
const marketEmpty =
    document.getElementById("marketEmpty");
const marketSearch =
    document.getElementById("marketSearch");
const clearSearch =
    document.getElementById("clearSearch");
const marketCategory =
    document.getElementById("marketCategory");
const marketSort =
    document.getElementById("marketSort");
const modeButtons =
    document.querySelectorAll(".market-mode-btn");
const categoryButtons =
    document.querySelectorAll(".market-category");
/* =========================================================
   CART STATE
========================================================= */
let cart = [];
/* =========================================================
   LOAD CART
========================================================= */
function loadCart() {
    try {
        const savedCart =
            localStorage.getItem("jkwiShoppingCart");
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        cart = [];
    }
}
/* =========================================================
   SAVE CART
========================================================= */
function saveCart() {
    localStorage.setItem(
        "jkwiShoppingCart",
        JSON.stringify(cart)
    );
}
/* =========================================================
   FORMAT MONEY
========================================================= */
function formatMoney(value) {
    return "R" + Number(value).toLocaleString("en-ZA");
}
/* =========================================================
   CATEGORY NAME
========================================================= */
function categoryName(category) {
    const names = {
        equipment: "Equipment",
        vehicles: "Vehicles",
        mining: "Mining",
        construction: "Construction",
        agriculture: "Agriculture"
    };
    return names[category] || category;
}
/* =========================================================
   GET PRODUCT PRICE
========================================================= */
function getProductPrice(product) {
    return currentMode === "rent"
        ? product.rentPrice
        : product.salePrice;
}
/* =========================================================
   CHECK CART
========================================================= */
function getCartItem(productId, mode = currentMode) {
    return cart.find(item =>
        item.id === productId &&
        item.mode === mode
    );
}
function isInCart(productId) {
    return Boolean(
        getCartItem(productId)
    );
}
/* =========================================================
   FILTER PRODUCTS
========================================================= */
function getFilteredProducts() {
    let filtered = [...products];
    /* MODE */
    /* Both Shop and Rent use the same marketplace
       products for now. */
    /* CATEGORY */
    if (currentCategory !== "all") {
        filtered = filtered.filter(product =>
            product.category === currentCategory
        );
    }
    /* SEARCH */
    if (currentSearch.trim() !== "") {
        const search =
            currentSearch.toLowerCase().trim();
        filtered = filtered.filter(product => {
            return (
                product.name
                    .toLowerCase()
                    .includes(search)
                ||
                product.category
                    .toLowerCase()
                    .includes(search)
                ||
                product.description
                    .toLowerCase()
                    .includes(search)
            );
        });
    }
    /* SORT */
    if (currentSort === "price-low") {
        filtered.sort((a, b) =>
            getProductPrice(a) -
            getProductPrice(b)
        );
    }
    if (currentSort === "price-high") {
        filtered.sort((a, b) =>
            getProductPrice(b) -
            getProductPrice(a)
        );
    }
    if (currentSort === "name") {
        filtered.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }
    if (currentSort === "featured") {
        filtered.sort((a, b) =>
            Number(b.featured) -
            Number(a.featured)
        );
    }
    return filtered;
}
/* =========================================================
   RENDER PRODUCTS
========================================================= */
function renderProducts() {
    const filtered =
        getFilteredProducts();
    productGrid.innerHTML = "";
    productCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "item"
                : "items"
        }`;
    if (filtered.length === 0) {
        marketEmpty.hidden = false;
        return;
    }
    marketEmpty.hidden = true;
    filtered.forEach(product => {
        const item =
            getCartItem(product.id);
        const card =
            document.createElement("article");
        card.className =
            "market-product-card";
        if (item) {
            card.classList.add(
                "cart-added"
            );
        }
        const price =
            getProductPrice(product);
        const priceLabel =
            currentMode === "rent"
                ? "Per day"
                : "Purchase price";
        const actionText =
            item
                ? "Cancel"
                : currentMode === "rent"
                    ? "Rent"
                    : "Add to Cart";
        card.innerHTML = `
            <div class="market-product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
                <span class="product-mode-badge">
                    ${
                        currentMode === "rent"
                            ? "RENT"
                            : "SALE"
                    }
                </span>
                ${
                    item
                        ? `
                            <span class="product-added-check">
                                ✓
                            </span>
                        `
                        : ""
                }
                <span class="product-availability">
                    ${product.availability}
                </span>
            </div>
            <div class="market-product-content">
                <span class="market-product-category">
                    ${categoryName(product.category)}
                </span>
                <h3>
                    ${product.name}
                </h3>
                <p class="market-product-description">
                    ${product.description}
                </p>
                <div class="market-product-footer">
                    <div class="market-product-price">
                        <small>
                            ${priceLabel}
                        </small>
                        <strong>
                            ${formatMoney(price)}
                        </strong>
                    </div>
                    <button
                        type="button"
                        class="product-add-btn ${
                            item
                                ? "cancel"
                                : ""
                        }"
                        data-action="cart"
                        data-id="${product.id}"
                    >
                        ${actionText}
                    </button>
                </div>
                <button
                    type="button"
                    class="product-view-btn"
                    data-action="view"
                    data-id="${product.id}"
                >
                    View Details →
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}
/* =========================================================
   ADD TO CART
========================================================= */
function addToCart(product) {
    const existing =
        getCartItem(product.id);
    if (existing) {
        existing.quantity++;
        saveCart();
        updateCart();
        showToast(
            "Quantity updated",
            `${product.name} quantity increased.`
        );
        return;
    }
    const item = {
        id: product.id,
        mode: currentMode,
        quantity: 1,
        days:
            currentMode === "rent"
                ? rentalDays
                : 1
    };
    cart.push(item);
    saveCart();
    updateCart();
    animateAdd(product.id);
    showToast(
        "Added to cart",
        `${product.name} is now in your cart.`
    );
}
/* =========================================================
   REMOVE FROM CART
========================================================= */
function removeFromCart(productId, mode) {
    const index =
        cart.findIndex(item =>
            item.id === productId &&
            item.mode === mode
        );
    if (index === -1) return;
    const product =
        products.find(product =>
            product.id === productId
        );
    cart.splice(index, 1);
    saveCart();
    updateCart();
    renderProducts();
    showToast(
        "Removed",
        `${product ? product.name : "Item"} removed from cart.`
    );
}
/* =========================================================
   TOGGLE CART
========================================================= */
function toggleProduct(productId) {
    const product =
        products.find(item =>
            item.id === productId
        );
    if (!product) return;
    const existing =
        getCartItem(productId);
    if (existing) {
        removeFromCart(
            productId,
            currentMode
        );
        return;
    }
    if (currentMode === "rent") {
        openRentalModal(product);
        return;
    }
    addToCart(product);
}
/* =========================================================
   ADD ANIMATION
========================================================= */
function animateAdd(productId) {
    const card =
        productGrid.querySelector(
            `[data-id="${productId}"]`
        )?.closest(
            ".market-product-card"
        );
    if (!card) {
        renderProducts();
        return;
    }
    card.classList.remove(
        "cart-added"
    );
    void card.offsetWidth;
    card.classList.add(
        "cart-added"
    );
    renderProducts();
    const newCard =
        productGrid.querySelector(
            `[data-id="${productId}"]`
        )?.closest(
            ".market-product-card"
        );
    if (newCard) {
        newCard.classList.add(
            "cart-added"
        );
    }
    bumpCartBadge();
}
/* =========================================================
   CART BADGE
========================================================= */
function bumpCartBadge() {
    const badge =
        document.getElementById(
            "cartBadge"
        );
    if (!badge) return;
    badge.classList.remove(
        "bump"
    );
    void badge.offsetWidth;
    badge.classList.add(
        "bump"
    );
}
/* =========================================================
   UPDATE CART
========================================================= */
function updateCart() {
    saveCart();
    const badge =
        document.getElementById(
            "cartBadge"
        );
    const itemCount =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );
    badge.textContent =
        itemCount;
    const cartBody =
        document.getElementById(
            "cartBody"
        );
    const cartSubtotal =
        document.getElementById(
            "cartSubtotal"
        );
    const cartItemCount =
        document.getElementById(
            "cartItemCount"
        );
    if (cartItemCount) {
        cartItemCount.textContent =
            `${itemCount} ${
                itemCount === 1
                    ? "item"
                    : "items"
            }`;
    }
    if (!cart.length) {
        cartBody.innerHTML = `
            <div class="cart-empty">
                <strong>
                    Your cart is empty
                </strong>
                <span>
                    Add something from the marketplace.
                </span>
            </div>
        `;
        cartSubtotal.textContent =
            "R0";
        return;
    }
    let subtotal = 0;
    cartBody.innerHTML = "";
    cart.forEach(item => {
        const product =
            products.find(
                product =>
                    product.id === item.id
            );
        if (!product) return;
        const price =
            item.mode === "rent"
                ? product.rentPrice
                : product.salePrice;
        let itemTotal =
            price * item.quantity;
        if (item.mode === "rent") {
            itemTotal *=
                item.days || 1;
        }
        subtotal += itemTotal;
        const cartItem =
            document.createElement("div");
        cartItem.className =
            "cart-item";
        cartItem.dataset.id =
            product.id;
        cartItem.dataset.mode =
            item.mode;
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                >
            </div>
            <div class="cart-item-main">
                <div class="cart-item-top">
                    <span class="cart-item-name">
                        ${product.name}
                    </span>
                    <span class="cart-item-price">
                        ${formatMoney(itemTotal)}
                    </span>
                </div>
                <div class="cart-item-info">
                    ${
                        item.mode === "rent"
                            ? `Rental · ${item.days} day${
                                item.days === 1
                                    ? ""
                                    : "s"
                            }`
                            : "Purchase"
                    }
                </div>
                <div class="cart-item-controls">
                    <div class="cart-quantity">
                        <button
                            type="button"
                            data-cart-action="minus"
                            data-id="${product.id}"
                            data-mode="${item.mode}"
                        >
                            −
                        </button>
                        <span>
                            ${item.quantity}
                        </span>
                        <button
                            type="button"
                            data-cart-action="plus"
                            data-id="${product.id}"
                            data-mode="${item.mode}"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        class="cart-remove"
                        data-cart-action="remove"
                        data-id="${product.id}"
                        data-mode="${item.mode}"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `;
        cartBody.appendChild(
            cartItem
        );
    });
    cartSubtotal.textContent =
        formatMoney(subtotal);
}
/* =========================================================
   CHANGE QUANTITY
========================================================= */
function changeQuantity(
    productId,
    mode,
    amount
) {
    const item =
        cart.find(cartItem =>
            cartItem.id === productId &&
            cartItem.mode === mode
        );
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) {
        removeFromCart(
            productId,
            mode
        );
        return;
    }
    saveCart();
    updateCart();
}
/* =========================================================
   CART EVENTS
========================================================= */
document.addEventListener(
    "click",
    event => {
        const cartAction =
            event.target.closest(
                "[data-cart-action]"
            );
        if (!cartAction) return;
        const action =
            cartAction.dataset.cartAction;
        const productId =
            Number(
                cartAction.dataset.id
            );
        const mode =
            cartAction.dataset.mode;
        if (action === "plus") {
            changeQuantity(
                productId,
                mode,
                1
            );
        }
        if (action === "minus") {
            changeQuantity(
                productId,
                mode,
                -1
            );
        }
        if (action === "remove") {
            const row =
                cartAction.closest(
                    ".cart-item"
                );
            if (row) {
                row.classList.add(
                    "removing"
                );
                setTimeout(() => {
                    removeFromCart(
                        productId,
                        mode
                    );
                }, 220);
            }
        }
    }
);
/* =========================================================
   PRODUCT BUTTON EVENTS
========================================================= */
productGrid.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                "[data-action]"
            );
        if (!button) return;
        const id =
            Number(button.dataset.id);
        if (
            button.dataset.action ===
            "cart"
        ) {
            toggleProduct(id);
        }
        if (
            button.dataset.action ===
            "view"
        ) {
            openQuickView(id);
        }
    }
);
/* =========================================================
   MODE SWITCH
========================================================= */
modeButtons.forEach(button => {
    button.addEventListener(
        "click",
        () => {
            const mode =
                button.dataset.mode;
            currentMode =
                mode;
            modeButtons.forEach(item =>
                item.classList.remove(
                    "active"
                )
            );
            button.classList.add(
                "active"
            );
            renderProducts();
        }
    );
});
/* =========================================================
   CATEGORY BUTTONS
========================================================= */
categoryButtons.forEach(button => {
    button.addEventListener(
        "click",
        () => {
            currentCategory =
                button.dataset.category;
            if (marketCategory) {
                marketCategory.value =
                    currentCategory;
            }
            categoryButtons.forEach(item =>
                item.classList.remove(
                    "active"
                )
            );
            button.classList.add(
                "active"
            );
            renderProducts();
        }
    );
});
/* =========================================================
   CATEGORY SELECT
========================================================= */
marketCategory.addEventListener(
    "change",
    () => {
        currentCategory =
            marketCategory.value;
        categoryButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.category ===
                currentCategory
            );
        });
        renderProducts();
    }
);
/* =========================================================
   SEARCH
========================================================= */
marketSearch.addEventListener(
    "input",
    () => {
        currentSearch =
            marketSearch.value;
        marketSearch.parentElement
            .classList.toggle(
                "has-value",
                marketSearch.value.length > 0
            );
        renderProducts();
    }
);
/* =========================================================
   CLEAR SEARCH
========================================================= */
clearSearch.addEventListener(
    "click",
    () => {
        marketSearch.value = "";
        currentSearch = "";
        marketSearch.parentElement
            .classList.remove(
                "has-value"
            );
        marketSearch.focus();
        renderProducts();
    }
);
/* =========================================================
   SORT
========================================================= */
marketSort.addEventListener(
    "change",
    () => {
        currentSort =
            marketSort.value;
        renderProducts();
    }
);
/* =========================================================
   RESET FILTERS
========================================================= */
document
    .getElementById("resetFilters")
    .addEventListener(
        "click",
        () => {
            currentCategory =
                "all";
            currentSearch =
                "";
            currentSort =
                "featured";
            marketSearch.value =
                "";
            marketCategory.value =
                "all";
            marketSort.value =
                "featured";
            marketSearch.parentElement
                .classList.remove(
                    "has-value"
                );
            categoryButtons.forEach(
                button =>
                    button.classList.toggle(
                        "active",
                        button.dataset.category ===
                        "all"
                    )
            );
            renderProducts();
        }
    );
/* =========================================================
   CART OPEN / CLOSE
========================================================= */
const cartOpen =
    document.getElementById(
        "cartOpen"
    );
const cartClose =
    document.getElementById(
        "cartClose"
    );
const marketCart =
    document.getElementById(
        "marketCart"
    );
const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );
function openCart() {
    marketCart.classList.add(
        "open"
    );
    cartOverlay.classList.add(
        "open"
    );
    document.body.style.overflow =
        "hidden";
}
function closeCartPanel() {
    marketCart.classList.remove(
        "open"
    );
    cartOverlay.classList.remove(
        "open"
    );
    document.body.style.overflow =
        "";
}
cartOpen.addEventListener(
    "click",
    openCart
);
cartClose.addEventListener(
    "click",
    closeCartPanel
);
cartOverlay.addEventListener(
    "click",
    closeCartPanel
);
/* =========================================================
   ESC KEY
========================================================= */
document.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Escape")
            return;
        closeCartPanel();
        closeQuickView();
        closeRentalModal();
    }
);
/* =========================================================
   QUICK VIEW
========================================================= */
const quickViewOverlay =
    document.getElementById(
        "quickViewOverlay"
    );
const quickViewContent =
    document.getElementById(
        "quickViewContent"
    );
const quickViewClose =
    document.getElementById(
        "quickViewClose"
    );
function openQuickView(productId) {
    const product =
        products.find(item =>
            item.id === productId
        );
    if (!product) return;
    const price =
        getProductPrice(product);
    quickViewContent.innerHTML = `
        <div class="quick-view-image">
            <img
                src="${product.image}"
                alt="${product.name}"
            >
        </div>
        <div class="quick-view-info">
            <span class="market-eyebrow">
                ${categoryName(product.category)}
            </span>
            <h2>
                ${product.name}
            </h2>
            <p>
                ${product.description}
            </p>
            <div class="quick-view-price">
                <small>
                    ${
                        currentMode === "rent"
                            ? "Rental price per day"
                            : "Purchase price"
                    }
                </small>
                <strong>
                    ${formatMoney(price)}
                </strong>
            </div>
            <button
                type="button"
                class="quick-view-add"
                data-quick-add="${product.id}"
            >
                ${
                    isInCart(product.id)
                        ? "Remove from Cart"
                        : currentMode === "rent"
                            ? "Rent This Asset"
                            : "Add to Cart"
                }
            </button>
        </div>
    `;
    quickViewOverlay.hidden =
        false;
    document.body.style.overflow =
        "hidden";
}
function closeQuickView() {
    quickViewOverlay.hidden =
        true;
    if (
        !marketCart.classList.contains(
            "open"
        )
    ) {
        document.body.style.overflow =
            "";
    }
}
quickViewClose.addEventListener(
    "click",
    closeQuickView
);
quickViewOverlay.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            quickViewOverlay
        ) {
            closeQuickView();
        }
    }
);
/* =========================================================
   QUICK VIEW ADD
========================================================= */
quickViewContent.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                "[data-quick-add]"
            );
        if (!button) return;
        const id =
            Number(
                button.dataset.quickAdd
            );
        toggleProduct(id);
        setTimeout(() => {
            openQuickView(id);
        }, 80);
    }
);
/* =========================================================
   RENTAL MODAL
========================================================= */
const rentalOverlay =
    document.getElementById(
        "rentalOverlay"
    );
const rentalConfirm =
    document.getElementById(
        "rentalConfirm"
    );
const rentalClose =
    document.getElementById(
        "rentalClose"
    );
const rentalOptions =
    document.querySelectorAll(
        ".rental-option"
    );
function openRentalModal(product) {
    rentalProduct =
        product;
    rentalDays =
        1;
    rentalOptions.forEach(
        option => {
            option.classList.toggle(
                "active",
                option.dataset.days ===
                "1"
            );
        }
    );
    rentalOverlay.hidden =
        false;
    document.body.style.overflow =
        "hidden";
}
function closeRentalModal() {
    rentalOverlay.hidden =
        true;
    rentalProduct =
        null;
    if (
        !marketCart.classList.contains(
            "open"
        ) &&
        quickViewOverlay.hidden
    ) {
        document.body.style.overflow =
            "";
    }
}
rentalOptions.forEach(option => {
    option.addEventListener(
        "click",
        () => {
            rentalDays =
                Number(
                    option.dataset.days
                );
            rentalOptions.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );
            option.classList.add(
                "active"
            );
        }
    );
});
rentalConfirm.addEventListener(
    "click",
    () => {
        if (!rentalProduct)
            return;
        addRentalToCart(
            rentalProduct,
            rentalDays
        );
        closeRentalModal();
    }
);
rentalClose.addEventListener(
    "click",
    closeRentalModal
);
rentalOverlay.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            rentalOverlay
        ) {
            closeRentalModal();
        }
    }
);
/* =========================================================
   ADD RENTAL
========================================================= */
function addRentalToCart(
    product,
    days
) {
    const existing =
        getCartItem(
            product.id,
            "rent"
        );
    if (existing) {
        existing.days =
            days;
        saveCart();
        updateCart();
        showToast(
            "Rental updated",
            `${product.name} · ${days} days`
        );
        return;
    }
    cart.push({
        id: product.id,
        mode: "rent",
        quantity: 1,
        days: days
    });
    saveCart();
    updateCart();
    renderProducts();
    bumpCartBadge();
    showToast(
        "Rental added",
        `${product.name} · ${days} days`
    );
}
/* =========================================================
   TOAST
========================================================= */
const marketToast =
    document.getElementById(
        "marketToast"
    );
const toastTitle =
    document.getElementById(
        "toastTitle"
    );
const toastMessage =
    document.getElementById(
        "toastMessage"
    );
let toastTimer;
function showToast(
    title,
    message
) {
    toastTitle.textContent =
        title;
    toastMessage.textContent =
        message;
    marketToast.classList.add(
        "show"
    );
    clearTimeout(
        toastTimer
    );
    toastTimer =
        setTimeout(
            () => {
                marketToast.classList.remove(
                    "show"
                );
            },
            2600
        );
}
/* =========================================================
   CHECKOUT
========================================================= */
document
    .getElementById("checkoutButton")
    .addEventListener(
        "click",
        () => {
            if (!cart.length) {
                showToast(
                    "Cart is empty",
                    "Add an item before checking out."
                );
                return;
            }
            /*
                FUTURE:
                Replace this with:
                checkout.html
                or your JKWI account/checkout API.
            */
            showToast(
                "Checkout ready",
                "Your JKWI checkout system can be connected here."
            );
        }
    );
/* =========================================================
   INITIALIZE
========================================================= */
loadCart();
updateCart();
renderProducts();