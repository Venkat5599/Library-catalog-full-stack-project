require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_book_catalog';

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0-7432-7356-5', category: 'Fiction', description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.', publishedYear: 1925, publisher: 'Scribner', language: 'English', pages: 180, totalCopies: 3, availableCopies: 3, isFeatured: true, tags: ['classic', 'american literature'] },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0-06-112008-4', category: 'Fiction', description: 'A novel about racial injustice and the loss of innocence in the American South.', publishedYear: 1960, publisher: 'J. B. Lippincott', language: 'English', pages: 281, totalCopies: 4, availableCopies: 4, isFeatured: true, tags: ['classic', 'justice'] },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-38016-3', category: 'Science', description: 'Hawking discusses the origin and fate of the universe.', publishedYear: 1988, publisher: 'Bantam Books', language: 'English', pages: 212, totalCopies: 2, availableCopies: 2, isFeatured: true, tags: ['physics', 'cosmology'] },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', category: 'Technology', description: 'A handbook of agile software craftsmanship.', publishedYear: 2008, publisher: 'Prentice Hall', language: 'English', pages: 464, totalCopies: 3, availableCopies: 3, isFeatured: true, tags: ['programming', 'software'] },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0-06-231609-7', category: 'History', description: 'A brief history of humankind from Stone Age to modern era.', publishedYear: 2011, publisher: 'Harper', language: 'English', pages: 443, totalCopies: 2, availableCopies: 2, isFeatured: true, tags: ['history', 'humanity'] },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0-06-112241-5', category: 'Fiction', description: 'A philosophical novel about following your dreams.', publishedYear: 1988, publisher: 'HarperOne', language: 'English', pages: 197, totalCopies: 5, availableCopies: 5, tags: ['philosophy', 'journey'] },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0-7352-1129-2', category: 'Self-Help', description: 'An easy and proven way to build good habits and break bad ones.', publishedYear: 2018, publisher: 'Avery', language: 'English', pages: 320, totalCopies: 3, availableCopies: 3, isFeatured: true, tags: ['habits', 'productivity'] },
  { title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '978-0-857-19776-9', category: 'Business', description: 'Timeless lessons on wealth, greed, and happiness.', publishedYear: 2020, publisher: 'Harriman House', language: 'English', pages: 256, totalCopies: 2, availableCopies: 2, tags: ['finance', 'investing'] },
  { title: '1984', author: 'George Orwell', isbn: '978-0-451-52493-5', category: 'Fiction', description: 'A dystopian novel set in a totalitarian society.', publishedYear: 1949, publisher: 'Secker & Warburg', language: 'English', pages: 328, totalCopies: 3, availableCopies: 3, tags: ['dystopia', 'classic'] },
  { title: 'Harry Potter and the Philosopher Stone', author: 'J.K. Rowling', isbn: '978-0-7475-3269-9', category: 'Fiction', description: 'The first novel in the Harry Potter series.', publishedYear: 1997, publisher: 'Bloomsbury', language: 'English', pages: 223, totalCopies: 5, availableCopies: 5, isFeatured: true, tags: ['fantasy', 'magic'] },
  { title: 'The Design of Everyday Things', author: 'Don Norman', isbn: '978-0-465-05065-9', category: 'Technology', description: 'How design affects human behavior and thought.', publishedYear: 1988, publisher: 'Basic Books', language: 'English', pages: 368, totalCopies: 2, availableCopies: 2, tags: ['design', 'ux'] },
  { title: 'Steve Jobs', author: 'Walter Isaacson', isbn: '978-1-4516-4853-9', category: 'Biography', description: 'The exclusive biography of Steve Jobs.', publishedYear: 2011, publisher: 'Simon & Schuster', language: 'English', pages: 630, totalCopies: 2, availableCopies: 2, tags: ['biography', 'apple'] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    await User.deleteMany({});
    await Book.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({ name: 'Admin User', email: 'admin@library.com', password: 'admin123', role: 'admin', isActive: true });
    console.log('Admin created: admin@library.com / admin123');

    const members = await User.create([
      { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'member' },
      { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'member' },
    ]);
    console.log(`${members.length} members created`);

    await Book.insertMany(books.map(b => ({ ...b, addedBy: admin._id })));
    console.log(`${books.length} books seeded`);

    console.log('\nDatabase seeded! Login: admin@library.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
