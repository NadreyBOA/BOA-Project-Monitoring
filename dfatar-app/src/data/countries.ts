export interface CountryInfo {
  name: string;
  cc: string;
  currency: string;
}

const RAW: [string, string, string][] = [
  ['Maroc', 'MA', 'MAD'], ['Algérie', 'DZ', 'DZD'], ['Tunisie', 'TN', 'TND'], ['Libye', 'LY', 'LYD'], ['Égypte', 'EG', 'EGP'],
  ['Mauritanie', 'MR', 'MRU'], ['Mali', 'ML', 'XOF'], ['Niger', 'NE', 'XOF'], ['Tchad', 'TD', 'XAF'], ['Soudan', 'SD', 'SDG'],
  ['Érythrée', 'ER', 'ERN'], ['Djibouti', 'DJ', 'DJF'], ['Somalie', 'SO', 'SOS'], ['Éthiopie', 'ET', 'ETB'], ['Kenya', 'KE', 'KES'],
  ['Ouganda', 'UG', 'UGX'], ['Tanzanie', 'TZ', 'TZS'], ['Rwanda', 'RW', 'RWF'], ['Burundi', 'BI', 'BIF'], ['RD Congo', 'CD', 'CDF'],
  ['Congo', 'CG', 'XAF'], ['Gabon', 'GA', 'XAF'], ['Guinée équatoriale', 'GQ', 'XAF'], ['Cameroun', 'CM', 'XAF'], ['Centrafrique', 'CF', 'XAF'],
  ['Sénégal', 'SN', 'XOF'], ['Gambie', 'GM', 'GMD'], ['Guinée-Bissau', 'GW', 'XOF'], ['Guinée', 'GN', 'GNF'], ['Sierra Leone', 'SL', 'SLE'],
  ['Liberia', 'LR', 'LRD'], ["Côte d'Ivoire", 'CI', 'XOF'], ['Ghana', 'GH', 'GHS'], ['Togo', 'TG', 'XOF'], ['Bénin', 'BJ', 'XOF'],
  ['Nigeria', 'NG', 'NGN'], ['Burkina Faso', 'BF', 'XOF'], ['Cap-Vert', 'CV', 'CVE'], ['Angola', 'AO', 'AOA'], ['Zambie', 'ZM', 'ZMW'],
  ['Malawi', 'MW', 'MWK'], ['Mozambique', 'MZ', 'MZN'], ['Zimbabwe', 'ZW', 'USD'], ['Botswana', 'BW', 'BWP'], ['Namibie', 'NA', 'NAD'],
  ['Afrique du Sud', 'ZA', 'ZAR'], ['Lesotho', 'LS', 'LSL'], ['Eswatini', 'SZ', 'SZL'], ['Madagascar', 'MG', 'MGA'], ['Maurice', 'MU', 'MUR'],
  ['Seychelles', 'SC', 'SCR'], ['Comores', 'KM', 'KMF'], ['Soudan du Sud', 'SS', 'SSP'],
  ['France', 'FR', 'EUR'], ['Belgique', 'BE', 'EUR'], ['Suisse', 'CH', 'CHF'], ['Luxembourg', 'LU', 'EUR'], ['Allemagne', 'DE', 'EUR'],
  ['Espagne', 'ES', 'EUR'], ['Portugal', 'PT', 'EUR'], ['Italie', 'IT', 'EUR'], ['Pays-Bas', 'NL', 'EUR'], ['Royaume-Uni', 'GB', 'GBP'],
  ['Irlande', 'IE', 'EUR'], ['Autriche', 'AT', 'EUR'], ['Grèce', 'GR', 'EUR'], ['Pologne', 'PL', 'PLN'], ['République tchèque', 'CZ', 'CZK'],
  ['Slovaquie', 'SK', 'EUR'], ['Hongrie', 'HU', 'HUF'], ['Roumanie', 'RO', 'RON'], ['Bulgarie', 'BG', 'BGN'], ['Croatie', 'HR', 'EUR'],
  ['Serbie', 'RS', 'RSD'], ['Bosnie-Herzégovine', 'BA', 'BAM'], ['Slovénie', 'SI', 'EUR'], ['Macédoine du Nord', 'MK', 'MKD'], ['Albanie', 'AL', 'ALL'],
  ['Monténégro', 'ME', 'EUR'], ['Kosovo', 'XK', 'EUR'], ['Suède', 'SE', 'SEK'], ['Norvège', 'NO', 'NOK'], ['Danemark', 'DK', 'DKK'],
  ['Finlande', 'FI', 'EUR'], ['Islande', 'IS', 'ISK'], ['Estonie', 'EE', 'EUR'], ['Lettonie', 'LV', 'EUR'], ['Lituanie', 'LT', 'EUR'],
  ['Ukraine', 'UA', 'UAH'], ['Biélorussie', 'BY', 'BYN'], ['Moldavie', 'MD', 'MDL'], ['Russie', 'RU', 'RUB'], ['Chypre', 'CY', 'EUR'],
  ['Malte', 'MT', 'EUR'], ['Andorre', 'AD', 'EUR'], ['Monaco', 'MC', 'EUR'], ['Saint-Marin', 'SM', 'EUR'], ['Liechtenstein', 'LI', 'CHF'],
  ['États-Unis', 'US', 'USD'], ['Canada', 'CA', 'CAD'], ['Mexique', 'MX', 'MXN'], ['Guatemala', 'GT', 'GTQ'], ['Belize', 'BZ', 'BZD'],
  ['Honduras', 'HN', 'HNL'], ['Salvador', 'SV', 'USD'], ['Nicaragua', 'NI', 'NIO'], ['Costa Rica', 'CR', 'CRC'], ['Panama', 'PA', 'PAB'],
  ['Cuba', 'CU', 'CUP'], ['Haïti', 'HT', 'HTG'], ['République dominicaine', 'DO', 'DOP'], ['Jamaïque', 'JM', 'JMD'], ['Bahamas', 'BS', 'BSD'],
  ['Brésil', 'BR', 'BRL'], ['Argentine', 'AR', 'ARS'], ['Chili', 'CL', 'CLP'], ['Colombie', 'CO', 'COP'], ['Pérou', 'PE', 'PEN'],
  ['Venezuela', 'VE', 'VES'], ['Équateur', 'EC', 'USD'], ['Bolivie', 'BO', 'BOB'], ['Paraguay', 'PY', 'PYG'], ['Uruguay', 'UY', 'UYU'],
  ['Guyana', 'GY', 'GYD'], ['Suriname', 'SR', 'SRD'],
  ['Turquie', 'TR', 'TRY'], ['Israël', 'IL', 'ILS'], ['Liban', 'LB', 'LBP'], ['Jordanie', 'JO', 'JOD'], ['Syrie', 'SY', 'SYP'],
  ['Irak', 'IQ', 'IQD'], ['Iran', 'IR', 'IRR'], ['Arabie saoudite', 'SA', 'SAR'], ['Émirats arabes unis', 'AE', 'AED'], ['Qatar', 'QA', 'QAR'],
  ['Koweït', 'KW', 'KWD'], ['Bahreïn', 'BH', 'BHD'], ['Oman', 'OM', 'OMR'], ['Yémen', 'YE', 'YER'], ['Afghanistan', 'AF', 'AFN'],
  ['Pakistan', 'PK', 'PKR'], ['Inde', 'IN', 'INR'], ['Bangladesh', 'BD', 'BDT'], ['Sri Lanka', 'LK', 'LKR'], ['Népal', 'NP', 'NPR'],
  ['Chine', 'CN', 'CNY'], ['Japon', 'JP', 'JPY'], ['Corée du Sud', 'KR', 'KRW'], ['Vietnam', 'VN', 'VND'], ['Thaïlande', 'TH', 'THB'],
  ['Indonésie', 'ID', 'IDR'], ['Malaisie', 'MY', 'MYR'], ['Singapour', 'SG', 'SGD'], ['Philippines', 'PH', 'PHP'], ['Cambodge', 'KH', 'KHR'],
  ['Australie', 'AU', 'AUD'], ['Nouvelle-Zélande', 'NZ', 'NZD'], ['Fidji', 'FJ', 'FJD'], ['Papouasie-Nouvelle-Guinée', 'PG', 'PGK'],
];

export const COUNTRIES: CountryInfo[] = RAW.map(([name, cc, currency]) => ({ name, cc, currency })).sort((a, b) =>
  a.name.localeCompare(b.name, 'fr')
);
