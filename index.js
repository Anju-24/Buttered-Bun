//index.js file 

//import the dependencies
const express = require('express');
const path = require('path');
//set up express validator by destructuring the object 
 const { check, validationResult } = require('express-validator');

//set up variables to use packages
var myApp = express();
//new way of using body parser after express 4.16
myApp.use(express.urlencoded({ extended: false })); 
//set up views and public folder
myApp.set('views', path.join(__dirname, 'views'));
//to find public resources
myApp.use(express.static(__dirname + '/public'));
//setting the view engine as ejs
myApp.set('view engine', 'ejs');


//regex for validating phone number
var phoneRegex = /^[\d]{10}$/;
//regex for validating input quantity
var numberRegex = /^[0-9]+$/;
//regex for email validation
var emailRegex=/^[\S]+@[\S]+$/;

// defining the province dictionary to store province name and sales tax rate
var provinceDictionary =
{
    'Alberta': 0.05,
    'British Columbia': 0.12,
    'Manitoba': 0.12,
    'New Brunswick': 0.15,
    'Newfoundland and Labrador': 0.15,
    'Northwest Territories': 0.13,
    'Nova Scotia': 0.11,
    'Nunavut': 0.13,
    'Ontario': 0.13,
    'Prince Edward Island': 0.11,
    'Quebec': 0.13,
    'Saskatchewan': 0.13,
    'Yukon': 0.11
}

//Declaring and initializing variables
var itemDictionary = {};
var items = [];
var total = 0, tax = 0, taxCalculate, taxPercent;
var browniesPrice = 3;
var blueberryMuffinsPrice = 8;
var chocolateCookiesPrice = 6;
var macaronsPrice = 3;
var cheeseCakesPrice = 6;
var croissantsPrice = 5;
var brownies=0, blueberryMuffins=0, chocolateCookies=0, macarons=0, cheeseCakes=0, croissants=0, croissants=0;
var name, address, city, province, email, phone;

//function to check a value using regular expression
function checkRegex(userInput, regex) 
{
    if (regex.test(userInput)) 
    {
        return true;
    }
    else 
    {
        return false;
    }
}

// function to check whether the input quantity is valid
function checkQuantity(value, { req }) 
{
    if (value) 
    {
        if (!checkRegex(value, numberRegex)) 
        {
            throw new Error("Please enter a valid quantity");
        }
        else 
        {
            return true;
        }
    }
    else 
    {
        return true;
    }
}

// function to check whether the minimum quantity ordered by user is greater than $10 & atleast an item is selected
function checkMinimumOrder(value, { req })
{
    brownies = (parseInt(req.body.brownies) > 0 ? req.body.brownies : 0);
    blueberryMuffins = (parseInt(req.body.blueberryMuffins) > 0 ? req.body.blueberryMuffins : 0);
    chocolateCookies = (parseInt(req.body.chocolateCookies) > 0 ? req.body.chocolateCookies : 0);
    macarons = (parseInt(req.body.macarons) > 0 ? req.body.macarons : 0);
    cheeseCakes = (parseInt(req.body.cheeseCakes) > 0 ? req.body.cheeseCakes : 0);
    croissants = (parseInt(req.body.croissants) > 0 ? req.body.croissants : 0);
    //check whether input quantity is 0
    if (brownies == 0 && blueberryMuffins == 0 && chocolateCookies == 0 && macarons == 0 &&
    cheeseCakes == 0 && croissants == 0) 
    {
        throw new Error("***Please select atleast an item for checkout***");
    }
    else 
    {
        //getting the total
        total = calculateTotal();
        if (total < 10) 
        {
            throw new Error("***Sorry you dont have a minimum purchase of $10.Please add few more items***");
        }
        else 
        {
            return true;
        }
    }
}

//fnction to calculate total and add those items to itemdictionary with their quantity
function calculateTotal() 
{
    itemDictionary={};
    if (brownies > 0) 
    {
        itemDictionary['brownies'] = brownies;
    }
    if (blueberryMuffins > 0) 
    {
        itemDictionary['blueberryMuffins'] = blueberryMuffins;
    }
    if (chocolateCookies > 0) 
    {
        itemDictionary['chocolateCookies'] = chocolateCookies;
    }
    if (macarons > 0) 
    {
        itemDictionary['macarons'] = macarons;
    }
    if (cheeseCakes > 0) 
    {
        itemDictionary['cheeseCakes'] = cheeseCakes;
    }
    if (croissants > 0) 
    {
        itemDictionary['croissants'] = croissants;
    }
    total = 0;
    //calculating total
    total = brownies * browniesPrice + blueberryMuffins * blueberryMuffinsPrice +
        chocolateCookies * chocolateCookiesPrice + macarons * macaronsPrice
        + cheeseCakes * cheeseCakesPrice + croissants * croissantsPrice;    
    return total;
}

