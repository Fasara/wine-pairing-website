import { WineType } from './schema';

export interface SeedCategory {
  slug: string;
  name: string;
  foods: string[];
}

export interface SeedRule {
  wineType: WineType;
  grape: string | null;
  category: string;
  strength: number;
  reason: string;
}

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categories: SeedCategory[] = [
  { slug: 'red-meat', name: 'Red meat', foods: ['Grilled steak', 'Roast lamb', 'Beef bourguignon', 'Burger', 'Braised short ribs'] },
  { slug: 'game', name: 'Game', foods: ['Venison stew', 'Duck breast', 'Wild boar ragu', 'Roast pheasant'] },
  { slug: 'poultry', name: 'Poultry', foods: ['Roast chicken', 'Turkey with cranberry', 'Chicken in cream sauce', 'Fried chicken'] },
  { slug: 'pork', name: 'Pork', foods: ['Roast pork loin', 'Pulled pork', 'Pork chops with apple', 'Glazed ham'] },
  { slug: 'charcuterie', name: 'Charcuterie', foods: ['Prosciutto', 'Salami', 'Pate', 'Chorizo'] },
  { slug: 'white-fish', name: 'White fish', foods: ['Sole meuniere', 'Fish and chips', 'Baked cod', 'Sea bass'] },
  { slug: 'oily-fish', name: 'Oily fish', foods: ['Grilled salmon', 'Seared tuna', 'Sardines', 'Smoked salmon'] },
  { slug: 'shellfish', name: 'Shellfish', foods: ['Oysters', 'Grilled prawns', 'Lobster', 'Mussels in white wine', 'Crab cakes'] },
  { slug: 'hard-cheese', name: 'Hard cheese', foods: ['Parmesan', 'Aged cheddar', 'Manchego', 'Gruyere'] },
  { slug: 'soft-cheese', name: 'Soft cheese', foods: ['Brie', 'Goat cheese', 'Camembert', 'Burrata'] },
  { slug: 'blue-cheese', name: 'Blue cheese', foods: ['Stilton', 'Roquefort', 'Gorgonzola'] },
  { slug: 'pasta-tomato', name: 'Tomato pasta', foods: ['Spaghetti bolognese', 'Lasagne', 'Penne arrabbiata', 'Margherita pizza'] },
  { slug: 'pasta-cream', name: 'Creamy pasta and risotto', foods: ['Fettuccine alfredo', 'Mushroom risotto', 'Carbonara', 'Lobster ravioli'] },
  { slug: 'vegetarian', name: 'Vegetarian', foods: ['Roasted vegetables', 'Mushroom stroganoff', 'Eggplant parmigiana', 'Lentil stew'] },
  { slug: 'salad', name: 'Salads and light starters', foods: ['Greek salad', 'Caesar salad', 'Asparagus with hollandaise', 'Gazpacho'] },
  { slug: 'spicy', name: 'Spicy and Asian', foods: ['Thai green curry', 'Sushi', 'Szechuan chicken', 'Indian tikka masala', 'Pad thai'] },
  { slug: 'bbq', name: 'Barbecue', foods: ['BBQ ribs', 'Smoked brisket', 'Grilled sausages', 'Chargrilled vegetables'] },
  { slug: 'chocolate', name: 'Chocolate desserts', foods: ['Dark chocolate', 'Chocolate fondant', 'Brownies', 'Chocolate truffles'] },
  { slug: 'fruit-dessert', name: 'Fruit desserts', foods: ['Apple tart', 'Lemon tart', 'Peach cobbler', 'Fresh strawberries', 'Creme brulee'] },
  { slug: 'nuts', name: 'Nuts and savoury snacks', foods: ['Salted almonds', 'Walnuts', 'Olives', 'Roasted chestnuts'] },
];

const r = (wineType: WineType, grape: string | null, category: string, strength: number, reason: string): SeedRule => ({
  wineType, grape, category, strength, reason,
});

