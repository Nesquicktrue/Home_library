
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


    //  ------------- DOM + CONST + GLOBAL ------------- 

    const tlacOdhlasit = document.getElementById("logout")
    tlacOdhlasit.addEventListener("click", () => {
        firebase.auth().signOut().then(function(){
        console.log("Odhlášeno");
        window.location.replace("login.html");
        })
    })

    const form = document.querySelector("form");
    const table = document.getElementById("myTable");
    const detNazev = document.querySelector("#detNazev");
    const detAutor = document.querySelector("#detAutor");
    const detStran = document.querySelector("#detStran");
    const detPridano = document.querySelector("#detPridano");
    const detID = document.querySelector("#detID");
    const detRecenze = document.querySelector("#detRecenze");
    const detRating = document.querySelector("#detRating");
    const tlacUpravKnihu = document.querySelector("#upravKnihu");
    const tlacSmazKnihu = document.querySelector("#smazatKnihu");
    let upravovano; // ukádám stav tlačítka pro úpravu hodnocení knihy
    let opravduSmazat; // počet zmáčknutí tlačítka pro smazání knihy
    let knihy=[]; // plný výčet z DB
    let knihyFiltr = []; // filrovaný
    let precteno = false;
    let idUser = user.uid;
    let today = new Date().toISOString().slice(0, 10);

    const inputHodnoceni = $(".my-rating").starRating({
        totalStars: 5,
        starShape: 'rounded',
        disableAfterRate: false,
        starSize: 30,
        emptyColor: 'lightgray',
        hoverColor: 'dodgerblue',
        activeColor: 'green',
        useGradient: true,
        callback: function(currentRating, $el){
            return currentRating*10
        }
    });
  
    //  ------------- Hodnocení nové knihy - collapse ------------- 
    let inputPrecteno = document.getElementById("collapseOhodnot")
    inputPrecteno.addEventListener('show.bs.collapse', function () {
        precteno = true;
        document.getElementById("tlacPrecteno").textContent = "Zatím nehodnotit";
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary")
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning")
    });
    inputPrecteno.addEventListener('hide.bs.collapse', function () {
        precteno = false;
        $(".my-rating").starRating("setReadOnly");
        document.getElementById("tlacPrecteno").textContent = "Hodnocení";
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning")
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary")
    });

    // ------------- Přidej knihu ------------- 
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        zjistiID();
        setTimeout(() => {naplnSeznamKnihzDB()}, 500);
    });

    function zjistiID () {
        get(ref(db, "Users/" + idUser + "/info/idKnizek"))
        .then( (snapshot) => {
            let idKnihy = snapshot.val();
            ++idKnihy;
            posliDoDatabaze(idKnihy)
        })
    }

    function posliDoDatabaze (id) {
        const inputNazev = document.getElementById("nazev");
        const inputAutor = document.getElementById("autor");
        const inputStran = document.getElementById("stran");
        const inputRecenze = document.getElementById("recenze");
        set(ref(db, ("Users/" + idUser + "/knihy/" + id)),{
            nazevKnihy: inputNazev.value,
            autor: inputAutor.value,
            stran: inputStran.value,
            precteno: precteno,
            rating: inputHodnoceni.starRating('getRating'),
            recenze: inputRecenze.value,
            pridano: today,
            "idKnihy": id
        });
            update(ref(db, ("Users/" + idUser + "/info")),{
                "idKnizek": id
            })
            inputNazev.value = "";          // vyprázdni zadávací pole
            inputAutor.value = "";
            inputStran.value = "";
            inputRecenze.value = "";
            precteno = false;
    }

    //  ------------- Vypis knih - Tabulka ------------- 

    naplnSeznamKnihzDB();

    function naplnSeznamKnihzDB(){
        knihy = [];
        table.innerHTML = '';
        const dbRef = ref(db);
        get(child(dbRef, ("Users/" + idUser + "/knihy")))
        .then((snapshot)=>{
            snapshot.forEach(childSnapshot => {
                knihy.push(childSnapshot.val());
            })
            buildTable(knihy)
        })
    }

    function buildTable(data){
        table.innerHTML = '';
        for (let i = 0; i < data.length; i++){
            // z row prozatím vypuštěno <td>${data[i].recenze}</td> a <td>${data[i].stran}</td>
            let row = `<tr>
            <td>${data[i].nazevKnihy}</td>
            <td>${data[i].autor}</td>
            
            <td>${data[i].rating}</td>
            <td>${data[i].pridano}</td>
            <td>
                <a class="btn btn-sm btn-primary tlacInfo" href="#popup" id="${data[i].idKnihy}">
                <i class="fas fa-pen-to-square"></i></a>
            </td>
            </tr>`
            table.innerHTML += row
        }
        vypisDetail();
    }

    //  ------------- Vypsání detailu knihy ------------- 
    
    function vypisDetail() {
        const tlacInfo = document.querySelectorAll(".tlacInfo");
        for (let i = 0; i < tlacInfo.length; i++) {
            let self = tlacInfo[i];
            self.addEventListener('click', () => {
                upravovano = 2;
                opravduSmazat = 0;
                tlacUpravKnihu.textContent = "Upravit";
                tlacSmazKnihu.textContent = "Smazat";
                get(ref(db, "Users/" + idUser + "/knihy/" + self.id))
                .then( (snapshot) => {
                    detNazev.textContent = snapshot.val().nazevKnihy;
                    detAutor.textContent = snapshot.val().autor;
                    detStran.textContent = snapshot.val().stran;
                    detRecenze.textContent = snapshot.val().recenze;
                    detPridano.textContent = snapshot.val().pridano;
                    detID.textContent = snapshot.val().idKnihy;
                    detRating.textContent = snapshot.val().rating + "★";
                })
            })
        }   
        tlacUpravKnihu.addEventListener("click", upravDetail);
        tlacSmazKnihu.addEventListener("click", smazKnihu);
    }   

    function upravDetail() {
            let idK = detID.textContent;
            upravovano %= 2;
            if (upravovano === 0) {
                tlacUpravKnihu.textContent = "Uložit změny";    
                detRating.innerHTML = '<div class="upRating m-1"></div>';
                $(".upRating").starRating({
                    totalStars: 5,
                    starShape: 'rounded',
                    disableAfterRate: false,
                    starSize: 30,
                    emptyColor: 'lightgray',
                    hoverColor: 'dodgerblue',
                    activeColor: 'green',
                    useGradient: true,
                    callback: function(currentRating, $el){
                        return currentRating*10
                    }
                });
                detRecenze.innerHTML = '<textarea id="upRecenze" class="form-control" rows="10" >' +
                                        detRecenze.textContent + '</textarea>';
                upravovano++;
         } else {
             update(ref(db, ("Users/" + idUser + "/knihy/" + idK)),{
                 precteno: true,
                 rating: $(".upRating").starRating('getRating'),
                 recenze: document.getElementById("upRecenze").value,
             });
             detRecenze.innerHTML = '<i class="fas fa-circle-check"></i><font style="color:#198754">Úspěšně uloženo!</font>';
             tlacUpravKnihu.textContent = "Upravit";
             upravovano++;
             setTimeout(() => {naplnSeznamKnihzDB()}, 500);
         }
    }

    function smazKnihu () {
        opravduSmazat++;
        let idK = detID.textContent;
        switch (opravduSmazat) {
            case 3:
                remove(ref(db, ("Users/" + idUser + "/knihy/" + idK)));
                console.log("kniha smazána");
                detRecenze.innerHTML = '<i class="fas fa-skull-crossbones"></i><font style="color:red">&nbsp;Kniha byla smazána</font>';
                tlacSmazKnihu.textContent = "SMAZÁNO";
                setTimeout(() => {naplnSeznamKnihzDB()}, 500);   
                break;
            case 2:
                detRecenze.innerHTML = '<i class="fas fa-skull-crossbones"></i><font style="color:red">&nbsp;Tato kniha bude nenávratně smazána!<br>Pokud souhlasíte, zmáčkněte smazání ještě jednou.</font>';
                break;
            case 1:
                tlacSmazKnihu.textContent = "Opravdu smazat?";
                break;
            default:
                tlacSmazKnihu.textContent = "SMAZÁNO";
        }
    }

    //  ------------- Filtrování knih v tabulce ------------- 
    
    const inputFilter = document.getElementById("filtr");
    inputFilter.addEventListener("keyup", () => { 
        let filtrUdaj = inputFilter.value;
        let data = filtrujTabulku(filtrUdaj, knihy);
        buildTable(data);
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
    
});
}

init();
    