import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";

function App() {
  // State ist die Art, wie man Variablen in React schreibt:
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  //  Erster aufruf der Daten beim Laden der Seite:
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // UseEffect führt den Code basierend auf einer Bedingung aus
  useEffect(() => {
    // async -> Sendet eine Anfrage an den Server und wartet dass  etwas mit der Eingabe passiert.
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        // Eine Reaktion aufbauen und das json-Objekt übernehmen.
        .then((response) => response.json())
        .then((data) => {
          // Umstrukturierung des Objekts - (Map ist wie eine Schleife für Object, um alle Daten zu erhalten).
          const countries = data.map((country) => ({
            name: country.country,              // United States, United Kingdom, France
            value: country.countryInfo.iso2,   // Returns: UK, USA, FR
          }));

          // Sort Funktion aus util.jsx Aufrufen:
          let sortedData = sortData(data);
          // useState values Aufrufen:
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };
    // async request Aufrufen:
    getCountriesData();
    // Mit dem zweiten Argument stellen wir sicher, dass der Code nur einmal ausgeführt wird:
  }, []);
  console.log(casesType);
  // Länder im Dropdown-Menü anzeigen:
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    // Länder Daten:      https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
    // Weltweite Daten:    https://disease.sh/v3/covid-19/all
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Update Daten:
        setInputCountry(countryCode);
        // Daten Speichern:
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker / W.Ahmad</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Weltweit</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live-Fälle nach Länder</h3>
            <Table countries={tableData} />
            <h3>Weltweit neue Fälle:</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;