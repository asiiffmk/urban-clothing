import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQ from './FAQ';

describe('FAQ Component', () => {
  it('renders the section header correctly', () => {
    render(<FAQ />);
    
    // Check main title
    const header = screen.getByRole('heading', { level: 2 });
    expect(header).toHaveTextContent(/Frequently Asked Questions/i);
  });

  it('renders all 6 default questions', () => {
    render(<FAQ />);

    expect(screen.getByText('What is the return policy?')).toBeInTheDocument();
    expect(screen.getByText('When will I get my order?')).toBeInTheDocument();
    expect(screen.getByText('How much does shipping cost?')).toBeInTheDocument();
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
    expect(screen.getByText('Can I change or cancel my order?')).toBeInTheDocument();
    expect(screen.getByText('Is there any shop available?')).toBeInTheDocument();
  });

  it('toggles question visibility when clicked', () => {
    render(<FAQ />);
    
    const trigger = screen.getByText('What is the return policy?');
    
    // Initially, the trigger's aria-expanded should be false
    expect(trigger.closest('button')).toHaveAttribute('aria-expanded', 'false');
    
    // Click to open
    fireEvent.click(trigger);
    expect(trigger.closest('button')).toHaveAttribute('aria-expanded', 'true');
    
    // Click again to close
    fireEvent.click(trigger);
    expect(trigger.closest('button')).toHaveAttribute('aria-expanded', 'false');
  });
});
