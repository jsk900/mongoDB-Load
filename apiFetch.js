const mongoose = require("mongoose");
const assert = require("assert");
const apiFetch = require("node-fetch");
const secrets = require("./secrets.json");

//MongoDb connnection string. Coonects to MLAB MongoDB using Mongoose
mongoose.connect(
    `mongodb://${secrets.user}:${
        secrets.pass
    }@ds161710.mlab.com:61710/book-store`,
    { useNewUrlParser: true }
);

//Setup Schema for book collection
const Schema = mongoose.Schema;
const bookSchema = new Schema({
    title: String,
    author: String,
    publishedDate: String,
    description: String,
    category: String,
    price: Number,
    currencyCode: String,
    thumbnail: String
});

const Books = mongoose.model("Books", bookSchema); //Attach schema
const search = "Comedy"; //Initialise search for google books API

let booksArr = []; //Initialise Books Array for insertion into DB

// Book detail obj prototype
function bookDetail(
    title,
    author,
    publishedDate,
    description,
    category,
    price,
    currencyCode,
    thumbnail
) {
    this.title = title;
    this.author = author;
    this.publishedDate = publishedDate;
    this.description = description;
    this.category = category;
    this.price = price;
    this.currencyCode = currencyCode;
    this.thumbnail = thumbnail;
}

//Get the data from google books API
apiFetch(
    `https://www.googleapis.com/books/v1/volumes?q=${search}subject:${search}&filter=paid-ebooks&startindex=0&maxResults=40&langRestrict='EN'`
)
    .then(res => {
        return res.json();
    })

    // Create the book detail object
    .then(json => {
        for (let i = 0; i < json.items.length; i++) {
            if (json.items[i].saleInfo.saleability === "FOR_SALE") {
                let a = new bookDetail(
                    json.items[i].volumeInfo.title,
                    json.items[i].volumeInfo.authors,
                    json.items[i].volumeInfo.publishedDate,
                    json.items[i].volumeInfo.description,
                    search,
                    json.items[i].saleInfo.retailPrice.amount,
                    json.items[i].saleInfo.retailPrice.currencyCode,
                    json.items[i].volumeInfo.imageLinks.smallThumbnail
                );

                // Insert book detail object into the books array
                booksArr.push(a);
            }
        }
    })

    //Insert Books array into mongo db. Assert is used for error checking
    .then(json => {
        Books.collection.insertMany(booksArr, (err, r) => {
            assert.equal(null, err);
            assert.equal(booksArr.length, r.insertedCount);
            mongoose.connection.close;
        });
    })
    .catch(err => {
        console.log(err);
    });

module.exports = apiFetch;
