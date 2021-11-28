
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
            update(ref(db, ("Users/" + user.uid + "/info")),{
                jmeno: user.displayName,
                email: user.email,
                UID: user.uid,
                lastLogin: new Date().toISOString().slice(0, 10),
            });
            
            uidLbl.textContent = user.displayName;
        } else {
            mainContainer.style.display = "none";
            console.warn("Nepřihlášen!");
            window.location.replace("login.html");
        }
        


    //  ------------- DOM + CONST + GLOBAL ------------- 

    const tlacOdhlasit = document.getElementById("logout")
    tlacOdhlasit.addEventListener("click", () => {
        firebase.auth().signOut().then(function(){
        console.log("Odhlášeno");
        window.location.replace("login.html");
        })
    })

    const tlacPridat = document.getElementById("tlacPridat");
    const inputAutor = document.getElementById("autor");
    const inputNazev = document.getElementById("nazev");
    const inputStran = document.getElementById("stran");
    const form = document.querySelector("form");
    const inputHvezdy = document.getElementById("hvezdy");
    const ratingCislo = document.getElementById("ratingCislo");
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
    const divVysledek = document.querySelector(".vysledek");

    let upravovano; // ukádám stav tlačítka pro úpravu hodnocení knihy
    let opravduSmazat; // počet zmáčknutí tlačítka pro smazání knihy
    let knihy=[]; // plný výčet z DB
    let knihyFiltr = []; // filrovaný
    let precteno = false;
    let idUser = user.uid;
    let idGoogle; // po výběru knihy z Google hledání
    let today = new Date().toISOString().slice(0, 10);

  
    //  ------------- Tlačítka - Collapse ------------- 
    const inputNovaKniha = document.getElementById("collapseForm")
    inputNovaKniha.addEventListener('show.bs.collapse', () => {
        tlacPridat.textContent = '▽ Přidat novou knihu';
        document.getElementById("infoHledani").classList.remove("neviditelny");
    }); 
    inputNovaKniha.addEventListener('hide.bs.collapse', () => {
        tlacPridat.textContent = '▷ Přidat novou knihu';
    }); 

    const inputPrecteno = document.getElementById("collapseOhodnot");
    inputPrecteno.addEventListener('show.bs.collapse', rozbalHodnoceni); 
    inputPrecteno.addEventListener('hide.bs.collapse', srolujHodnoceni); 
    
    function rozbalHodnoceni () {
        precteno = true;
        document.getElementById("tlacPrecteno").textContent = "△ Nechci knihu nyní hodnotit";
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary");
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning");
        document.getElementById("infoHodnoceni").classList.toggle("neviditelny");
    };

    function srolujHodnoceni () {
        precteno = false;
        document.getElementById("tlacPrecteno").textContent = "▷ Mám přečteno a chci hodnotit";
        document.getElementById("tlacPrecteno").classList.toggle("btn-warning");
        document.getElementById("tlacPrecteno").classList.toggle("btn-primary");
        document.getElementById("infoHodnoceni").classList.toggle("neviditelny");
    };

    inputHvezdy.addEventListener("input", ohodnotNovou);

    function ohodnotNovou (){
        ratingCislo.textContent = inputHvezdy.value / 2 + "★";
        if (inputHvezdy.value <= 2) {
            document.getElementById("recenze").textContent = "Ztráta času. Nedoporučuji.";
        } else if (inputHvezdy.value <= 4) {
            document.getElementById("recenze").textContent = "Kniha mne nebavila.";
        } else if (inputHvezdy.value <= 7) {
            document.getElementById("recenze").textContent = "Průměr, kniha mne bavila.";
        } else if (inputHvezdy.value <= 9) {
            document.getElementById("recenze").textContent = "Zážitek! Určitě doporučuji.";
        } else if (inputHvezdy.value > 9) {
            document.getElementById("recenze").textContent = "Super zážitek! Kandidát na knihu roku!";
        }  

    }

    // ------------- Přidej knihu ------------- 
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        zjistiID();
        tlacPridat.click();          // schovat form
        document.getElementById("oznameni").textContent = "✓ Kniha úspěšně uložena";
        setTimeout(() => {document.getElementById("oznameni").textContent = ""}, 5000);
        divVysledek.innerHTML = "";                 // vyčistit seznam vyhledávání
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
        // inputNazev, inputAutor a inputStran je global kvůlu Google API hledání
        const inputRecenze = document.getElementById("recenze");
        set(ref(db, ("Users/" + idUser + "/knihy/" + id)),{
            nazevKnihy: inputNazev.value,
            autor: inputAutor.value,
            stran: inputStran.value,
            precteno: precteno,
            rating: ratingCislo.textContent.slice(0,-1),
            recenze: inputRecenze.value,
            pridano: today,
            "idKnihy": id,
            "idGoogle": idGoogle
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


    //  ------------- Google books API hledání ------------- 

    document.getElementById("nazev").addEventListener("keyup", hledejNaGoogleBooks)
    document.getElementById("autor").addEventListener("keyup", hledejNaGoogleBooks)
    
    function hledejNaGoogleBooks () {
        let hledanyVyraz;
        if (inputNazev.value.length > 3) {
            document.getElementById("infoHledani").classList.add("neviditelny");
            if ( inputAutor.value ) {
                hledanyVyraz = "intitle:" + inputNazev.value.replace(/\s+/g, '+');//.toLowerCase()
                hledanyVyraz += "+inauthor:" + inputAutor.value.replace(/\s+/g, '+');//.toLowerCase();
            } else {
                hledanyVyraz = inputNazev.value.replace(/\s+/g, '+')//.toLowerCase()
            }
            najdiAVypisZGoogle (hledanyVyraz)
            
        } else {
            document.getElementById("infoHledani").classList.remove("neviditelny");
            if ( inputAutor.value.length > 3) {
                hledanyVyraz = "+inauthor:" + inputAutor.value.replace(/\s+/g, '+');
                najdiAVypisZGoogle (hledanyVyraz)
            } 
            divVysledek.innerHTML =  
                                        'Zadejte více jak 3 znaky pro vyhledání v databázy Google Books';
        }
          
    }
    
    function najdiAVypisZGoogle (hledanyVyraz) {
        divVysledek.innerHTML = "<h6>Výsledky hledání na Google Knihy:</h6>";
        let hledObr;
        let hledPodtitul;
        let hledStran;
        let hledJazyk;
        let rok;
        fetch("https://www.googleapis.com/books/v1/volumes?q=" 
            + hledanyVyraz + "&printType=books") //&orderBy=newest
        .then(function(res) {
            return res.json();
        })
        .then(function(response) {
            if (response.items) {
                for (let i = 0; i < response.items.length ; i++) {
                    let item = response.items[i];
                    // in production code, item.text should have the HTML entities escaped.
                    if (item.volumeInfo.authors) {
                        if (item.volumeInfo.imageLinks) {
                            hledObr =   '<img src=' + item.volumeInfo.imageLinks.smallThumbnail +
                                        '" class="img-fluid rounded-start">';
                        } else {
                            hledObr =   '<img src="./img/no_cover_thumb.gif"' + 
                                        'class="img-fluid rounded-start">';
                        }
                        (item.volumeInfo.subtitle) ? 
                            (hledPodtitul= ": " + item.volumeInfo.subtitle) : (hledPodtitul = ""); 
                        (item.volumeInfo.pageCount) ?
                            (hledStran = item.volumeInfo.pageCount) :  (hledStran = "N/A");
                        (item.volumeInfo.language) ? 
                            ( hledJazyk= ", " + item.volumeInfo.language.toUpperCase()) : (hledPodtitul = "");
                        (item.volumeInfo.publishedDate) ? 
                            ( rok = item.volumeInfo.publishedDate.slice(0,4)) : (rok = "");

                        divVysledek.innerHTML +='<div class="hledVysledek card mb-1" style="max-width: 450px;" id='
                                                + item.id + '>' + '<div class="row g-0">' + 
                                                '<div class="col-md-2">' + 
                                                hledObr + '</div>' +
                                                '<div class="col-md-8">' + '<div class="card-body">' +
                                                '<h6 class="card-title">' + item.volumeInfo.title +
                                                hledPodtitul + '</h6>' +
                                                '<p class="card-text"><span>' +
                                                item.volumeInfo.authors[0] +
                                                "</span>, " +
                                                rok +
                                                 ", stran: " +
                                                "<span>" + hledStran + "</span>" +
                                                hledJazyk + '</p>' +
                                                "</div></div></div></div><br>";
                        
                    }
                }   
            } else {
                                        divVysledek.innerHTML = "<h6>Kniha nenalezena na Google Knihy</h6>";
                                    }
        // Umožňuji vybrat z hledaných výsledků
        const hledVysledek = document.querySelectorAll(".hledVysledek");
        vyberZHledanych(hledVysledek); 
        }),
        
        function(error) {
        console.log(error);
        };
        
    }
    
    function vyberZHledanych (hledVysledek) {
        for (let i=0; i < hledVysledek.length; i++) {
            let zaznam = hledVysledek[i];
            zaznam.addEventListener("click", () => {
                scroll(0,0);
                document.getElementById("tlacPrecteno").click();
                let vysStran = zaznam.children[0].children[1].children[0]
                                .children[1].children[1].textContent;

                inputNazev.value = zaznam.children[0].children[1].children[0].children[0].textContent;
                inputAutor.value = zaznam.children[0].children[1].children[0]
                                    .children[1].children[0].textContent;
                if (vysStran > 0) {
                    inputStran.value = vysStran;
                } else {
                    inputStran.value = 0;
                }
                ;
                idGoogle = zaznam.id;
            })
        } 

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
                    document.getElementById("detGID").textContent = snapshot.val().idGoogle;
                    detRating.textContent = snapshot.val().rating + "★";
                    document.getElementById("detIMG").src = "img/no_cover_thumb.gif";
                    if (snapshot.val().idGoogle) {zjistiObrazek(snapshot.val().idGoogle)};
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
                detRating.innerHTML = '<div class="container d-flex my-4 gap-2">' +
                                      '<input type="range" id="detHvezdy" max="10">' +
                                      '<h2 id="detRatingCislo">2,5 ★</h2>' +
                                      '</div>';
                const detInputHvezdy = document.getElementById("detHvezdy");
                const detRatingCislo = document.getElementById("detRatingCislo");
                detInputHvezdy.addEventListener("input", () => {
                    detRatingCislo.textContent = detInputHvezdy.value / 2 + "★";
                });
                detRecenze.innerHTML = '<textarea id="upRecenze" class="form-control" rows="10" >' +
                                        detRecenze.textContent + '</textarea>';
                upravovano++;
         } else {
             update(ref(db, ("Users/" + idUser + "/knihy/" + idK)),{
                 precteno: true,
                 rating: detRatingCislo.textContent.slice(0,-1),
                 recenze: document.getElementById("upRecenze").value,
             });
             detRecenze.innerHTML = '<i class="fas fa-circle-check"></i>' +
                                '<font style="color:#198754">Úspěšně uloženo!</font>';
             detRating.innerHTML = "";
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

    function zjistiObrazek (gid) {
        fetch("https://www.googleapis.com/books/v1/volumes/" + gid)
        .then((res) => {return res.json()})
        .then((response) => {
            if ("imageLinks" in response.volumeInfo) {
                document.getElementById("detIMG").src = response.volumeInfo.imageLinks.thumbnail;
            }
        })
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
        th.textContent = th.textContent.slice(0, -1)
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        let vybrano = document.querySelector(".bg-info"); // přepínání barvy filtrovaného sloupce
        vybrano.classList.toggle("bg-info");
        Array.from(tbody.querySelectorAll('tr'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), window.asc = !window.asc))
        .forEach(tr => tbody.appendChild(tr) );
        if (window.asc === true) {
            th.classList.toggle("bg-info");
            th.textContent += "△";
        } else {
            th.classList.toggle("bg-info");
            th.textContent += "▽";
        }   
    })));
    
});
}

init();
    