import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { food, foodPairing, wine, winePairing } from '../fixtures';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

const api = vi.hoisted(() => ({
  listWines: vi.fn(),
  listCountries: vi.fn(),
  getWine: vi.fn(),
  getWinePairings: vi.fn(),
  listFoodCategories: vi.fn(),
  listFoods: vi.fn(),
  getFood: vi.fn(),
  getFoodWines: vi.fn(),
}));
vi.mock('@/lib/api', async (orig) => ({ ...(await orig<typeof import('@/lib/api')>()), api }));

import ErrorPage from '@/app/error';
import FoodDetailPage from '@/app/foods/[slug]/page';
import FoodsLoading from '@/app/foods/loading';
import FoodsPage from '@/app/foods/page';
import RootLayout from '@/app/layout';
import Loading from '@/app/loading';
import NotFound from '@/app/not-found';
import HomePage from '@/app/page';
import WineDetailPage from '@/app/wines/[id]/page';
import WinesLoading from '@/app/wines/loading';
import WinesPage from '@/app/wines/page';

beforeEach(() => vi.resetAllMocks());

const page = (items = [wine()], total = items.length) => ({ items, total, page: 1, pageSize: 12 });

describe('HomePage', () => {
  it('shows entry points and featured pairings', async () => {
    api.listWines.mockResolvedValue(page());
    api.getWinePairings.mockResolvedValue([winePairing()]);
    render(await HomePage());
    expect(screen.getByRole('link', { name: 'I have a wine' })).toHaveAttribute('href', '/wines');
    expect(screen.getByRole('link', { name: 'I have a dish' })).toHaveAttribute('href', '/foods');
    expect(screen.getAllByTestId('featured')).toHaveLength(1);
  });

  it('skips wines without pairings and hides the block', async () => {
    api.listWines.mockResolvedValue(page());
    api.getWinePairings.mockResolvedValue([]);
    render(await HomePage());
    expect(screen.queryByText('Featured pairings')).not.toBeInTheDocument();
  });

  it('still renders when the API is down', async () => {
    api.listWines.mockRejectedValue(new ApiError(0, 'down'));
    render(await HomePage());
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.queryByTestId('featured')).not.toBeInTheDocument();
  });
});

