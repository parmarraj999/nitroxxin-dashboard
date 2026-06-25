import React from 'react';
import { Star, Download, ChevronRight, Edit2, Share2, Heart, Shield, Truck, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import './ProductDetails.css';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { product } = useProduct(productId);
  const title = product?.title || 'Apex V3 Carbon Aero';
  const price = `$${Number(product?.pricing?.sellingPrice || 599).toFixed(2)}`;
  const description = product?.fullDescription || 'The Apex V3 is the pinnacle of racing helmets. Engineered in the wind tunnel and tested on the track, it offers unmatched aerodynamics, ventilation, and safety in a stunning 3K carbon shell.';
  const mediaUrl = product?.media?.primaryImage;
  const stock = Number(product?.inventory?.stockQuantity || 4);

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div className="breadcrumb">
          <span>Products</span> <ChevronRight size={14} /> <span>{product?.category || 'Full Face Helmets'}</span> <ChevronRight size={14} /> <span className="current">{title}</span>
        </div>
        <div className="header-actions-main">
          <button className="export-btn"><Share2 size={16} /> Share</button>
          <button className="quick-add-btn" onClick={() => navigate(`/products/edit/${productId || ''}`)}><Edit2 size={16} /> Edit Product</button>
        </div>
      </div>

      <div className="details-layout">

        <div className="left-column">

          <div className="product-gallery">
            <div className="main-image dark" style={{ backgroundImage: mediaUrl ? `url(${mediaUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <span className="view-badge">360° VIEW</span>
            </div>
            <div className="thumbnail-list">
              {mediaUrl ? (
                <div className="thumbnail dark active" style={{ backgroundImage: `url(${mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              ) : (
                <div className="thumbnail dark active"></div>
              )}
              {product?.media?.galleryImages?.map((url, i) => (
                <div className="thumbnail dark" key={i} style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              ))}
            </div>
          </div>

          <div className="specs-container card">
            <div className="specs-tabs">
              <span className="tab active">Specifications</span>
              <span className="tab">Fit & Guide</span>
              <span className="tab">Compatibility</span>
            </div>

            <div className="specs-content">
              {product?.brand && (
                <div className="spec-row">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
              )}
              {product?.category && (
                <div className="spec-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{product.category}</span>
                </div>
              )}
              {product?.sku && (
                <div className="spec-row">
                  <span className="spec-label">SKU</span>
                  <span className="spec-value">{product.sku}</span>
                </div>
              )}
              {product?.weight && (
                <div className="spec-row">
                  <span className="spec-label">Weight</span>
                  <span className="spec-value">{product.weight}</span>
                </div>
              )}
              {product?.attributes && Object.entries(product.attributes).map(([key, val]) => {
                if (key === 'supportedAttributes' || !val) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div className="spec-row" key={key}>
                    <span className="spec-label">{label}</span>
                    <span className="spec-value">{String(val)}</span>
                  </div>
                );
              })}
              <div className="spec-row">
                <span className="spec-label">Certifications</span>
                <span className="spec-value">
                  {Object.entries(product?.safety || {})
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => key)
                    .join(', ') || 'N/A'}
                </span>
              </div>
            </div>

            <div className="docs-actions">
              <button className="export-btn"><Download size={14} /> Download Manual</button>
              <button className="export-btn"><Download size={14} /> CE Certificate</button>
            </div>
          </div>

          <div className="reviews-section">
            <div className="reviews-header-flex">
              <div>
                <h3 className="section-title">Customer Reviews</h3>
                <div className="rating-summary">
                  <div className="stars">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
                  </div>
                  <span>{Number(product?.averageRating || 4.8).toFixed(1)} / 5.0 ({product?.reviewCount || 124} reviews)</span>
                </div>
              </div>
              <button className="view-all-link" style={{background: 'none', border: 'none'}}>View All Reviews</button>
            </div>

            <div className="reviews-grid">
              <div className="review-card card">
                <div className="review-header">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e290267041" alt="Mark L." className="reviewer-img" />
                  <div>
                    <span className="reviewer-name">Mark L.</span>
                    <span className="review-date">Oct 12, 2026</span>
                  </div>
                </div>
                <div className="stars mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--warning)" color="var(--warning)" />)}
                </div>
                <p className="review-text">"Lightest helmet I've ever owned. The aerodynamics are incredible at track speeds. Highly recommend for any serious rider."</p>
              </div>
              <div className="review-card card">
                <div className="review-header">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e290267042" alt="Sarah J." className="reviewer-img" />
                  <div>
                    <span className="reviewer-name">Sarah J.</span>
                    <span className="review-date">Oct 05, 2026</span>
                  </div>
                </div>
                <div className="stars mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--warning)" color="var(--warning)" />)}
                </div>
                <p className="review-text">"Fit is snug but comfortable after break-in. Visor mechanism feels very premium."</p>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="product-buy-card card">
            <div className="title-price-flex">
              <h1 className="product-title-large">{title}</h1>
              <span className="product-price-large">{price}</span>
            </div>

            <p className="product-desc-text">
              {description}
            </p>

            <div className="options-section">
              <div className="option-header">
                <span className="option-title">Color: <strong>Matte Black Carbon</strong></span>
              </div>
              <div className="color-options">
                <div className="color-circle active" style={{backgroundColor: '#111827'}}></div>
                <div className="color-circle" style={{backgroundColor: '#1e3a8a'}}></div>
                <div className="color-circle" style={{backgroundColor: '#f3f4f6'}}></div>
              </div>
            </div>

            <div className="options-section">
              <div className="option-header">
                <span className="option-title">Size</span>
                <span className="size-guide">Size Guide</span>
              </div>
              <div className="size-options">
                <div className="size-box">S</div>
                <div className="size-box">M</div>
                <div className="size-box active">L</div>
                <div className="size-box">XL</div>
                <div className="size-box">XXL</div>
              </div>
              <p className="stock-warning">Only {stock} units left in size L</p>
            </div>

            <div className="action-buttons-stack">
              <div className="flex-row">
                <button className="add-cart-btn flex-1">Add to Cart</button>
                <button className="wishlist-btn"><Heart size={20} /></button>
              </div>
              <button className="buy-now-btn">Buy It Now</button>
            </div>

            <div className="info-list">
              <div className="info-item">
                <Truck size={18} className="text-muted" />
                <span>Free shipping worldwide on orders over $100</span>
              </div>
              <div className="info-item">
                <RotateCcw size={18} className="text-muted" />
                <span>30-day hassle-free return policy</span>
              </div>
              <div className="info-item">
                <Shield size={18} className="text-muted" />
                <span>1-year comprehensive manufacturer warranty</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
