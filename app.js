// jshint esversion6

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
// [*] Embedded JavaScript EJS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))
// [*] tell express to use public folder as static resource
app.use(express.static('public'))


let todos = [];
let workItems = [];


app.get('/', function(req, res){ 

    let today = new Date();

    let options={
        weekday:'long',
        day: 'numeric',
        month: 'long'
    };
    // [*] .toLocaleDateString - method to format date string based on options
    let day = today.toLocaleDateString('en-US', options);

    // [*] Using EJS to render something different in one HTML file instead
    //       of sending different HTMLs
    res.render('list', {listTitle:day, newEl: todos})
})


app.post('/', function(req, res){
    
    let item = req.body.newItem;
    if (req.body.list === 'Work'){
        
        workItems.push(item);
        res.redirect('/work');

    } else {
       
        todos.push(item)
        // [*] Redirect to the homepage, trigger GET request to render todo
        res.redirect('/')
    }
    

})

app.get('/work', function(req, res) {
    // [*] Specify  listTitle = Work here; use ejs to set value of button to
    //  equal to listTitle (so button value changes dynamically on different paths)
    res.render('list', {listTitle: 'Work List', newEl: workItems})
})

// [*] Don't need a POST method at '/work' because the button is always
//      directed to '/'. app.post('/') differentiates and redirects based on 
//      button value listTitle (dynamically changes with ejs)

    // app.post('/work', function(req, res){
    //     let work = req.body.newItem;
    //     workItems.push(work)
    //     res,redirect('/work')
    // })

app.listen(3000, function(){ 
    console.log('Service is up and running at port 3000')
})