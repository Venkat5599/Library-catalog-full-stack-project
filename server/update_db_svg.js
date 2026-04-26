const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@cluster1.556pzyn.mongodb.net/library_book_catalog?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection;
    const Book = db.collection('books');
    const book = await Book.find().sort({_id:-1}).limit(1).toArray();
    await Book.updateOne({_id: book[0]._id}, {$set: {coverImage: 'https://cdn.registerdisney.go.com/v4/asset/bundler/MARVEL/v4/images/v1/marvel-logo.svg'}});
    console.log('Updated db directly with SVG');
    process.exit(0);
  });
