'use strict';

const express = require("express");
const http = require('http');
const fs = require("fs");
const multer = require("multer");
const app = express();
const bodyparser = require("body-parser");
const path = require("path");
const atob = require("atob");
const btoa = require("btoa");
const cookieParser = require('cookie-parser');
const nodemailer=require("nodemailer");
var port=process.env.PORT || 5555;



app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.use(express.static("public"));
app.use(cookieParser());
const options = {
    httpOnly: true
};

/**
 * @return {number}
 */

const AddInfo = function(folder, Obj) {
    fs.writeFile("./private/users/" + folder + "/name.txt", JSON.stringify({
        fname: Obj.firstName
    }), function(err) {
        if (err) console.log("There was an error while loading name");
    }); //Writing Names
    fs.writeFile("./private/users/" + folder + "/Last_Name.txt", JSON.stringify({
        lname: Obj.lastName
    }), function(err) {
        if (err) console.log("There was an error while loading last name");
    });
    fs.writeFile("./private/users/" + folder + "/email.txt", JSON.stringify({
        mail: Obj.email
    }), function(err) {
        if (err) console.log("There was an error while loading email");
    });
    fs.mkdirSync('./private/users/' + folder + "/Private");
    fs.writeFile("./private/users/" + folder + "/Private/username.txt", JSON.stringify({
        user: Obj.username
    }), function(err) {
        if (err) console.log("There was an error while loading username");
    });
    fs.writeFile("./private/users/" + folder + "/Private/password.txt", JSON.stringify({
        pass: Obj.password
    }), function(err) {
        if (err) console.log("There was an error while loading password");
    });
    if (Obj.team) {
        fs.mkdirSync('./private/users/' + folder + "/Team");
        fs.writeFile("./private/users/" + folder + "/Team/team.txt", JSON.stringify({
            team: Obj.team
        }), function(err) {
            if (err) console.log("There was an error while loading Team Name");
        });
    }
    return 1;
};

/**
 * @return {number}
 */

const ProjectSet = function(user, categ, colabs, descr, project) {
    if (categ !== 'Web Sites' && categ !== 'Blogs' && categ !== 'Other') {
        let path = './private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project;
        fs.writeFile(path + '/title.txt', project, function(err) {
            if (err) {
                console.log(err);
                return false;
            }
        });
        fs.openSync(path + '/comments.txt', 'w+');
        if (colabs) {
            fs.writeFile(path + '/colaborators.txt', colabs, function(err) {
                if (err) {
                    console.log(err);
                    return false;
                }
            })
        }
        if (descr) {
            fs.writeFile(path + '/description.txt', descr, function(err) {
                if (err) {
                    console.log(err);
                    return false;
                }
            });
        }

    }
    if (categ === 'Web Sites' || categ === 'Blogs' || categ === 'Other') {
        let path = './private/Projects/' + categ + '/' + user + '/' + project;
        fs.writeFile(path + '/title.txt', project, function(err) {
            if (err) {
                console.log(err);
                return false;
            }
        });
        fs.openSync(path + '/comments.txt', 'w+');
        if (colabs) {
            fs.writeFile(path + '/colaborators.txt', colabs, function(err) {
                if (err) {
                    console.log(err);
                    return false;
                }
            })
        }
        if (descr) {
            fs.writeFile(path + '/description.txt', descr, function(err) {
                if (err) {
                    console.log(err);
                    return false;
                }
            });
        }
    }
    return 1;
};
//End of Useful functions




//Setup

let dest = "";
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        fs.mkdirSync('./private/users/' + dest + "/Images");
        cb(null, './private/users/' + dest + "/Images");
    },

    filename: function(req, file, cb) {
        let extStart = file.originalname.indexOf(path.extname(file.originalname));
        cb(null, dest + path.extname(file.originalname));
    }
});

let AnotherDest = "";
let TheUser = "";
let counter = 1;
let storage2 = multer.diskStorage({
    destination: function(req, file, cb) {
        if (fs.existsSync(AnotherDest + "/Images") != true) {
            fs.mkdirSync(AnotherDest + "/Images");
        }
        cb(null, AnotherDest + "/Images");
    },

    filename: function(req, file, cb) {
        let extStart = file.originalname.indexOf(path.extname(file.originalname));
        cb(null, TheUser + counter + path.extname(file.originalname));
        counter += 1;
    }
});



