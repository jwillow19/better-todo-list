// jshint esversion6

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()

// Create new mongoDB for this project
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Set view engine to EJS, set static folder, mount bodyParser middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

// Create schema to store TODOs
const todoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Specify todo']
    }
})
// Link schema to model to create collection
const Todo = mongoose.model('Todo', todoSchema)

// Create new schema for custom route
const routeSchema = new mongoose.Schema({
    name: String,
    // [*] item is a list of todoSchema-based todos
    items: [todoSchema]
})
const List = mongoose.model('List', routeSchema)

// Create new documents for todo
const item1 = new Todo({
    name: 'Wake up'
})
const item2 = new Todo({
    name: 'Drink water'
})
const item3 = new Todo({
    name: 'Meditate'
})
// add documents to collection
defaultTodos = [item1, item2, item3];

Todo.find({}, function(err, docs){
    if (err) {
        console.log(err)
    } else {
        console.log(docs)
    }
})

app.get('/', function(req, res){ 
    // [*] Using find() method to render todos
    // [*] if at startup no items are in Todo collection - log the default todo
    //     No longer need to do Todo.insert and pile the same items up, do it once
    //     if collection is empty and stop doing it.

    Todo.find({}, function(err, docs){
        if (docs.length === 0){
            Todo.insertMany(defaultTodos, function(error){
                if (error) {
                    console.log(error)
                } else {
                    console.log('Successfully logged default todos in collection.')
                }
            })
            // [*] Redirect back to homepage, but this time there are default todos,
            //     so the else statement will run
            res.redirect('/')
        } else {
            // [*] Keep running this loop to render todos
            res.render('list', {listTitle: 'TODO', newEl: docs})
        }
        
    })
    
})


app.post('/', function(req, res){
 
    const routeName = req.body.list
    const item = req.body.newItem
    // create this new todo 
    const newTodo = new Todo({
        name: item
    })

    // Check which route item is added to
    // [*] Grab todo from POST request and save it to DB
    // [*] Save the item and redirect back to '/' to run else-loop to redner
    if (routeName === 'TODO') {
        newTodo.save()
        res.redirect('/')
    } else {
        // find the route in list collection and add the new todo
        List.findOne({name: routeName}, function(err, docs) {
            docs.items.push(newTodo)
            docs.save()
            res.redirect('/' + routeName)
        })
    }
    
    

    // if (req.body.list === 'Work'){
        
    //     workItems.push(item);
    //     res.redirect('/work');

    // } else {
       
    //     todos.push(item)
    //     // [*] Redirect to the homepage, trigger GET request to render todo
    //     res.redirect('/')
    // }
})

// app.get('/work', function(req, res) {
//     // [*] Specify  listTitle = Work here; use ejs to set value of button to
//     //  equal to listTitle (so button value changes dynamically on different paths)
//     res.render('list', {listTitle: 'Work List', newEl: workItems})
// })


app.get('/:customRoute', function(req, res) {
    // [*] Custom Route with Express - Can have multiple TODO lists!
    const customRoute = req.params.customRoute
    List.findOne({name: customRoute}, function(err, docs){ 
        // check to see if route already exist or not,
        // if not: create new list, else ignore
        if (!err) {
            if (!docs) {
                const route = new List({
                    name: customRoute,
                    items: defaultTodos
                })
                route.save()
                res.redirect('/' + customRoute)
            } else {
                res.render('list', {listTitle: docs.name, newEl: docs.items})
            }
        }       
    })
})


app.post('/delete', function(req, res){
    // Save checked todo and deletes it
    const checkedTodo = req.body.checkbox;
    const routeName = req.body.listName;
    // console.log(routeName)

    if (routeName === 'TODO') {
        Todo.deleteOne({name: checkedTodo}, function(err){
            if(err) {
                console.log(err)
            } else {
                res.redirect('/')
            }
        })
    } else {
        List.findOne({name: routeName}, function(err, docs) {
            const ind = docs.items.findIndex(function(item, index) {
                return item.name === checkedTodo
            })
            docs.items.splice(ind, 1)
            docs.save()
            res.redirect('/' + routeName)
        })

    }
    
})


app.listen(3000, function(){ 
    console.log('Service is up and running at port 3000')
})

// ==========================================================================
// [*] Don't need a POST method at '/work' because the button is always
//      directed to '/'. app.post('/') differentiates and redirects based on 
//      button value listTitle (dynamically changes with ejs)

    // app.post('/work', function(req, res){
    //     let work = req.body.newItem;
    //     workItems.push(work)
    //     res,redirect('/work')
    // })