export const rules: SeedRule[] = [
  // Red
  r('red', null, 'red-meat', 5, 'Tannins soften against the protein and fat of red meat, while the meat rounds out the wine.'),
  r('red', null, 'game', 5, 'Gamey, earthy flavours echo the savoury depth of a structured red.'),
  r('red', null, 'bbq', 4, 'Smoky, charred flavours match the dark fruit and spice of red wine.'),
  r('red', null, 'hard-cheese', 4, 'Aged, nutty cheeses stand up to firm tannins.'),
  r('red', null, 'pasta-tomato', 4, 'Acidity in the wine mirrors the acidity of tomato sauce.'),
  r('red', null, 'charcuterie', 4, 'Salty, cured meats balance fruit-forward reds.'),
  r('red', null, 'pork', 3, 'Medium-bodied reds complement the sweetness of roast pork.'),
  r('red', null, 'vegetarian', 3, 'Earthy, umami-rich vegetable dishes suit softer reds.'),
  r('red', null, 'poultry', 3, 'Lighter reds work well with roasted or grilled poultry.'),
  r('red', null, 'chocolate', 2, 'Dark chocolate and ripe red fruit can work, provided the wine is not too dry.'),
  r('red', 'Cabernet Sauvignon', 'red-meat', 5, 'Cabernet\'s firm tannins and blackcurrant cut through rich, fatty steak and lamb.'),
  r('red', 'Merlot', 'poultry', 4, 'Soft, plummy Merlot is gentle enough for roast chicken and turkey.'),
  r('red', 'Pinot Noir', 'poultry', 5, 'Light-bodied, high-acid Pinot Noir is a classic with roast poultry and duck.'),
  r('red', 'Pinot Noir', 'oily-fish', 4, 'Pinot Noir is one of the few reds light enough for salmon and tuna.'),
  r('red', 'Pinot Noir', 'vegetarian', 4, 'Earthy Pinot Noir loves mushrooms and roasted root vegetables.'),
  r('red', 'Syrah', 'bbq', 5, 'Peppery, smoky Syrah is a natural partner for barbecue.'),
  r('red', 'Sangiovese', 'pasta-tomato', 5, 'Sangiovese\'s bright acidity is made for tomato-based Italian dishes.'),
  r('red', 'Nebbiolo', 'vegetarian', 4, 'Nebbiolo\'s truffle and tar notes pair with mushrooms and earthy dishes.'),
  r('red', 'Nebbiolo', 'game', 5, 'Powerful Nebbiolo matches the intensity of game and braises.'),
  r('red', 'Tempranillo', 'charcuterie', 5, 'Spanish Tempranillo is the traditional match for chorizo and cured ham.'),
  r('red', 'Tempranillo', 'pork', 4, 'Tempranillo\'s savoury character suits roast pork.'),
  r('red', 'Malbec', 'bbq', 5, 'Bold, plush Malbec is the classic asado wine.'),
  // White
  r('white', null, 'white-fish', 5, 'Crisp, delicate whites flatter mild fish without overpowering it.'),
  r('white', null, 'shellfish', 5, 'Bright acidity acts like a squeeze of lemon on shellfish.'),
  r('white', null, 'salad', 5, 'Fresh, zesty whites match green, herbal and lightly dressed dishes.'),
  r('white', null, 'soft-cheese', 4, 'Acidity cuts through the creaminess of soft cheeses.'),
  r('white', null, 'poultry', 4, 'Round, medium-bodied whites suit chicken and turkey.'),
  r('white', null, 'pasta-cream', 4, 'Rich whites mirror the texture of cream sauces.'),
  r('white', null, 'spicy', 3, 'Off-dry whites soothe heat and echo aromatic spices.'),
  r('white', null, 'oily-fish', 3, 'Acidic whites cut the richness of oily fish.'),
  r('white', null, 'vegetarian', 3, 'Herbal, mineral whites complement lightly cooked vegetables.'),
  r('white', null, 'pork', 3, 'A fruity white balances the sweetness of pork.'),
  r('white', 'Chardonnay', 'pasta-cream', 5, 'Buttery, oaked Chardonnay matches creamy pasta, risotto and lobster.'),
  r('white', 'Chardonnay', 'shellfish', 5, 'Mineral Chardonnay such as Chablis is a classic with oysters and lobster.'),
  r('white', 'Sauvignon Blanc', 'soft-cheese', 5, 'Zesty Sauvignon Blanc is a textbook match for fresh goat cheese.'),
  r('white', 'Sauvignon Blanc', 'salad', 5, 'Grassy, citrusy Sauvignon Blanc suits asparagus, herbs and salads.'),
  r('white', 'Riesling', 'spicy', 5, 'Off-dry Riesling cools chilli heat and complements sweet-sour Asian flavours.'),
  r('white', 'Riesling', 'pork', 4, 'Riesling\'s fruit and acidity are a long-standing partner to pork and ham.'),
  r('white', 'Pinot Grigio', 'white-fish', 4, 'Light, crisp Pinot Grigio is ideal with simple fish dishes.'),
  r('white', 'Chenin Blanc', 'poultry', 4, 'Chenin\'s honeyed fruit and acidity suit roast chicken and pork.'),
  // Sparkling
  r('sparkling', null, 'shellfish', 5, 'High acidity and bubbles refresh the palate between rich, briny bites.'),
  r('sparkling', null, 'nuts', 5, 'Salty nuts and olives are an ideal aperitif match for dry bubbles.'),
  r('sparkling', null, 'oily-fish', 4, 'Bubbles cut through smoked and oily fish.'),
  r('sparkling', null, 'poultry', 4, 'Fried chicken and creamy poultry dishes love the contrast of fizz.'),
  r('sparkling', null, 'soft-cheese', 4, 'Bubbles lift the richness of brie and camembert.'),
  r('sparkling', null, 'spicy', 4, 'Chilled sparkling wine tames heat and refreshes the palate.'),
  r('sparkling', null, 'white-fish', 4, 'Crisp, dry sparkling wine works as well as a white with delicate fish.'),
  r('sparkling', null, 'charcuterie', 3, 'Fizz cleanses the palate between salty cured meats.'),
  r('sparkling', null, 'fruit-dessert', 3, 'Off-dry sparkling wine suits light fruit desserts.'),
  // Rose
  r('rose', null, 'salad', 5, 'Dry rose is crisp and fruity, a summer match for fresh salads.'),
  r('rose', null, 'charcuterie', 4, 'Rose handles salty, cured meats with ease.'),
  r('rose', null, 'oily-fish', 4, 'Rose has the body for salmon and tuna without heavy tannins.'),
  r('rose', null, 'shellfish', 4, 'Dry rose is a staple with grilled prawns and Provencal seafood.'),
  r('rose', null, 'bbq', 4, 'Chilled rose is a versatile match for grilled and barbecued food.'),
  r('rose', null, 'spicy', 3, 'Fruity rose balances moderate spice.'),
  r('rose', null, 'soft-cheese', 3, 'Rose complements fresh and creamy cheeses.'),
  r('rose', null, 'vegetarian', 3, 'Rose pairs well with Mediterranean vegetable dishes.'),
  r('rose', null, 'pasta-tomato', 3, 'Rose has enough acidity to match tomato-based dishes.'),
  // Dessert
  r('dessert', null, 'blue-cheese', 5, 'Sweet wine balances the salt and funk of blue cheese, the classic sweet-salty pairing.'),
  r('dessert', null, 'fruit-dessert', 5, 'The wine should be at least as sweet as the dessert; fruit tarts are ideal.'),
  r('dessert', null, 'nuts', 3, 'Honeyed sweetness plays against salty, toasted nuts.'),
  r('dessert', null, 'charcuterie', 3, 'Pate and foie gras are traditional partners for sweet wines.'),
  r('dessert', null, 'spicy', 3, 'Sweetness tempers heat in very spicy dishes.'),
  r('dessert', null, 'hard-cheese', 3, 'Aged cheeses are balanced by a luscious sweet wine.'),
  r('dessert', null, 'chocolate', 2, 'Works with milk chocolate and caramel, but dark chocolate can overpower it.'),
  // Port
  r('port', null, 'chocolate', 5, 'Rich, fruity port is the classic partner for dark chocolate and brownies.'),
  r('port', null, 'blue-cheese', 5, 'Port and Stilton is a famous combination: sweetness against salt.'),
  r('port', null, 'nuts', 4, 'Tawny port\'s nutty notes echo walnuts and almonds.'),
  r('port', null, 'hard-cheese', 4, 'Aged cheddar and other hard cheeses suit the weight of port.'),
  r('port', null, 'red-meat', 2, 'Dry-style ruby port can accompany rich braised red meat.'),
  r('port', null, 'game', 3, 'Port\'s richness matches game sauces and pates.'),
  r('port', null, 'fruit-dessert', 3, 'Tawny port complements apple tart and caramelised desserts.'),
];