const upload = multer({
    storage: storage
});


const uploadProjImage = multer({
    storage: storage2
});

const transporter=nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:"",
        pass:"",
    }
});









// end of setup

app.get("/", function(req, res) {
    if (req.cookies.cd_user) {
        const user = atob(atob(req.cookies.cd_user));
        if (user) {
            fs.exists('./private/users/' + user, function(exists) {
                if (exists) {
                    res.sendFile(path.join(__dirname, './private/ProfPage/LoggedHome.html'));
                } else {
                    res.clearCookie('cd_user');
                    res.statusCode = 401;
                }
            })
        } else {
            res.statusCode = 401;
            res.send('Please log in again');
        }
    } else {
        res.sendFile(path.join(__dirname, './public/home.html'));
    }
});

app.get("/public/Form.html", function(req, res, next) {
    res.sendFile(path.join(__dirname, "./public/Form.html"));
});
app.get("/public/LogIn.html", function(req, res, next) {
    if (req.cookies.cd_user) {
        const user = atob(atob(req.cookies.cd_user));
        if (user) {
            res.sendFile(path.join(__dirname, './private/ProfPage/LoggedHome.html'));
        } else {
            res.sendFile(path.join(__dirname, './public/LogIn.html'))
        }
    } else {
        res.sendFile(path.join(__dirname, './public/LogIn.html'))
    }
});

app.get("/GetThingReady", function(req, res) {
    if (req.cookies.cd_user) {
        const Dat = atob(atob(req.cookies.cd_user));
        if (Dat) {
            fs.exists("./private/users/" + Dat, function(exists) {
                if (exists) {
                    fs.exists("./private/users/" + Dat + '/Images', function(exists) {
                        if (exists) {
                            fs.readdir("./private/users/" + Dat + "/Images/", function(err, data) {
                                if (err) {
                                    res.statusCode = 500;
                                    res.send('Blown');
                                } else {
                                    const ext = path.extname(data[0]);
                                    fs.readFile("./private/users/" + Dat + "/Images/" + Dat + ext, function (err, data) {
                                        res.send(data.toString("base64"));
                                    });
                                }
                            });
                        } else {
                            res.send('The user has no image');
                        }
                    });
                } else {
                    console.log("Blown");
                    res.statusCode = 500;
                    res.clearCookie('cd_user');
                    res.send("OOPS Smth blown");
                }
            });
        }
    } else {
        res.statusCode = 500;
        res.send('Please log in again');
    }
});

