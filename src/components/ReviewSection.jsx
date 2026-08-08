import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState('General Feedback');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            author,
            rating,
            comment,
            product: productName
          }
        ]);
      
      if (error) throw error;
      
      // Reset form
      setAuthor('');
      setComment('');
      setRating(5);
      setProductName('General Feedback');
      setShowForm(false);
      
      // Refresh list
      await fetchReviews();
    } catch (err) {
      console.error('Error submitting review to Supabase:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const availableProducts = [
    'The Oxford Textured Shirt',
    'The Vanguard Graphic Tee',
    'The Corduroy Utility Pants',
    'The Relaxed Summer Shorts',
    'The Premium Boxer Briefs',
    'Corduroy Shirts MSC1262',
    'Stripes Shirts MSC1265',
    'Linen Shirts MSC1263',
    'Semi Baggy Denim Pants MDP0176'
  ];

  return (
    <section className="reviews-section">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="section-title">
          Client <span className="highlight">Reviews</span>
        </h2>
        <p className="section-subtitle">
          Read authentic testimonials from gentlemen who appreciate structured design and refined comfort.
        </p>

        {/* Toggle Form Button */}
        <div className="review-form-toggle-wrap">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showForm ? <X size={16} /> : <MessageSquare size={16} />}
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Add Review Form */}
        {showForm && (
          <div className="review-form-container glass-panel" style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 className="review-form-title">Submit a Review</h3>
            <form onSubmit={handleSubmitReview}>
              
              <div className="review-form-group">
                <label htmlFor="authorName">Your Name</label>
                <input 
                  type="text" 
                  id="authorName" 
                  className="review-form-input" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Liam K."
                  required
                />
              </div>

              <div className="review-form-group">
                <label>Rating</label>
                <div className="review-form-stars-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`review-star-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      aria-label={`Set rating to ${star} stars`}
                    >
                      <Star size={20} fill={rating >= star ? 'var(--accent-gold)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>


              <div className="review-form-group">
                <label htmlFor="reviewComment">Your Feedback</label>
                <textarea 
                  id="reviewComment" 
                  className="review-form-input" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on the tailoring, comfort, and fabric quality..."
                  rows={4}
                  required
                />
              </div>

              <div className="review-form-actions">
                <button 
                  type="submit" 
                  className="btn btn-accent"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Reviews Loader / Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div className="checkout-spinner" style={{
              width: '28px',
              height: '28px',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--accent-gold)',
              borderRadius: '50%',
              animation: 'pulseGlow 1s infinite'
            }}></div>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="review-card glass-panel">
                
                {/* Header: Rating & Date */}
                <div className="review-header">
                  <div className="review-stars">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={16} className="star-icon filled" />
                    ))}
                    {[...Array(5 - rev.rating)].map((_, i) => (
                      <Star key={i} size={16} className="star-icon" style={{ opacity: 0.2 }} />
                    ))}
                  </div>
                  <span className="review-date">{formatDate(rev.created_at)}</span>
                </div>

                {/* Comment */}
                <p className="review-comment">"{rev.comment}"</p>

                {/* Author and Product Details */}
                <div className="review-footer">
                  <div className="review-author-info">
                    <div className="review-avatar">
                      {rev.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="review-author">
                        {rev.author}
                        <span className="verified-badge" title="Verified Purchase">
                          <CheckCircle size={12} className="verified-icon" />
                        </span>
                      </h4>
                      {rev.product && <span className="review-product">Purchased: {rev.product}</span>}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
