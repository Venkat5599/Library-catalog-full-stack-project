const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@cluster1.556pzyn.mongodb.net/library_book_catalog?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection;
    const Book = db.collection('books');
    const book = await Book.find().sort({_id:-1}).limit(1).toArray();
    await Book.updateOne({_id: book[0]._id}, {$set: {coverImage: 'https://i.ytimg.com/vi/SE8LWfexxDU/maxresdefault.jpg'}});
    console.log('Updated db directly');
    process.exit(0);
  });