app.get("/GetThingsReady", function(req, res) {
    if (req.cookies.cd_user) {
        const Dat = atob(atob(req.cookies.cd_user));
        console.log(Dat);
        if (Dat) {
            fs.exists("./private/users/" + Dat, function(exists) {
                if (exists) {
                    const name = JSON.parse(fs.readFileSync("./private/users/" + Dat + "/name.txt", 'utf8')).fname;
                    const Surn = JSON.parse(fs.readFileSync("./private/users/" + Dat + "/Last_Name.txt", 'utf8')).lname;
                    const mail = JSON.parse(fs.readFileSync('./private/users/' + Dat + '/email.txt', 'utf8')).mail;
                    const Team = fs.existsSync("./private/users/" + Dat + "/Team") === true ? JSON.parse(fs.readFileSync("./private/users/" + Dat + "/Team/team.txt", 'utf8')).team : undefined;
                    console.log(name + " " + Surn + " ", Team);
                    const ToBeSent = {
                        Name: name,
                        LName: Surn,
                        team: Team,
                        user : Dat,
                        mail: mail
                    };
                    res.send(JSON.stringify(ToBeSent));
                } else {
                    console.log("Blown");
                    res.clearCookie('cd_user');
                    res.statusCode = 500;
                    res.send("User not found");
                }
            });
        } else {
            res.statusCode = 500;
            res.clearCookie('cd_user');
            res.send('Smth blew up');
        }
    } else {
        res.statusCode = 500;
        res.send('Smth blew up');
    }
});
app.get("/GetMyProjects",function(req,res){
    const ObjectToBeSent={};
    let ObjectCount=0;
    const TheUser=atob(atob(req.cookies.cd_user));
    const TheDir=fs.readdirSync("./private/Projects/");
    TheDir.forEach(function(categs,index){
        if(categs!=="Mobile Applications"){
            const ThisDir=fs.readdirSync("./private/Projects/"+categs);
            ThisDir.forEach(function(Folder,index){
                if(Folder===TheUser){
                    const TheProjectsOfTheUser=fs.readdirSync("./private/Projects/"+categs+"/"+Folder);
                    TheProjectsOfTheUser.forEach(function(ProjName,index){
                        const title=fs.readFileSync("./private/Projects/"+categs+"/"+Folder+"/"+ProjName+"/title.txt").toString("utf8");
                        const desc =fs.readFileSync("./private/Projects/"+categs+"/"+Folder+"/"+ProjName+"/description.txt").toString("utf8");
                        const colabs=fs.readFileSync("./private/Projects/"+categs+"/"+Folder+"/"+ProjName+"/colaborators.txt").toString("utf8");
                        const comments=fs.readFileSync("./private/Projects/"+categs+"/"+Folder+"/"+ProjName+"/comments.txt").toString("utf8");
                        ObjectToBeSent["Object"+ObjectCount]={tit:title,descr:desc,cols:colabs,coms:comments};
                        ObjectCount++;
                    });//end of foreach
                }
                else {/*console.log('Nothing Found in '+categs)*/}
            });
            //console.log(ObjectToBeSent);
        }
        else if(categs==="Mobile Applications"){
            const Subcats=fs.readdirSync("./private/Projects/"+categs);
            Subcats.forEach(function(Subcats,index){
                const Users=fs.readdirSync("./private/Projects/"+categs+"/"+Subcats);
                Users.forEach(function(Folder,index){
                    if(Folder===TheUser){
                        const TheProjectsOfTheUser=fs.readdirSync("./private/Projects/"+categs+"/"+Subcats+"/"+Folder);
                        TheProjectsOfTheUser.forEach(function(ProjName,index){
                            const title=fs.readFileSync("./private/Projects/"+categs+"/"+Subcats+"/"+Folder+"/"+ProjName+"/title.txt").toString("utf8");
                            const desc =fs.readFileSync("./private/Projects/"+categs+"/"+Subcats+"/"+Folder+"/"+ProjName+"/description.txt").toString("utf8");
                            const colabs=fs.readFileSync("./private/Projects/"+categs+"/"+Subcats+"/"+Folder+"/"+ProjName+"/colaborators.txt").toString("utf8");
                            const comments=fs.readFileSync("./private/Projects/"+categs+"/"+Subcats+"/"+Folder+"/"+ProjName+"/comments.txt").toString("utf8");
                            ObjectToBeSent["Object"+ObjectCount]={tit:title,descr:desc,cols:colabs,coms:comments};
                            ObjectCount++;
                        });//end of third foreach
                    }
                    else{

                    }//end of else
                });//end of second ForEach
            });//end of first forEach
        }//end of else
    });
    res.send(JSON.stringify(ObjectToBeSent));
});


app.get('/projectUpload', function(req, res) {
    if (req.cookies.cd_user) {
        const user = atob(atob(req.cookies.cd_user));
        if (user) {
            fs.exists('./private/users/' + user, function(exists) {
                if (exists) {
                    console.log(true);
                    res.sendFile(path.join(__dirname, '/private/ProfPage/Project.html'));
                } else {
                    res.clearCookie('cd_user');
                    res.statusCode = 500;
                    res.send('User not found');
                }
            });
        } else {
            res.clearCookie('cd_user');
            res.redirect(401, '/public/LogIn.html');
        }
    } else {
        res.redirect(401, '/public/LogIn.html');
    }
});

app.get('/logoff', function(req, res) {
    res.clearCookie('cd_user');
    res.redirect('/');
});

app.get("/GettingData", function(req, res) {
    if (req.cookies.cd_user) {
        const user = atob(atob(req.cookies.cd_user));
        if (user) {
            res.send(user)
        }
    } else {
        res.statusCode = 200;
        res.send('Blown');
    }
});

