export interface Venue {
  name: string
  city: string
  country: string
  capacity: number
  founded: number      // byggeår / åpningsår
  tenant: string       // fast bruker (klubb/lag)
  utcOffset: number    // UTC-offset under VM (sommer 2026); Mexico uten sommertid
  tzLabel: string      // f.eks. "PDT", "EDT", "CST"
  wikipedia?: string
}

// VM 2026 spilles på 16 stadioner (11 i USA, 3 i Mexico, 2 i Canada).
// Tider i schedule.ts er CEST (UTC+2). Lokal tid = kampklokkeslett − 2 + utcOffset.
// USA/Canada observerer sommertid i juni–juli 2026. Mexico avskaffet sommertid i 2023.
export const VENUES: Venue[] = [
  { name: 'SoFi Stadium',            city: 'Los Angeles',     country: 'USA',    capacity: 100240, founded: 2020, utcOffset: -7, tzLabel: 'PDT', tenant: 'LA Rams & LA Chargers (NFL)',                wikipedia: 'https://en.wikipedia.org/wiki/SoFi_Stadium' },
  { name: 'MetLife Stadium',         city: 'East Rutherford', country: 'USA',    capacity: 82500,  founded: 2010, utcOffset: -4, tzLabel: 'EDT', tenant: 'New York Giants & Jets (NFL)',               wikipedia: 'https://en.wikipedia.org/wiki/MetLife_Stadium' },
  { name: "AT&T Stadium",            city: 'Arlington',       country: 'USA',    capacity: 80000,  founded: 2009, utcOffset: -5, tzLabel: 'CDT', tenant: 'Dallas Cowboys (NFL)',                       wikipedia: 'https://en.wikipedia.org/wiki/AT%26T_Stadium' },
  { name: 'Estadio Azteca',          city: 'Mexico City',     country: 'Mexico', capacity: 87523,  founded: 1966, utcOffset: -6, tzLabel: 'CST', tenant: 'Club América / Mexicos landslag',            wikipedia: 'https://en.wikipedia.org/wiki/Estadio_Azteca' },
  { name: 'Estadio BBVA',            city: 'Monterrey',       country: 'Mexico', capacity: 53500,  founded: 2015, utcOffset: -6, tzLabel: 'CST', tenant: 'CF Monterrey (Rayados)',                     wikipedia: 'https://en.wikipedia.org/wiki/Estadio_BBVA' },
  { name: 'BMO Field',               city: 'Toronto',         country: 'Canada', capacity: 30000,  founded: 2007, utcOffset: -4, tzLabel: 'EDT', tenant: 'Toronto FC (MLS), Argonauts (CFL)',          wikipedia: 'https://en.wikipedia.org/wiki/BMO_Field' },
  { name: 'BC Place',                city: 'Vancouver',       country: 'Canada', capacity: 54500,  founded: 1983, utcOffset: -7, tzLabel: 'PDT', tenant: 'BC Lions (CFL), Vancouver Whitecaps (MLS)',  wikipedia: 'https://en.wikipedia.org/wiki/BC_Place' },
  { name: 'Lumen Field',             city: 'Seattle',         country: 'USA',    capacity: 72000,  founded: 2002, utcOffset: -7, tzLabel: 'PDT', tenant: 'Seattle Seahawks (NFL), Sounders (MLS)',     wikipedia: 'https://en.wikipedia.org/wiki/Lumen_Field' },
  { name: 'Arrowhead Stadium',       city: 'Kansas City',     country: 'USA',    capacity: 76416,  founded: 1972, utcOffset: -5, tzLabel: 'CDT', tenant: 'Kansas City Chiefs (NFL)',                   wikipedia: 'https://en.wikipedia.org/wiki/Arrowhead_Stadium' },
  { name: 'Hard Rock Stadium',       city: 'Miami',           country: 'USA',    capacity: 65326,  founded: 1987, utcOffset: -4, tzLabel: 'EDT', tenant: 'Miami Dolphins (NFL)',                       wikipedia: 'https://en.wikipedia.org/wiki/Hard_Rock_Stadium' },
  { name: 'Mercedes-Benz Stadium',   city: 'Atlanta',         country: 'USA',    capacity: 71000,  founded: 2017, utcOffset: -4, tzLabel: 'EDT', tenant: 'Atlanta Falcons (NFL), Atlanta United (MLS)', wikipedia: 'https://en.wikipedia.org/wiki/Mercedes-Benz_Stadium' },
  { name: 'NRG Stadium',             city: 'Houston',         country: 'USA',    capacity: 72220,  founded: 2002, utcOffset: -5, tzLabel: 'CDT', tenant: 'Houston Texans (NFL)',                       wikipedia: 'https://en.wikipedia.org/wiki/NRG_Stadium' },
  { name: 'Lincoln Financial Field', city: 'Philadelphia',    country: 'USA',    capacity: 67594,  founded: 2003, utcOffset: -4, tzLabel: 'EDT', tenant: 'Philadelphia Eagles (NFL)',                  wikipedia: 'https://en.wikipedia.org/wiki/Lincoln_Financial_Field' },
  { name: "Levi's Stadium",          city: 'San Jose',        country: 'USA',    capacity: 68500,  founded: 2014, utcOffset: -7, tzLabel: 'PDT', tenant: 'San Francisco 49ers (NFL)',                  wikipedia: 'https://en.wikipedia.org/wiki/Levi%27s_Stadium' },
  { name: 'Gillette Stadium',        city: 'Boston',          country: 'USA',    capacity: 64628,  founded: 2002, utcOffset: -4, tzLabel: 'EDT', tenant: 'New England Patriots (NFL) & Revolution (MLS)', wikipedia: 'https://en.wikipedia.org/wiki/Gillette_Stadium' },
  { name: 'Estadio Akron',           city: 'Guadalajara',     country: 'Mexico', capacity: 49813,  founded: 2010, utcOffset: -6, tzLabel: 'CST', tenant: 'CD Guadalajara (Chivas)',                    wikipedia: 'https://en.wikipedia.org/wiki/Estadio_Akron' },
]
