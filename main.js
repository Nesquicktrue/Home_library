
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
import {getDatabase, get, ref, set, child, update, remove}
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
        set(ref(db, ("Users/" + user.uid + "/info")),{
            jmeno: user.displayName,
            email: user.email,
            UID: user.uid,
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
    const inputPrecteno = document.getElementById("precteno");
    const inputRecenze = document.getElementById("recenze");
    const form = document.querySelector("form");
    const plusTlac = document.getElementById("plusTlac");
    const pridejForm = document.getElementById("pridejForm");
    const table = document.getElementById("myTable");
    const blokOhodnot = document.getElementById("ohodnot");

    let knihy=[];
    let knihyFiltr = [];
    let idUser = user.uid;

    const inputHodnoceni = $(".my-rating").starRating({
        // starSize: 20,
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

    inputPrecteno.addEventListener("change", () => {
        blokOhodnot.classList.toggle("neviditelny")
    });

    blokOhodnot.addEventListener("click", () => {
        switch (inputHodnoceni.starRating('getRating')) {
            case 1:
                inputRecenze.textContent = "Shit!"
        }        

    })


    // class Kniha {
    //     constructor(nazev, autor, pocetStranek, precteno, hodnoceni, recenze) {
    //         this.nazev = nazev;
    //         this.autor = autor;
    //         this.pocetStranek = pocetStranek;
    //         this.precteno = precteno;
    //         this.hodnoceni = hodnoceni;
    //         this.recenze = recenze;
    //         this.info = function () {
    //             return `Kniha "${nazev}" od autora ${autor} má ${pocetStranek} stran ${jePrecteno(this)}`;
    //         };
    //     }
    // }

    plusTlac.addEventListener("click", () => {pridejForm.classList.toggle("neviditelny")});

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        posliDoDatabaze();
        vyprazdniPole();
        naplnSeznamKnihzDB();
    });

    function vyprazdniPole () {
        inputNazev.value = "";
        inputAutor.value = "";
        inputStran.value = "";
        inputRecenze.value = "";
        inputPrecteno.checked = false;
    };

    function posliDoDatabaze () {
        let idKnihy = knihy.length + 1;
        set(ref(db, ("Users/" + idUser + "/knihy/" + idKnihy)),{
            nazevKnihy: inputNazev.value,
            autor: inputAutor.value,
            stran: inputStran.value,
            precteno: inputPrecteno.checked,
            rating: inputHodnoceni.starRating('getRating'),
            recenze: inputRecenze.value
        })
    }

    //  ------------- Vypis knih - Tabulka ------------- 
    naplnSeznamKnihzDB();  // načtu z DB knihy do array knihy[];

    function naplnSeznamKnihzDB(){
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
            
            let row = `<tr>
            <td>${data[i].nazevKnihy}</td>
            <td>${data[i].autor}</td>
            <td>${data[i].stran}</td>
            <td>${data[i].rating}</td>
            <td>${data[i].recenze}</td>
            <td>${data[i].rating}</td>
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
    