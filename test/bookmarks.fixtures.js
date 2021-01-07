function makeBookmarksArray(){
    return [
        {
        id: 1,
        title: "google",
        url: "http://google.com",
        description: "google website",
        rating: 4
        },
        {
        id: 2,
        title: "thinkful",
        url: "http://thinkful.com",
        description : "thinkful website",
        rating: 5
        },
        {
        id: 3,
        title: "amazon",
        url : "http://amazon.com",
        description : "amazon website",
        rating: 3,
        },
    ]
}

module.exports = {
    makeBookmarksArray,
}