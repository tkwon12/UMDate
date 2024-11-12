const express = require('express');
const router = express.Router();
const database = require('./mangoDb.js');
const axios = require('axios');
let signedin = false;
let currentUser = {};
let currentFriend = {};

// Route for the home page
router.get('/', (req, res) => {
    let movieData
    getMovies()
        .then((movieHTML) => {
            res.render('index',{movies: movieHTML})
            //console.log(movieHTML); // Log the resolved value when the Promise is fulfilled
        })
        .catch((error) => {
            console.error(error); // Handle any errors that may occur
        });
});
async function getMovies() {
    let movieHTML = "";
    
    const options = {
      method: 'GET',
      url: 'https://movies-tv-shows-database.p.rapidapi.com/',
      params: { page: '1' },
      headers: {
        Type: 'get-trending-movies',
        'X-RapidAPI-Key': '5a70ec0a51mshe9a8be20e44f7ccp1bf17ajsn382af7fdce5a',
        'X-RapidAPI-Host': 'movies-tv-shows-database.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
    
      const random = Math.floor(Math.random() * 5);
      const movieId = response.data.movie_results[random].imdb_id;
      const options2 = {
        method: 'GET',
        url: 'https://movies-tv-shows-database.p.rapidapi.com/',
        params: { movieid: movieId },
        headers: {
          Type: 'get-movies-images-by-imdb',
          'X-RapidAPI-Key': '5a70ec0a51mshe9a8be20e44f7ccp1bf17ajsn382af7fdce5a',
          'X-RapidAPI-Host': 'movies-tv-shows-database.p.rapidapi.com'
        }
      };
  
      try {
        const response2 = await axios.request(options2);
        movieHTML += `<img src="${response2.data.poster}" alt="${response2.data.title}" width="200" height="300"/>`;
        movieHTML += `<p>${response2.data.title}</p>`
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  // console.log(movieHTML)
    return movieHTML;
  }

// Sign up routes
router.get('/signup', (req, res) => {
    if (!signedin) {
        res.render('signup');
    } else {
        res.render('alreadysignedup');
    }
});

router.post('/signup', async (req, res) => {
    const { name, age, directoryid, email, major, years, profile, photo } = req.body;
    const result = await database.lookUpOneEntry(directoryid);

    if (!result) {
        const newUser = { name, age, directoryid, email, major, years, profile, photo, likedme: [], metme: [directoryid] };
        await database.insertUserdata(newUser);
        res.redirect('/');
    } else {
        res.render('alreadysignedup');
    }
});

// Sign in routes
router.get('/signin', (req, res) => {
    res.render('signin');
});

router.post('/signin', async (req, res) => {
    const directoryID = req.body.directoryid;
    const result = await database.lookUpOneEntry(directoryID);

    if (result) {
        signedin = true;
        currentUser = result;
        res.redirect('/menu');
    } else {
        res.redirect('/error');
    }
});

// Menu page route
router.get('/menu', (req, res) => {
    if (signedin) {
        res.render('menu');
    } else {
        res.redirect('/signin');
    }
});

// Error page route
router.get('/error', (req, res) => {
    res.render('ErrorMassage');
});

// Searching page route
router.get('/searching', async (req, res) => {
    if (signedin) {
        const friends = await database.lookUpnotMetme(currentUser.directoryid);
        if (friends && friends.length > 0) {
            const number = Math.floor(Math.random() * friends.length);
            currentFriend = friends[number];
            
            // Update the 'metme' list of the found friend
            currentFriend.metme.push(currentUser.directoryid);
            await database.updateOne(currentFriend.directoryid, { metme: currentFriend.metme });

            const variables = {
                photo: currentFriend.photo,
                name: currentFriend.name,
                major: currentFriend.major,
                years: currentFriend.years,
                age: currentFriend.age,
                profile: currentFriend.profile
            };
            res.render('searching', variables);
        } else {
            res.redirect('/nofriend');
        }
    } else {
        res.redirect('/error');
    }
});

// POST route for searching 
router.post('/searching', async (req, res) => {
});

// Route for handling when no friends are found
router.get('/nofriend', (req, res) => {
    res.render('nofriend');
});

router.get('/update',async(req,res)=>{
  
    const result = await database.lookUpOneEntry(currentUser.directoryid);
    
    const variables = { 
        name: result.name, 
        age: result.age, 
        directoryid: result.directoryid, 
        email: result.email, 
        major: result.major, 
        years: result.years, 
        profile: result.profile, 
        photo: result.photo};
   
    res.render('update',variables);
    
    
});

router.post('/update',async(req,res)=>{
    const { name, age, email, major, years, profile, photo } = req.body;
    await database.updateOne(currentUser.directoryid, { name: name, age:age, email:email,major:major,years:years,profile:profile,
    photo:photo});
    res.redirect("/menu");
});

router.get('/userdata',async(req,res)=>{
    const result = await database.lookUpOneEntry(currentUser.directoryid);
    const variables = {
        photo: result.photo,
        name: result.name,
        major: result.major,
        years: result.years,
        age: result.age,
        profile: result.profile
    };
    res.render('userdata',variables);
}
)

// Route for liking a user
router.get('/like', async (req, res) => {
    if (signedin && currentFriend) {
        currentFriend.likedme.push(currentUser.directoryid);
        await database.updateOne(currentFriend.directoryid, { likedme: currentFriend.likedme });
        res.redirect('/searching');
    } else {
        res.redirect('/error');
    }
});

// Route for viewing the liked me list
router.get('/likedme', async (req, res) => {
    if (signedin) {
        const result = await database.lookUpOneEntry(currentUser.directoryid);
        if (result && result.likedme.length > 0) {
            let table = "<table border='1'><tr><th>Name</th><th>Major</th><th>Age</th><th>Years</th><th>Email</th></tr>";

            for (let directoryid of result.likedme) {
                let friendlikedme = await database.lookUpOneEntry(directoryid);
                if (friendlikedme) {
                    table += `<tr><td>${friendlikedme.name}</td><td>${friendlikedme.major}</td><td>${friendlikedme.age}</td><td>${friendlikedme.years}</td><td>${friendlikedme.email}</td></tr>`;
                }
            }

            table += "</table>";
            res.render('likedme', { display: table });
        } else {
            res.render('nolikes'); // Assuming you have a template for when there are no likes
        }
    } else {
        res.redirect('/signin');
    }
});

// POST route for liked me 
router.post('/likedme', async (req, res) => {

});


// Logout route
router.get("/logout",(req,res)=>{
    res.render("logoutwarning");
})

router.post("/logout",(req,res)=>{
    signedin = false;
    currentUser = {};
    res.redirect('/');
});



module.exports = router;
