# Categories Feature Setup

## Overview
The admin portal now includes a Categories management section where you can add, edit, and delete product categories dynamically.

## Database Setup

To enable this feature, you need to run the SQL migration in your Supabase database:

### Steps:

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com
   - Login to your account
   - Select your "aura-and-co" project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run the Migration**
   - Copy the contents of `supabase-categories-setup.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify**
   - Go to "Table Editor" in the left sidebar
   - You should see a new "categories" table with default categories (rings, necklaces, earrings, bracelets)

## How to Use

### Adding a New Category:

1. Login to admin portal at `/admin.html`
2. Click on the **"Categories"** tab
3. Click **"Add Category"** button
4. Enter the category name (e.g., "Anklets", "Pendants", "Charms")
5. Click **"Save Category"**

### Editing a Category:

1. Go to Categories tab
2. Click **"Edit"** button next to the category
3. Change the name
4. Click **"Save Category"**

### Deleting a Category:

1. Go to Categories tab
2. Click **"Delete"** button next to the category
3. Confirm deletion
   - If the category has products, you'll be warned
   - Products won't be deleted, but you'll need to reassign them to a new category

### Using Categories in Products:

- When adding or editing products, the Category dropdown will automatically show all your custom categories
- The dropdown is populated from the database, so new categories appear immediately

## Features:

✅ Dynamic category management
✅ Product count per category
✅ Automatic dropdown updates in product form
✅ Duplicate category name prevention
✅ Warning when deleting categories with products
✅ Default categories included (rings, necklaces, earrings, bracelets)

## Notes:

- Category names are automatically converted to lowercase for consistency
- Category names must be unique
- You cannot have two categories with the same name
- Products keep their category even if you delete the category (but you should reassign them)
