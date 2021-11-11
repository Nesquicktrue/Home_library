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
let knihyFiltr = [];

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

function jePrecteno (co) {
    if (co.precteno === true) {
        return "a byla již přečtena.";
    } else {
        return "a nebyla dosud přečtena.";
    }
}

function posliDoDatabaze () {
    set(ref(db, "Users/" + "Admin/" + 5),{
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
let idKnihy;
const table = document.getElementById('myTable')
naplnSeznamKnihzDB();  // načtu z DB knihy do array knihy[];

function naplnSeznamKnihzDB(){
    table.innerHTML = ''
    const dbRef = ref(db);

    get(child(dbRef,"Users/Admin"))
    .then((snapshot)=>{
        snapshot.forEach(childSnapshot => {
            knihy.push(childSnapshot.val());
        })
        console.log(knihy)
        buildTable(knihy)
    })
}

function buildTable(data){
    // let table = document.getElementById('myTable')
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

document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    Array.from(tbody.querySelectorAll('tr'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), window.asc = !window.asc))
        .forEach(tr => tbody.appendChild(tr) );
})));


