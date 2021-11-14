
// --------- Inicializace DB ---------

let firebaseConfig = {
    apiKey: "AIzaSyB5TZnqd4Lwel74yhtYNaHfOjsfgWIJF_4",
    authDomain: "home-library-js.firebaseapp.com",
    databaseURL: "https://home-library-js-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "home-library-js",
    storageBucket: "home-library-js.appspot.com",
    messagingSenderId: "109962970996",
    appId: "1:109962970996:web:2317b678700fc00da40e21"
};
firebase.initializeApp(firebaseConfig);
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
const app = initializeApp(firebaseConfig);
import {getDatabase, get, onValue, ref, set, child, update, remove}
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
const db = getDatabase();  


// --------- Kontrola přihlášení ---------
const uidLbl = document.getElementById("UID")

let mainContainer = document.getElementById("main_container");

// --------- Začátek init funkce ---------
let init = function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("Úspěšně přihlášeno");
            mainContainer.style.display = "";
            console.log("Uživatel: " + user.displayName)
        } else {
            mainContainer.style.display = "none";
            console.warn("Nepřihlášen!");
            window.location.replace("login.html");
        }
        
        update(ref(db, ("Users/" + user.uid + "/info")),{
            jmeno: user.displayName,
            email: user.email,
            UID: user.uid,
            lastLogin: new Date().toISOString().slice(0, 10),
        });
        uidLbl.textContent = user.displayName;


    //  ------------- DOM const + EL + Class------------- 

    const tlacOdhlasit = document.getElementById("logout")
    tlacOdhlasit.addEventListener("click", () => {
        firebase.auth().signOut().then(function(){
        console.log("Odhlášeno");
        window.location.replace("login.html");
        })
    })

    const inputNazev = document.getElementById("nazev");
    const inputAutor = document.getElementById("autor");
    const inputStran = document.getElementById("stran");
    const inputRecenze = document.getElementById("recenze");
    const form = document.querySelector("form");
    const table = document.getElementById("myTable");

    let knihy=[];
    let knihyFiltr = [];
    let precteno = false;
    let idUser = user.uid;
    let today = new Date().toISOString().slice(0, 10);

    const inputHodnoceni = $(".my-rating").starRating({
        totalStars: 5,
        starShape: 'rounded',
        starSize: 30,
        emptyColor: 'lightgray',
        hoverColor: 'dodgerblue',
        activeColor: 'green',
        useGradient: false,
        callback: function(currentRating, $el){
            return currentRating*10
        }
    });

    let inputPrecteno = document.getElementById("collapseOhodnot")
    inputPrecteno.addEventListener('show.bs.collapse', function () {
        precteno = true;
        document.getElementById("tlacPrecteno").textContent = "Zatím nehodnotit";
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary")
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning")
    });
    inputPrecteno.addEventListener('hide.bs.collapse', function () {
        precteno = false;
        document.getElementById("tlacPrecteno").textContent = "Hodnocení";
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning")
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary")
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        zjistiID();
        vyprazdniPole();
        naplnSeznamKnihzDB(); // --- vypsalo prvni novou porizeno až při refresh - nahrazeno refreshem
        // location.reload();
    });

    function vyprazdniPole () {
        inputNazev.value = "";
        inputAutor.value = "";
        inputStran.value = "";
        inputRecenze.value = "";
        precteno = false;
    };

    function zjistiID () {
        get(ref(db, "Users/" + idUser + "/info/idKnizek"))
        .then( (snapshot) => {
            let idKnihy = snapshot.val();
            ++idKnihy;
            console.log(idKnihy); 
            console.log(inputNazev.value); 

            // posliDoDatabaze(idKnihy)
        })
    }

    function posliDoDatabaze (id) {
            set(ref(db, ("Users/" + idUser + "/knihy/" + id)),{
                nazevKnihy: inputNazev.value,
                autor: inputAutor.value,
                stran: inputStran.value,
                precteno: precteno,
                rating: inputHodnoceni.starRating('getRating'),
                recenze: inputRecenze.value,
                pridano: today,
                // id: id
            });
            update(ref(db, ("Users/" + idUser + "/info")),{
                "idKnizek": id
            })
    }

    //  ------------- Vypis knih - Tabulka ------------- 
    naplnSeznamKnihzDB();  // načtu z DB knihy do array knihy[];

    function naplnSeznamKnihzDB(){
        knihy = [];
        table.innerHTML = '';
        const dbRef = ref(db);
        get(child(dbRef, ("Users/" + idUser + "/knihy")))
        .then((snapshot)=>{
            snapshot.forEach(childSnapshot => {
                knihy.push(childSnapshot.val());
            })
            console.log(knihy)
            buildTable(knihy)
        })
    }

    
    function buildTable(data){
        table.innerHTML = ''
        for (let i = 0; i < data.length; i++){
            
            // z row prozatím vypuštěno <td>${data[i].recenze}</td>
            let row = `<tr>
            <td>${data[i].nazevKnihy}</td>
            <td>${data[i].autor}</td>
            <td>${data[i].stran}</td>
            <td>${data[i].rating}</td>
            <td>${data[i].pridano}</td>
            <td>
                <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseDetail" 
                role="button" aria-expanded="false" aria-controls="collapseDetail">
                info</a>
            </td>
            </tr>`
            table.innerHTML += row
        }
    }
    //  ------------- Filtrování knih v tabulce ------------- 
    
    const inputFilter = document.getElementById("filtr");
    inputFilter.addEventListener("keyup", () => {
        let filtrUdaj = inputFilter.value;
        let data = filtrujTabulku(filtrUdaj, knihy)
        buildTable(data)
    })
    
    function filtrujTabulku(filtrUdaj, knihy) {
        knihyFiltr = [];
        for (let i=0; i < knihy.length; i++){
            filtrUdaj = filtrUdaj.toLowerCase();
            let nazev = knihy[i].nazevKnihy.toLowerCase();
            let autor = knihy[i].autor.toLowerCase();
            
            if ( nazev.includes(filtrUdaj) || autor.includes(filtrUdaj) ){
                knihyFiltr.push(knihy[i])
            }
        }
        return knihyFiltr
    }
    
    //  ------------- Řazení knih v tabulce ------------- 
    
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    let predchoziStav;

    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        let vybrano = document.querySelector(".bg-info"); // přepínání barvy filtrovaného sloupce
        vybrano.classList.toggle("bg-info");
        Array.from(tbody.querySelectorAll('tr'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), window.asc = !window.asc))
        .forEach(tr => tbody.appendChild(tr) );
        if (window.asc === true) {
            th.classList.toggle("bg-info");
        } else {
            th.classList.toggle("bg-info");
        }   
    })));
    
//  ------------- Konec init Fce -------------     
});
}

init();
    