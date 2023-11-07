import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const PORT = process.env.PORT || 3000;
// Dynamic port for Heroku


let currTheme = "light";

let themeIcon = "moon";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to mongoDB database
// mongoose.connect("mongodb://localhost:27017/todolistDB");

// Connect to MongoDB Atlas online server
mongoose.connect("mongodb+srv://kunaldusk:thMXljqFOmUu9n2U@cluster0.tg40em3.mongodb.net/todolistDB");

// Cyclic
mongoose.connect(process.env.MONGO_URI);

// Create item schema
const itemSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("item", itemSchema);

// Create list schema
const listSchema = mongoose.Schema({
    name: String,
    item: [itemSchema]
});

const List = mongoose.model("list", listSchema);


// **************************************************************************************************
// Dark-light mode toggle
app.get("/theme", (req, res) => {
    if (currTheme === "light") {
        currTheme = "dark";
        themeIcon = "sun";
    }
    else {
        currTheme = "light";
        themeIcon = "moon";
    }

    const routeName = req.query.route;

    if (routeName) {
        res.redirect(`/${routeName}`);
    }
    else {
        res.redirect("/");
    }
})


// Get route for the home page
app.get("/", (req, res) => {

    List.find()
        .then((AllLists) => {
            res.render("app.ejs", {
                lists: AllLists,
                theme: currTheme,
                themeIcon: themeIcon
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

// Get route for a custom list page
app.get("/:customRoute", (req, res) => {
    const listName = _.capitalize(req.params.customRoute);

    List.findOne({ name: listName })
        .then((currList) => {

            res.render("app.ejs", {
                list: currList,
                listName: listName,
                theme: currTheme,
                themeIcon: themeIcon
            });
        })
        .catch((err) => {
            console.log(err);
        })
});


// Post route to add a new list
app.post("/addList", (req, res) => {
    const newList = req.body.newList;
    res.redirect(`/${newList}`);
});


// Add Tasks
app.post("/addTask", (req, res) => {
    const task = req.body.newNote;
    const listName = req.body.listName;

    const newItem = new Item({
        name: task
    });

    List.findOne({ name: listName })
        .then((foundList) => {
            if (!foundList) {
                const newList = new List({
                    name: listName,
                    item: [newItem]
                });

                newList.save();
            }
            else {
                foundList.item.push(newItem);
                foundList.save();
            }

            res.redirect(`/${listName}`);
        })
        .catch((err) => {
            console.log(err);
        });
});

// Delete List
app.post("/deleteList", (req, res) => {

    const listId = req.body.listId;

    // List.deleteOne({ name: list })
    //     .then(() => {
    //         console.log("Successfully deleted a list");
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });

    List.findByIdAndDelete(listId)
        .then(() => {
            console.log("Successfully deleted a list");
        })
        .catch((err) => {
            console.log(err);
        });

    res.redirect("/");
})

// Delete Tasks
app.post('/deleteTask', function (req, res) {

    const list = req.body.listName;
    const taskId = req.body.deleteItemId;


    // List.findOne({ name: list })
    //     .then((foundList) => {
    //         if (foundList) {
    //             const index = foundList.item.indexOf(task);
    //             foundList.item.splice(index, 1);
    //             foundList.save();
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });

    List.findOneAndUpdate({ name: list }, { $pull: { item: { _id: taskId } } })
        .then(() => {
            console.log("Successfully deleted a task");
        })
        .catch((err) => {
            console.log(err);
        });

    res.redirect(`/${list}`);
});


// app.listen(dPort || port, () => {
//     console.log(`Server running on port ${port}`);
// })


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})