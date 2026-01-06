// Products Database
const products = [
    {
        id: 1,
        name: "Diamond Solitaire Ring",
        category: "rings",
        price: 2999,
        image: "images/ring1.jpg",
        description: "Elegant 18K white gold ring with 1 carat diamond",
        badge: "Bestseller",
        featured: true
    },
    {
        id: 2,
        name: "Pearl Necklace Set",
        category: "necklaces",
        price: 1499,
        image: "images/necklace1.jpg",
        description: "Classic freshwater pearl necklace with matching earrings",
        badge: "New",
        featured: true
    },
    {
        id: 3,
        name: "Gold Hoop Earrings",
        category: "earrings",
        price: 799,
        image: "images/earring1.jpg",
        description: "14K yellow gold hoop earrings",
        featured: false
    },
    {
        id: 4,
        name: "Tennis Bracelet",
        category: "bracelets",
        price: 1899,
        image: "images/bracelet1.jpg",
        description: "Classic tennis bracelet with brilliant cut diamonds",
        badge: "Sale",
        featured: true
    },
    {
        id: 5,
        name: "Emerald Ring",
        category: "rings",
        price: 3499,
        image: "images/ring2.jpg",
        description: "Stunning emerald ring with diamond accents",
        featured: false
    },
    {
        id: 6,
        name: "Gold Chain Necklace",
        category: "necklaces",
        price: 1299,
        image: "images/necklace2.jpg",
        description: "18K gold chain necklace with delicate pendant",
        featured: false
    },
    {
        id: 7,
        name: "Diamond Stud Earrings",
        category: "earrings",
        price: 1599,
        image: "images/earring2.jpg",
        description: "0.5 carat diamond stud earrings in platinum",
        badge: "Bestseller",
        featured: true
    },
    {
        id: 8,
        name: "Charm Bracelet",
        category: "bracelets",
        price: 899,
        image: "images/bracelet2.jpg",
        description: "Sterling silver charm bracelet",
        featured: false
    },
    {
        id: 9,
        name: "Sapphire Ring",
        category: "rings",
        price: 2799,
        image: "images/ring3.jpg",
        description: "Royal blue sapphire ring with diamond halo",
        badge: "New",
        featured: false
    },
    {
        id: 10,
        name: "Statement Necklace",
        category: "necklaces",
        price: 1799,
        image: "images/necklace3.jpg",
        description: "Bold statement necklace with mixed gemstones",
        featured: false
    },
    {
        id: 11,
        name: "Drop Earrings",
        category: "earrings",
        price: 999,
        image: "images/earring3.jpg",
        description: "Elegant drop earrings with pearls",
        featured: false
    },
    {
        id: 12,
        name: "Bangles Set",
        category: "bracelets",
        price: 1199,
        image: "images/bracelet3.jpg",
        description: "Set of 3 gold bangles with intricate designs",
        badge: "Sale",
        featured: false
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
