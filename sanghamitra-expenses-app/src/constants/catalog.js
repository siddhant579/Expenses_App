// Central catalog for Expense Tracker categories and Book/Frames product names.

// 📂 Grouped Expense Category dropdown (4 sections).
// `custom: true` means selecting it reveals a free-text "Custom Details" box.
// `bookForm: true` means selecting it opens the full Books Order (Offline) form.
export const CATEGORY_GROUPS = [
  {
    label: "Transfers & Salary",
    options: [
      { value: "Sundeep Sir Transfer" },
      { value: "Salary" },
    ],
  },
  {
    label: "Operations",
    options: [
      { value: "Utilities", custom: true },
      { value: "Miscellaneous", custom: true },
      { value: "Travel and Transport" },
    ],
  },
  {
    label: "Products & Services",
    options: [
      { value: "Products and Services", custom: true },
      { value: "Book", bookForm: true },
      { value: "Frames", bookForm: true },
      { value: "Other", custom: true },
    ],
  },
  {
    label: "Others",
    options: [
      { value: "Grocery" },
      { value: "Household Work" },
      { value: "Computer Repair" },
      { value: "D-Mart" },
      { value: "Internet Recharge" },
      { value: "Petrol" },
      { value: "Office Rent" },
      { value: "Electricity Bill" },
      { value: "Others", custom: true },
    ],
  },
];

// Flat lookup helpers derived from the groups above
export const ALL_CATEGORY_OPTIONS = CATEGORY_GROUPS.flatMap((g) => g.options);

export const CUSTOM_DETAIL_CATEGORIES = ALL_CATEGORY_OPTIONS
  .filter((o) => o.custom)
  .map((o) => o.value);

export const BOOK_FORM_CATEGORIES = ALL_CATEGORY_OPTIONS
  .filter((o) => o.bookForm)
  .map((o) => o.value);

// 📚 Book names (Products & Services → Book)
export const BOOK_NAMES = [
  "Cast & Class",
  "Ews",
  "Gujrati",
  "In Quest of Equality by The Shared Mirror",
  "Mahad",
  "Hatred In The Belly by The Shared Mirror",
  "Bhima Koregaon",
  "The River Speaks",
  "What Babasaheb Ambedkar Means",
  "Navayana Buddhism",
  "A Dyslexic's Life",
  "Kanshi Ram Ji Ki Sohabat Me",
  "Mai Kanshi Ram Bol Raha Hu",
  "Savari",
];

// 🖼️ Frame names (Products & Services → Frames)
export const FRAME_NAMES = [
  "Adivasi Geographic by Jayesh Lakhama Vayeda",
  "Anti-caste Bookseller by Nidhin Shobhana",
  "Anti-Caste Movement is a Verb by Nidhin Shobhana",
  "Atta Deep Bhav by Buddhist Cultural Art",
  "Atta hi Attano Natho by Buddhist Cultural Art",
  "Attasila Samadanam by Buddhist Cultural Art",
  "Babasaheb and the Dhamma by Priyanka Rohan Patil",
  "Babasaheb by Sonali Meshram",
  "Babasaheb gave us the Path by Priyanka Rohan Patil",
  "Babasaheb, champion of women's rights by Priyanka Rohan Patil",
  "Beauty by Kshitij Mahendra",
  "Bhima Koregaon: Our War Cry! by The Shared Mirror",
  "Buddha at the Jetavana by Priyanka Rohan Patil",
  "Buddha by Sonali Meshram",
  "Buddha [2] by Sushil Patil",
  "Dhamek Stupa (Dhamma Chakra Pravartan) by Sushil Patil",
  "Dhammachakra Pravartan by Sushil Patil",
  "Dr. B. R. Ambedkar by Priyanka Rohan Patil",
  "Dream by Kshitij Mahendra",
  "Enlightened Buddha by Sushil Patil",
  "Freedom by Kshitij Mahendra",
  "Guja-ratri by The Shared Mirror",
  "Hatred In The Belly by The Shared Mirror",
  "In Quest of Equality by The Shared Mirror",
  "Jotiba and Savitri by Nidhin Shobhana",
  "Khajur Harvest by Jayesh Lakhama Vayeda",
  "Mahad The March That is Launched Every Day by The Shared Mirror",
  "Meditating Buddha [1] by Sushil Patil",
  "Meditating Buddha [3] by Sushil Patil",
  "Meditating Buddha [4] by Sushil Patil",
  "Paramita by Buddhist Culture Art",
  "Peacock Flourish by Jayesh Lakhama Vayeda",
  "People's Babasaheb - Babasaheb's People by Nidhin Shobhana",
  "Periyar by Sonali Meshram",
  "Pleasure and Pain by Kshitij Mahendra",
  "Ramai and Babasaheb's dreams by Priyanka Rohan Patil",
  "Reading with Babasaheb by Nidhin Shobhana",
  "Savitri and Fatima by Nidhin Shobhana",
  "Savitri Mai by Sonali Meshram",
  "Shades of Grey by Kshitij Mahendra",
  "Shahu Maharaj by Sonali Meshram",
  "Spreading Ambedkarite Culture by Priyanka Rohan Patil",
  "The Problematics of Tribal Integration by The Shared Mirror",
  "The River Speaks by The Shared Mirror",
  "The Thirsty Fox by Jayesh Lakhama Vayeda",
  "The Tree is Life by Jayesh Lakhama Vayeda",
  "The Tree provides for Life and Love by Jayesh Lakhama Vayeda",
  "Under Babasaheb's Umbrella by Nidhin Shobhana",
  "Undisturbed by Kshitij Mahendra",
  "Warli Community Life by Jayesh Lakhama Vayeda",
  "Warli Terrain by Jayesh Lakhama Vayeda",
  "What Babasaheb Ambedkar Means To Me by The Shared Mirror",
  "Buddham Sharanam Gachhami",
];

// name list for a given book-form category
export const namesFor = (category) =>
  category === "Frames" ? FRAME_NAMES : BOOK_NAMES;
