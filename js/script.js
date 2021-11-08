const knihovna = [];

const nazev = document.getElementById("nazev");
const autor = document.getElementById("autor");
const stran = document.getElementById("stran");
const precteno = document.getElementById("precteno");

const vypis = document.querySelector(".vypis");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    zkontrolujAZadej();
    vyprazdniPole();
});

function zkontrolujAZadej () {
    if (nazev.value != "" && nazev.value != "") {
        pridejKnihu (nazev.value, autor.value, stran.value, precteno.checked)
        
        console.log("Kniha byla úspěšně přidána!")
    } else {
        console.log("Zadej povinné údaje")
    }
};

function vyprazdniPole () {
    nazev.value = "";
    autor.value = "";
    stran.value = "";
    precteno.checked = false;
};

function Kniha(nazev, autor, pocetStranek, precteno) {
    this.nazev = nazev;
    this.autor = autor;
    this.pocetStranek = pocetStranek;
    this.precteno = precteno;
    this.info = function () {
        return `Kniha "${nazev}" od autora ${autor} má ${pocetStranek} stran ${jePrecteno(this)}`;
    }
}

function pridejKnihu (nazev, autor, pocetStranek, precteno) {
    let novaKniha = new Kniha (nazev, autor, pocetStranek, precteno)
    knihovna.push(novaKniha);
};

function jePrecteno (co) {
    if (co.precteno === true) {
        return "a byla již přečtena.";
    } else {
        return "a nebyla dosud přečtena.";
    }
}


// pridejKnihu ("Noční klub", "Jiří Kulhánek", 950, true)


