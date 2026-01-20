-- Migration: Add support for multiple product images
-- Run this in your Supabase SQL Editor to add multiple images support

-- Add images column (array of TEXT) to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Migrate existing image data to images array
-- This copies the single image URL to the first element of the images array
UPDATE products 
SET images = ARRAY[image]
WHERE image IS NOT NULL AND images IS NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN products.image IS 'Primary/main image URL (first image). Kept for backward compatibility.';
COMMENT ON COLUMN products.images IS 'Array of all product image URLs. First image is the main/primary image.';

-- Create index for better performance when querying images
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Verify the migration
SELECT 
    id, 
    name, 
    image as old_single_image,
    images as new_images_array,
    array_length(images, 1) as image_count
FROM products
LIMIT 5;
