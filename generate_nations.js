const fs = require('fs');

const rawNames = [
  "Afganistan", "Afrika Selatan", "Albania", "Aljazair", "Amerika Serikat", "Andorra", "Angola", "Anguilla", "Antigua dan Barbuda", "Arab Saudi",
  "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahama", "Bahrain", "Bangladesh", "Barbados",
  "Belanda", "Belarus", "Belgia", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia dan Herzegovina", "Botswana",
  "Brasil", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Chad", "Chili", "China (Tiongkok)", "Curacao", "Denmark",
  "Djibouti", "Dominika", "Ekuador", "El Salvador", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Filipina",
  "Finlandia", "Gabon", "Gambia", "Georgia", "Ghana", "Gibraltar", "Grenada", "Guam", "Guatemala", "Guinea",
  "Guinea Khatulistiwa", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungaria", "India", "Indonesia", "Inggris",
  "Irak", "Iran", "Irlandia", "Irlandia Utara", "Islandia", "Israel", "Italia", "Jamaika", "Jepang", "Jerman",
  "Kaledonia Baru", "Kamboja", "Kamerun", "Kanada", "Kazakhstan", "Kenya", "Kepulauan Cayman", "Kepulauan Cook", "Kepulauan Faroe", "Kepulauan Solomon",
  "Kepulauan Turks dan Caicos", "Kepulauan Virgin Amerika Serikat", "Kepulauan Virgin Britania Raya", "Kirgistan", "Kolombia", "Komoro", "Kongo", "Korea Selatan", "Korea Utara", "Kosovo",
  "Kosta Rika", "Kroasia", "Kuba", "Kuwait", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lituania", "Luksemburg", "Madagaskar", "Makau", "Makedonia Utara", "Maladewa", "Malawi", "Malaysia", "Mali",
  "Malta", "Maroko", "Mauritania", "Mauritius", "Meksiko", "Mesir", "Moldova", "Mongolia", "Montenegro", "Montserrat",
  "Mozambik", "Myanmar", "Namibia", "Nepal", "Niger", "Nigeria", "Nikaragua", "Norwegia", "Oman", "Pakistan",
  "Palestina", "Panama", "Pantai Gading", "Papua Nugini", "Paraguay", "Peru", "Polandia", "Portugal", "Prancis", "Puerto Riko",
  "Qatar", "Republik Afrika Tengah", "Republik Ceko", "Republik Demokratik Kongo", "Republik Dominika", "Rumania", "Rusia", "Rwanda", "Samoa", "Samoa Amerika",
  "San Marino", "Sao Tome dan Principe", "Selandia Baru", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapura", "Siprus", "Skotlandia",
  "Slovakia", "Slovenia", "Somalia", "Spanyol", "Sri Lanka", "St. Kitts dan Nevis", "St. Lucia", "St. Vincent dan Grenadines", "Sudan", "Sudan Selatan",
  "Suriah", "Suriname", "Swedia", "Swiss", "Tahiti", "Taiwan", "Tajikistan", "Tanjung Verde", "Tanzania", "Thailand",
  "Timor Leste", "Togo", "Tonga", "Trinidad dan Tobago", "Tunisia", "Turki", "Turkmenistan", "Uganda", "Ukraina", "Uni Emirat Arab",
  "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Wales", "Yaman", "Yordania", "Yunani", "Zambia",
  "Zimbabwe"
];