app.get("/logged", function(req, res) {
    if (req.cookies.cd_user) {
        const user = atob(atob(req.cookies.cd_user));
        if (user) {
            res.sendFile(path.join(__dirname, './private/ProfPage/prof.html'));
        } else {
            res.redirect('/public/Login.html');
        }
    } else {
        res.redirect('/public/Login.html');
    }
});
app.get('/ProjectsPages', function (req, res) {
    res.sendFile(path.join(__dirname, './public/GetProjects.html'))
});
app.get('/Projects', function (req, res) {
    const TheObjectsToBeSent={};
    let TheRequest=Object.keys(req.query)[0];
    if (TheRequest === 'WebSites') {
        TheRequest = 'Web Sites';
    }
    if (TheRequest.indexOf('MobileApplications') >= 0) {
        if (TheRequest.substr(19) === 'UsefulApps') {
            TheRequest = 'Mobile Applications/Useful Apps';
        } else {
            TheRequest = 'Mobile Applications/' + TheRequest.substr(19);
        }
    }

    const OpenDirectory="./private/Projects/"+TheRequest;
    const LengthOfOpenDir=fs.readdirSync(OpenDirectory).length;
    let NumberOfObjectsToBeSent=0;
    for(let i=0;i<LengthOfOpenDir;i++){                  //for number 1
        let Current=OpenDirectory+"/"+fs.readdirSync(OpenDirectory)[i];
        let User=fs.readdirSync(OpenDirectory)[i];
        let Current2=Current;
        const LengthOfCurrent=fs.readdirSync(Current).length;
        for(let i=0;i<LengthOfCurrent;i++){               //for number 2
            Current2=Current;
            Current2=Current2+"/"+fs.readdirSync(Current)[i];
            let colabs;
            let title;
            let desc;
            let comments;
            if (fs.existsSync(Current2+"/colaborators.txt")) {
                colabs = fs.readFileSync(Current2 + "/colaborators.txt").toString("utf8");
                console.log(colabs);
            }
            if(fs.existsSync(Current2+"/title.txt")) {
                title = fs.readFileSync(Current2 + "/title.txt").toString("utf8");
            }
            if(fs.existsSync(Current2+"/description.txt")){
                desc = fs.readFileSync(Current2 + "/description.txt").toString("utf8");
            }
            comments = fs.readFileSync(Current2 + '/comments.txt').toString('utf8');
            console.log(comments);
            let NumberOfImages = "";
            let TheImages = [];
            if(fs.existsSync(Current2+"/Images")) {NumberOfImages=fs.readdirSync(Current2+"/Images").length;}
            else NumberOfImages=0;
            for(let i=0;i<NumberOfImages;i++){
                TheImages[i]=fs.readFileSync(Current2+"/Images"+"/"+fs.readdirSync(Current2+"/Images")[i]).toString("base64");
            }
            TheObjectsToBeSent['Object' + NumberOfObjectsToBeSent++]={user:User,images:TheImages,cols:colabs,TheTitle:title,descr:desc, comments:comments};
        }
    }

    res.statusCode=200;
    res.send(JSON.stringify(TheObjectsToBeSent));
    console.log("The Objects have been sent");

});



app.post("/lol", upload.any(), function(req, res) {
    console.log(req.files);
    res.send("OK");
});

app.post("/TXT", function(req, res, next) {
    fs.exists('./private/users/' + req.body.username, function(exists) {
        if (exists) {
            console.log(exists);
            res.statusCode = 406;
            res.send('user exists');
        } else {
            dest = req.body.username;
            fs.mkdirSync('./private/users/' + req.body.username);
            if (AddInfo(req.body.username, req.body)) {
                res.send("Done");


                    const mailOptions={
                        from:"theprojectup@gmail.com",
                        to:req.body.email,    //req.body.Mail
                        subject:"Signed Up",
                        text:"Congratulatios!!! You've successfully signed up for ProjectUp.Now you may upload your projects and get your feedback from anonymous users! "
                    }
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                           console.log("Error Sending Message!");
                        }
                        else{
                            console.log("Message sent");

                        }



                })



            } else {
                res.statusCode = 500;
                res.send('Blown');
            }
        }
    });

});

