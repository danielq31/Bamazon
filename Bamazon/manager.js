// The manager module is part of bamazon.
// Managers can view products for sale.
// They can view low inventory.
// They can add to inventory.
// Managers can also add new products.

// Required node modules.
var mysql = require("mysql");
var inquirer = require("inquirer");

// Connects to the database.
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Root is default username.
  user: "root",
  // Password is empty string.
  password: "",
  database: "Bamazon_db"
});

// If connection doesn't work, throws error, else...
connection.connect(function(err) {
  if (err) throw err;

  // Lets manager pick action.
  selectAction();

});

// Manager picks action they wish to complete.
var selectAction = function() {
	inquirer.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'What would you like to do?',
		choices: [
			"View Products for Sale",
			"View Low Inventory",
			"Add to Inventory",
			"Add New Product"
		]
	}
	]).then(function(answer) {

		// Different functions called based on managers selection
		switch (answer.action) {
		    case "View Products for Sale":
		    	viewProducts();
		      	break;

		    case "View Low Inventory":
		    	viewLowInventory();
		      	break;

		    case "Add to Inventory":
		    	addInventory();
		      	break;

		    case "Add New Product":
		    	addProduct();
		      	break;
		}
	});
};

// Displays list of all available products.
var viewProducts = function() {
	var query = "Select * FROM products";
	connection.query(query, function(err, res) {
		if (err) throw err;
		for (var i = 0; i < res.length; i++) {
			console.log("Product ID: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Price: " + res[i].price + " || Quantity: " + res[i].stock_quantity);
		}

		// Lets manager select new action.
		selectAction();
	});
};

// Displays products with low inventory.
var viewLowInventory = function() {
	var query = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5";
	connection.query(query, function(err, res) {
		if (err) throw err;
		for (var i = 0; i < res.length; i++) {
			console.log("Product ID: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Quantity: " + res[i].stock_quantity);
		}

		// Lets manager select new action.
		selectAction();
	});
};

// Adds new stock to selected product.
var addInventory = function() {

	inquirer.prompt([
		{
			name: "product_ID",
			type: "input",
			message: "Enter product ID that you would like to add stock to."
		},
		{
			name: "stock",
			type: "input",
			message: "How much stock would you like to add?"
		}
	]).then(function(answer) {

		// Pushes new stock to database.
		connection.query("SELECT * FROM products", function(err, results) {
			
			var chosenItem;

			// Gets product who's stock needs to be updated.
			for (var i = 0; i < results.length; i++) {
				if (results[i].item_id === parseInt(answer.product_ID)) {
					chosenItem = results[i];
				}
			}

			// Adds new stock  to existing stock.
			var updatedStock = parseInt(chosenItem.stock_quantity) + parseInt(answer.stock);

			console.log("Updated stock: " + updatedStock);

			// Updates stock for selected product in database.
			connection.query("UPDATE products SET ? WHERE ?", [{
				stock_quantity: updatedStock
			}, {
				item_id: answer.product_ID
			}], function (err, res) {
				if (err) {
					throw err;
				} else {

					// Lets manager select new action.
					selectAction();
				}
			});
			
		});

	});
};
