// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const nav = document.querySelector('.nav, .main-nav');
    
    if (mobileMenuToggle && nav) {
        // Toggle menu
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.toggle('active');
            }
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                this.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Close menu when clicking on a non-dropdown link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768 && !this.parentElement.classList.contains('dropdown')) {
                    mobileMenuToggle.classList.remove('active');
                    nav.classList.remove('active');
                    if (mobileMenuOverlay) {
                        mobileMenuOverlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Toggle dropdowns on mobile
        const dropdowns = nav.querySelectorAll('.dropdown > a');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    this.parentElement.classList.toggle('active');
                }
            });
        });
    }
});
