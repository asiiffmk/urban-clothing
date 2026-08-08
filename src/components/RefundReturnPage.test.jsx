import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RefundReturnPage from './RefundReturnPage';

describe('RefundReturnPage Component', () => {
  const mockProducts = [
    { id: 1, name: 'The Vanguard Tee' },
    { id: 2, name: 'The Oxford Shirt' }
  ];

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    vi.stubGlobal('open', vi.fn());
  });

  it('renders heading, form fields and video reminder', () => {
    render(<RefundReturnPage products={mockProducts} onBack={mockOnBack} />);

    expect(screen.getByRole('heading', { name: /Refund & Return/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Order ID/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Garment \/ Product Bought/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Describe the issue \/ Complaint/i)).toBeInTheDocument();
    expect(screen.getByText(/360° Package Opening Video Required/i)).toBeInTheDocument();
  });

  it('shows error if video confirmation is unchecked', () => {
    render(<RefundReturnPage products={mockProducts} onBack={mockOnBack} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Garment \/ Product Bought/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Describe the issue \/ Complaint/i), { target: { value: 'Item size is too small' } });
    
    const submitBtn = screen.getByRole('button', { name: /Send Complaint via WhatsApp/i });
    fireEvent.click(submitBtn);

    // Expect error message to be shown (video check error)
    expect(screen.getByText(/You must confirm that you have a 360° unboxing video/i)).toBeInTheDocument();
  });

  it('submits form and calls window.open with correct WhatsApp link', () => {
    render(<RefundReturnPage products={mockProducts} onBack={mockOnBack} />);

    // Fill in fields
    fireEvent.change(screen.getByLabelText(/Garment \/ Product Bought/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Describe the issue \/ Complaint/i), { target: { value: 'Item size is too small' } });
    
    // Toggle video check
    const checkboxLabel = screen.getByText(/I confirm that I have recorded a/i);
    fireEvent.click(checkboxLabel);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Send Complaint via WhatsApp/i });
    fireEvent.click(submitBtn);

    // Verify window.open was called
    expect(window.open).toHaveBeenCalled();
    const callUrl = decodeURIComponent(vi.mocked(window.open).mock.calls[0][0]);
    expect(callUrl).toContain('wa.me');
    expect(callUrl).toContain('The Vanguard Tee');
    expect(callUrl).toContain('Item size is too small');
    expect(callUrl).toContain('360° package opening video is recorded');
  });
});
