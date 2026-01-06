# Admin Portal - Aura & Co

## 🔐 Access
**URL:** http://localhost:8080/admin.html (or /admin after deployment)

**Default Credentials:**
- Username: `admin`
- Password: `aura123`

⚠️ **IMPORTANT:** Change these credentials in `js/admin.js` before deployment!

## ✨ Features

### Product Management
- ✅ **View All Products** - Table view with all product details
- ✅ **Add New Products** - Complete form with validation
- ✅ **Edit Products** - Update any product detail
- ✅ **Delete Products** - Remove products with confirmation
- ✅ **Image Preview** - Live preview of product images
- ✅ **Auto Placeholders** - SVG placeholders if no image provided

### Product Fields
- **Name** - Product title (required)
- **Category** - Rings, Necklaces, Earrings, Bracelets (required)
- **Price** - In PKR (required)
- **Description** - Product details (required)
- **Image URL** - Product image URL (optional, generates placeholder if empty)
- **Badge** - Bestseller, New, Sale (optional)
- **Featured** - Show on homepage (optional)

## 💾 Data Storage

Products are stored in **localStorage** with key `auraProducts`. 

- Changes are **immediate** and **local to your browser**
- Products sync across shop page, homepage, cart, and checkout
- Clear browser data = lose all changes
- For production: Replace with backend API

## 🚀 Usage

### Adding a Product
1. Click "Add New Product" button
2. Fill in all required fields (marked with *)
3. Optionally add image URL, badge, and featured status
4. Click "Save Product"

### Editing a Product
1. Click "Edit" button on any product
2. Modify fields as needed
3. Click "Save Product"

### Deleting a Product
1. Click "Delete" button on any product
2. Confirm deletion
3. Product is removed immediately

### Image URLs
- Use direct image URLs (e.g., https://example.com/image.jpg)
- Leave blank to generate SVG placeholder with brand colors
- Supports any web-accessible image format

## 🔒 Security Notes

### Current Implementation (Development)
- Simple username/password stored in JavaScript
- Session-based authentication (sessionStorage)
- **NOT SECURE for production!**

### For Production Deployment
1. **Change credentials** in `js/admin.js`
2. **Add server-side authentication** (e.g., Firebase Auth, Auth0, JWT)
3. **Implement proper backend** with database (MongoDB, PostgreSQL, Supabase)
4. **Use environment variables** for secrets
5. **Add rate limiting** to prevent brute force
6. **Implement HTTPS** (Vercel does this automatically)
7. **Add audit logging** for product changes

## 🛠️ Technical Details

### Files
- `admin.html` - Admin interface
- `js/admin.js` - Admin logic and authentication
- `js/products.js` - Shared product database

### How It Works
1. Admin logs in with credentials
2. Products loaded from localStorage (or default from products.js)
3. Changes saved to localStorage immediately
4. All pages (shop, home, cart) read from localStorage
5. If no localStorage data, defaults to products.js

### localStorage Keys
- `auraProducts` - Product array
- `adminLoggedIn` - Auth state (sessionStorage)
- `adminName` - Logged-in username (sessionStorage)

## 📱 Mobile Responsive
- Fully responsive design
- Works on tablets and phones
- Optimized table layout for small screens

## 🎨 UI Features
- Clean, modern interface matching brand design
- Brand colors throughout
- Smooth animations and transitions
- Real-time image preview
- Toast notifications for actions
- Modal-based editing (no page refreshes)

## 🔄 Syncing with Frontend

Products automatically sync because:
1. Both admin and frontend read from same localStorage key
2. Changes in admin instantly available on shop pages
3. Shop pages check localStorage first, then fallback to products.js

## 🐛 Troubleshooting

**Can't login?**
- Check credentials in `js/admin.js`
- Clear sessionStorage and try again
- Check browser console for errors

**Products not saving?**
- Check localStorage is enabled in browser
- Ensure not in private/incognito mode
- Check browser console for errors

**Changes not showing on shop?**
- Hard refresh shop page (Cmd+Shift+R / Ctrl+Shift+R)
- Clear browser cache
- Check localStorage contains `auraProducts` key

**Images not loading?**
- Verify image URL is accessible
- Check for HTTPS/HTTP mixed content issues
- Try using placeholder by leaving field blank

## 📝 Future Enhancements

- [ ] Image upload to cloud storage (AWS S3, Cloudinary)
- [ ] Bulk product import/export (CSV, JSON)
- [ ] Product categories management
- [ ] Order management
- [ ] Inventory tracking
- [ ] Sales analytics dashboard
- [ ] Multi-user roles (admin, editor, viewer)
- [ ] Product variations (sizes, colors)
- [ ] SEO fields (meta description, keywords)
- [ ] Product image gallery (multiple images)

## 📞 Support

For issues or questions, contact the development team.

---

**Built with:** Pure HTML, CSS, JavaScript  
**Storage:** localStorage (temporary, for development)  
**Authentication:** Session-based (development only)  
**Ready for:** Local testing and development  
**Not ready for:** Production without backend implementation
