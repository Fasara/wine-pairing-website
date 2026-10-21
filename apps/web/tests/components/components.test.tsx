import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodCard } from '@/components/FoodCard';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Pagination } from '@/components/Pagination';
import { FoodPairingList, WinePairingList } from '@/components/PairingLists';
import { EmptyState, ErrorState, LoadingGrid } from '@/components/States';
import { StrengthMeter } from '@/components/StrengthMeter';
import { WineCard } from '@/components/WineCard';
import { WineFilters } from '@/components/WineFilters';
import { WineImage } from '@/components/WineImage';
import { food, foodPairing, wine, winePairing } from '../fixtures';

describe('WineCard', () => {
  it('shows wine details and links to the detail page', () => {
    render(<WineCard wine={wine()} />);
    expect(screen.getByRole('link', { name: 'Barolo Riserva' })).toHaveAttribute('href', '/wines/1');
    expect(screen.getByText('Cantina Rossa')).toBeInTheDocument();
    expect(screen.getByText('Piedmont, Italy')).toBeInTheDocument();
    expect(screen.getByText(/4\.4 \(1,234 reviews\)/)).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('omits missing origin and rating', () => {
    render(<WineCard wine={wine({ region: null, country: null, ratingAverage: null, imageUrl: null })} />);
    expect(screen.queryByText(/Rating/)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /No image available/ })).toBeInTheDocument();
  });
});

describe('WineImage', () => {
  it('falls back to a placeholder when the image fails', () => {
    render(<WineImage src="https://img.example/broken.png" name="Broken" />);
    fireEvent.error(screen.getByAltText('Broken'));
    expect(screen.getByRole('img', { name: /No image available for Broken/ })).toBeInTheDocument();
  });
});

describe('FoodCard / lists', () => {
  it('links foods by slug', () => {
    render(<ul><FoodCard food={food()} /></ul>);
    expect(screen.getByRole('link', { name: /Ribeye steak/ })).toHaveAttribute('href', '/foods/ribeye-steak');
  });

  it('renders wine pairings with strength and reason', () => {
    render(<WinePairingList pairings={[winePairing()]} />);
    expect(screen.getByRole('link', { name: 'Ribeye steak' })).toHaveAttribute('href', '/foods/ribeye-steak');
    expect(screen.getByRole('img', { name: 'Match strength 5 out of 5' })).toBeInTheDocument();
    expect(screen.getByText('Tannins cut through the fat.')).toBeInTheDocument();
  });

  it('renders food pairings linking to wines', () => {
    render(<FoodPairingList pairings={[foodPairing()]} />);
    expect(screen.getByRole('link', { name: 'Barolo Riserva' })).toHaveAttribute('href', '/wines/1');
    expect(screen.getByText('Structure matches richness.')).toBeInTheDocument();
  });
});

describe('StrengthMeter', () => {
  it('clamps values', () => {
    const { rerender } = render(<StrengthMeter strength={9} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Match strength 5 out of 5');
    rerender(<StrengthMeter strength={-2} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Match strength 0 out of 5');
  });
});

describe('WineFilters', () => {
  it('prefills values and offers clear when active', () => {
    render(<WineFilters type="white" country="France" q="chab" countries={['France', 'Italy']} />);
    expect(screen.getByLabelText('Search')).toHaveValue('chab');
    expect(screen.getByLabelText('Type')).toHaveValue('white');
    expect(screen.getByLabelText('Country')).toHaveValue('France');
    expect(screen.getByRole('option', { name: 'Italy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear' })).toHaveAttribute('href', '/wines');
    expect(screen.getByRole('search')).toHaveAttribute('action', '/wines');
  });

  it('hides clear when nothing is filtered', () => {
    render(<WineFilters countries={[]} />);
    expect(screen.queryByRole('link', { name: 'Clear' })).not.toBeInTheDocument();
  });
});

describe('Pagination', () => {
  const hrefFor = (p: number) => `/wines?page=${p}`;

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageSize={12} total={5} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('marks current page and disables previous on first page', () => {
    render(<Pagination page={1} pageSize={10} total={100} hrefFor={hrefFor} />);
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/wines?page=2');
    expect(screen.getAllByRole('link', { name: /^Page/ })).toHaveLength(5);
  });

  it('windows around the middle and disables next on last page', () => {
    const { rerender } = render(<Pagination page={5} pageSize={10} total={100} hrefFor={hrefFor} />);
    expect(screen.getByRole('link', { name: 'Page 3' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/wines?page=4');
    rerender(<Pagination page={10} pageSize={10} total={100} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Page 6' })).toBeInTheDocument();
  });
});

describe('States', () => {
  it('EmptyState renders title, text and action', () => {
    render(<EmptyState title="Nothing" action={{ href: '/x', label: 'Go' }}>Try again</EmptyState>);
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/x');
  });

  it('EmptyState works without optional parts', () => {
    render(<EmptyState title="Bare" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('ErrorState is an alert and retries', () => {
    const retry = vi.fn();
    render(<ErrorState message="Down" onRetry={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Down');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();
  });

  it('ErrorState without retry has no button', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('LoadingGrid announces status', () => {
    render(<LoadingGrid label="Loading wines" count={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading wines');
  });
});

describe('chrome', () => {
  it('Header has main nav; Footer mentions data source', () => {
    render(<><Header /><Footer /></>);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Wines');
    expect(screen.getByRole('link', { name: 'Foods' })).toHaveAttribute('href', '/foods');
    expect(screen.getByText(/SampleAPIs/)).toBeInTheDocument();
  });
});