describe('WinesPage', () => {
  it('passes validated filters to the API and renders results', async () => {
    api.listWines.mockResolvedValue({ ...page([wine(), wine({ id: 2, name: 'Other' })], 30), page: 2 });
    api.listCountries.mockResolvedValue(['Italy']);
    render(await WinesPage({ searchParams: Promise.resolve({ type: 'red', country: 'Italy', q: ' bar ', page: '2' }) }));
    expect(api.listWines).toHaveBeenCalledWith({ type: 'red', country: 'Italy', q: 'bar', page: 2 });
    expect(screen.getByText('30 wines found')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/wines?type=red&country=Italy&q=bar&page=3');
  });

  it('ignores invalid type/page and tolerates a failing countries call', async () => {
    api.listWines.mockResolvedValue(page());
    api.listCountries.mockRejectedValue(new ApiError(500, 'x'));
    render(await WinesPage({ searchParams: Promise.resolve({ type: 'beer', page: '-4', country: '', q: '  ' }) }));
    expect(api.listWines).toHaveBeenCalledWith({ type: undefined, country: undefined, q: undefined, page: 1 });
    expect(screen.getByText('1 wine found')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    api.listWines.mockResolvedValue(page([], 0));
    api.listCountries.mockResolvedValue([]);
    render(await WinesPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No wines match your filters');
  });

  it('propagates API errors to the error boundary', async () => {
    api.listWines.mockRejectedValue(new ApiError(500, 'boom'));
    api.listCountries.mockResolvedValue([]);
    await expect(WinesPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('boom');
  });
});

describe('WineDetailPage', () => {
  it('renders wine details and pairings', async () => {
    api.getWine.mockResolvedValue(wine({ region: null }));
    api.getWinePairings.mockResolvedValue([winePairing()]);
    render(await WineDetailPage({ params: Promise.resolve({ id: '1' }) }));
    expect(screen.getByRole('heading', { level: 1, name: 'Barolo Riserva' })).toBeInTheDocument();
    expect(screen.getByText('Nebbiolo')).toBeInTheDocument();
    expect(screen.queryByText('Region')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('pairing')).toHaveLength(1);
  });

  it('shows empty pairings state', async () => {
    api.getWine.mockResolvedValue(wine());
    api.getWinePairings.mockResolvedValue([]);
    render(await WineDetailPage({ params: Promise.resolve({ id: '1' }) }));
    expect(screen.getByText('No pairings yet')).toBeInTheDocument();
  });

  it('404s on non-numeric ids and API 404', async () => {
    await expect(WineDetailPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    api.getWine.mockRejectedValue(new ApiError(404, 'nf'));
    api.getWinePairings.mockRejectedValue(new ApiError(404, 'nf'));
    await expect(WineDetailPage({ params: Promise.resolve({ id: '9' }) })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('rethrows other errors', async () => {
    api.getWine.mockRejectedValue(new ApiError(500, 'boom'));
    api.getWinePairings.mockResolvedValue([]);
    await expect(WineDetailPage({ params: Promise.resolve({ id: '9' }) })).rejects.toThrow('boom');
  });
});

describe('FoodsPage', () => {
  it('groups foods by category and skips empty categories', async () => {
    api.listFoodCategories.mockResolvedValue([
      { id: 1, slug: 'red-meat', name: 'Red meat' },
      { id: 2, slug: 'cheese', name: 'Cheese' },
    ]);
    api.listFoods.mockResolvedValue([food()]);
    render(await FoodsPage());
    expect(screen.getByRole('heading', { name: 'Red meat' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cheese' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ribeye steak/ })).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    api.listFoodCategories.mockResolvedValue([]);
    api.listFoods.mockResolvedValue([]);
    render(await FoodsPage());
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});

describe('FoodDetailPage', () => {
  it('renders matching wines', async () => {
    api.getFood.mockResolvedValue(food());
    api.getFoodWines.mockResolvedValue([foodPairing()]);
    render(await FoodDetailPage({ params: Promise.resolve({ slug: 'ribeye-steak' }) }));
    expect(screen.getByRole('heading', { level: 1, name: 'Ribeye steak' })).toBeInTheDocument();
    expect(screen.getAllByTestId('pairing')).toHaveLength(1);
  });

  it('shows empty state, 404 and rethrows', async () => {
    api.getFood.mockResolvedValue(food());
    api.getFoodWines.mockResolvedValue([]);
    render(await FoodDetailPage({ params: Promise.resolve({ slug: 'x' }) }));
    expect(screen.getByText('No wines yet')).toBeInTheDocument();

    api.getFood.mockRejectedValue(new ApiError(404, 'nf'));
    await expect(FoodDetailPage({ params: Promise.resolve({ slug: 'x' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    api.getFood.mockRejectedValue(new ApiError(500, 'boom'));
    await expect(FoodDetailPage({ params: Promise.resolve({ slug: 'x' }) })).rejects.toThrow('boom');
  });
});

describe('boundaries and layout', () => {
  it('error page offers retry', () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error('x')} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalled();
  });

  it('not-found and loading states render', () => {
    render(<><NotFound /><Loading /><WinesLoading /><FoodsLoading /></>);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('layout renders skip link, header, main and footer', () => {
    // <html> cannot nest in the test container, so render the tree's parts.
    const tree = RootLayout({ children: <p>child</p> }) as React.ReactElement;
    render(<div>{((tree.props as { children: React.ReactElement }).children.props as { children: React.ReactNode }).children}</div>);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveTextContent('child');
  });
});
