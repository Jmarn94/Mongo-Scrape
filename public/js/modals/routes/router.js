module.exports = function(app,axios,cheerio,db) {
    app.get("/", function(req,res) {
        db.Article.find({}).then(function(dbArticle){
            vardbObject= {article: dbArticle};
            res.render("index, dbObject");
        });
    })

    app.post("/addArticle", function(req,res) {
        console.log(req.body.title,req.body.link);
        db.Article.create({title:req.body.title,
                           link: req.body.link})
        .then(function(dbArticle) {
            console.log(dbArticle);
            res.end("success");
        })
        .catch(function(err) {
            console.log(err);
        });                    
    });
    app.get("/addNoteForm/:id",function(req,res){
        var id = {id:req.params.id};
        res.render("addNoteForm",id);
})
app.post("/addNote",function(req,res){
    console.log(req.body.id);
    console.log(req.body.comments);
    db.Note.create({comments:req.body.comments}).then(function(data){
        db.Article.update({_id:req.body.id},{$push:{note:data._id} }, { new: true }).then(function(result){
            console.log(result);
            db.Article.find({}).then(function(dbArticle){
                var dbObject= {article: dbArticle};
                res.render("index",dbObject);
            });       
        }).catch(function(err){console.log(err)});        
    });
});
app.get("/deleteArticle/:id",function(req,res){
    db.Article.deleteOne({_id:req.params.id},function(err,result){
        if(err){res.send(err)}
        else{
            db.Article.find({}).then(function(dbArticle){
                var dbObject= {article: dbArticle};
                res.render("index",dbObject);
            });
        }
    });
});
app.get("/scrape",function(req,res){
                
    axios.get("https://www.statesman.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        newsObject = [];
        $("h3").each(function(i, element) {
            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            newsObject.push(result);
        });
        res.render("news",{news:newsObject});
     });
});
}


