var isLoggedin = false
var lo = document.getElementById("lo");
var lo1 = document.getElementById("lo1");
var preloadli = document.getElementById("preloadli");
var preloadsu = document.getElementById("preloadsu");
var selectform = document.getElementById("selectform");
selectform.style.display = "none";
lo.style.display = "none";
lo1.style.display = "none";
preloadli.style.display = "none";
preloadsu.style.display = "none";
subtn.style.display = "block";
libtn.style.display = "block";

const myModal = document.querySelectorAll('.modal')
async function signup(e){
    e.preventDefault()
    var subtn = document.getElementById("subtn");
    subtn.style.display = "none";
    preloadsu.style.display = "block";
    const email = document.querySelector('#signUpPRN')
    const password = document.querySelector('#signUpPassword')
    try{
       if(email.value.length!=10)
       {
        throw {
            message: "Invalid PRN",
            error: new Error()
          };
       }
    const result = await firebase.auth().createUserWithEmailAndPassword(email.value+"@prn.com", password.value)
    if(email.value=="7768989938")
    {
        await result.user.updateProfile({
        displayName: "Admin"
    });
    M.toast({html: 'Admin signup', classes: 'green rounded', displayLength: 1500})
    }
    else
    {
        await result.user.updateProfile({
            displayName: "User"
        });
    }
    M.toast({html: 'Sign in successful', classes: 'green rounded', displayLength: 1500})
    email.value=""
    password.value=""
    M.Modal.getInstance(myModal[0]).close()
    addresponse()
    }
    catch(err)
    {
        if(err.code=="auth/email-already-in-use")
        {
            err.message="PRN already exist"
            window.alert(err.message)       
        }
        subtn.style.display = "block";
        preloadsu.style.display = "none";
    }
    
}
async function getCGPA()
{
    const db = firebase.firestore();

    //get all signed in users
    db.collection("user").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id);

            //get data of signed in users
            var docRef = db.collection("Student Database").doc(doc.id);
            docRef.get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data()["CGPA"]);

                //update CGPA signed in users
                db.collection("user").doc(doc.id).update({
                    CGPA: doc.data()["CGPA"],
                })
                .then(() => {
                    console.log("Document successfully written!");
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
                
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
        });
    });
    
    
}

async function getSortedData()
{
    const db = firebase.firestore();
    db.collection("user").orderBy("CGPA", "desc")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, doc.data()["CGPA"], doc.data()["pref1"]);
            var prn = doc.id;
            if(doc.data()["pref1"]==1)
            {
                db.collection("Courses").doc("ML").get().then((doc) => {
                    console.log(doc.data()["totalCap"] > doc.data()["filled"])
                    if(doc.data()["totalCap"] > doc.data()["filled"])
                    {
                        assign(prn,doc.id, doc.data()["filled"]+1); 
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });

            }
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}
async function assign(prn, course, filled)
{
    
    //update student
    firebase.firestore().collection("user").doc(prn).update({
        allocation: "ML"
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
    
    
    //update course
    firebase.firestore().collection("Courses").doc(course).update({
        filled: filled
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

async function login(e){
    e.preventDefault()
    var libtn = document.getElementById("libtn");
    libtn.style.display = "none";
    preloadli.style.display = "block";
    const email = document.querySelector('#loginPRN')
    const password = document.querySelector('#LoginPassword')
    try{
       if(email.value.length!=10)
       {
        throw {
            message: "Invalid PRN",
            error: new Error()
          };
       }

    const result = await firebase.auth().signInWithEmailAndPassword(email.value+"@prn.com", password.value)
    if(await result.user.displayName=="Admin")
    {
    M.toast({html: 'Admin Login', classes: 'green rounded', displayLength: 1500})
    }
    else
    {
        selectform.style.display = "block";
    }
    M.toast({html: 'Login successful', classes: 'green rounded', displayLength: 1500})
    isLoggedin=true
    email.value=""
    password.value=""
    M.Modal.getInstance(myModal[1]).close()
    hideLI()
    }
    catch(err)
    {
        if(err.code=="auth/wrong-password")
        {
            err.message="Incorrect Password"       
        }
        if(err.code=="auth/user-not-found")
        {
            err.message="PRN does not exist, Please sign-up"       
        }
        window.alert(err.message)
        libtn.style.display = "block";
        preloadli.style.display = "none";
    }
}
function logout(){
    firebase.auth().signOut().then(() => {
        M.toast({html: 'Log out successful', classes: 'green rounded', displayLength: 1500})
        }).catch((error) => {
            window.alert(error.message)
        });
}
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        if(user.displayName=="Admin")
        {
        M.toast({html: 'Admin Login', classes: 'green rounded', displayLength: 1500})
        getSortedData();
        }
        else
        {
            selectform.style.display = "block";
        }
        isLoggedin=true
        hideLI()
        var test = document.getElementById("test");
        document.getElementById("lo").innerHTML = user.email.slice(0, 10);
        document.getElementById("lo1").innerHTML = user.email.slice(0, 10);
      console.log(user)
    } else {
        selectform.style.display = "none";
        isLoggedin = false
        hideLO()
    }
  });
function hideLI() {
    var x = document.getElementById("li");
    var y = document.getElementById("lo");
    var z = document.getElementById("su");
    var x1 = document.getElementById("li1");
    var y1 = document.getElementById("lo1");
    var z1 = document.getElementById("su1");
    if(isLoggedin)
    {
        x.style.display = "none";
        y.style.display = "block";
        z.style.display = "none";
        x1.style.display = "none";
        y1.style.display = "block";
        z1.style.display = "none";
    }
}
async function fillform(e){
    e.preventDefault()
    var p1 = document.getElementById("p1").selectedIndex;
    var p2 = document.getElementById("p2").selectedIndex;
    var p3 = document.getElementById("p3").selectedIndex;
    var p4 = document.getElementById("p4").selectedIndex;
    
    try
    {
        if(p1==p2 || p1==p3 || p1==p4|| p2==p3 || p2==p4 || p3==p4 || !p1 || !p2 || !p3 || !p4)
        {
            window.alert("Invalid choices")
        }
        else
        {
            addresponse(firebase.auth().currentUser.email.slice(0,10),p1,p2,p3,p4);
            window.alert("Response Added")
            getCGPA();
        }
    }
    catch(err)
    {
            window.alert(err)
    }
  
}
function hideLO() {
    var x = document.getElementById("li");
    var y = document.getElementById("lo");
    var z = document.getElementById("su");
    var x1 = document.getElementById("li1");
    var y1 = document.getElementById("lo1");
    var z1 = document.getElementById("su1");
    if(!isLoggedin)
    {
        lo.style.display = "none";
        lo1.style.display = "none";
        preloadli.style.display = "none";
        preloadsu.style.display = "none";
        x.style.display = "block";
        y.style.display = "none";
        z.style.display = "block";
        x1.style.display = "block";
        y1.style.display = "none";
        z1.style.display = "block";
        subtn.style.display = "block";
        libtn.style.display = "block";
    }
}
