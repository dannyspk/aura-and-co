-- Update add_ons to use "customised jewellery" instead of "Custom Jewellery"
UPDATE add_ons 
SET applicable_to = ARRAY['customised jewellery']
WHERE 'Custom Jewellery' = ANY(applicable_to);
