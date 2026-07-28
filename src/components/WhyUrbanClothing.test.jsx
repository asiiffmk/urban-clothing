import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhyUrbanClothing from './WhyUrbanClothing';

describe('WhyUrbanClothing Component', () => {
  it('renders the section header correctly', () => {
    render(<WhyUrbanClothing />);
    
    // Check main title
    const header = screen.getByRole('heading', { level: 2 });
    expect(header).toHaveTextContent(/Why Urban Clothing/i);

    // Check subtitle
    expect(screen.getByText(/Crafting modern gentlemen's wear/i)).toBeInTheDocument();
  });

  it('renders exactly 3 pillar cards', () => {
    const { container } = render(<WhyUrbanClothing />);
    
    // The pillars-grid sliced the array to 3 items
    const cards = container.querySelectorAll('.pillar-card');
    expect(cards).toHaveLength(3);
  });

  it('renders correct content for the sliced pillars and excludes the 4th', () => {
    render(<WhyUrbanClothing />);

    // Renders the first three pillars
    expect(screen.getByText('Sartorial Excellence')).toBeInTheDocument();
    expect(screen.getByText('Minimalist Philosophy')).toBeInTheDocument();
    expect(screen.getByText('Sustainably Sourced')).toBeInTheDocument();

    // Does not render the 4th pillar (Gentlemen's Guarantee) due to .slice(0, 3)
    expect(screen.queryByText("Gentlemen's Guarantee")).not.toBeInTheDocument();
  });
});
