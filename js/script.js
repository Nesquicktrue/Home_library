//  ------------- inicializace Databaze ------------- 

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
    const firebaseConfig = {
        apiKey: "AIzaSyB5TZnqd4Lwel74yhtYNaHfOjsfgWIJF_4",
        authDomain: "home-library-js.firebaseapp.com",
        databaseURL: "https://home-library-js-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "home-library-js",
        storageBucket: "home-library-js.appspot.com",
        messagingSenderId: "109962970996",
        appId: "1:109962970996:web:2317b678700fc00da40e21"
    };

    const app = initializeApp(firebaseConfig);
        
import {getDatabase, get, ref, set, child, update, remove}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
    
const db = getDatabase();

//  ------------- DOM const + EL + Class------------- 
const inputNazev = document.getElementById("nazev");
const inputAutor = document.getElementById("autor");
const inputStran = document.getElementById("stran");
const inputPrecteno = document.getElementById("precteno");
const inputRecenze = document.getElementById("recenze");
const form = document.querySelector("form");
const plusTlac = document.getElementById("plusTlac");
const pridejForm = document.getElementById("pridejForm");
let knihovna = [];

const inputHodnoceni = $(".my-rating").starRating({
    starSize: 25,
    totalStars: 5,
    starShape: 'rounded',
    starSize: 40,
    emptyColor: 'lightgray',
    hoverColor: 'salmon',
    activeColor: 'crimson',
    useGradient: false,
    callback: function(currentRating, $el){
        return currentRating*10
    }
});

class Kniha {
    constructor(nazev, autor, pocetStranek, precteno, hodnoceni, recenze) {
        this.nazev = nazev;
        this.autor = autor;
        this.pocetStranek = pocetStranek;
        this.precteno = precteno;
        this.hodnoceni = hodnoceni;
        this.recenze = recenze;
        this.info = function () {
            return `Kniha "${nazev}" od autora ${autor} má ${pocetStranek} stran ${jePrecteno(this)}`;
        };
    }
}

plusTlac.addEventListener("click", () => {pridejForm.classList.toggle("neviditelny")});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    zkontrolujAZadej();
    posliDoDatabaze();
    vyprazdniPole();
});

function zkontrolujAZadej () {
    if (inputNazev.value != "") {
        pridejKnihu (inputNazev.value, inputAutor.value, inputStran.value, inputPrecteno.checked,
            inputHodnoceni.starRating('getRating'), inputRecenze.value)
        
        console.log("Kniha byla úspěšně přidána!");
        dejVsechnyJednou()
    } else {
        console.log("Zadej povinné údaje")
    }
};

function vyprazdniPole () {
    inputNazev.value = "";
    inputAutor.value = "";
    inputStran.value = "";
    inputRecenze.value = "";
    inputPrecteno.checked = false;
};

function pridejKnihu (nazev, autor, pocetStranek, precteno, hodnoceni, recenze) {
    let novaKniha = new Kniha (nazev, autor, pocetStranek, precteno, hodnoceni, recenze)
    knihovna.push(novaKniha);
};

function jePrecteno (co) {
    if (co.precteno === true) {
        return "a byla již přečtena.";
    } else {
        return "a nebyla dosud přečtena.";
    }
}

function posliDoDatabaze () {
    set(ref(db, "Users/" + "Admin/" + 3),{
        nazevKnihy: inputNazev.value,
        autor: inputAutor.value,
        stran: inputStran.value,
        precteno: inputPrecteno.checked,
        rating: inputHodnoceni.starRating('getRating'),
        recenze: inputRecenze.value
    })
}

//  ------------- Vypis knih - Tabulka ------------- 
let knihy=[];
naplnSeznamKnihzDB();  // načtu z DB knihy do array knihy[];
buildTable(knihy);

function naplnSeznamKnihzDB(){
    const dbRef = ref(db);

    get(child(dbRef,"Users/Admin"))
    .then((snapshot)=>{
        snapshot.forEach(childSnapshot => {
            knihy.push(childSnapshot.val());
        })
        console.log(knihy)
    })
}

$('th').on('click', function(){
    let column = $(this).data('colname')
    let order = $(this).data('order')
    let text = $(this).html()
    text = text.substring(0, text.length - 1);
    if (order == 'desc'){
       knihy = knihy.sort((a, b) => a[column] > b[column] ? 1 : -1)
       $(this).data("order","asc");
       text += '&#9660'
    }else{
       knihy = knihy.sort((a, b) => a[column] < b[column] ? 1 : -1)
       $(this).data("order","desc");
       text += '&#9650'
    }

   $(this).html(text)
   buildTable(knihy)
})
   
function buildTable(data){
   let table = document.getElementById('myTable')
   table.innerHTML = ''
   for (let i = 0; i < data.length; i++){
    //    let nazev = `nazev-${i}`
    //    let autor = `autor-${i}`
    //    let stran = `stran-${i}`

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
