# Nitroxx Firebase Schema

This dashboard uses these top-level collections:

- `vendors`
- `products`
- `product_categories`
- `product_attributes`
- `product_variants`
- `brands`
- `orders`
- `order_items`
- `inventory`
- `warehouses`
- `coupons`
- `reviews`
- `notifications`
- `analytics`
- `settlements`
- `withdrawals`
- `support_tickets`
- `media_library`
- `shipping_templates`
- `return_policies`
- `certifications`
- `bike_compatibility`

The executable structure and default field maps live in `src/schemas/firestoreSchema.js`.

Required deploy artifacts:

- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`
- Composite indexes: `firestore.indexes.json`