//function to calculate sales tax
function calculateSalesTax(province) 
{
    for (var key in provinceDictionary) 
    {
        if (key == province) 
        {
            tax = provinceDictionary[key];
        }
    }
    taxCalculate = total * tax;
    total += taxCalculate;
    taxPercent = tax * 100;
}

//setting up routes to divert to different parts of the web application
//home page
myApp.get('/', function (req, res) 
{
    res.render('home')
});

myApp.post('/process', [
    check('name', 'Please enter name').not().isEmpty(),
    check('address', 'Please enter address').not().isEmpty(),
    check('city', 'Please enter city').not().isEmpty(),
    check('province', 'Please select province').not().equals('Please Select'),
    check('phone', 'Please enter a valid phone number').matches(phoneRegex),
    check('email', 'Please enter a valid email').matches(emailRegex),
    check('brownies').custom(checkQuantity),
    check('blueberryMuffins').custom(checkQuantity),
    check('chocolateCookies').custom(checkQuantity),
    check('macarons').custom(checkQuantity),
    check('cheeseCakes').custom(checkQuantity),
    check('croissants').custom(checkQuantity),
    check('minimumCheck').custom(checkMinimumOrder)
], function (req, res) 
{
    //check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {        
        return res.render('home', 
        {
            //errors are passed to view
            errors: errors.array(), 
            //values enterd by the user are passed back to view to retain them after validation
            name:req.body.name,
            address:req.body.address,
            city:req.body.city,
            province:req.body.province,
            email:req.body.email,
            phone:req.body.phone,
            brownies : req.body.brownies,
            blueberryMuffins : req.body.blueberryMuffins,
            chocolateCookies : req.body.chocolateCookies,
            macarons : req.body.macarons,
            cheeseCakes : req.body.cheeseCakes,
            croissants : req.body.croissants     
        });
    }   
    else 
    {
        //fetch all the form fields (name field in ejs)
        name = req.body.name;
        address = req.body.address;
        city = req.body.city;
        province = req.body.province;
        email = req.body.email;
        phone = req.body.phone;

        brownies = req.body.brownies;
        blueberryMuffins = req.body.blueberryMuffins;
        chocolateCookies = req.body.chocolateCookies;
        macarons = req.body.macarons;
        cheeseCakes = req.body.cheeseCakes;
        croissants = req.body.croissants;
        //creating an array of objects with the help of itemdictionary
        items=[];
        for (var key in itemDictionary) 
        {
            console.log(itemDictionary);
            switch (key) 
            {
                case ('brownies'):
                                    item = 
                                    {
                                        itemName: 'Brownies',
                                        itemQuantity: brownies,
                                        itemUnitPrice: browniesPrice,
                                        itemTotalPrice: brownies * browniesPrice
                                    }
                                    break;

                case ('blueberryMuffins'):
                                    item = 
                                    {
                                        itemName: 'BlueBerry Muffins',
                                        itemQuantity: blueberryMuffins,
                                        itemUnitPrice: blueberryMuffinsPrice,
                                        itemTotalPrice: blueberryMuffins * blueberryMuffinsPrice
                                    }
                                    break;
                case ('chocolateCookies'):
                                    item = 
                                    {
                                        itemName: 'Chocolate Cookies',
                                        itemQuantity: chocolateCookies,
                                        itemUnitPrice: chocolateCookiesPrice,
                                        itemTotalPrice: chocolateCookies * chocolateCookiesPrice
                                    }
                                    break;
                case ('macarons'):
                                    item = 
                                    {
                                        itemName: 'Macarons',
                                        itemQuantity: macarons,
                                        itemUnitPrice: macaronsPrice,
                                        itemTotalPrice: macarons * macaronsPrice
                                    }
                                    break;
                case ('cheeseCakes'):
                                    item = 
                                    {
                                        itemName: 'Cheese Cakes',
                                        itemQuantity: cheeseCakes,
                                        itemUnitPrice: cheeseCakesPrice,
                                        itemTotalPrice: cheeseCakes * cheeseCakesPrice
                                    }
                                    break;
                case ('croissants'):
                                    item = 
                                    {
                                        itemName: 'Croissants',
                                        itemQuantity: croissants,
                                        itemUnitPrice: croissantsPrice,
                                        itemTotalPrice: croissants * croissantsPrice
                                    }
                                    break;
            }
            items.push(item);
        }
    }
        //create an object with the fetched data to send to view
        calculateSalesTax(province);
        var pageData =
        {
            name: name,
            address: address,
            city: city,
            province: province,
            email: email,
            phone: phone,
            itemsArray: items,
            taxPercent: taxPercent,
            taxAmount: (taxCalculate.toFixed(2)),
            totalAmount: (total.toFixed(2))
        }
        //send data to view and render it
        res.render('card', pageData);    
    });
// Starting the server at port 8088
myApp.listen(8088);
console.log('Everything executed fine...Website at port 8088');