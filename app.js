//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app=express();
const _=require("lodash");

var workitems=[];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-ubaid:Ubaid2001@cluster0.ojiyx.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your to-do list"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});
const item3=new Item({
  name:"<---- Hit this to delete an item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("success");
      }
    });
  }
  res.render("list",{listtitle:"Today",newlistitems:foundItems});
});

});
app.post("/",function(req,res){
   const itemName= req.body.context;
   const listName=req.body.list;
   const item=new Item({
     name:itemName
   });
   if(listName==="Today"){
     item.save();
     res.redirect("/");
   }
   else{
     List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
     });
   }
});
app.post("/delete",function(req,res){

const checkedItem=req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
  Item.findByIdAndRemove(checkedItem,function(err){

  if(!err){
    console.log("successfully deleted");
    res.redirect("/");
  }
  });
}
else {
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});
app.get("/:hell",function(req,res){
  const customlistname=_.capitalize(req.params.hell);
  List.findOne({name:customlistname},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new listen
        const list=new List({
          name:customlistname,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customlistname);
      }
      else{
      //show an existing listen
      res.render("List",{listtitle:foundList.name,newlistitems:foundList.items});
      }
    }

  });


});
app.listen(process.env.PORT||3000,function(){
console.log("3000");
});
