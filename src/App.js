import React from 'react'
import Modell from './model/Shopping'
import GruppenTag from './components/GruppenTag'
import GruppenDialog from './components/GruppenDialog'
import SortierDialog from "./components/SortierDialog";

/**
 * @version 0.1 - 20220608
 * @author Philipp Edrich <philipp@edrich.codes>
 * @description Diese App ist eine einfache Repertoire-Verwaltung mit React.js und separatem Model, welche Offline verwendet werden kann
 * @license Gnu Public Lesser License 3.0
 *
 */
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      aktiveGruppe: null,
      showGruppenDialog: false,
      showSortierDialog: false,
      einkaufenAufgeklappt: true,
      erledigtAufgeklappt: false
    }
  }
  /**
   * Nachdem diese Komponente vollständig erstellt ist,
   * lädt sie den gespeicherten Zustand aus dem LocalStorage
   * und stellt den Anzeigezustand wieder her
   */
  componentDidMount() {
    Modell.laden()
    // Auf-/Zu-Klapp-Zustand aus dem LocalStorage laden
    let einkaufenAufgeklappt = localStorage.getItem("einkaufenAufgeklappt")
    einkaufenAufgeklappt = (einkaufenAufgeklappt == null) ? true : JSON.parse(einkaufenAufgeklappt)

    let erledigtAufgeklappt = localStorage.getItem("erledigtAufgeklappt")
    erledigtAufgeklappt = (erledigtAufgeklappt == null) ? false : JSON.parse(erledigtAufgeklappt)

    this.setState({
      aktiveGruppe: Modell.aktiveGruppe,
      einkaufenAufgeklappt: einkaufenAufgeklappt,
      erledigtAufgeklappt: erledigtAufgeklappt
    })
  }
  /**
   * Setzt den Anzeigestatus der Set-Liste.
   * Dreht dazu {@link this.state.imSetAufgeklappt} um,
   * speichert diesen Zustand im LocalStorage und
   * aktualisiert den State in (@link this.state)
   */
  einkaufenAufZuKlappen() {
    const neuerZustand = !this.state.einkaufenAufgeklappt
    localStorage.setItem("einkaufenAufgeklappt", neuerZustand.toString())
    this.setState({einkaufenAufgeklappt: neuerZustand})
  }
  /**
   * Setzt den Anzeigestatus der Mappe-Liste.
   * Dreht dazu {@link this.state.geprobtAufgeklappt} um,
   * speichert diesen Zustand im LocalStorage und
   * aktualisiert den State in (@link this.state)
   */
  erledigtAufZuKlappen() {
    this.setState({erledigtAufgeklappt: !this.state.erledigtAufgeklappt})
  }
  /**
   * Ermöglicht es, den localStorage vollständig zu löschen.
   * Fordert eine doppelte Bestätigung mittels PopUps ein.
   */
  lsLoeschen() {
    if (window.confirm("Wollen Sie wirklich alles löschen?!")) {
      if (window.confirm("Dies kann nicht rückgängig gemacht werden! \n Wirklich sicher?")) {
        localStorage.clear()
      }
    }
  }

  /**
   * Schiebt ein Lied vom Programm in Mappe oder umgekehrt.
   * Dreht dazu den Zustand von {@link Artikel.gekauft} um.
   * @param {Artikel} artikel - das aktuelle Lied, das gerade abgehakt oder reaktiviert wird
   */
  artikelChecken = (artikel) => {
    artikel.gekauft = !artikel.gekauft
    const aktion = (artikel.gekauft) ? "erledigt" : "reaktiviert"
    Modell.informieren("[App] Artikel \"" + artikel.name + "\" wurde " + aktion)
    this.setState(this.state)
  }
  /**
   * Fügt ein neues Lied dem aktiven Genre in der Set-Liste hinzu.
   * Verwendet dazu {@link Modell.aktiveGruppe.artikelHinzufuegen}.
   * Den Namen des neuen Lieds holt sich die Methode aus dem Eingabefeld im Header.
   * Anschließend leert die Methode dieses Feld und setzt den Focus darauf,
   * sodass direkt ein weiteres Lied hinzugefügt werden kann
   */
  artikelHinzufuegen() {
    // ToDo: implementiere diese Methode
    const eingabe = document.getElementById("artikelEingabe")
    const artikelName = eingabe.value.trim()
    if (artikelName.length > 0) {
      Modell.aktiveGruppe.artikelHinzufuegen(artikelName)
      this.setState(this.state)
    }
    eingabe.value = ""
    eingabe.focus()
  }
  /**
   * Setzt die übergebene Gruppe als aktive (zu bearbeitende) Gruppe.
   * Speichert dies mittels {@link Modell.informieren} und
   * aktualisiert den State in {@link this.state}
   * @param {Gruppe} gruppe
   */
  setAktiveGruppe(gruppe) {
    Modell.aktiveGruppe = gruppe
    Modell.informieren("[App] Gruppe \"" + gruppe.name + "\" ist nun aktiv")
    this.setState({aktiveGruppe: Modell.aktiveGruppe})
  }
  /**
   * Sortiert die Listen in der übergebenen Reihenfolge,
   * wenn der Vorgang nicht abgebrochen wurde.
   * Wird vom closeHandler des SortierDialog aufgerufen.
   * Wenn der Dialog mittels "Abbrechen" geschlossen wurde,
   * ist der Parameter sortieren false und die Methode sortiert nicht
   * @param {String} reihenfolge - Die gewünschte Sortierung
   * @param {boolean} sortieren - Steuert, ob sortiert wird oder nicht.
   */
  closeSortierDialog = (reihenfolge, sortieren) => {
    if (sortieren) {
      Modell.sortieren(reihenfolge)
    }
    this.setState({showSortierDialog: false})
  }

  render() {
    let nochZuKaufen = []
    if (this.state.einkaufenAufgeklappt) {
      for (const gruppe of Modell.gruppenListe) {
        nochZuKaufen.push(
          <GruppenTag
            key={gruppe.id}
            aktiv={gruppe === this.state.aktiveGruppe}
            aktiveGruppeHandler={() => this.setAktiveGruppe(gruppe)}
            checkHandler={this.artikelChecken}
            gekauft={false}
            gruppe={gruppe}
          />)
      }
    }

    let schonGekauft = []
    if (this.state.erledigtAufgeklappt) {
      for (const gruppe of Modell.gruppenListe) {
        schonGekauft.push(
          <GruppenTag
            key={gruppe.id}
            aktiveGruppeHandler={() => this.setAktiveGruppe(gruppe)}
            checkHandler={this.artikelChecken}
            gekauft={true}
            gruppe={gruppe}
          />)
      }
    }

    let gruppenDialog = ""
    if (this.state.showGruppenDialog) {
      gruppenDialog = <GruppenDialog
        gruppenListe={Modell.gruppenListe}
        onDialogClose={() => this.setState({showGruppenDialog: false})}/>
    }

    let sortierDialog = ""
    if (this.state.showSortierDialog) {
      sortierDialog = <SortierDialog onDialogClose={this.closeSortierDialog}/>
    }

    return (
      <div id="container">
        <header>
          <h1>Repertoire</h1>
          <label
            className="mdc-text-field mdc-text-field--filled mdc-text-field--with-trailing-icon mdc-text-field--no-label">
            <span className="mdc-text-field__ripple"></span>
            <input className="mdc-text-field__input" type="search"
                   id="artikelEingabe" placeholder="Lied hinzufügen"
                   onKeyUp={e => (e.key === 'Enter') ? this.artikelHinzufuegen() : ''}/>
            <span className="mdc-line-ripple"></span>
            <i className="material-icons mdc-text-field__icon mdc-text-field__icon--trailing"
               tabIndex="0" role="button"
               onClick={() => this.artikelHinzufuegen()}>add_circle</i>
          </label>

        </header>
        <hr/>

        <main>
          <section>
            <h2 onClick={() => this.einkaufenAufZuKlappen()}>Programm
              <i className="material-icons">
                {this.state.einkaufenAufgeklappt ? 'expand_more' : 'expand_less'}
              </i>
            </h2>
            <dl>
              {nochZuKaufen}
            </dl>
          </section>
          <hr/>
          <section>
            <h2 onClick={() => this.erledigtAufZuKlappen()}>Mappe
              <i className="material-icons">
                {this.state.erledigtAufgeklappt ? 'expand_more' : 'expand_less'}
              </i>
            </h2>
            <dl>
              {schonGekauft}
            </dl>
          </section>
        </main>
        <hr/>

        <footer>
          <button className="mdc-button mdc-button--raised genreButton"
                  onClick={() => this.setState({showGruppenDialog: true})}>
            <span className="material-icons">bookmark_add</span>
            <span className="mdc-button__ripple"></span> Genre
          </button>
          <button className="mdc-button mdc-button--raised sortButton"
                  onClick={() => this.setState({showSortierDialog: true})}>
            <span className="material-icons">sort</span>
            <span className="mdc-button__ripple"></span> Sort
          </button>
          <button className="mdc-button mdc-button--raised clearButton"
                  onClick={this.lsLoeschen}>
            <span className="material-icons">clear_all</span>
            <span className="mdc-button__ripple"></span> Clear
          </button>
        </footer>

        {gruppenDialog}
        {sortierDialog}
      </div>
    )
  }
}

export default App
