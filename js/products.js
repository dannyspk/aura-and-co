// Products Database
const products = [
    {
        id: 1,
        name: "Diamond Solitaire Ring",
        category: "rings",
        price: 299900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EDiamond Ring%3C/text%3E%3C/svg%3E",
        description: "Elegant 18K white gold ring with 1 carat diamond",
        badge: "Bestseller",
        featured: true
    },
    {
        id: 2,
        name: "Pearl Necklace Set",
        category: "necklaces",
        price: 149900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EPearl Necklace%3C/text%3E%3C/svg%3E",
        description: "Classic freshwater pearl necklace with matching earrings",
        badge: "New",
        featured: true
    },
    {
        id: 3,
        name: "Gold Hoop Earrings",
        category: "earrings",
        price: 79900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Hoops%3C/text%3E%3C/svg%3E",
        description: "14K yellow gold hoop earrings",
        featured: false
    },
    {
        id: 4,
        name: "Tennis Bracelet",
        category: "bracelets",
        price: 189900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ETennis Bracelet%3C/text%3E%3C/svg%3E",
        description: "Classic tennis bracelet with brilliant cut diamonds",
        badge: "Sale",
        featured: true
    },
    {
        id: 5,
        name: "Emerald Ring",
        category: "rings",
        price: 349900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EEmerald Ring%3C/text%3E%3C/svg%3E",
        description: "Stunning emerald ring with diamond accents",
        featured: false
    },
    {
        id: 6,
        name: "Gold Chain Necklace",
        category: "necklaces",
        price: 129900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Chain%3C/text%3E%3C/svg%3E",
        description: "22K gold chain necklace with delicate pendant",
        featured: false
    },
    {
        id: 7,
        name: "Diamond Stud Earrings",
        category: "earrings",
        price: 159900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EDiamond Studs%3C/text%3E%3C/svg%3E",
        description: "0.5 carat diamond stud earrings in platinum",
        badge: "Bestseller",
        featured: true
    },
    {
        id: 8,
        name: "Charm Bracelet",
        category: "bracelets",
        price: 89900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ECharm Bracelet%3C/text%3E%3C/svg%3E",
        description: "Sterling silver charm bracelet",
        featured: false
    },
    {
        id: 9,
        name: "Sapphire Ring",
        category: "rings",
        price: 279900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESapphire Ring%3C/text%3E%3C/svg%3E",
        description: "Royal blue sapphire ring with diamond halo",
        badge: "New",
        featured: false
    },
    {
        id: 10,
        name: "Statement Necklace",
        category: "necklaces",
        price: 179900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EStatement Necklace%3C/text%3E%3C/svg%3E",
        description: "Bold statement necklace with mixed gemstones",
        featured: false
    },
    {
        id: 11,
        name: "Drop Earrings",
        category: "earrings",
        price: 99900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EPearl Drops%3C/text%3E%3C/svg%3E",
        description: "Elegant drop earrings with pearls",
        featured: false
    },
    {
        id: 12,
        name: "Bangles Set",
        category: "bracelets",
        price: 119900,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Bangles%3C/text%3E%3C/svg%3E",
        description: "Set of 4 gold bangles with intricate designs",
        badge: "Sale",
        featured: false
    }
];

// Load products from localStorage if available (syncs with admin changes)
function loadProductsFromStorage() {
    const saved = localStorage.getItem('auraProducts');
    if (saved) {
        // Replace the products array with saved data
        products.length = 0;
        products.push(...JSON.parse(saved));
    }
}

// Initialize products from localStorage
loadProductsFromStorage();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
