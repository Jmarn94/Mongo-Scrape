$(".addArticle").on("click",function() {
    $.ajax({url:"/addArticle", method: "post", data:this.dataset}).then(function(result) {
        window.location.href = "/";
    });
})