app.post("/CheckAndLogIn", function(req, res) {
    console.log(req.body);
    fs.exists("./private/users/" + req.body.user, function(exists) {
        if (exists) {
            console.log("Username matches");
            fs.readFile("./private/users/" + req.body.user + "/Private/password.txt", function(err, data) {
                if (err) {
                    console.log("Error Checking Password");
                    res.send('Denied');
                } else {
                    if (JSON.parse(data).pass === req.body.pass) {
                        console.log("Password matches");
                        res.cookie('cd_user', btoa(btoa(req.body.user)), options);
                        res.send('Logged in');
                    } else {
                        console.log("Password doesn't match");
                        res.send("Denied");
                    }
                }
            })

        } else {
            console.log("Username doesn't match");
            res.send("Denied");
        }
    });
});

app.post('/Comment', function (req, res) {
    console.log(req.body);
    let categ = req.body.categ;
    let project = req.body.project;
    let comment = req.body.comment;
    if (categ === 'WebSites') {
        categ = 'Web Sites';
    }
    if (categ.indexOf('MobileApplications') >= 0) {
        if (categ.substr(19) === 'UsefulApps') {
            categ = 'Mobile Applications/Useful Apps';
        } else {
            categ = 'Mobile Applications/' + categ.substr(19);
        }
    }
    fs.appendFile('./private/Projects/' + categ + '/' + project + '/comments.txt', comment + 'chulchul', function (err) {
        if (err) {
            res.statusCode = 500;
            res.send('blown');
        } else {
            res.send('ok');
        }
    })
});

app.post('/ProjectDetails', function(req, res) {
    if (req.cookies.cd_user) {
        let user = atob(atob(req.cookies.cd_user));
        let categ = req.body.categ;
        let project = req.body.title;
        let colabs = req.body.colabs;
        let descr = req.body.desc;
        if (user) {
            fs.exists('./private/users/' + user, function(exists) {
                if (exists) {
                    if (categ !== 'Web Sites' && categ !== 'Blogs' && categ !== 'Other') {
                        if (fs.existsSync('./private/Projects/Mobile Applications/' + categ + '/' + user)) {
                            console.log('yes');
                        } else {
                            fs.mkdirSync('./private/Projects/Mobile Applications/' + categ + '/' + user);
                        }
                        fs.exists('./private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project, function(exists) {
                            if (exists) {
                                res.send('Project already exists');
                            } else {
                                fs.mkdirSync('./private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project);
                                AnotherDest = './private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project;
                                TheUser = user;
                                if (ProjectSet(user, categ, colabs, descr, project)) {
                                    res.send('Done');
                                } else {
                                    res.statusCode = 500;
                                    res.send('Blown');
                                }
                            }
                        });
                    }
                    if (categ === "Web Sites" || categ === "Blogs" || categ === "Other") {
                        console.log("categ");
                        if (fs.existsSync('./private/Projects/' + categ + '/' + user)) {
                            console.log('yes');
                        } else {
                            fs.mkdirSync('./private/Projects/' + categ + '/' + user);
                        }
                        fs.exists('./private/Projects/' + categ + '/' + user + '/' + project, function(exists) {
                            if (exists) {
                                res.send('Project already exists');
                            } else {
                                fs.mkdirSync('./private/Projects/' + categ + '/' + user + '/' + project);
                                AnotherDest = './private/Projects/' + categ + '/' + user + '/' + project;
                                TheUser = user;
                                if (ProjectSet(user, categ, colabs, descr, project)) {
                                    res.send('Done');
                                } else {
                                    res.statusCode = 500;
                                    res.send('Blown');
                                }
                            }
                        });
                    }
                } else {
                    res.statusCode = 500;
                    res.clearCookie('cd_user');
                    res.send('Blown');
                }
            });
        } else {
            res.redirect(401, '/public/LogIn.html');
        }
    } else {
        res.redirect(401, '/public/LogIn.html')
    }
});

app.post("/ProjectPics", uploadProjImage.any(), function(req, res) {
    res.send("It's OK");
});





http.createServer(app).listen(port, console.log('Server started'));
