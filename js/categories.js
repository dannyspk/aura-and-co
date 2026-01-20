// Categories Management for Frontend
let categories = [];

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        categories = data || [];
        return categories;
    } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
        categories = [
            { name: 'rings' },
            { name: 'necklaces' },
            { name: 'earrings' },
            { name: 'bracelets' }
        ];
        return categories;
    }
}

// Capitalize first letter
function capitalizeCategory(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update navigation menus with categories
function updateCategoryMenus() {
    // Find all category dropdown containers
    const dropdowns = document.querySelectorAll('.dropdown-content');
    
    dropdowns.forEach(dropdown => {
        // Check if this is a collections/category dropdown (by checking if it has category links)
        const hasCategories = dropdown.querySelector('a[href*="category="]');
        
        if (hasCategories) {
            // Clear existing category links
            const categoryLinks = Array.from(dropdown.querySelectorAll('a[href*="category="]'));
            categoryLinks.forEach(link => link.remove());
            
            // Add new category links from database
            categories.forEach(category => {
                const link = document.createElement('a');
                link.href = `shop.html?category=${category.name}`;
                link.textContent = capitalizeCategory(category.name);
                
                // Insert at the beginning (before other links like "Our Story")
                if (dropdown.firstChild) {
                    dropdown.insertBefore(link, dropdown.firstChild);
                } else {
                    dropdown.appendChild(link);
                }
            });
        }
    });
    
    // Update mobile menu categories if it exists
    updateMobileCategoryMenu();
    
    // Update shop filter buttons if they exist
    updateShopFilters();
}

// Update mobile menu categories
function updateMobileCategoryMenu() {
    const mobileNav = document.querySelector('.nav, .main-nav');
    if (!mobileNav) return;
    
    // Find the Collections dropdown in mobile menu
    const mobileDropdowns = mobileNav.querySelectorAll('.dropdown-content, .sub-menu');
    
    mobileDropdowns.forEach(dropdown => {
        const hasCategories = dropdown.querySelector('a[href*="category="]');
        
        if (hasCategories) {
            // Clear existing category links
            const categoryLinks = Array.from(dropdown.querySelectorAll('a[href*="category="]'));
            categoryLinks.forEach(link => link.remove());
            
            // Add new category links from database
            categories.forEach(category => {
                const link = document.createElement('a');
                link.href = `shop.html?category=${category.name}`;
                link.textContent = capitalizeCategory(category.name);
                dropdown.insertBefore(link, dropdown.firstChild);
            });
        }
    });
}

// Update shop page filter buttons
function updateShopFilters() {
    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;
    
    // Clear existing category filter buttons (keep "All" button)
    const categoryButtons = Array.from(filtersContainer.querySelectorAll('.filter-btn[data-category]:not([data-category="all"])'));
    categoryButtons.forEach(btn => btn.remove());
    
    // Add new category filter buttons from database
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-category', category.name);
        button.textContent = capitalizeCategory(category.name);
        
        // Add click event listener (if shop.js hasn't loaded yet, it will be added later)
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Trigger filter update if shop.js is loaded
            if (typeof renderProducts === 'function') {
                const event = new CustomEvent('categoryFilterChange', { detail: { category: category.name } });
                document.dispatchEvent(event);
            }
        });
        
        filtersContainer.appendChild(button);
    });
}

// Initialize categories on page load
(async function initCategories() {
    await loadCategories();
    updateCategoryMenus();
})();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.categoriesModule = {
        loadCategories,
        updateCategoryMenus,
        categories
    };
}