const nameToCode = {
  "Afganistan": "AF", "Afrika Selatan": "ZA", "Albania": "AL", "Aljazair": "DZ", "Amerika Serikat": "US", "Andorra": "AD", "Angola": "AO", "Anguilla": "AI", "Antigua dan Barbuda": "AG", "Arab Saudi": "SA",
  "Argentina": "AR", "Armenia": "AM", "Aruba": "AW", "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahama": "BS", "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB",
  "Belanda": "NL", "Belarus": "BY", "Belgia": "BE", "Belize": "BZ", "Benin": "BJ", "Bermuda": "BM", "Bhutan": "BT", "Bolivia": "BO", "Bosnia dan Herzegovina": "BA", "Botswana": "BW",
  "Brasil": "BR", "Brunei Darussalam": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI", "Chad": "TD", "Chili": "CL", "China (Tiongkok)": "CN", "Curacao": "CW", "Denmark": "DK",
  "Djibouti": "DJ", "Dominika": "DM", "Ekuador": "EC", "El Salvador": "SV", "Eritrea": "ER", "Estonia": "EE", "Eswatini": "SZ", "Ethiopia": "ET", "Fiji": "FJ", "Filipina": "PH",
  "Finlandia": "FI", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Ghana": "GH", "Gibraltar": "GI", "Grenada": "GD", "Guam": "GU", "Guatemala": "GT", "Guinea": "GN",
  "Guinea Khatulistiwa": "GQ", "Guinea-Bissau": "GW", "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hong Kong": "HK", "Hungaria": "HU", "India": "IN", "Indonesia": "ID", "Inggris": "GB-ENG",
  "Irak": "IQ", "Iran": "IR", "Irlandia": "IE", "Irlandia Utara": "GB-NIR", "Islandia": "IS", "Israel": "IL", "Italia": "IT", "Jamaika": "JM", "Jepang": "JP", "Jerman": "DE",
  "Kaledonia Baru": "NC", "Kamboja": "KH", "Kamerun": "CM", "Kanada": "CA", "Kazakhstan": "KZ", "Kenya": "KE", "Kepulauan Cayman": "KY", "Kepulauan Cook": "CK", "Kepulauan Faroe": "FO", "Kepulauan Solomon": "SB",
  "Kepulauan Turks dan Caicos": "TC", "Kepulauan Virgin Amerika Serikat": "VI", "Kepulauan Virgin Britania Raya": "VG", "Kirgistan": "KG", "Kolombia": "CO", "Komoro": "KM", "Kongo": "CG", "Korea Selatan": "KR", "Korea Utara": "KP", "Kosovo": "XK",
  "Kosta Rika": "CR", "Kroasia": "HR", "Kuba": "CU", "Kuwait": "KW", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY",
  "Liechtenstein": "LI", "Lituania": "LT", "Luksemburg": "LU", "Madagaskar": "MG", "Makau": "MO", "Makedonia Utara": "MK", "Maladewa": "MV", "Malawi": "MW", "Malaysia": "MY", "Mali": "ML",
  "Malta": "MT", "Maroko": "MA", "Mauritania": "MR", "Mauritius": "MU", "Meksiko": "MX", "Mesir": "EG", "Moldova": "MD", "Mongolia": "MN", "Montenegro": "ME", "Montserrat": "MS",
  "Mozambik": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nepal": "NP", "Niger": "NE", "Nigeria": "NG", "Nikaragua": "NI", "Norwegia": "NO", "Oman": "OM", "Pakistan": "PK",
  "Palestina": "PS", "Panama": "PA", "Pantai Gading": "CI", "Papua Nugini": "PG", "Paraguay": "PY", "Peru": "PE", "Polandia": "PL", "Portugal": "PT", "Prancis": "FR", "Puerto Riko": "PR",
  "Qatar": "QA", "Republik Afrika Tengah": "CF", "Republik Ceko": "CZ", "Republik Demokratik Kongo": "CD", "Republik Dominika": "DO", "Rumania": "RO", "Rusia": "RU", "Rwanda": "RW", "Samoa": "WS", "Samoa Amerika": "AS",
  "San Marino": "SM", "Sao Tome dan Principe": "ST", "Selandia Baru": "NZ", "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapura": "SG", "Siprus": "CY", "Skotlandia": "GB-SCT",
  "Slovakia": "SK", "Slovenia": "SI", "Somalia": "SO", "Spanyol": "ES", "Sri Lanka": "LK", "St. Kitts dan Nevis": "KN", "St. Lucia": "LC", "St. Vincent dan Grenadines": "VC", "Sudan": "SD", "Sudan Selatan": "SS",
  "Suriah": "SY", "Suriname": "SR", "Swedia": "SE", "Swiss": "CH", "Tahiti": "PF", "Taiwan": "TW", "Tajikistan": "TJ", "Tanjung Verde": "CV", "Tanzania": "TZ", "Thailand": "TH",
  "Timor Leste": "TL", "Togo": "TG", "Tonga": "TO", "Trinidad dan Tobago": "TT", "Tunisia": "TN", "Turki": "TR", "Turkmenistan": "TM", "Uganda": "UG", "Ukraina": "UA", "Uni Emirat Arab": "AE",
  "Uruguay": "UY", "Uzbekistan": "UZ", "Vanuatu": "VU", "Venezuela": "VE", "Vietnam": "VN", "Wales": "GB-WLS", "Yaman": "YE", "Yordania": "JO", "Yunani": "GR", "Zambia": "ZM",
  "Zimbabwe": "ZW"
};

function getFlagEmoji(countryCode) {
  if (countryCode === 'GB-ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (countryCode === 'GB-SCT') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (countryCode === 'GB-WLS') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  if (countryCode === 'GB-NIR') return '🇬🇧'; // Or proper emoji if supported
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const outData = rawNames.map(name => {
  const code = nameToCode[name];
  if (!code) {
    console.error("Missing code for", name);
  }
  return {
    id: name,
    name: name,
    flag: code ? getFlagEmoji(code) : '🏳️'
  };
});

const content = `// Auto-generated 211 Nations
export interface Nation {
  id: string;
  name: string;
  flag: string;
}

export const NATIONS_211: Nation[] = ${JSON.stringify(outData, null, 2)};
`;

fs.writeFileSync('src/lib/data/nations.ts', content);
console.log('Successfully generated src/lib/data/nations.ts with', outData.length, 'nations');
