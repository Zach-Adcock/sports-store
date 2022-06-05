#! /usr/bin/env node

console.log('This script populates some test products, brands, sports and productinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Product = require('./models/product')
var Brand = require('./models/brand')
var Sport = require('./models/sport')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = []
var brands = []
var sports = []

function brandCreate(name, description, year_created, cb) {
  branddetail = { name, description }
  if (year_created != false) branddetail.year_created = year_created
  // if (d_death != false) branddetail.date_of_death = d_death
  
  var brand = new Brand(branddetail);
       
  brand.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Brand: ' + brand);
    brands.push(brand)
    cb(null, brand)
  }  );
}

function sportCreate(name, cb) {
  var sport = new Sport({ name: name });
       
  sport.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Sport: ' + sport);
    sports.push(sport)
    cb(null, sport);
  }   );
}

function productCreate(name, brand, description, product_code, sport, price, stock, cb) {
  productdetail = { 
    name, brand, description, product_code, sport, price, stock
  }
  // if (sport != false) productdetail.sport = sport
    
  var product = new Product(productdetail);    
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Product: ' + product);
    products.push(product)
    cb(null, product)
  }  );
}




function createSportBrands(cb) {
    async.series([
        function(callback) {
          brandCreate('Nike', 'Nike Brand description', '1973', callback);
        },
        function(callback) {
          brandCreate('Adidas', 'Adidas Brand description', '1932', callback);
        },
        function(callback) {
          brandCreate('Lacoste', 'Lacoste Brand description', '1920', callback);
        },
        function(callback) {
          brandCreate('Converse', 'Converse Brand description', '1930', callback);
        },
        function(callback) {
          brandCreate('Brooks', 'Brooks Brand description', '1971', callback);
        },
        function(callback) {
          sportCreate("Soccer", callback);
        },
        function(callback) {
          sportCreate("Football", callback);
        },
        function(callback) {
          sportCreate("Hockey", callback);
        },
        function(callback) {
          sportCreate("Running", callback);
        },
        function(callback) {
          sportCreate("Tennis", callback);
        },
        ],
        // optional callback
        cb);
}


function createProducts(cb) {
    async.parallel([
        function(callback) {
          productCreate('Mercurial Superfly', brands[0], 'Lightweight knit soccer cleats', '89876590',  sports[0], 99, 4, callback);
        },
        function(callback) {
          productCreate("Pro-size football", brands[0], 'The ol pigskin', '29292938', sports[1], 9, 14, callback);
        },
        function(callback) {
          productCreate("Jubilani", brands[1],'Crazy soccer ball', '93939483', sports[0], 33, 5, callback);
        },
        function(callback) {
          productCreate("Polo shirt", brands[2], "Look good feel good.", '83849382', sports[4], 14, 8,  callback);
        },
        function(callback) {
          productCreate("Running shoes ",brands[4], "Shoes for the feets", '83940392', sports[3], 24, 10, callback);
        },
        function(callback) {
          productCreate('puck', brands[0], 'Hit it with stick', 'ISBN111111', sports[0], 109, 3, callback);
        },
        function(callback) {
          productCreate('Test Product 2',brands[3], 'Summary of test product 2', '21312323', sports[2], 993, 14,  callback)
        }
        ],
        // optional callback
        cb);
}



async.series([
    createSportBrands,
    createProducts,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: ');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



